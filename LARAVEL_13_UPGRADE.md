# Laravel 12 → 13 Upgrade — Execution Runbook

Living document tracking the phased upgrade. Work happens on branch `upgrade/laravel-13`.

| Phase | Goal | Status |
|---|---|---|
| 0 | Pre-flight: safety net, CI, backups, staging | 🔶 in progress |
| 1 | Stabilize on Laravel 12 (de-risk before the bump) | ⬜ pending |
| 2 | The Laravel 13 dependency bump | ⬜ pending |
| 3 | Verify on staging | ⬜ pending |
| 4 | Atomic production deploy + rollback | ⬜ pending |

Target: Laravel **13.0** (released 2026-03-17), **PHP 8.3+** (prod runs 8.4), PHPUnit 12 / Pest 4.

---

## Phase 0 — Pre-flight

### ✅ Done (in this branch)
- **Green test baseline restored.** Two migrations used MySQL-only `ALTER … MODIFY … ENUM`, which broke the SQLite test DB and took the *entire* suite down (0 usable tests). Made them driver-portable (MySQL path unchanged; `->change()` for SQLite/CI). Fixed a stale paginator assertion. Suite is now **123 passing**.
- **CI added** (`.github/workflows/ci.yml`): Pest is the blocking gate; Pint (changed-files) and `composer audit` are advisory; frontend build is checked.

### ☐ Operational tasks (run against your infra — cannot be done from the repo)

#### 1. Backups (do this before every phase that touches prod)
The app is currently a **single central MySQL database** (tenancy is configured but dormant — see Phase 1). So one logical backup covers production data today. If/when DB-per-tenant is activated, loop over tenant DBs too.

```bash
# Central DB — full logical backup with routines/triggers
mysqldump --single-transaction --quick --routines --triggers \
  -u "$DB_USER" -p "$DB_DATABASE" | gzip > backup-central-$(date +%F-%H%M).sql.gz

# If tenant DBs exist (prefix tenant_*), back each up:
for db in $(mysql -u "$DB_USER" -p -N -e "SHOW DATABASES LIKE 'tenant\_%'"); do
  mysqldump --single-transaction --quick --routines --triggers \
    -u "$DB_USER" -p "$db" | gzip > "backup-$db-$(date +%F-%H%M).sql.gz"
done
```
- Store off-box (S3/another host). **Do a restore drill** into staging — an untested backup is not a backup.
- Snapshot `storage/app` (uploaded admission docs/PDFs) and `.env`.

#### 2. Staging environment (mirror prod)
- Same OS, **PHP 8.3+**, MySQL 8, Redis, same `.env` values except secrets/URLs.
- Seed it from the restored production backup so the upgrade is exercised against real data shapes.
- This is where Phase 3 verification runs. Do **not** validate the bump only against the in-memory SQLite test DB — the enum/encryption/raw-SQL paths differ on MySQL.

#### 3. Branch protection
- Require the `Tests (Pest)` check to pass before merging `upgrade/laravel-13` → `main`.

### Rollback posture (applies to every phase)
- All work is on `upgrade/laravel-13`; `main` stays deployable at all times.
- Keep the pre-phase DB backup + a tagged commit of the last-known-good release.
- Production deploys (Phase 4) become **atomic symlink swaps** so rollback = repoint the symlink + (if a migration ran) restore the DB snapshot. Keep migrations backward-compatible (additive, nullable, async backfills) so old and new code can briefly coexist.

---

## Decision (resolved 2026-06-27): single-DB row-scoping
**Chosen: (A) Commit to single-DB row-scoping.** `CompanyScope` becomes the mandatory, audited isolation boundary on every tenant-owned model; IDOR endpoints get explicit `company_id` scoping; all tables stay in the central DB. The dormant `stancl/tenancy` wiring is parked (kept installed, not activated). True DB-per-tenant is deferred to a separate future project, not coupled to this upgrade.

---

## Phase 1 — Stabilize on Laravel 12 (done, except deferred crypto)
- [x] Remove runtime `Schema::create()` from controllers/services → rely on migrations
- [x] Register the scheduler (`notifications:process-scheduled`, `leads:cleanup`) + move notification sending to a queued `SendNotificationLog` job
- [x] Fail-closed reCAPTCHA + path-traversal guard on `/private-storage`
- [x] Close cross-tenant IDOR on admission approve/reject/comment (scope via `whereHas('student')`)
- [x] Move `env()` out of runtime code → `config('app.encryption_master_key')`; `config:cache` verified

### Deferred security sub-project (do AFTER the L13 bump, on a staging copy of prod data)
Decision 2026-06-27: defer because these require re-encrypting/altering existing production data.
- Replace `BaseHelper::customCrypt()` hardcoded key + fixed IV (used for `users.email`) with authenticated encryption + a keyed **blind index** column for login lookups; re-encrypt existing rows.
- Remove `encrypt()`'s `ctype_xdigit` passthrough and `decrypt()`'s fail-open (returns plaintext/ciphertext on failure) — needs data validation first.
- `CompanyScope` is **fail-open** when the session has no `company_id` ([Scopes/CompanyScope.php:17](app/Models/Scopes/CompanyScope.php#L17)); make it deny-by-default for tenant models and audit every model that should carry it.
- `.env.example`: ship `APP_DEBUG=false`, set `SESSION_SECURE_COOKIE=true`; disable `PDO::ATTR_PERSISTENT` on tenant/mysql connections.
- Add a multi-tenant **isolation test** asserting cross-company access is denied (the suite has none).
