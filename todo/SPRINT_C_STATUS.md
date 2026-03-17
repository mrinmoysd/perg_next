# Sprint C — Status

## 1) Sprint overview
- **Sprint:** C (Polish + conversion)
- **Dates:** TBD
- **Status:** Complete
- **Goal:** Ship Google OAuth, match API implementation to OpenAPI, and implement editable replies + variations UX.

## 2) Scope

### In scope
- Google OAuth login at launch
- Implement missing endpoints from `docs/API_OPENAPI.yaml`
  - `POST /api/regenerate`
  - `GET /api/generations/{id}`
  - `POST /api/generations/{id}/save`
- Editable reply UI (Dashboard)
- Variations list per session/generation group

### Out of scope
- (TBD)

### Key references
- `todo/LAUNCH_GAPS.md`
- `docs/API_OPENAPI.yaml`
- `docs/MASTER_SPEC.md`

## 3) Execution checklist
- [x] Google OAuth (Supabase provider + UI)
- [x] Implement missing API endpoints
- [x] Update UI to use spec endpoints (optional but recommended)
- [x] Editable reply UX
- [x] Variations list UX
- [x] Quality gates: lint/test/build + E2E smoke

## 4) Deliverables produced
- `src/app/api/regenerate/route.ts` — `POST /api/regenerate`
- `src/app/api/generations/[id]/route.ts` — `GET /api/generations/{id}`
- `src/app/api/generations/[id]/save/route.ts` — `POST /api/generations/{id}/save`
- `src/app/login/page.tsx` — Google OAuth sign-in button
- `src/app/auth/callback/route.ts` — upsert user + set cookie on OAuth callback
- `src/app/(app)/dashboard/page.tsx` — editable reply + variations UI; uses spec-aligned save/regenerate endpoints

## 5) Acceptance criteria validation
- (TBD)

## 6) Quality gates
- Build: **PASS**
- Lint/Typecheck: **PASS**
- Unit tests: **PASS**
- E2E smoke: **PASS**

## 7) Risks & mitigations
- Risk: OAuth callback + cookie session issues.
  - Mitigation: add clear prod checklist + staging validation.

## 8) Decisions made
- (TBD)

## 9) Next sprint handoff
- Post-launch polish.
