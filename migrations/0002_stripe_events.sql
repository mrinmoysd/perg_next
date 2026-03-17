-- Migration: 0002_stripe_events
-- Purpose: Add a table for Stripe webhook idempotency.

create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);
