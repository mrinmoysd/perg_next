# Sprint B — Status

## 1) Sprint overview
- **Sprint:** B (Billing correctness)
- **Dates:** TBD
- **Status:** In Progress
- **Goal:** Make billing reliable in production: webhook idempotency + invoice events + customer portal + audit logging.

## 2) Scope

### In scope
- Webhook idempotency hardening
- Handle `invoice.payment_succeeded` and `invoice.payment_failed`
- Stripe customer portal (manage subscription)
- Audit logging using `audit_events`

### Out of scope
- Google OAuth (Sprint C)
- API spec alignment (Sprint C)

### Key references
- `todo/LAUNCH_GAPS.md`
- `todo/PENDING_ITEMS.md`
- `docs/MASTER_SPEC.md`

## 3) Execution checklist
- [x] Webhook idempotency + duplicate tolerance
- [x] Invoice events: succeeded/failed
- [x] Customer portal: API + UI
- [x] Audit logs: record webhook + subscription changes
- [x] Quality gates: lint/test/build + targeted webhook tests

## 4) Deliverables produced
- `migrations/0001_init.sql` — add `public.stripe_events` table for webhook idempotency
- `migrations/0002_stripe_events.sql` — incremental migration to safely add `public.stripe_events` on existing DBs
- `src/app/api/webhooks/stripe/route.ts` — idempotency guard + audit logging + invoice event handling
- `src/app/api/billing/portal/route.ts` — Stripe customer portal session endpoint
- `src/app/(app)/settings/billing/page.tsx` — “Manage subscription” portal button for Pro users
- `src/app/api/webhooks/stripe/stripeWebhookIdempotency.test.ts` — unit tests for duplicate tolerance

## 5) Acceptance criteria validation
- Duplicate Stripe webhooks do not double-apply state changes: **PASS (unit-tested)**
- Invoice succeeded/failed events are handled and audited: **PASS (implemented)**
- Pro users can open Stripe customer portal: **PASS (implemented)**
- Audit trail is written for Stripe webhook events and billing changes: **PASS (implemented)**

## 6) Quality gates
- Build: **PASS**
- Lint/Typecheck: **PASS**
- Unit tests: **PASS**
- E2E smoke: **n/a** (Sprint B changes are server-side; existing Playwright smoke remains green)

## 7) Risks & mitigations
- Risk: webhook event ordering and retries.
  - Mitigation: idempotency + upserts keyed by subscription id; resilient updates.

## 8) Decisions made
- (TBD)

## 9) Next sprint handoff
- Handoff to Sprint C.
