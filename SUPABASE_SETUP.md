# Supabase setup (Sprint 2)

This project uses Supabase for:

- Auth (email magic link / OTP)
- Postgres storage (`users`, `generations`, `subscriptions`, `usage_counters`)

This doc makes Sprint 2 **self-contained** by providing the exact dashboard + SQL steps to get auth + profile + generation history working.

## 1) Create a Supabase project

1. Create a new Supabase project.
2. In **Project Settings → API** copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Create `.env.local` (do **not** commit):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional (enables real LLM)
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

## 2) Configure Auth redirect URLs (required)

Go to **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs** (add both):
  - `http://localhost:3000/auth/callback`
  - `http://127.0.0.1:3000/auth/callback`

This is required because the app uses a server route handler at `GET /auth/callback` to exchange the PKCE `code` for a session.

## 3) Apply DB schema (tables)

In **SQL Editor**, run:

1) `migrations/0001_init.sql`

## 4) Enable RLS + policies (minimal for MVP)

In **SQL Editor**, run the following SQL.

> Notes:
> - These policies assume your app stores the Supabase user id in `public.users.id`.
> - `auth.uid()` is the current authenticated user id.

```sql
-- USERS
alter table public.users enable row level security;

-- A user can read and update their own profile row
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
for select
using (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
for update
using (id = auth.uid());

-- Optionally allow inserting your own row from the client. If you don't want this,
-- keep inserts server-side only.
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
for insert
with check (id = auth.uid());


-- GENERATIONS
alter table public.generations enable row level security;

drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own" on public.generations
for select
using (user_id = auth.uid());

drop policy if exists "generations_insert_own" on public.generations;
create policy "generations_insert_own" on public.generations
for insert
with check (user_id = auth.uid());

drop policy if exists "generations_update_own" on public.generations;
create policy "generations_update_own" on public.generations
for update
using (user_id = auth.uid());
```

## 5) Ensure a `public.users` row exists on first login

### Option A (recommended for now): server upsert on first authenticated request

This repo uses server-side routes (`/api/user`, `/api/generate`) with a service role key.
They will upsert `public.users` as needed.

### Option B: Supabase trigger (advanced)

You can create a trigger on `auth.users` to also create `public.users` automatically.
This is optional and not required for MVP in this repo.

## 6) Smoke test

1. Start dev server.
2. Visit `/login`, enter your email, click **Send magic link**.
3. Open the email link → should land on `/dashboard`.
4. Visit `/settings/profile` and save profile.
5. Generate a reply on `/dashboard`.
6. Call `/api/generations` → should return recent items.

## Troubleshooting

### Magic link redirects to login or fails
- Confirm Redirect URLs include `http://localhost:3000/auth/callback`
- Confirm you're not using an old emailed link (they expire)

### `/api/user` returns 401
- You don't have the `perg_access_token` cookie (not signed in)
- Callback didn't receive a `code` param (redirect misconfigured)

### DB writes fail
- Ensure `migrations/0001_init.sql` has been applied
- If you enabled RLS, ensure the policies above were applied
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is present for server routes
