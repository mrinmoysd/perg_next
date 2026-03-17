# System Design — Personalized Email Reply Generator

**Version:** 1.0 (2026-03-10)

This doc focuses on system design: APIs, data, scaling, reliability, cost controls, and operational concerns.

## 1) Goals
- Ship a production-ready AI reply generator with strong UX and predictable costs.
- Handle early growth spikes safely.
- Support billing tiers and quotas.

## 2) Core workloads

### 2.1 Online inference (LLM calls)
- Latency-sensitive
- Cost-sensitive
- Spiky traffic

### 2.2 CRUD workloads
- History browsing/search
- Profile updates
- Subscription updates

## 3) Capacity and cost model (practical)

Cost drivers:
- Token usage per generation
- Regenerations per request
- Free plan abuse

Cost controls:
- Input max length (hard cap)
- Free quota limit (10/day)
- Per-user rate limits
- Idempotency keys
-+- optional caching of identical prompts (per user, short TTL)

## 4) Data design choices

### Store prompt + model metadata
Why:
- Debugging failures
- Support consistent regenerations
- Support billing and analytics without leaking content externally

### Usage counters vs counting generations
Use `usage_counters` for fast reads and atomic updates.

## 5) API design details

### Input validation
- Use schema validation (e.g., Zod)
- Reject empty email
- Enforce max length

### Idempotency
- Accept `idempotency_key`
- Store in generation row or a separate table
- On duplicate key within TTL: return existing result

### Error taxonomy
- `INVALID_INPUT`
- `UNAUTHORIZED`
- `QUOTA_EXCEEDED`
- `RATE_LIMITED`
- `LLM_TIMEOUT`
- `LLM_UNAVAILABLE`
- `DB_ERROR`

## 6) Reliability design

### Retry strategy
- Retry only safe, transient failures (429, 5xx)
- 2 retries, exponential backoff

### Timeouts
- Set server-side timeout (e.g., 20–30s) to avoid hanging serverless requests

### Circuit breaker (optional)
- If LLM fails repeatedly, temporarily disable generate for non-paying users

## 7) Scaling strategy

### MVP scaling
- Stateless Next.js API routes scale horizontally on Vercel
- Supabase handles DB scaling up to initial limits

### Next scaling step
- Async generation via job queue
- Background worker with concurrency control

## 8) Security design

- Server-only secrets
- RLS in Supabase if any client direct access to tables
- Stripe signature verification
- Avoid storing sensitive analytics properties
- Support deletion/export

## 9) Observability design

Logs:
- generation latency
- LLM errors
- webhook failures

Metrics:
- p95 generate latency
- generate success rate
- daily active users
- conversion funnel

Tracing (optional):
- Correlate a request id end-to-end

## 10) System design diagrams (text)

### 10.1 High-level data flow
Client -> API -> DB
Client -> API -> LLM
Stripe -> Webhook -> DB

### 10.2 Read-heavy pages
- `/history`: pagination + indexes
- `/pricing`: static
