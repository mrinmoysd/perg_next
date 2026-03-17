-- Migration: 0001_init
-- Baseline schema for Personalized Email Reply Generator
-- Source of truth: docs/ER_DIAGRAM.dbml and docs/DATA_DICTIONARY.md

create extension if not exists "pgcrypto";

-- users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  job_title text,
  company text,
  signature text,
  default_tone text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- generations
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  parent_id uuid references public.generations(id) on delete set null,
  email_input text not null,
  tone text not null,
  length text not null,
  ai_model text,
  prompt text,
  ai_reply text,
  tokens_used integer,
  latency_ms integer,
  status text not null default 'created',
  is_saved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_generations_user_created_at on public.generations(user_id, created_at desc);
create index if not exists idx_generations_user_saved_created_at on public.generations(user_id, is_saved, created_at desc);

-- subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null,
  status text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create unique index if not exists idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists idx_subscriptions_stripe_subscription on public.subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;

-- usage_counters
create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  day date not null,
  successful_generations integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, day)
);

-- audit_events (optional)
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_events_user_created_at on public.audit_events(user_id, created_at desc);

-- stripe_events (webhook idempotency)
-- Used to safely ignore duplicate Stripe webhook deliveries.
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_usage_counters_updated_at on public.usage_counters;
create trigger trg_usage_counters_updated_at
before update on public.usage_counters
for each row execute function public.set_updated_at();
