# Personalized Email Reply Generator — Comprehensive Specification

This document is the canonical, launch-ready specification for the Personalized Email Reply Generator product. Use it as the single source of truth for Low-Level Design (LLD), ER diagrams, API implementation, UI copy, acceptance criteria, testing, and deployment.

Source: derived from `PRD.md` and expanded for implementation.

## Table of contents
- Purpose & scope
- Goals & success metrics
- Personas & user journeys
- Feature list (MVP + Day 2+)
- Pages & UI content
- UX flows and wireframe-level descriptions
- API specification (endpoints, contracts)
- Database schema and ER relationships
- AI prompt & adapter design
- Detailed architecture & LLD notes
- Security, privacy & compliance
- Billing & pricing pages
- Observability & monitoring
- Testing strategy (E2E, unit, integration)
- Deployment & CI/CD checklist
- Acceptance criteria and launch checklist
- Next steps & deliverables

---

## Purpose & scope

Purpose: provide a single, developer-friendly specification that covers everything required to build, test, and deploy the Personalized Email Reply Generator as described in the PRD.

Scope (this doc):
- Web application (Next.js) with auth, dashboard, email -> reply generation, history, profile/signature, pricing and billing.
- Integration with an LLM provider (OpenAI by default) via a server-side adapter.
- Supabase as primary DB & auth layer (optional NextAuth alternative noted).
- Stripe billing integration for paid plans.
- Observability: analytics (PostHog/Plausible), errors (Sentry), basic monitoring.

Out-of-scope (for Day 0 launch):
- Two-way Gmail send via API (planned Day 2+).
- Self-hosted Ollama adapter (optional future integration).

Assumptions:
- Project will use Next.js app routes and API routes.
- Vercel for hosting.
- Supabase for persistent storage and optional auth.

---

## Goals & success metrics

- Time-to-generate (TTG): median <= 10s for successful generate requests.
- Free-user retention: >= 20% weekly retention after launch.
- Error rate: < 5% failed generate requests.
- Conversion: identifiable upsell funnel from free -> Pro.

---

## Personas

- Freelancer — wants quick professional replies to client questions.
- Support agent — needs templated responses with personalization.
- Sales rep — responds to inbound leads with persuasive tone.
- Job seeker — replies to recruiter messages clearly.

Each persona should be able to complete the generate->copy->send loop in under 30 seconds.

---

## Feature list

MVP (must work end-to-end):
- Paste email input (text area) accepting plain text and quoted replies.
- Tone selection: Professional, Friendly, Formal, Casual, Persuasive, Short Reply.
- Reply length: Short, Medium, Detailed.
- Generate reply via AI model server-side.
- Copy button, Edit in output box, Regenerate (new variation), Save to history.
- User accounts: Signup / Login (Email & Google OAuth).
- History list of generated replies per user.
- Profile: name, job title, company, signature, default tone.
- Quota enforcement: Free plan = 10 replies/day.

Day 2–3 / Advanced:
- Signature auto-inserted into replies.
- Billing/Stripe: Pro ($9/mo), Agency ($29/mo) plans and webhook processing.
- Analytics (PostHog or Plausible).
- Rate limiting and abuse detection.

Future:
- Gmail integration (send directly from UI).
- Ollama/self-hosted model adapter.

---

## Pages & content (site map + CMS pages)

Public pages
- / (Landing) — hero, features, pricing, CTA, trust indicators.
- /pricing — full pricing table with plan details and comparison.
- /features — longer feature breakdown and examples.
- /privacy — privacy policy (GDPR data deletion instructions).
- /terms — terms of service.
- /help — FAQ and contact info.
- /auth/login — login page with Email + Google button.
- /auth/signup — signup or magic link.

Authenticated
- /dashboard — main entry (input on left, output on right or top/bottom depending on viewport).
- /history — list of past generations with search and filters.
- /settings/profile — edit name, job title, company, signature, default tone.
- /settings/billing — view plan, upgrade/downgrade, payment method.

UI copy snippets (important for UX consistency):
- Hero title: "Write Perfect Email Replies in Seconds"
- Hero CTA: "Try Free"
- Generate button: "Generate Reply"
- Copy button: "Copy"
- Regenerate: "Regenerate"
- Save: "Save to History"
- Empty history CTA: "Generate your first reply"

Accessibility: all pages must be keyboard-navigable and meet WCAG AA color contrast.

---

## UX flows (detailed)

1) New user signup + first generate
- User lands on `/`, clicks Try Free -> `/auth/signup`.
- Signup via magic link or Google OAuth -> redirect to `/dashboard`.
- Onboarding toast: "Paste an email to get started — 10 free replies/day".
- User pastes email, selects tone/length, clicks Generate.
- Loading state (skeleton + spinner + message: "Generating...") appears.
- When reply returns: output area populated, buttons Copy/Edit/Regenerate/Save visible.

Acceptance criteria: signup completes, first generation returns within 10s, user can copy and save.

2) Regenerate
- Regenerate uses same input + new randomness seed; original versions saved in history.

3) Billing & quota
- Free users see daily counter and CTA to upgrade when limit reached.

---

## API specification

General: all authenticated endpoints require a valid session (cookie/JWT). Server returns standard JSON envelope: { success: boolean, data: ..., error?: { code, message }}.

1) POST /api/generate
- Auth: required
- Body: { email: string, tone: string, length: string, idempotency_key?: string }
- Response 200: { success: true, data: { id: string, reply: string, model: string, prompt: string, tokens?: number }}
- Errors: 400 invalid input, 401 unauthorized, 429 quota exceeded, 502/503 AI backend error
- Behavior: store record in `generations` with status `created`; update to `succeeded` on success or `failed` on error.

2) POST /api/regenerate
- Body: { generationId: string, tone?: string, length?: string }
- Response: same as /api/generate and creates new `generation` row with relation to original via field `parent_id`.

3) GET /api/generations?limit=20&cursor=
- Returns paginated list for the user.

4) GET /api/generations/:id
- Returns full details including prompt and model metadata.

5) POST /api/generations/:id/save
- Marks generation as saved/favorite and accepts optional metadata { title, tags }.

6) GET /api/user
- Returns profile record (id, email, name, signature, default_tone, plan).

7) PUT /api/user
- Update allowed profile fields.

8) POST /api/webhooks/stripe
- Verify signature, update `subscriptions` table accordingly.

9) POST /api/admin/usage-report (internal)
- Admin-only, returns aggregated usage.

Auth notes:
- Use Supabase Auth sessions or NextAuth JWT sessions. Protect API routes server-side.

Rate limiting & quota enforcement
- Implement server-side daily counters per-user. For free tier, enforce 10/day.

---

## Database schema (Relational) and ER diagram description

This section shows tables and columns (ready for migration script). Use UUID PKs.

Table: users
- id: uuid PK
- email: varchar unique
- name: varchar
- job_title: varchar
- company: varchar
- signature: text
- default_tone: varchar
- plan: varchar (free/pro/agency)
- created_at: timestamptz
- updated_at: timestamptz

Table: generations
- id: uuid PK
- user_id: uuid FK -> users(id)
- parent_id: uuid FK -> generations(id) nullable (for regenerates)
- email_input: text
- tone: varchar
- length: varchar
- ai_model: varchar
- prompt: text
- ai_reply: text
- tokens_used: integer nullable
- status: varchar (created/succeeded/failed)
- is_saved: boolean default false
- created_at: timestamptz

Table: subscriptions
- id: uuid PK
- user_id: uuid FK -> users(id)
- plan: varchar
- status: varchar
- stripe_customer_id: varchar
- stripe_subscription_id: varchar
- created_at: timestamptz

Table: audit_events (optional)
- id, user_id, event_type, payload(jsonb), created_at

Indexes
- idx_generations_user_created_at (user_id, created_at)

ER relationships (textual diagram):
- users 1 --- * generations (user_id)
- generations 1 --- * generations (parent_id) for regenerate lineage
- users 1 --- 0..1 subscriptions

Notes for ER diagram generation: use the above fields; for LLD produce a diagram with these relations and annotate cascade delete behavior for user deletion (soft-delete or GDPR delete endpoint required).

---

## AI Prompt design & adapter

Prompt template (server-side):

System message (short):
"You are an expert business email assistant. Write a clear, concise reply that matches the user's tone and length preferences. Avoid hallucination and do not invent facts the user did not provide. If the reply needs follow-up questions, ask them politely. Append the user's signature if provided."

User prompt template:
"Tone: {tone}\nLength: {length}\nUser profile: {name} — {job_title} at {company} (signature: {signature})\nEmail:\n{email}\n\nReply:"

Model parameters (suggested):
- Model: gpt-4 or gpt-3.5-turbo (fallback)
- Temperature: 0.2 (professional/formal) — up to 0.6 for friendly/persuasive
- Max tokens: 512
- Top_p: 0.9

Adapter behavior:
- Centralize LLM calls in a server-side adapter module.
- Provide simple interface: generateReply({email, tone, length, userProfile, idempotencyKey}) -> {reply, prompt, model, tokens}
- Implement retries for transient errors with exponential backoff (2 retries).
- Record prompt, model and tokens in `generations` for reproducibility and billing.
- Sanitize input: trim inputs, enforce max length (e.g., 8k characters) and optionally run a summarizer step for very long emails.

Safety & content filtering:
- Run a light filter on output to avoid abusive or illegal content.

---

## Detailed architecture & LLD notes

High-level components:
- Frontend (Next.js) — pages for public site, client-side dashboard UI components.
- API layer (Next.js API routes or app route handlers) — validation, auth checking, DB writes, LLM adapter.
- Database (Supabase / Postgres) — persistence, migrations.
- Auth (Supabase Auth or NextAuth) — session management.
- Billing (Stripe) — subscription handling via webhooks.
- Observability (Sentry, PostHog)

Sequence for generate request:
1. Client sends POST /api/generate with request payload and idempotency key.
2. API validates session, checks daily quota and rate limits.
3. API creates `generation` row with status `created` (optimistic write) and returns a 202 + generation id to client (optional) or awaits LLM response synchronously.
4. API calls LLM adapter -> LLM provider.
5. On success: update `generation` row with reply, tokens, status `succeeded` and return reply to client.
6. On failure: update `generation` row status `failed` and return friendly error.

Synch vs Async: recommended synchronous for MVP to keep UX simple — call LLM inline and return reply. For heavy scale, move to async job queue (e.g., Redis queue + worker) with progress updates via websockets.

LLD notes / modules to implement:
- ui/components (TextArea, ToneSelect, LengthSelect, OutputBox, HistoryList)
- lib/llm-adapter (generateReply, retry logic, telemetry)
- lib/db (queries, migrations)
- pages/api/generate.ts (validate, quota, call adapter, persist)
- pages/api/generations (list, get, save)
- pages/auth (signup/login handlers)
- stripe/webhook handler

Storage & caching:
- Cache recent generation results per user for 1 hour to avoid duplicate calls.

Scaling considerations:
- LLM calls are the main cost: batch or cache where possible.
- Monitor token usage per user and flag heavy users.

---

## Frontend details: components & states

Main components:
- EmailInput (text area, paste detection, maxLength guard)
- ToneSelector (dropdown with icons)
- LengthSelector (segmented control)
- GenerateButton (disabled when empty; shows loading)
- OutputBox (editable content, Copy, Save, Regenerate actions)
- HistoryPanel (list with filters and pagination)

State transitions:
- Idle -> Generating -> Success/Failure

Edge UI states:
- Empty input -> show example placeholder text and CTA.
- Quota exceeded -> modal with upgrade CTA.

---

## Billing & Pricing pages

Plans (as in PRD):
- Free: 10 replies/day
- Pro: $9/month — unlimited replies, priority support
- Agency: $29/month — team access, seat management (future)

Pricing page requirements:
- Comparison table with features per plan.
- CTA buttons that open Stripe Checkout or manage subscription in `/settings/billing`.
- Legal copy: billing frequency, refund policy, cancellation instructions.

Stripe integration notes:
- Use Checkout for initial payment flows.
- Use webhooks to update `subscriptions` table on events: invoice.paid, customer.subscription.updated, invoice.payment_failed, customer.subscription.deleted.
- Implement retry and notification for failed payments.

---

## Observability & monitoring

Events to track (analytics): generate.request, generate.success, generate.fail, copy, save, regenerate, signup, upgrade, downgrade.

Metrics & alerts:
- Latency P50/P95 for generate API — alert if P95 > 15s.
- Error rate for /api/generate — alert if > 5% over 5m.
- Stripe webhook failures — alert on repeated webhook signature failures.

Tools: PostHog (funnel), Sentry (errors), simple server logs and Prometheus-compatible metrics if adding infra.

---

## Security, privacy & compliance

Authentication & sessions:
- Use secure, httpOnly cookies for sessions.
- Use standard OAuth for Google.

Data protection & GDPR:
- Provide user data deletion endpoint: DELETE /api/user or /api/user/delete-request, which removes or anonymizes personal data and generations.
- Consider encrypting `email_input` and `ai_reply` at application layer if storing sensitive user messages is a concern.

Secrets:
- Store API keys and secrets in Vercel environment variables.

Webhooks:
- Validate Stripe signatures.

Rate limiting & abuse:
- Limit requests per IP + per user to prevent runaway costs.

---

## Testing strategy

Automated tests to add prior to launch:
- Unit tests (Jest): lib/llm-adapter logic, quota logic, DB helpers.
- Integration tests (Node): API route handlers with mocked DB and LLM provider.
- E2E (Playwright or Cypress): signup flow, generate flow, regenerate, quota enforcement, pricing checkout flow (sandbox), history and profile updates.

Minimum test matrix before launch:
- 5 E2E happy-paths: signup -> generate -> copy -> save -> view history.
- 3 unit tests for generate success/failure and quota enforcement.

Manual QA checklist:
- Cross-browser (Chrome, Safari, Firefox) and responsive checks.
- Accessibility audit.

---

## Non-functional requirements

- Performance: median generate latency <= 10s on typical conditions.
- Scalability: be ready to turn LLM calls into worker jobs if synchronous approach hits limits.
- Reliability: retries for transient LLM errors, Sentry monitored.

---

## Deployment & CI/CD

CI checks
- Linting (ESLint), typecheck (TypeScript), unit tests, E2E smoke.

Vercel pipeline
- Branch preview deployments for PRs.
- Production deployment on merge to `main`.

Environment variables (minimum):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SENTRY_DSN
- POSTHOG_KEY

Run locally (developer commands) — provide in README later:
```bash
npm install
cp .env.example .env.local
# fill env vars
npm run dev
```

---

## Acceptance criteria and launch checklist

Functional acceptance (all must pass):
- Generate returns contextual reply for pasted email with chosen tone+length.
- Copy, Edit, Regenerate and Save functionality present and working.
- Signup/Login via Email and Google works and persists profile.
- History lists saved generations and loads them into editor.
- Free quota enforced and upgrade CTA works with Stripe sandbox.

Quality & observability:
- E2E and unit tests passing in CI.
- Sentry and analytics initialized and receiving events.

Security & compliance:
- Stripe webhooks validated, env vars not leaked.
- GDPR deletion endpoint present or documented.

Launch steps (short):
1. Verify env vars and secrets in Vercel.
2. Run DB migrations and seed demo user.
3. Deploy to production and hit smoke tests: signup, generate, billing sandbox.
4. Monitor metrics and Sentry for first 24–72 hours.

---

## Low-Level Design (LLD) pointers

Files & modules outline (suggested):
- /src/components/* — UI primitives
- /src/ui/* — shadcn-based UI composition
- /src/pages/* — Next.js pages and app routes
- /src/pages/api/generate.ts — main generation handler
- /src/lib/llm-adapter.ts — wraps OpenAI/other providers
- /src/lib/db.ts — queries and migrations
- /src/lib/billing.ts — stripe helpers
- /migrations/* — SQL migrations for tables above

Sequence diagrams (textual) — generate
Client -> API(/api/generate): POST payload
API -> DB: insert generation (created)
API -> LLM adapter: call model
LLM -> API: reply
API -> DB: update generation status each step
API -> Client: return final reply

Database migration suggestions
- Create users, generations, subscriptions tables with constraints and indexes.
- Add unique index on users.email.

---

## Example ER Diagram (text description)

- users (id PK)
  - has many -> generations
  - has one -> subscription
- generations (id PK)
  - belongs to -> user
  - may belong to -> parent generation (self-relation)

Use any ER diagram tool (dbdiagram.io, draw.io) with the table definitions above.

---

## Operational runbook (short)

If high error rates observed on /api/generate:
1. Check Sentry for recent errors and stack traces.
2. Check OpenAI status and API key limits.
3. Check DB connectivity and RDS/managed DB metrics.
4. Temporarily throttle or disable non-admin users if costs spike.

---

## Next steps & deliverables I can produce now

- Generate SQL migration files for the schema above.
- Create API route stubs for `/api/generate`, `/api/generations`, `/api/user`.
- Create basic Next.js page templates for Landing, Dashboard, History, Settings.
- Generate Playwright E2E skeleton tests for the happy paths.

Tell me which of these you'd like me to implement first and I will create the tasks and code stubs.

---

Appendix: quick references
- Quota policy: Free 10/day — server enforces by counting `generations` with created_at >= local midnight.
- Idempotency: client may pass idempotency_key to avoid duplicate LLM charges.
- Storage retention: default keep generations indefinitely; provide user control to purge data.
