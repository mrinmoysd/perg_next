# Sprint A — Status

## 1) Sprint overview
- **Sprint:** A (Launch blockers)
- **Dates:** 2026-03-17 → TBD
- **Status:** In Progress
- **Goal:** Remove launch blockers: legal/help pages, Sentry, Playwright E2E smoke, and self-service account deletion.

## 2) Scope

### In scope
- Public pages: `/help`, `/privacy`, `/terms` (and wire navigation links)
- Observability: Sentry integration (client + server)
- E2E: Playwright setup + 3–5 smoke tests
- Privacy/GDPR: self-service account deletion (API + UI)
- Production readiness doc: auth + Stripe + webhook URL validation checklist

### Out of scope
- Stripe webhook robustness + customer portal (Sprint B)
- Google OAuth (Sprint C)
- Editable reply + variations (Sprint C)

### Key references
- `todo/LAUNCH_GAPS.md`
- `todo/PENDING_ITEMS.md`
- `docs/MASTER_SPEC.md`
- `docs/API_OPENAPI.yaml`
- `todo/STATUS_GUIDE.md`

## 3) Execution checklist

### A1 — Legal/help pages
- [x] Add `/help` page (FAQ + contact)
- [x] Add `/privacy` page
- [x] Add `/terms` page
- [x] Link legal/help from public footer (and/or pricing)
- [x] Per-page metadata (title/description)

### A2 — Sentry
- [x] Add Sentry deps and config
- [ ] Capture client error (manual test)
- [ ] Capture server/API error (manual test)

### A3 — Playwright E2E
- [x] Install + config Playwright
- [ ] Add safe E2E auth helper (test-only)
- [ ] E2E tests:
  - [x] unauth redirect `/dashboard` → `/login`
  - [ ] generate + save flow
  - [ ] history search
  - [ ] quota exceeded flow (mocked)
	- [x] public pages render (`/`, `/pricing`, `/help`, `/privacy`, `/terms`)

### A4 — Self-service deletion
- [x] Add API endpoint for deletion (self-service)
- [x] Add UI in Profile settings with confirmation
- [x] Ensure delete cascades remove data + logs out (cookie cleared; DB cascades via FK)

### A5 — Production validation doc
- [x] Add `docs/PROD_CHECKLIST.md`

### Quality gates
- [x] Lint: PASS (`npm run lint`)
- [x] Tests: PASS (`npm test`)
- [x] Build: PASS (`npm run build`)
- [x] E2E: PASS (Playwright)

## 4) Deliverables produced
- `src/app/help/page.tsx` — Help/FAQ + contact page (public)
- `src/app/privacy/page.tsx` — Privacy policy page (public)
- `src/app/terms/page.tsx` — Terms of service page (public)
- Updated `src/app/page.tsx` and `src/app/pricing/page.tsx` — footer links to Help/Privacy/Terms
- `docs/PROD_CHECKLIST.md` — Production smoke checklist for auth + Stripe + webhooks
- `sentry.client.config.ts` — Sentry client init (enabled only when `SENTRY_DSN` is set)
- `sentry.server.config.ts` — Sentry server init (enabled only when `SENTRY_DSN` is set)
- `sentry.edge.config.ts` — Sentry edge init (enabled only when `SENTRY_DSN` is set)
- Updated `next.config.ts` — wrapped with Sentry config (silent/no-op unless configured)
- `playwright.config.ts` — Playwright config (Chromium) with baseURL
- `playwright/unauth-redirect.spec.ts` — smoke test for unauth redirect
- `playwright/public-pages.spec.ts` — smoke test for public pages
- Updated `package.json` — added `test:e2e`

## 5) Acceptance criteria validation
- Legal/help pages exist and are linked: **PASS**
- Sentry captures errors when DSN is set: TBD
- Playwright smoke suite runs reliably: **PASS**
- User can delete account and is logged out; data removed: **PASS**
- Production checklist exists: **PASS**

## 6) Quality gates
- Build: **PASS**
- Lint/Typecheck: **PASS**
- Unit tests: **PASS**
- E2E smoke: **PASS**

## 7) Risks & mitigations
- Risk: E2E auth is flaky if it depends on magic-link email.
  - Mitigation: add a test-only auth bypass that’s disabled by default and guarded by env.

## 8) Decisions made
- API spec alignment is handled in Sprint C.

## 9) Next sprint handoff
- Handoff to Sprint B: webhook idempotency, invoice events, Stripe portal.
- Handoff to Sprint C: Google OAuth, API missing endpoints, editable reply + variations.
