# Architecture — Personalized Email Reply Generator

**Version:** 1.0 (2026-03-10)

This document defines the system architecture and the implementation choices required for an end-to-end production launch.

## 1) Checklist
- Logical architecture (components)
- Deployment view
- Data flow and sequence diagrams (text)
- Key decisions and trade-offs
- Scaling & reliability plan
- Security and privacy controls

---

## 2) Architecture overview

### Primary stack
- **Frontend:** Next.js + TailwindCSS + shadcn/ui
- **Backend:** Next.js Route Handlers (server-side)
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth (preferred) or NextAuth
- **LLM:** OpenAI (default), Ollama (future)
- **Payments:** Stripe
- **Hosting:** Vercel
- **Analytics:** PostHog or Plausible
- **Error tracking:** Sentry

### Key guiding principles (market-informed)
- Keep the “Paste → Generate → Copy” loop extremely fast.
- Centralize LLM calls server-side to protect keys and manage cost.
- Store enough metadata to debug (model, prompt version, latency), without leaking data to analytics.

---

## 3) Component diagram (logical)

**Client (Browser)**
- Marketing pages
- Auth screens
- Dashboard / history / settings
- Calls Next.js APIs

**Next.js App (Server / Vercel)**
- Route handlers: `/api/generate`, `/api/generations`, `/api/user`, `/api/webhooks/stripe`
- Quota enforcement
- LLM adapter
- Billing adapter
- Analytics emitter

**Supabase**
- Postgres (users, generations, subscriptions, usage counters)
- Auth (sessions, OAuth)

**OpenAI**
- `chat.completions` / responses API (implementation detail)

**Stripe**
- Checkout / Customer Portal
- Webhooks

**Observability**
- Sentry
- PostHog/Plausible

---

## 4) Deployment architecture

### Production
- Vercel project
  - environments: Preview, Production
- Supabase project
  - Postgres with migrations
- Stripe account
  - products/prices configured
- OpenAI key
- Optional: PostHog Cloud + Sentry Cloud

### Secrets
Store in Vercel env vars:
- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`
- `POSTHOG_KEY`

---

## 5) Runtime sequences (text diagrams)

### 5.1 Generate reply
1. Client → POST `/api/generate`
2. API → Auth verify session
3. API → Plan lookup & quota check
4. API → DB insert generation(status=created)
5. API → Build prompt
6. API → OpenAI request
7. OpenAI → Reply
8. API → DB update generation(status=succeeded + reply + metadata)
9. API → Update usage counter
10. API → Client returns reply

### 5.2 Regenerate
Same as generate, but creates a new generation row with `parent_id`.

### 5.3 Subscribe (Stripe)
1. Client → `/pricing` click “Upgrade”
2. Client → server creates Stripe Checkout session
3. Stripe handles payment
4. Stripe → webhook to `/api/webhooks/stripe`
5. Webhook handler → verify signature
6. Handler → upsert subscription record + set user plan
7. Client refreshes plan and unlocks usage

---

## 6) Key architectural decisions

### A) Synchronous generation (MVP)
**Decision:** Keep generation synchronous for MVP.

Rationale:
- Lowest complexity
- Matches “10 seconds” promise
- Better for early-stage product iteration

Risk:
- Cost spikes and long response times under high load

Mitigation:
- Add strict quotas and rate limiting
- Add retries with backoff
- Consider async queue later

### B) Server-only LLM calls
**Decision:** LLM calls happen server-side.

Rationale:
- Protect API keys
- Centralize cost control and QA

### C) Quota implementation via `usage_counters`
**Decision:** Add a dedicated table for daily usage.

Rationale:
- Efficient and avoids counting large generation tables
- Simplifies quota reset logic

---

## 7) Scalability & reliability

### Expected bottlenecks
- LLM latency and rate limits
- Spike traffic after marketing launches

### Controls
- Daily quotas
- Per-minute rate limits
- Idempotency keys to avoid duplicate charges

### Future scaling option
- Async job system:
  - queue (Redis) + worker
  - client polls status or uses websockets

---

## 8) Security & privacy

- Auth required for all user data endpoints
- Stripe webhook signature verification
- Do not send raw email content to analytics
- Consider encryption strategy for stored email_input if necessary
- GDPR: delete/export endpoint

---

## 9) Operational readiness

- Sentry alerts for API errors
- Dashboard metrics: generate latency p95
- Stripe webhook error logs
- Runbook included in `MASTER_SPEC.md`
