# Sprint 3 — Status

## 1) Sprint overview
- **Sprint:** 3 (Quota, Billing, and Subscriptions)
- **Dates:** 2026-03-16 → 2026-03-16
- **Status:** Done
- **Goal:** Enforce free-tier daily quotas and add Stripe Checkout + webhook-driven subscription state.

## 2) Scope

### In scope
- Enforce daily free quota (10 successful generations/day) server-side
- Show quota in UI
- Add Stripe Checkout (test mode) for Pro subscription
- Add Stripe webhook receiver to upsert subscription state

### Out of scope
- Customer portal (manage subscription)
- Full webhook event coverage (invoice/payment events)
- Full E2E tests (Sprint 4)

### Key references
- `todo/ITERATIONS.md`
- `docs/MASTER_SPEC.md`
- `docs/API_OPENAPI.yaml`
- `migrations/0001_init.sql` (tables: `usage_counters`, `subscriptions`)

## 3) Execution checklist

- [x] Implement `usage_counters` usage and `QuotaService.canGenerate` + increment
- [x] Add quota badge in UI and server-side enforcement (429 + upgrade link)
- [x] Integrate Stripe Checkout (test mode)
- [x] Implement `/api/webhooks/stripe` receiver to upsert subscription updates
- [x] Implement `SubscriptionService.getPlanForUser` to consult DB
- [x] Add env var template updates for Stripe config
- [x] Quality gates: lint + build + unit tests

## 4) Deliverables produced

- `src/lib/billing/plans.ts` — Plan model and per-plan daily limits
- `src/lib/billing/subscriptionService.ts` — Resolve user plan from `users` + `subscriptions`
- `src/lib/billing/quotaService.ts` — Quota check + increment logic using `usage_counters`
- `src/lib/billing/stripe.ts` — Stripe client + webhook secret helpers
- `src/app/api/billing/checkout/route.ts` — Creates Stripe Checkout subscription session
- `src/app/api/billing/status/route.ts` — Returns `{ plan, quota }` for UI badge
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook handler (basic events)
- `src/app/settings/billing/page.tsx` — Billing UI with upgrade button
- Updated `src/app/api/generate/route.ts` — Enforce quota and increment usage on success
- Updated `src/app/dashboard/page.tsx` — Quota badge + Billing nav link
- Updated `src/app/settings/profile/page.tsx` — Added Billing nav link
- Updated `.env.example` — Added `NEXT_PUBLIC_APP_URL` + `STRIPE_PRO_PRICE_ID`

## 5) Acceptance criteria validation

- Free user cannot generate after 10 successful generations/day (server enforced): **PASS**
  - Implemented via `/api/generate` quota check returning HTTP 429.
- Stripe checkout flow updates subscription in DB via webhook: **PASS**
  - `checkout.session.completed` and `customer.subscription.updated/deleted` supported.

## 6) Quality gates

- Build: **PASS** (`npm run build`)
- Lint/Typecheck: **PASS** (`npm run lint` + TS in build)
- Unit tests: **PASS** (`npm test`)
- E2E smoke: **N/A (not added yet; planned Sprint 4)**

## 7) Risks & mitigations

- Risk: quota increment is not atomic under high concurrency.
  - Mitigation: implement a DB-side atomic increment (RPC or single upsert update) before load testing.
- Risk: webhook coverage is minimal; missing invoice/payment events.
  - Mitigation: add invoice event handling and stronger idempotency in Sprint 3 hardening/Sprint 4.

## 8) Decisions made

- Enforce quota only for authenticated users (consistent with history persistence).
- Keep plan in `users.plan` and sync it from Stripe webhooks for fast checks.

## 9) Next sprint handoff

- Sprint 4 should add Playwright E2E coverage, observability (Sentry/PostHog), and security/GDPR endpoints.
- Consider adding a Stripe customer portal link on `/settings/billing`.
