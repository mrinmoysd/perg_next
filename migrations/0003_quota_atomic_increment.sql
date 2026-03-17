-- Migration: 0003_quota_atomic_increment
-- Purpose: Make quota increments atomic under concurrency.
-- Note: Some editors lint this as non-T-SQL; this is valid Postgres (Supabase).

create or replace function public.increment_usage_success(
  p_user_id text,
  p_day text
)
returns void
language plpgsql
as $$
begin
  insert into public.usage_counters (user_id, day, successful_generations)
  values (p_user_id, p_day, 1)
  on conflict (user_id, day)
  do update
    set successful_generations = public.usage_counters.successful_generations + 1,
        updated_at = now();
end;
$$;
