# Runbook: Encryption Key Rotation

The audit found that both encryption keys were recoverable from the repository:

1. **Master key** (`config('app.encryption_master_key')` → file
   `storage/framework/bootstrap/.sys_bin_`) — used by `BaseHelper::encrypt/decrypt`
   (the `EncryptedString`/`EncryptedJson` casts). Protects: `Student.first_name/last_name`,
   all `Staff`/`StaffEnrollment` PII, `User.name`, admission form JSON, etc.
2. **Email key/IV** (`config('app.email_crypt_key')` / `email_crypt_iv`) — used by
   `BaseHelper::customCrypt` (the `EncryptedEmail` cast). Deterministic, so emails can be
   looked up by ciphertext at login.

Because both leaked, **treat all encrypted-at-rest data as exposed** and rotate. Rotation
re-encrypts existing rows, so it must be done with a maintenance window and a DB backup.

> ⚠️ The code change in Phase 1 only *stops new commits* from leaking the keys. The old keys
> are still in git history and must be purged, AND the data must be re-encrypted under new
> keys, or the exposure persists.

## 1. Provision new keys (out of band)

```bash
# New master key (32 random bytes, hex) — store ONLY on the server / secret manager.
php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'  > storage/framework/bootstrap/.sys_bin_.new

# New email key + IV — set in the server environment, never in source.
EMAIL_CRYPT_KEY=$(php -r 'echo bin2hex(random_bytes(24)), PHP_EOL;')
EMAIL_CRYPT_IV=$(php -r 'echo bin2hex(random_bytes(24)), PHP_EOL;')
```

Add to the server `.env` (NOT `.env.example`):

```
EMAIL_CRYPT_KEY=<value>
EMAIL_CRYPT_IV=<value>
```

## 2. Re-encrypt existing data

Rotation must read every encrypted column with the OLD key and write it back with the NEW
key in a single migration step. Outline of a guarded one-off command (dry-run by default):

```php
// app/Console/Commands/RotateEncryptionKeys.php  (sketch — review & test before running)
//   php artisan security:rotate-keys --dry-run         # report only
//   php artisan security:rotate-keys --force           # perform the rewrite
//
// For each model with encrypted casts (Student, Staff, StaffEnrollment, User, AdmissionForm…):
//   - decrypt each row's encrypted columns with the OLD key (load old key/iv explicitly)
//   - re-encrypt with the NEW key
//   - update in a chunked transaction
// Email columns (deterministic) change ciphertext, so they keep working for login because the
// app now reads the NEW EMAIL_CRYPT_KEY too. Do email + master-key columns in the same pass.
```

Key points for the command:
- Take a full DB backup first; run inside a transaction per chunk (`chunkById(500)`).
- Default to `--dry-run`; require `--force` to write; log counts.
- Read OLD keys from explicit args/temp config, NEW keys from the live env/file, so one process
  can translate old→new.

## 3. Swap the keys live

1. Put the app in maintenance mode (`php artisan down`).
2. Back up the database.
3. Run the re-encryption command with the old+new keys.
4. Replace the master key file: `mv .sys_bin_.new .sys_bin_` (perms `0600`).
5. Confirm `EMAIL_CRYPT_KEY`/`EMAIL_CRYPT_IV` are set in the server env.
6. `php artisan config:clear` and smoke-test login + a record that uses encrypted fields.
7. `php artisan up`.

## 4. Purge the old keys from git history

```bash
# Using git-filter-repo (preferred):
git filter-repo --invert-paths --path storage/framework/bootstrap/.sys_bin_
# Then rotate the remote and force-push per your team's process. Coordinate — this rewrites history.
```

Also remove the legacy defaults from `config/app.php` (`email_crypt_key`/`email_crypt_iv`)
once every environment has the env vars set, so the old email key no longer lives in source.

## 5. Post-rotation

- Verify `git ls-files | grep sys_bin_` returns nothing.
- Verify `config/app.php` no longer contains the literal legacy key strings.
- Rotate `APP_KEY` too if it was ever committed, and audit logs for prior exposure.
