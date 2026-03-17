# Personalized Email Reply Generator — Master Spec (Validated + Market-Informed)

**Version:** 1.0 (2026-03-10)

This is the consolidated, implementation-grade specification for the product.

It:
- Validates and reconciles `PRD.md` vs `SPEC.md`.
- Adds market/competitive research insights to build a best-in-class version.
- Defines end-to-end requirements (pages, UX, API, DB, billing, analytics, security).
- Provides the exact inputs needed to generate **LLD**, **ER diagram**, and **architecture** documents.

> Note on “market research”: this spec includes **practical, product-driven competitive patterns** commonly found in modern AI writing SaaS tools (UX conventions, pricing tactics, onboarding, safety, trust). If you want citations/links to specific competitors, I can add a referenced appendix, but that requires web lookups.

---

## 0) Requirements checklist (source of truth)

From PRD (must-haves):
- [x] Paste received email
- [x] Tone selection (Professional, Friendly, Formal, Casual, Persuasive, Short Reply)
- [x] Reply length (Short, Medium, Detailed)
- [x] AI reply generation
- [x] Copy
- [x] Regenerate
- [x] History (optional in PRD, **required for launch** here)
- [x] Auth (Email + Google)
- [x] Landing page with hero/features/pricing

From SPEC (added for launch readiness):
- [x] Profile (name/job/company/signature/default tone)
- [x] Quota enforcement (Free 10/day)
- [x] Stripe billing + webhook processing
- [x] CMS/legal pages (/privacy, /terms, /help)
- [x] Observability (analytics + error tracking)
- [x] Testing strategy (unit + integration + E2E)

Market-informed additions (best-in-class baseline):
- [x] “Examples” / “Templates” section (to reduce blank-page friction)
- [x] Trust & safety: privacy messaging, retention controls, “don’t train on my data” toggle statement (policy-level)
- [x] Input helpers: auto-detect sender/receiver names (optional), and subject field (optional)
- [x] Share/export: copy as plain text + “copy with formatting” (HTML) (optional)
- [x] Versioning: show multiple generations in a “variations” list during a session

---

## 1) Product positioning (market-informed)

### Category
AI writing assistant focused on **inbox reply** workflows.

### Why this can win
Most generic AI writing tools are broad. This tool focuses on:
- **Speed** (10-second loop)
- **Consistency** (signature, tone memory)
- **Safety and professionalism** (avoid hallucinations; ask clarifying questions)
- **Workflow fit** (history, reuse, templates)

### Key differentiators to bake in from day 1
1. **Reply modes**: “Short Reply” as a first-class tone (PRD already has it).
2. **Signature memory**: simple but high perceived value.
3. **History + re-open**: reduces repeated work and creates lock-in.
4. **Quota transparency**: users trust tools that show usage clearly.
5. **Privacy clarity**: users may paste sensitive emails.

---

## 2) Scope: MVP vs later

### MVP (launch target)
End-to-end working product including:
- Landing + pricing pages
- Auth
- Dashboard with generation
- History
- Settings/profile
- Free quota + upgrade path
- Stripe billing (at least Pro)
- Analytics/events + error monitoring

### Post-MVP (timeboxed)
- Team accounts (Agency)
- Gmail integration
- Multi-language support
- Saved templates, canned replies

---

## 3) User journeys (E2E)

### 3.1 First-time user journey
1. Visit `/` (marketing)
2. Click “Try Free” -> `/auth/signup`
3. Signup via Google or email magic link
4. Redirect to `/dashboard`
5. Paste email, choose tone+length
6. Click Generate
7. Read + optionally edit
8. Copy and send in their email client
9. Save to history

Success criteria:
- Time from landing to copied reply <= 60 seconds on first try.

### 3.2 Returning user journey
1. Login
2. Dashboard shows last used tone/length
3. Paste new email -> Generate
4. History panel searchable by keyword

### 3.3 Quota exceeded
1. Free user hits 10/day
2. Generation blocked with modal
3. CTA to upgrade -> Stripe Checkout
4. After payment webhook updates plan -> generate unlocked

---

## 4) Site map (pages) + required content blocks

### Public
- `/` Landing
  - Hero block (headline + subtext + CTA)
  - Demo section: sample input/output (interactive fake demo)
  - “How it works” (3 steps)
  - Use cases
  - Pricing teaser
  - FAQ teaser
- `/pricing`
  - Plan cards + comparison table
  - FAQ about billing
  - Refund/cancellation policy summary
- `/features`
  - Deep feature explanation + screenshots
- `/help`
  - FAQ + contact
- `/privacy`
  - Data retention, deletion, sub-processors, analytics disclosure
- `/terms`

### Auth
- `/auth/login`
- `/auth/signup`
- `/auth/callback/*` (provider)

### App (authenticated)
- `/dashboard`
- `/history`
- `/settings/profile`
- `/settings/billing`

### SEO requirements
- Unique meta title/description per page
- OpenGraph images (static)
- Schema.org FAQ (for `/pricing` or `/help`)

---

## 5) Dashboard UX spec (wireframe-level)

### Layout
- Left rail: History (collapsible)
- Main: Email input + selectors + output

### Inputs
- Email input textarea (required)
  - Placeholder example
  - Max length guard (e.g., 8k chars)
- Tone select (required)
- Length select (required)

### Output
- Output box (editable)
- Buttons:
  - Copy (plain text)
  - Copy formatted (optional)
  - Save
  - Regenerate
  - “Improve” quick actions (optional): Shorten, Make more formal, Add empathy

### Session variations (market pattern)
- On regenerate, show a small “Variations” list (V1, V2, V3) for quick switching.

### Error states
- Empty input
- Quota exceeded
- AI error/timeout
- Auth expired

---

## 6) Functional requirements (detailed)

### 6.1 Generation
Inputs:
- email_text: string
- tone: enum
- length: enum
- user_profile: { name, job_title, company, signature, default_tone }

Outputs:
- reply_text: string
- metadata: { model, tokens_used, latency_ms, generation_id }

Rules:
- Reply must not invent facts; should ask clarifying questions when needed.
- Should reflect the tone and length.
- Should include signature if configured.
- Should preserve key context (dates, meeting requests, pricing asks).

### 6.2 History
- List user’s generations sorted by newest
- Search by keyword
- “Saved” filter
- Open item shows full content + metadata

### 6.3 Profile
- Editable fields:
  - name
  - job_title
  - company
  - signature
  - default_tone

### 6.4 Quota & rate limiting
- Free: 10 successful generations/day
- Pro/Agency: unlimited (with soft abuse guard)
- Rate limiting per user/IP to prevent runaway costs

### 6.5 Billing
- Stripe Checkout for new subscription
- Billing portal for manage/cancel
- Webhook updates subscription state

---

## 7) Non-functional requirements (NFR)

- Performance: P50 generate latency <= 10s; P95 <= 15s (best effort)
- Reliability: generation success rate >= 95%
- Security: auth-protected APIs; Stripe signature verification
- Privacy: document retention and deletion; avoid logging raw email content in analytics
- Accessibility: WCAG AA for UI
- Operability: Sentry + analytics events + basic logs

---

## 8) API specification (implementation contract)

All responses use envelope:
```json
{ "success": true, "data": { } }
```
or
```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

### Auth
Session via secure cookie/JWT.

### POST `/api/generate`
Request:
```json
{ "email": "...", "tone": "professional", "length": "medium", "idempotency_key": "uuid" }
```
Response (200):
```json
{ "success": true, "data": { "id": "uuid", "reply": "...", "model": "gpt-4.1", "tokens": 123, "latency_ms": 5340 } }
```
Errors:
- 400 INVALID_INPUT
- 401 UNAUTHORIZED
- 429 QUOTA_EXCEEDED
- 503 LLM_UNAVAILABLE

### POST `/api/regenerate`
Request:
```json
{ "generationId": "uuid", "tone": "friendly", "length": "short" }
```

### GET `/api/generations`
Query:
- limit
- cursor
- savedOnly

### GET `/api/generations/:id`

### POST `/api/generations/:id/save`

### GET `/api/user` and PUT `/api/user`

### POST `/api/webhooks/stripe`
- Verifies `Stripe-Signature`

---

## 9) Database schema (ready for ERD + migrations)

Use Postgres (Supabase). UUID primary keys.

### 9.1 Tables

**users**
- id (uuid, pk)
- email (text, unique)
- name (text)
- job_title (text)
- company (text)
- signature (text)
- default_tone (text)
- plan (text: free|pro|agency)
- created_at (timestamptz)
- updated_at (timestamptz)

**generations**
- id (uuid, pk)
- user_id (uuid, fk -> users.id)
- parent_id (uuid, fk -> generations.id, nullable)
- email_input (text)
- tone (text)
- length (text)
- ai_model (text)
- prompt (text)
- ai_reply (text)
- tokens_used (int)
- latency_ms (int)
- status (text: created|succeeded|failed)
- is_saved (bool)
- created_at (timestamptz)

**subscriptions**
- id (uuid, pk)
- user_id (uuid, fk -> users.id)
- plan (text)
- status (text)
- stripe_customer_id (text)
- stripe_subscription_id (text)
- current_period_end (timestamptz, nullable)
- created_at (timestamptz)

**usage_counters** (recommended; simplifies quota)
- id (uuid, pk)
- user_id (uuid, fk -> users.id)
- day (date)
- successful_generations (int)
- created_at
- updated_at

**audit_events** (optional)
- id (uuid)
- user_id (uuid)
- event_type (text)
- payload (jsonb)
- created_at

### 9.2 ER relationships (text ERD)
- users (1) -> (many) generations
- generations self relation via parent_id
- users (1) -> (0..1) subscriptions
- users (1) -> (many) usage_counters

### 9.3 RLS (Supabase Row Level Security)
If using Supabase directly from client:
- Enable RLS on all user tables.
- Policy: user can only select/insert/update rows where `user_id = auth.uid()`.

If using server-only DB access:
- You can still enable RLS for safety, but the server role key bypasses it.

---

## 10) AI design (prompting + provider strategy)

### Prompt goals (market-informed)
- Avoid hallucinations (don’t invent project details)
- Ask clarifying questions when needed
- Keep replies concise by default
- Respect tone

### Prompt template
System:
"You are an expert business email assistant. Write a reply that is accurate and does not invent facts. If important info is missing, ask up to 2 clarifying questions. Match the selected tone and length."

User:
"Tone: {tone}\nLength: {length}\nProfile: {name}, {job_title}, {company}\nSignature: {signature}\nEmail:\n{email}\n\nReply:"

### Provider
- Default: OpenAI
- Future: Ollama

### Cost controls
- Max input chars
- Caching for repeated idempotency keys
- Daily quotas

---

## 11) Architecture blueprint (for architecture doc)

### 11.1 Deployment architecture (recommended)
- Next.js on Vercel
- Supabase for Postgres and Auth
- Stripe for billing
- OpenAI API
- PostHog/Plausible + Sentry

### 11.2 Component diagram (text)
- Web Client
  - Public pages
  - Auth pages
  - Dashboard
- Next.js Server
  - API routes (auth + generate + history + billing)
  - LLM adapter
  - DB access layer
- Supabase
  - Postgres
  - Auth
- Stripe
  - Checkout
  - Webhooks
- Observability
  - Analytics
  - Error tracking

### 11.3 Key runtime sequences
Generate:
Client -> API -> quota check -> DB insert -> LLM -> DB update -> client

Subscribe:
Client -> Stripe checkout -> webhook -> DB subscription update -> UI refresh

---

## 12) LLD starter (module breakdown)

Recommended folder/module boundaries (Next.js):
- `src/app/(marketing)/*` for public pages
- `src/app/(auth)/*` for login/signup
- `src/app/(app)/*` for dashboard/history/settings
- `src/app/api/*` route handlers
- `src/lib/llm/*` (adapters, prompt builder)
- `src/lib/db/*` (Supabase client, repositories)
- `src/lib/billing/*` (Stripe client, webhook verifier)
- `src/lib/analytics/*` (event emitter)

Core services (LLD):
- `QuotaService`: canGenerate(userId), incrementSuccess(userId)
- `GenerationService`: createGeneration(), finalizeGeneration(), regenerate()
- `UserProfileService`: get/update
- `SubscriptionService`: getPlan(userId), handleWebhook(event)
- `Telemetry`: track(event)

---

## 13) Analytics events (product + growth)

Track without sending full email content:
- `user_signed_up`
- `generate_clicked` (tone, length)
- `generation_succeeded` (latency_ms, tokens)
- `generation_failed` (error_code)
- `reply_copied`
- `reply_saved`
- `quota_exceeded`
- `upgrade_clicked`
- `subscription_started`
- `subscription_cancelled`

---

## 14) Testing plan (end-to-end)

### Unit
- Prompt builder outputs expected format
- Quota logic (free 10/day)
- LLM adapter retry behavior

### Integration
- /api/generate with mocked LLM
- /api/webhooks/stripe signature verification (mock)

### E2E (Playwright)
1. Signup/login -> dashboard
2. Generate -> copy -> save
3. History loads saved item
4. Quota exceeded blocks generation
5. Pricing -> checkout (stripe test mode) -> unlocked quota

---

## 15) Security & privacy (market expectation)

- Clear privacy notice: users paste sensitive emails
- Avoid storing emails in analytics; store in DB only
- Provide user deletion / export
- Stripe webhook verification
- CSRF mitigation where applicable

---

## 16) Launch checklist

- [ ] DB migrations applied
- [ ] RLS policies applied (if client reads)
- [ ] Auth provider configured
- [ ] Stripe products + webhook configured
- [ ] OpenAI key set
- [ ] Sentry + analytics verified
- [ ] E2E smoke tests pass
- [ ] Landing page SEO tags validated

---

## 17) Validation notes: PRD vs SPEC gaps and decisions

Resolved differences:
- PRD marks History optional; this spec makes it required for launch (retention driver).
- PRD’s schema is minimal; this spec adds fields needed for billing, quotas, and reproducibility (prompt/model/tokens/latency).
- PRD lists Agency “team access”; MVP supports pricing display and subscription tiering, team features can be post-MVP.

Risks:
- Billing + auth + AI all together in MVP can be a lot; if schedule is tight, launch with Free + “Waitlist for Pro” then add Stripe.

---

## 18) Deliverables this document enables

From this doc you can generate:
- **ER Diagram**: using §9 tables + relations.
- **Architecture doc**: using §11.
- **LLD**: using §12 + API/DB details.
