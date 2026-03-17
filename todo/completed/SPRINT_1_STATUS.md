# Sprint 1 — Status

## 1) Sprint overview
- **Sprint:** 1 (Core generate flow)
- **Dates:** 2026-03-10 → TBD
- **Status:** In Progress
- **Goal:** Implement the core end-to-end loop: paste email -> choose tone/length -> generate reply -> copy; store generation in DB (initially local stub or Supabase).

## 2) Scope

### In scope
- `/api/generate` route handler (server-side) per `API_OPENAPI.yaml`
- Prompt builder + mocked LLM adapter (real OpenAI optional)
- Dashboard UI form (email input + tone + length + output + copy)
- Persist generation records (prefer Supabase; fallback to in-memory mock for early wiring)
- Unit tests for prompt builder

### Out of scope
- Full auth (Sprint 2)
- Full history UI (Sprint 2)
- Stripe billing + quotas (Sprint 3)

### Key references
- `docs/MASTER_SPEC.md`
- `docs/LLD.md`
- `docs/API_OPENAPI.yaml`
- `docs/ER_DIAGRAM.dbml`
- `docs/THEME_UI_UX.md`
- `/todo/ITERATIONS.md`
- `/todo/STATUS_GUIDE.md`

## 3) Execution checklist

- [x] Add DB migrations (baseline schema) and document how to apply
- [x] Implement `PromptBuilder`
- [x] Implement `LLMAdapter` with mock + optional OpenAI
- [x] Implement `/api/generate` (validation + call adapter + persist stub)
- [x] Update `/dashboard` to call `/api/generate` and show output
- [x] Add copy button
- [x] Add unit tests (prompt builder)

## 4) Deliverables produced

- `migrations/0001_init.sql` (baseline DB schema)
- `src/app/api/generate/route.ts` (generate endpoint)
- `src/lib/generate/*` (types, validation, prompt builder, LLM adapter)
- Updated `src/app/dashboard/page.tsx` with end-to-end UI
- Unit tests via Vitest (`src/lib/generate/promptBuilder.test.ts`)

## 5) Acceptance criteria validation

- Paste -> Generate returns reply within 10s: **PASS (local mock/OpenAI)**
- Copy copies plaintext: **PASS**
- Generation record persisted: **PARTIAL** (prompt + reply returned; DB schema added; persistence wiring deferred to Supabase in Sprint 2)

## 6) Quality gates

- Build: **PASS** (`npm run build`)
- Lint/Typecheck: **PASS** (`npm run lint` + TS in build)
- Unit tests: **PASS** (`npm test`)
- E2E smoke: **N/A (not added yet)**

## 7) Risks & mitigations

- Risk: Supabase not configured yet; impact medium.
  - Mitigation: implement persistence behind a repository interface; start with in-memory/local JSON fallback.

## 8) Decisions made

- None yet.

## 9) Next sprint handoff

- Sprint 2 will add auth + profile + history.
