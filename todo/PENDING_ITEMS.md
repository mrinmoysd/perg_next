# Pending items (post Sprint 3)

This file tracks the **remaining work** after completing Sprints 0–3, based on:
- `todo/ITERATIONS.md`
- Current implementation status under `todo/completed/SPRINT_*_STATUS.md`
- Repo specs in `docs/*`

## Sprint 3 follow-ups (hardening)

These are not strictly required for Sprint 3 acceptance criteria, but are recommended before going live.

- **Make usage counter update atomic**
  - Current `incrementSuccess()` reads then updates; concurrent requests can undercount/overcount.
  - Preferred: single SQL function (RPC) or `INSERT ... ON CONFLICT DO UPDATE SET successful_generations = usage_counters.successful_generations + 1 RETURNING ...`.
- **Stripe webhook robustness**
  - Expand supported events: `invoice.payment_succeeded`, `invoice.payment_failed`.
  - Ensure idempotency (upserts keyed by `stripe_subscription_id`) and tolerate duplicates.
  - Add minimal logging/audit events for webhook processing.
- **UI upgrade experience**
  - Replace dashboard error string with a small “Upgrade” CTA component/modal.
  - Show plan name + quota remaining consistently across app pages.
- **Billing settings improvements**
  - Add “Manage subscription” via Stripe customer portal (optional but common).
  - Show current Stripe status and period end on `/settings/billing`.

## Sprint 4 — Observability, Tests, and Security (pending)

- Analytics
  - Wire PostHog events for: login, generate_clicked, generate_succeeded/failed, copy_clicked, upgrade_clicked.
- Error monitoring
  - Add Sentry client+server integration and verify events.
- E2E tests (Playwright)
  - Happy paths: signup/login → generate → history.
  - Quota: generate until limit → verify 429 → verify upgrade CTA.
  - Billing: mock or test-mode checkout initiation.
- Security/GDPR
  - Add `/api/user/delete` (or documented manual deletion flow) and ensure it deletes `users` + cascades.
  - Add basic rate limiting for webhook + generate endpoints (optional).

## Sprint 5 — Polish, UX, and Launch (pending)

Execution plan: `todo/SPRINT_5_UX_SHADCN_PLAN.md`

- Apply theming from `docs/THEME_UI_UX.md` across dashboard/history/settings.
- Accessibility sweeps (keyboard nav, focus states, contrast).
- Marketing pages
  - Landing page
  - Pricing page
  - SEO metadata
- Production readiness
  - Deployment smoke tests
  - Webhook and auth redirect URL verification in prod

## Product gaps vs `docs/MASTER_SPEC.md` (backlog)

- **Saved generations UX**
  - `/api/generations` supports `is_saved`, but there’s no UI to toggle save/unsave.
- **Search in history**
  - Spec mentions keyword search; not implemented.
- **Regenerate / variations**
  - Planned in spec; not implemented.
- **Signature placement in output**
  - We pass signature into the prompt instructions, but we don’t enforce appending signature in UI if the model omits it.
  - Optional: post-process reply to append signature when missing.
