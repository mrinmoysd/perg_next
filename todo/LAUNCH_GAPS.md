# Launch gap analysis — planned vs shipped (as of 2026-03-18)

This document compares what we planned (PRD + MASTER_SPEC + iteration/sprint plans) vs what’s implemented in the repo today.

Goal: make the remaining work obvious and executable so we can **finish the project completely** and ship a **launch-ready SaaS**.

---

## 1) Source documents used

**Product + requirements**
- `docs/PRD.md`
- `docs/MASTER_SPEC.md`
- `docs/SPEC.md`

**Engineering plans**
- `todo/ITERATIONS.md`
- `todo/PENDING_ITEMS.md`
- `todo/SPRINT_5_UX_SHADCN_PLAN.md`

**Implementation inventory (observed)**

Pages:
- Public: `/` (`src/app/page.tsx`), `/pricing` (`src/app/pricing/page.tsx`), `/login` (`src/app/login/page.tsx`)
- Authenticated: `/dashboard`, `/history`, `/settings/profile`, `/settings/billing` under `src/app/(app)/*`

APIs:
- `POST /api/generate` (`src/app/api/generate/route.ts`)
- `GET|PATCH /api/generations` (`src/app/api/generations/route.ts`)
- `GET|PUT /api/user` (`src/app/api/user/route.ts`)
- Billing: `GET /api/billing/status`, `POST /api/billing/checkout`, `POST /api/webhooks/stripe`
- Auth helper: `POST /api/auth/set-session`

DB:
- `migrations/0001_init.sql` (users, generations, subscriptions, usage_counters, audit_events)

---

## 2) What’s implemented end-to-end ✅

### Core MVP loop (PRD)
- Paste email → choose tone/length → **Generate reply**: ✅ (`/dashboard` + `POST /api/generate`)
- Copy: ✅ (Dashboard + History)
- Regenerate: ✅ (Dashboard + History calls `POST /api/generate` with the same input)
- History (PRD optional, Master Spec required): ✅ (`/history` + `GET /api/generations`)
- Save/unsave: ✅ (`PATCH /api/generations` + UI in Dashboard & History)

### Auth + protected routes
- Magic-link email login: ✅ (`/login`, Supabase browser client)
- Protected pages redirect to login when unauthenticated: ✅ (`src/middleware.ts`)
- Session cookie write-back: ✅ (`/api/auth/set-session`)
- Google OAuth login: ✅ (`/login` uses `supabase.auth.signInWithOAuth({ provider: "google" })`)

### Profile defaults
- Edit profile fields + signature + default tone: ✅ (`/settings/profile` + `PUT /api/user`)
- Signature is used in generation prompt (best-effort): ✅ (`POST /api/generate` loads signature when authed)

### Quota + upgrade path
- Free quota enforcement server-side (429): ✅ (`QuotaService` in `POST /api/generate`)
- UI quota display in app header: ✅ (Dashboard header)
- Stripe Checkout entrypoint + webhook syncing: ✅ (basic)

### Sprint 5 UI system foundations
- Tailwind + shadcn/ui component set in use: ✅
- App shell with side-nav + theme toggle + consistent layout: ✅
- Landing + pricing pages exist + SEO metadata baseline: ✅
- Accessibility baseline: ✅ landmarks + skip link ("Skip to content")

### Public site launch pages
- `/help`: ✅ (`src/app/help/page.tsx`)
- `/privacy`: ✅ (`src/app/privacy/page.tsx`)
- `/terms`: ✅ (`src/app/terms/page.tsx`)

### API spec alignment (OpenAPI parity)
- `POST /api/regenerate`: ✅ (`src/app/api/regenerate/route.ts`)
- `GET /api/generations/{id}`: ✅ (`src/app/api/generations/[id]/route.ts`)
- `POST /api/generations/{id}/save`: ✅ (`src/app/api/generations/[id]/save/route.ts`)

### Dashboard UX (market-informed)
- Editable reply output: ✅ (`ReplyEditor` component)
- In-session variations list: ✅ (`VariationsBar` + `GET /api/generations/{id}`)

### Billing robustness (hardening)
- Stripe webhook idempotency + dedupe: ✅ (stores `stripe_events`)
- Invoice events handled: ✅ (`invoice.payment_succeeded` / `invoice.payment_failed`)
- Minimal webhook audit logging: ✅ (writes `audit_events` best-effort)

### Account deletion
- Self-service deletion API: ✅ (`DELETE /api/user` in `src/app/api/user/route.ts`)

---

## 3) Functional gaps vs PRD / MASTER_SPEC ❌

This section is only the *missing or incomplete* product behavior (not code quality).

### 3.1 Public site pages required by `MASTER_SPEC.md`
**Planned:** `/features`, `/help`, `/privacy`, `/terms`

**Current:** `/help`, `/privacy`, and `/terms` exist. `/features` does not.

**Gap:** `/features` page is not implemented as a standalone route.
- Impact: **High** (trust + compliance + support)
- Effort: Low–Medium

### 3.2 Auth methods
**Planned (PRD/Master Spec):** Email + Google OAuth

**Current:** Email magic-link + Google OAuth.

**Gap:** none in code path; production readiness still requires Supabase provider config + redirect URLs.

### 3.3 API contract mismatch with `docs/API_OPENAPI.yaml`
OpenAPI includes endpoints we don’t implement as defined:
All previously missing OpenAPI endpoints are now implemented:
- `POST /api/regenerate`: ✅
- `GET /api/generations/{id}`: ✅
- `POST /api/generations/{id}/save`: ✅

**Gap:** None for these endpoints. (We should still periodically validate OpenAPI vs implementation.)

### 3.4 Generation variations (session UX) (market-informed)
**Planned:** show multiple variations per input in-session (V1/V2/V3)

**Current:** variations list exists in Dashboard and supports switching.

**Gap:** None.

### 3.5 Output editing + saving edited reply
**Planned:** output box is editable; user can edit and then copy/save.

**Current:** reply is editable in Dashboard via `ReplyEditor`.

**Gap:** Remaining question: do we also want to persist *edited* reply back to DB as user-edited content?

### 3.6 Privacy/retention controls
**Planned:** clear retention policy + deletion workflow (GDPR-ish).

**Current:** deletion API exists as `DELETE /api/user`. (UI affordance/confirmation may still be missing.)

**Gap:** Add a discoverable UI entry + confirmation flow for deletion in Settings.

---

## 4) UI/UX gaps vs Sprint 5 DoD / Theme guide ⚠️

### 4.1 Focus + keyboard audit (not fully validated)
We added skip-to-content and focus rings exist on shadcn components, but we **haven’t audited every interactive element**.

Known risk areas:
- History list item is a `<button>` (good) but lacks a clear keyboard *selected* state.
- Split view layout: ensure tabbing order is predictable (list → actions → details).

### 4.2 Mobile UX validation
We’ve addressed overflow issues in ToggleGroup and used responsive grids, but there’s no documented mobile smoke pass.

### 4.3 Quota exceeded UX
Current: destructive Alert + Upgrade link.

Gap (planned): calmer upgrade UX + possibly a small modal; also consistent quota badge on all app pages.

### 4.4 Billing page completeness
Planned (pending items): customer portal link, show Stripe current status/period end.

Current: customer portal endpoint exists (`/api/billing/portal`). Verify a “Manage subscription” UI exists and shows plan/status/period end.

---

## 5) Engineering gaps (launch hardening) ❌

### 5.1 Sprint 4 (Observability / Testing / Security) is mostly missing
Planned in `todo/PENDING_ITEMS.md`:
- PostHog analytics events
- Sentry error monitoring
- Playwright E2E tests for core flows
- GDPR: account deletion endpoint

Current:
- Sentry: ✅ dependencies + config present (runtime verification still needed)
- Account deletion API: ✅ (`DELETE /api/user`)
- PostHog: ❌ not wired
- Core-flow Playwright E2E: ⚠️ Playwright exists, but core app smoke coverage still incomplete

Impact: **High** (no safety net in production).

### 5.2 Quota increment is not atomic
`todo/PENDING_ITEMS.md` calls out concurrency risk.

Current: `incrementSuccess()` is read-then-update (race possible).

Impact: Medium (only matters under parallel requests / abuse)
Effort: Low–Medium (single SQL upsert update or RPC)

### 5.3 Stripe webhook robustness
Current: handles:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Gaps:
N/A (now implemented):
- idempotency hardening + tolerate duplicates: ✅ (dedup via `stripe_events`)
- handle `invoice.payment_succeeded` / `invoice.payment_failed`: ✅
- store minimal audit events: ✅ (best-effort)

Impact: High (billing correctness)
Effort: Medium

### 5.4 Next.js warning: “middleware file convention is deprecated”
Build shows warning and a “Proxy (Middleware)” entry.

Gap: migrate `src/middleware.ts` to the new convention (`src/proxy.ts`) when Next requires it.
Impact: Low short-term, Medium long-term.

---

## 6) Launch readiness checklist (what must be true before we ship)

### Must-have (launch blockers)
- [x] Legal pages: `/privacy`, `/terms`
- [x] Help/support page: `/help` (at least a FAQ + contact)
- [ ] E2E smoke tests (Playwright): login → generate → save → history search
- [x] Sentry integration (client + server) (verify events in a real environment)
- [x] Stripe webhook hardening + idempotency + at least invoice paid/failed events
- [ ] Account deletion flow (API + confirmation UI, or documented manual process) — API done, UI pending
- [ ] Production env validation doc (auth redirect URLs + Stripe webhook URLs)

### Should-have (high value)
- [x] Google OAuth login
- [x] Editable reply in Dashboard
- [x] Variations list (V1/V2/V3) per input
- [x] Stripe customer portal (manage subscription) (endpoint present; ensure UI is wired)
- [ ] Analytics event hooks (PostHog)

### Nice-to-have
- [ ] `/features` page (optional if we embed features section on Home)
- [ ] Copy formatted (HTML)
- [ ] Templates/examples library

---

## 7) Execution plan to finish (2–3 focused sprints)

### Sprint A — Launch blockers (3–5 days)
1) Add legal/help pages
2) Add Sentry
3) Add Playwright E2E (3–5 tests)
4) Add `/api/user/delete` + UI

### Sprint B — Billing correctness (2–4 days)
1) Webhook idempotency + invoice events
2) Add Stripe customer portal endpoints + UI
3) Add webhook audit logging using `audit_events`

### Sprint C — Product polish / conversion (3–5 days)
1) Google OAuth
2) Editable reply + save edited reply
3) Variations list UX

---

## 8) Decisions needed (so implementation doesn’t drift)

1) **API spec alignment**
- Option 1: update `docs/API_OPENAPI.yaml` to match shipped endpoints
- Option 2: implement missing endpoints to match the spec

**Decision:** implement the missing endpoints to match `docs/API_OPENAPI.yaml`.

Status: ✅ implemented (`/api/regenerate`, `/api/generations/{id}`, `/api/generations/{id}/save`).

2) **Auth strategy**
- Confirm whether we must ship Google OAuth at launch.

**Decision:** ship Google OAuth at launch.

3) **Data deletion promise**
- Decide whether deletion is self-serve (recommended) or manual by email.

**Decision:** self-service deletion (API + UI).

---

## 9) Notes / assumptions
- This doc reflects repo state observed on 2026-03-17.
- Where a feature exists but isn’t fully validated (e.g., keyboard navigation), it’s listed under UX gaps rather than missing functionality.
