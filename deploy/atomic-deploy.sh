#!/usr/bin/env bash
#
# Atomic, (near) zero-downtime deploy for SchoolExa.
#
# Layout it manages on the server:
#   $DEPLOY_ROOT/
#     releases/<timestamp>/     one immutable checkout+build per deploy
#     shared/.env               the real environment file (never in git)
#     shared/storage/           persisted across releases (uploads, logs)
#     current -> releases/<ts>  symlink the web root / php-fpm points at
#
# The web root (nginx root, php-fpm) must point at  $DEPLOY_ROOT/current/public.
# Deploy builds a brand-new release dir, runs migrations against the shared DB,
# warms caches, then atomically repoints `current` and reloads php-fpm. A failed
# build never touches the live release.
#
# Usage:   ./deploy/atomic-deploy.sh [git-ref]      (default: origin/main)
#
# REVIEW the CONFIG block and the service names before first use — they are
# environment-specific. Run as the deploy user, not root.

set -euo pipefail

# ----------------------------- CONFIG (edit me) -----------------------------
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/schoolexa}"
REPO="${REPO:-git@github.com:your-org/schoolexa.git}"
GIT_REF="${1:-origin/main}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.3-fpm}"   # match your installed FPM
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
# Multi-tenant DB-per-tenant is NOT active (single-DB row-scoping). If that ever
# changes, set RUN_TENANT_MIGRATIONS=true to also run `tenants:migrate`.
RUN_TENANT_MIGRATIONS="${RUN_TENANT_MIGRATIONS:-false}"
# ----------------------------------------------------------------------------

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[deploy:error]\033[0m %s\n' "$*" >&2; exit 1; }

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="$DEPLOY_ROOT/releases/$TIMESTAMP"
SHARED_DIR="$DEPLOY_ROOT/shared"

[ -f "$SHARED_DIR/.env" ] || die "Missing $SHARED_DIR/.env — create it before deploying."
command -v composer >/dev/null || die "composer not found on PATH."
command -v npm >/dev/null || die "npm not found on PATH."

log "Deploying ref '$GIT_REF' -> release $TIMESTAMP"
mkdir -p "$DEPLOY_ROOT/releases" "$SHARED_DIR"

# 1. Fresh checkout of the exact ref into the new release dir.
git clone --quiet "$REPO" "$RELEASE_DIR"
git -C "$RELEASE_DIR" fetch --quiet --all
git -C "$RELEASE_DIR" checkout --quiet --detach "$GIT_REF"
COMMIT="$(git -C "$RELEASE_DIR" rev-parse --short HEAD)"
log "Checked out $COMMIT"

# 2. Wire up shared state (env + storage) into the release.
ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
rm -rf "$RELEASE_DIR/storage"
ln -sfn "$SHARED_DIR/storage" "$RELEASE_DIR/storage"

# 3. Build the release (production deps + assets) BEFORE going live.
log "Installing PHP dependencies"
composer install --working-dir="$RELEASE_DIR" \
    --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-progress

log "Building frontend assets"
( cd "$RELEASE_DIR" && npm ci && npm run build )

# 4. Migrations run against the SHARED database before the swap. Keep migrations
#    backward-compatible (additive/nullable, async backfills) so the still-live
#    previous release keeps working until the symlink flips.
if [ "$RUN_MIGRATIONS" = "true" ]; then
    log "Running migrations (--force)"
    php "$RELEASE_DIR/artisan" migrate --force --isolated
    if [ "$RUN_TENANT_MIGRATIONS" = "true" ]; then
        log "Running tenant migrations"
        php "$RELEASE_DIR/artisan" tenants:migrate --force
    fi
fi

# 5. Warm caches inside the release (so the first request after swap is hot).
log "Warming caches"
php "$RELEASE_DIR/artisan" config:cache
php "$RELEASE_DIR/artisan" route:cache
php "$RELEASE_DIR/artisan" view:cache
php "$RELEASE_DIR/artisan" event:cache

# 6. Atomic swap: replace the `current` symlink in a single rename.
log "Swapping 'current' -> $TIMESTAMP"
ln -sfn "$RELEASE_DIR" "$DEPLOY_ROOT/current.tmp"
mv -Tf "$DEPLOY_ROOT/current.tmp" "$DEPLOY_ROOT/current"

# 7. Reload php-fpm (clears OPcache for the new path) and restart workers so they
#    pick up the new code. The scheduler cron should call $DEPLOY_ROOT/current.
log "Reloading $PHP_FPM_SERVICE and restarting queue workers"
sudo systemctl reload "$PHP_FPM_SERVICE" || log "WARN: could not reload $PHP_FPM_SERVICE"
php "$DEPLOY_ROOT/current/artisan" queue:restart || true

# 8. Prune old releases, keeping the newest $KEEP_RELEASES.
log "Pruning old releases (keeping $KEEP_RELEASES)"
( cd "$DEPLOY_ROOT/releases" && ls -1dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf )

log "Done. Live release: $TIMESTAMP ($COMMIT)"
