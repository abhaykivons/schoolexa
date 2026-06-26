#!/usr/bin/env bash
#
# Roll back to the previous release by repointing the `current` symlink.
# Code rollback is instant; a DATABASE rollback (if a migration ran) must be done
# separately by restoring the pre-deploy snapshot — which is why deploy migrations
# must stay backward-compatible (additive), so the previous code runs against the
# new schema without a DB restore in the common case.
#
# Usage:   ./deploy/rollback.sh [release-timestamp]
#          (no arg = roll back to the immediately previous release)

set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/schoolexa}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.3-fpm}"

log() { printf '\033[1;34m[rollback]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[rollback:error]\033[0m %s\n' "$*" >&2; exit 1; }

RELEASES_DIR="$DEPLOY_ROOT/releases"
[ -d "$RELEASES_DIR" ] || die "No releases dir at $RELEASES_DIR"

CURRENT_TARGET="$(basename "$(readlink -f "$DEPLOY_ROOT/current")")"

if [ "${1:-}" != "" ]; then
    TARGET="$1"
else
    # Newest release that is not the current one.
    TARGET="$(cd "$RELEASES_DIR" && ls -1dt */ | sed 's#/##' | grep -v "^${CURRENT_TARGET}$" | head -n1 || true)"
fi

[ -n "${TARGET:-}" ] || die "No previous release to roll back to."
[ -d "$RELEASES_DIR/$TARGET" ] || die "Release '$TARGET' not found."

log "Rolling back: $CURRENT_TARGET -> $TARGET"
ln -sfn "$RELEASES_DIR/$TARGET" "$DEPLOY_ROOT/current.tmp"
mv -Tf "$DEPLOY_ROOT/current.tmp" "$DEPLOY_ROOT/current"

sudo systemctl reload "$PHP_FPM_SERVICE" || log "WARN: could not reload $PHP_FPM_SERVICE"
php "$DEPLOY_ROOT/current/artisan" queue:restart || true

log "Now live: $TARGET"
log "If a migration ran in the rolled-back release, restore the pre-deploy DB snapshot."
