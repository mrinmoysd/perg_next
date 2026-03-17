# Data Dictionary — Personalized Email Reply Generator

**Version:** 1.0 (2026-03-10)

Source of truth: `MASTER_SPEC.md` (§9) and `ER_DIAGRAM.dbml`.

Conventions:
- Postgres types: `uuid`, `text`, `timestamptz`, `date`, `int`, `boolean`, `jsonb`
- All timestamps use UTC.
- IDs are UUID v4.

---

## 1) `users`

Purpose: stores application user profile fields (separate from provider auth tables if using Supabase Auth).

| Column | Type | Null | Constraints | Example | Notes |
|---|---|---:|---|---|---|
| id | uuid | NO | PK | `b3b52d3a-9f6a-4b7a-a713-2f8b1f7c3b2b` | Should match auth user id when using Supabase Auth. |
| email | text | NO | UNIQUE | `alex@acme.com` | Unique identifier for login. |
| name | text | YES |  | `Alex Kim` | Used in prompt context and UI. |
| job_title | text | YES |  | `Founder` | Optional. |
| company | text | YES |  | `Acme Labs` | Optional. |
| signature | text | YES |  | `Best,\nAlex` | Appended to replies if present. |
| default_tone | text | YES | enum-like | `professional` | Default for dashboard selection. |
| plan | text | NO | default `free` | `free` | `free/pro/agency`. Keep in sync with `subscriptions`. |
| created_at | timestamptz | YES |  | `2026-03-10T12:00:00Z` | Set via trigger/default. |
| updated_at | timestamptz | YES |  | `2026-03-10T12:10:00Z` | Set via trigger. |

Recommended indexes:
- unique(email)

---

## 2) `generations`

Purpose: stores every AI generation request and result.

| Column | Type | Null | Constraints | Example | Notes |
|---|---|---:|---|---|---|
| id | uuid | NO | PK | `5a7f8b16-6cd1-4b18-8d66-55b54f0fb6a1` | Generation identifier returned to client. |
| user_id | uuid | NO | FK -> users.id | `b3b52d3a-...` | Ownership boundary for RLS. |
| parent_id | uuid | YES | FK -> generations.id | `...` | Used for regenerate lineage. |
| email_input | text | NO |  | `Hi John, can you...` | Consider encryption if sensitive. |
| tone | text | NO | enum-like | `friendly` | One of tones. |
| length | text | NO | enum-like | `medium` | short/medium/detailed. |
| ai_model | text | YES |  | `gpt-4.1-mini` | Store actual model used. |
| prompt | text | YES |  | `System: ... User: ...` | For reproducibility/debug. |
| ai_reply | text | YES |  | `Hi Sarah, ...` | Result text. |
| tokens_used | int | YES |  | `280` | Optional if provider returns. |
| latency_ms | int | YES |  | `5340` | Measure end-to-end provider latency or total. |
| status | text | NO | default `created` | `succeeded` | created/succeeded/failed. |
| is_saved | boolean | NO | default false | `true` | Saved to history. |
| created_at | timestamptz | YES |  | `2026-03-10T12:01:00Z` | For sorting and quota computations (if needed). |

Recommended indexes:
- (user_id, created_at desc)
- (user_id, is_saved, created_at desc)

---

## 3) `subscriptions`

Purpose: stores subscription state synced from Stripe.

| Column | Type | Null | Constraints | Example | Notes |
|---|---|---:|---|---|---|
| id | uuid | NO | PK | `b9f6c...` | Internal ID. |
| user_id | uuid | NO | FK -> users.id | `b3b52d...` | Each user has 0..1 active sub. |
| plan | text | NO |  | `pro` | pro/agency. |
| status | text | NO |  | `active` | Mirror Stripe subscription status. |
| stripe_customer_id | text | YES |  | `cus_123` | From Stripe. |
| stripe_subscription_id | text | YES |  | `sub_123` | From Stripe. |
| current_period_end | timestamptz | YES |  | `2026-04-10T00:00:00Z` | Useful for grace periods/UX. |
| created_at | timestamptz | YES |  | `2026-03-10T12:05:00Z` |  |

Recommended indexes:
- (user_id)
- unique(stripe_customer_id)
- unique(stripe_subscription_id)

---

## 4) `usage_counters`

Purpose: daily quota enforcement (fast).

| Column | Type | Null | Constraints | Example | Notes |
|---|---|---:|---|---|---|
| id | uuid | NO | PK | `...` |  |
| user_id | uuid | NO | FK -> users.id | `...` |  |
| day | date | NO | unique-ish | `2026-03-10` | Use one row per user per day. |
| successful_generations | int | NO | default 0 | `7` | Increment on succeeded generations only. |
| created_at | timestamptz | YES |  | `...` |  |
| updated_at | timestamptz | YES |  | `...` |  |

Recommended constraints:
- Unique(user_id, day)

---

## 5) `audit_events` (optional)

Purpose: internal audit/logging for sensitive operations (billing changes, deletions, admin actions).

| Column | Type | Null | Constraints | Example | Notes |
|---|---|---:|---|---|---|
| id | uuid | NO | PK | `...` |  |
| user_id | uuid | YES | FK -> users.id | `...` | Nullable for system events. |
| event_type | text | NO |  | `subscription_updated` | Keep a stable taxonomy. |
| payload | jsonb | YES |  | `{ "plan": "pro" }` | Never store raw email content here. |
| created_at | timestamptz | YES |  | `...` |  |

---

## 6) RLS notes (if using Supabase RLS)

If the client directly queries tables, enable RLS and policies:
- `users`: user can select/update their own row
- `generations`: user can read/write rows with their user_id
- `usage_counters`: user can read their counter row
- `subscriptions`: user can read their subscription row

If DB access is server-only (recommended), RLS can still be enabled as defense-in-depth.
