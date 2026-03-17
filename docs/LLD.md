# Low-Level Design (LLD) — Personalized Email Reply Generator

**Version:** 1.0 (2026-03-10)

This LLD is derived from `MASTER_SPEC.md` and is written to be directly actionable for implementation.

## 1) Checklist (what this LLD covers)
- Modules/services and responsibilities
- Data flow and key sequences
- Route handlers (API) contracts and validation
- Database access layer and query shapes
- UI module/component breakdown
- Error handling, retries, quotas
- Testing hooks and boundaries

---

## 2) Codebase layout (proposed)

Assuming Next.js App Router:

```
src/
  app/
    (marketing)/
      page.tsx
      pricing/page.tsx
      features/page.tsx
      help/page.tsx
      privacy/page.tsx
      terms/page.tsx
    (auth)/
      auth/login/page.tsx
      auth/signup/page.tsx
      auth/callback/[provider]/page.tsx
    (app)/
      dashboard/page.tsx
      history/page.tsx
      settings/profile/page.tsx
      settings/billing/page.tsx
    api/
      generate/route.ts
      regenerate/route.ts
      generations/route.ts
      generations/[id]/route.ts
      generations/[id]/save/route.ts
      user/route.ts
      webhooks/stripe/route.ts
  components/
    marketing/
    app/
    ui/
  lib/
    auth/
    db/
    llm/
    quota/
    billing/
    analytics/
    errors/
  styles/
    globals.css
```

If using Pages Router, adapt paths to `pages/` and `pages/api/`.

---

## 3) Domain model

### 3.1 Types (TypeScript)

**Enums**
- `Tone = 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive' | 'short_reply'`
- `Length = 'short' | 'medium' | 'detailed'`
- `Plan = 'free' | 'pro' | 'agency'`

**UserProfile**
- `id: string`
- `email: string`
- `name?: string`
- `jobTitle?: string`
- `company?: string`
- `signature?: string`
- `defaultTone?: Tone`
- `plan: Plan`

**Generation**
- `id: string`
- `userId: string`
- `parentId?: string`
- `emailInput: string`
- `tone: Tone`
- `length: Length`
- `aiModel: string`
- `prompt: string`
- `aiReply: string`
- `tokensUsed?: number`
- `latencyMs?: number`
- `status: 'created' | 'succeeded' | 'failed'`
- `isSaved: boolean`
- `createdAt: string`

---

## 4) Core services (LLD)

### 4.1 `AuthService`
Responsibilities:
- Read currently authenticated user/session
- Provide `requireUser()` for server routes

Key functions:
- `getSession(req) -> Session | null`
- `requireUser(req) -> { userId, email }` throws UNAUTHORIZED

### 4.2 `QuotaService`
Responsibilities:
- Enforce Free plan daily quota (10/day)
- Throttle abusive usage (per-user and per-IP)

Key functions:
- `canGenerate(userId) -> { allowed: boolean, remaining: number, resetAt: ISOString }`
- `incrementSuccess(userId, day) -> void`

Implementation detail:
- Use `usage_counters` (recommended) or count successful `generations` for the day.

### 4.3 `PromptBuilder`
Responsibilities:
- Build the system/user prompt from (tone, length, userProfile, email)
- Centralize prompt versioning

Key functions:
- `buildPrompt({ tone, length, userProfile, email }) -> { system: string, user: string, promptText: string }`

### 4.4 `LLMAdapter`
Responsibilities:
- Call OpenAI (default) and return structured results
- Handle retry for transient errors
- Enforce max input size

Key functions:
- `generateReply({ system, user, model, temperature, maxTokens, idempotencyKey }) -> { reply, model, tokensUsed, latencyMs }`

Retry policy:
- 2 retries, exponential backoff (e.g., 250ms, 1000ms) for 429/5xx.

### 4.5 `GenerationService`
Responsibilities:
- Persist generation lifecycle
- Create + finalize generation records
- Support regenerate lineage

Key functions:
- `createGenerationDraft(userId, payload) -> generationId`
- `finalizeGenerationSuccess(generationId, llmResult) -> Generation`
- `finalizeGenerationFailure(generationId, error) -> void`
- `regenerate(userId, generationId, overrideTone?, overrideLength?) -> Generation`

### 4.6 `SubscriptionService`
Responsibilities:
- Infer plan from subscription state
- Handle Stripe webhook events

Key functions:
- `getPlanForUser(userId) -> Plan`
- `handleStripeWebhook(event) -> void`

### 4.7 `AnalyticsService`
Responsibilities:
- Track product events without sensitive content

Key functions:
- `track(eventName, props) -> void`

---

## 5) API route handlers (LLD)

### Common handler scaffolding
All handlers must:
1. Authenticate
2. Validate input (zod recommended)
3. Enforce quota
4. Call business service
5. Return envelope response

Standard errors:
- `INVALID_INPUT`
- `UNAUTHORIZED`
- `QUOTA_EXCEEDED`
- `LLM_UNAVAILABLE`
- `INTERNAL_ERROR`

### 5.1 POST `/api/generate`
Flow:
1. `user = AuthService.requireUser()`
2. Validate { email, tone, length, idempotency_key? }
3. `plan = SubscriptionService.getPlanForUser(user.id)`
4. If plan free: `QuotaService.canGenerate()` else allow.
5. Create draft generation row status=created
6. Build prompt
7. Call LLM
8. Update generation status + fields
9. Increment quota on success
10. Track analytics

Edge cases:
- Empty email => 400
- Very long email => truncate or reject 400
- LLM failure => return 503 and mark generation failed

### 5.2 POST `/api/regenerate`
Flow:
- Validate generation ownership
- Create new generation with `parent_id = original.id`

### 5.3 GET `/api/generations`
- Pagination by cursor
- Default order created_at desc

### 5.4 GET `/api/generations/:id`
- Ownership required

### 5.5 POST `/api/generations/:id/save`
- Toggle `is_saved`

### 5.6 GET/PUT `/api/user`
- Return/update profile

### 5.7 POST `/api/webhooks/stripe`
- Verify signature
- Parse events:
  - subscription created/updated/deleted
  - invoice paid/failed
- Update `subscriptions` and user `plan`

---

## 6) Database access layer

Use repository pattern:
- `UserRepo`
- `GenerationRepo`
- `SubscriptionRepo`
- `UsageCounterRepo`

Each repo exposes small focused methods. Avoid leaking DB client into route handlers.

Example repo methods:
- `GenerationRepo.createDraft({ userId, emailInput, tone, length })`
- `GenerationRepo.markSucceeded({ id, aiReply, prompt, aiModel, tokensUsed, latencyMs })`
- `UsageCounterRepo.incrementSuccess({ userId, day })`

---

## 7) Frontend LLD

### 7.1 App state
Dashboard local state:
- `emailInput: string`
- `tone: Tone`
- `length: Length`
- `isGenerating: boolean`
- `replyText: string`
- `variations: { id, replyText }[]` (optional)
- `error: { code, message } | null`

### 7.2 Components
- `EmailInput`
- `ToneSelect`
- `LengthSelect`
- `GenerateButton`
- `OutputEditor`
- `CopyButton`
- `RegenerateButton`
- `SaveButton`
- `HistoryPanel` + `HistoryItem`
- `QuotaBadge`

### 7.3 UX contract details
- Disable Generate when input empty
- Show skeleton loading while generating
- Copy success toast
- Regenerate adds new variation without losing previous output

---

## 8) Testing hooks

### Unit tests
- PromptBuilder
- QuotaService
- LLMAdapter retry

### Integration tests
- API handler with mocked LLM and DB

### E2E tests
- Signup/login
- Generate + copy + save
- History open
- Quota exceed
- Billing flow sandbox

---

## 9) Open questions (explicit)

These can be resolved during implementation without blocking docs:
- Do we store the raw prompt? (recommended yes for debugging; optional encryption)
- Do we offer “copy formatted”? (nice to have)
- Do we implement team/agency seats in MVP? (recommended no)
