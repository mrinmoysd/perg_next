# Iteration plan — end-to-end delivery

Location: `/todo/ITERATIONS.md`

Purpose: provide a pragmatic, time-boxed iteration plan to implement the product end-to-end using the spec artifacts in this repository. Each sprint has clear deliverables, acceptance criteria, and references to the spec documents so implementation stays aligned.

Guiding constraints
- Small, focused sprints (1 week each) to ship incremental, testable functionality.
- Prioritize the core generate loop (paste -> generate -> copy) before advanced features.
- Keep costs predictable: enforce quotas early and centralize LLM calls server-side.

How to use this document
- Assignees pick a sprint, create issues/tasks per line item, mark progress, and reference satisfying files (PRs should reference these tasks).

Definition of Done (DoD) for any sprint item
- Code compiles and passes lint/type checks
- Unit tests for new logic added (where applicable)
- Integration/E2E test (happy path) added or updated
- Documentation updated (one-line in README or linked spec)
- Deployed to preview environment and smoke-tested

---

Sprint 0 — Repo & infra setup (2 days)
Goal: get project scaffolding and developer environment ready.

Tasks:
- Create Next.js app skeleton (app router) or confirm existing structure. (if not present)
- Add `eslint`, `prettier`, TypeScript config, and husky pre-commit hooks.
- Add environment `.env.example` with required vars listed in `MASTER_SPEC.md`.
- Setup Supabase project (dev) and create initial DB (manual or using DBML later).
- Add sample Vercel project or a local run doc.

Deliverables:
- Basic repo scaffold, CI skeleton (lint + unit test). Files: `LLD.md`, `ARCHITECTURE.md` referenced.

Acceptance criteria:
- `npm run dev` starts without fatal errors (or documented if Next app not created here).
- CI job passes lint.

Estimated: 2 days

---

Sprint 1 — Core generate flow (5 days)
Goal: Implement server-side generate API, basic dashboard UI to paste email, choose tone/length, and show reply.

Tasks:
- Implement `/api/generate` route (LLD + `API_OPENAPI.yaml`) with validation, prompt builder, and LLM adapter stubbed (mock) + DB draft write.
- Implement `LLMAdapter` with actual OpenAI call behind env var (use mock for CI). Include retry logic.
- Implement `GenerationService` to create & finalize generation rows in DB (use `generations` table per `ER_DIAGRAM.dbml`).
- Frontend: Dashboard page with EmailInput, ToneSelect, LengthSelect, GenerateButton, OutputEditor.
- Add Copy and Regenerate UI interactions (regenerate triggers POST `/api/regenerate` which in this sprint can call `/api/generate` with parent reference).
- Hook basic analytics events (local log or PostHog if key present).

Deliverables/files:
- `src/app/dashboard/page.tsx`, `src/app/api/generate/route.ts`, `src/lib/llm/*`, `src/lib/generation/*`
- Update `DATA_DICTIONARY.md` if DB changes needed

Acceptance criteria:
- Paste -> Generate returns reply (mocked or real if OPENAI_API_KEY present) within 10s in preview.
- Copy copies plaintext to clipboard.
- Generation row written to DB with status succeeded and metadata (model/prompt) recorded.
- Unit tests for `PromptBuilder` and `LLMAdapter` retry path.

Estimated: 5 days

Risks & mitigation:
- OpenAI key missing: use mock adapter in CI and local dev by default.

---

Sprint 2 — Auth, Profile, and History (5 days)
Goal: Add authentication, user profiles (signature, default tone), and history listing.

Tasks:
- Integrate Supabase Auth (email magic link + Google OAuth) or NextAuth based on `MASTER_SPEC.md` decision.
- Implement `/api/user` GET/PUT endpoints and frontend settings/profile page.
- Implement HistoryPanel UI and `/api/generations` GET endpoint with pagination and saved filter.
- Wire profile signature into prompt builder so generated replies include signature when copying/sending.

Deliverables/files:
- `src/app/api/user/route.ts`, `src/app/settings/profile/page.tsx`, `src/app/history/page.tsx`

Acceptance criteria:
- Signup + login flow works and creates `users` row.
- Profile edits persist and are used by new generations.
- History shows saved and recent generations; opening an item loads content into editor.

Estimated: 5 days

---

Sprint 3 — Quota, Billing, and Subscriptions (5 days)
Goal: Enforce free quota and add Stripe Checkout for Pro plan; update subscription state via webhooks.

Tasks:
- Implement `usage_counters` table and `QuotaService.canGenerate` + increment behavior.
- Add quota badge in UI and server-side enforcement (429 response + upgrade CTA modal).
- Integrate Stripe Checkout (test mode) and `/api/webhooks/stripe` route for subscription updates.
- Update `SubscriptionService.getPlanForUser` to consult `subscriptions` table.

Deliverables/files:
- `src/app/api/webhooks/stripe/route.ts`, `src/app/settings/billing/page.tsx`

Acceptance criteria:
- Free user cannot generate after 10 successful generations/day (server enforced).
- Stripe checkout flow (test keys) results in DB subscription row being upserted on webhook event and user plan updated.

Estimated: 5 days

---

Sprint 4 — Observability, Tests, and Security (5 days)
Goal: Add analytics, Sentry integration, unit and E2E test coverage, and GDPR endpoints.

Tasks:
- Add PostHog (or simple analytics stub) event hooks for core events per `MASTER_SPEC.md`.
- Configure Sentry DSN more detail capture.
- Add Jest unit tests and Playwright skeleton E2E tests for signup -> generate -> history flows.
- Implement `/api/user/delete` or documented deletion workflow (GDPR).

Deliverables/files:
- `tests/` (unit), `e2e/` (Playwright skeleton), analytics config

Acceptance criteria:
- All unit tests pass locally; 3 core E2E tests run in CI (happy paths).
- Observability events visible in PostHog (if key present) and errors sent to Sentry.

Estimated: 5 days

---

Sprint 5 — Polish, UX, and Launch (5 days)
Goal: Implement theming, finalize UI polish, accessibility fixes, finalize docs, and launch to production.

Tasks:
- Apply `THEME_UI_UX.md` tokens and styles across app.
- Fix accessibility (keyboard, color contrast) issues.
- Finalize marketing pages (Landing, Pricing) with SEO meta tags.
- Run smoke tests in production preview; ensure webhooks, auth, and generation work.
- Update `README` and `MASTER_SPEC.md` with any final decisions.

Deliverables/files:
- Styled components, accessibility report, final README updates

Acceptance criteria:
- No critical accessibility issues; smoke tests pass; production deploy successful.

Estimated: 5 days

---

Post-launch (ongoing)
- Monitor Sentry & analytics for first 72 hours and pivot on issues.
- Iterate on user feedback, add Gmail integration and team features post-MVP.

---

CI/CD and QA rules
- Each PR must include at least one unit test for new logic and a screenshot or brief description for UI changes.
- Merge to main triggers preview deploy; maintainers run E2E smoke on preview before marking release-ready.

Dependencies & blockers
- OpenAI key for integration testing
- Stripe test keys for billing flow
- Supabase dev project for auth and DB

Risk register (top items)
- Cost of LLM usage — mitigate with quotas and soft-limits.
- OAuth and callback misconfigurations — test early.
- Stripe webhook mismatch — test webhook signature verification locally with stripe CLI.

Communication cadence
- Daily standups (10–15m)
- Sprint demo and retro at end of each sprint

Owner notes
- Assign concrete owners to tasks in your issue tracker. Use labels: `sprint:X`, `area:api`, `area:frontend`, `priority:high`.

References
- `MASTER_SPEC.md`, `SPEC.md`, `PRD.md`
- `LLD.md`, `ARCHITECTURE.md`, `SYSTEM_DESIGN.md`
- `ER_DIAGRAM.dbml`, `DATA_DICTIONARY.md`, `API_OPENAPI.yaml`

---

If you want, I can now scaffold the Sprint 1 API and frontend stubs (create files and basic handlers) and wire the mocked LLM adapter; tell me to `scaffold sprint1` and I'll start creating the code files.
