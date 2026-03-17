# Sprint 2 — Status

## 1) Sprint overview
- **Sprint:** 2 (Auth, Profile, History)
- **Dates:** 2026-03-10 → TBD
- **Status:** In Progress
- **Goal:** Add authentication, user profile (signature/default tone), and history listing.

## 2) Scope

### In scope
- Supabase client + server helpers
- Auth pages: `/login` (email magic link) and `/auth/callback`
- Middleware to protect `/dashboard` and `/settings`
- `/api/user` GET/PUT (profile)
- `/api/generations` GET (history)
- Minimal settings/profile page

### Out of scope
- Stripe billing/quota (Sprint 3)
- Full UX polish (Sprint 5)

## 3) Execution checklist

- [x] Add Supabase client setup (browser + server)
- [x] Implement login + callback routes
- [x] Add route protection middleware
- [x] Implement `/api/user` GET/PUT
- [x] Implement `/api/generations` GET
- [x] Add `/settings/profile` UI
- [x] Wire dashboard to use profile defaults (default tone)
- [x] Document Supabase setup + RLS policies
- [x] Persist generations to Supabase when authenticated
- [x] Quality gates: lint + build + unit tests
- [x] Add `/history` UI
- [x] Wire profile signature into prompt builder

## 4) Deliverables produced

- `src/lib/supabase/*` (browser client, server admin client, auth cookie helpers)
- `src/middleware.ts` (protect `/dashboard`, `/settings`, `/history`)
- `src/app/login/page.tsx` (magic link sign-in)
- `src/app/auth/callback/route.ts` (PKCE code exchange; sets session cookie)
- `src/app/api/user/route.ts` (GET/PUT profile)
- `src/app/api/generations/route.ts` (GET history)
- `src/app/history/page.tsx` (history UI)
- `src/app/settings/profile/page.tsx` (profile editor)
- `SUPABASE_SETUP.md` (auth redirect URLs + schema + minimal RLS policies)
- Updated `src/app/api/generate/route.ts` to write generations when authenticated

## 5) Acceptance criteria validation

- Signup + login flow works: **PASS** (magic link + fragment handling sets cookie; user row upserts server-side)
- Profile edits persist and used by generations: **PASS** (default tone in dashboard; signature now applied on generation)
- History shows recent generations: **PASS** (`/history` UI + `/api/generations`; server writes generations when authenticated)

## 6) Quality gates

- Build: **PASS** (`npm run build`)
- Lint/Typecheck: **PASS** (`npm run lint` + TS in build)
- Unit tests: **PASS** (`npm test`)

## 7) Risks & mitigations

- Risk: Supabase project/keys not configured locally.
  - Mitigation: gate runtime paths with clear errors; keep mock generation working without auth.

## 8) Decisions made

- Use Supabase Auth (magic link) for MVP.

## 9) Next sprint handoff

- Sprint 3 adds quotas + Stripe and enforces plans.
