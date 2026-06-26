# Security Remediation Plan

Generated from the security audit on 2026-06-27. Findings are addressed on the
`security/audit-remediation` branch, one phase per commit. Severities: 🔴 Critical,
🟠 High, 🟡 Medium, ⚪ Low.

## Status legend
- ✅ Fixed in this branch
- 🔁 Partially fixed (code change here, operational follow-up required)
- 📋 Deferred — needs a product/infra decision (tracked below)

## Phases

### Phase 1 — Encryption secret management 🔴
- **#1 Encryption keys committed to the repo.** The master key file
  `storage/framework/bootstrap/.sys_bin_` was git-tracked, and `BaseHelper::customCrypt`
  hard-coded the email key/IV in source.
  - ✅ Untracked the key file and added it (plus key material patterns) to `.gitignore`.
  - ✅ Moved the email key/IV to `config/app.php` (`email_crypt_key`/`email_crypt_iv`)
    sourced from env, with the legacy values kept as defaults so existing ciphertext
    still decrypts. **These defaults MUST be removed after rotation.**
  - 🔁 Rotation + history purge is operational — see `docs/runbooks/key-rotation.md`.
    Until rotated, treat both keys as compromised (they remain in git history).
- **#7 Encryption fails silently to plaintext.** `BaseHelper::encrypt` would run with an
  empty key when the key file was missing.
  - ✅ `encrypt()` now throws if the key is unavailable (fail closed) instead of writing
    weakly/again-unencrypted data.
  - 📋 The `ctype_xdigit && strlen>32` "already-encrypted" heuristic is left as-is to keep
    backward compatibility; replacing it with an explicit ciphertext marker needs a data
    format migration (deferred).

### Phase 2 — Privilege escalation in Settings/UserController 🔴
- **#2** Add company-ownership checks to `update()`/`toggleStatus()`, validate `role_id`
  belongs to the caller's company, and company-scope `index()`. (`User` deliberately has no
  global `CompanyScope` because login/impersonation query it cross-boundary — protection is
  enforced at the controller layer.)

### Phase 3 — Cross-tenant write + login gate 🟠
- **#3** `GradeController::reorder` raw `UPDATE grades SET order=-order` hit every company;
  scope it to the caller's company.
- **#4** Login only checked `is_login`; also reject `status === false` (column defaults to
  `true`, so existing accounts are unaffected).

### Phase 4 — Targeted high/medium fixes 🟠
- **#6** `CustomResetPassword` template lookup is fail-open on the public reset route; scope
  it to the notifiable's `company_id`.
- **#8** Escape parent-supplied fields in the admission PDF Blade templates (`{!! !!}` → `{{ }}`).
- **#5** `/private-storage/{path}` serves any private file to any school user; route downloads
  through ownership-checked controllers and stop emitting raw paths. 🔁 May be split if it needs
  the `StaffEnrollment.company_id` column (see deferred).

### Phase 5 — Systemic: CompanyScope fail-closed 🟠
- Make `CompanyScope` deny (empty result) when no `company_id` is resolvable, and update the
  legitimate no-session consumers (scheduled-notification cron) to set company context or use
  `withoutGlobalScope` explicitly. Neutralizes the whole fail-open class (#6 and future leaks).

## Deferred (need a decision) 📋
- **#5b `StaffEnrollment` has no `company_id`** — resumes/portfolios can't be company-scoped
  until a column is added + backfilled.
- **PublicHoliday cross-tenant mutation** — needs a `company_id` (nullable = shared national
  holiday) + a migration/backfill, plus restricting mutation to admins.
- **#11 Parent self-registration** — auto-login without email verification against any company
  UUID; needs a product decision (invite flow / verification / company-active check).
- **#10 Email "test connection" SSRF** — add a private-IP/metadata allow-list and generic errors.
- **#12 Login throttle/enumeration** — add a per-IP throttle and uniform failure messages.
- **#13 reCAPTCHA is a no-op** (no secret configured) — provision keys or remove the dependency.
- **#14 `APP_DEBUG=true` in `.env.example` + raw log viewer** — default debug off; redact logs.
- **#15 PII over-serialized into Inertia props** — move to API Resources / explicit field lists.
- Replace unauthenticated AES-CBC with authenticated encryption (AES-GCM / Laravel `Crypt`).
