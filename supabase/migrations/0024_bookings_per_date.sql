-- ============================================================================
-- TX Quince — up to 3 active bookings per date (run in Supabase SQL editor)
-- ============================================================================
-- TX Quince is a team now: the studio assigns photographers and videographers
-- by date and can cover more than one quinceañera on the same day. Until now a
-- PARTIAL UNIQUE INDEX allowed one active booking per event_date (0002, 0007).
--
-- This replaces the unique index with a capacity check: a BEFORE INSERT/UPDATE
-- trigger that serializes writers per date (advisory lock) and refuses a row
-- that would make the date's active bookings exceed bookings_per_date().
--
-- It raises SQLSTATE 23505 (unique_violation) with the message
-- 'date_unavailable', exactly what the old index raised, so every existing
-- caller keeps working unchanged:
--   - create_booking_hold() catches unique_violation → 'date_unavailable'
--   - confirm_booking_payment() catches it → 'payment_review'
--   - /api/admin/bookings/deposit-link maps 23505 → "That date is already taken"
--
-- The app reads the same number from src/lib/booking-capacity.ts
-- (BOOKINGS_PER_DATE); a test fails if the two ever disagree.
-- To change the capacity later: edit both, then re-run the function below.
-- ============================================================================

create or replace function public.bookings_per_date()
returns integer
language sql
immutable
as $$ select 3 $$;

create or replace function public.enforce_bookings_per_date()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  active_count integer;
begin
  if new.status not in ('requested', 'pending_payment', 'paid') then
    return new;
  end if;
  -- An UPDATE that keeps the row active on the same date doesn't add a booking.
  if tg_op = 'UPDATE'
     and old.event_date = new.event_date
     and old.status in ('requested', 'pending_payment', 'paid') then
    return new;
  end if;

  -- One writer per date at a time, so two concurrent checkouts can't both see
  -- room for the last spot. Released at commit/rollback.
  perform pg_advisory_xact_lock(hashtext('bookings_per_date:' || new.event_date::text));

  select count(*) into active_count
  from public.bookings
  where event_date = new.event_date
    and status in ('requested', 'pending_payment', 'paid')
    and id <> new.id;

  if active_count >= public.bookings_per_date() then
    raise exception 'date_unavailable' using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_enforce_per_date on public.bookings;
create trigger bookings_enforce_per_date
  before insert or update of status, event_date on public.bookings
  for each row execute function public.enforce_bookings_per_date();

-- The trigger now guards capacity; drop the one-per-date unique index and keep
-- a plain partial index so the per-date count stays fast.
drop index if exists public.bookings_active_event_date_idx;
create index if not exists bookings_active_event_date_idx
  on public.bookings (event_date)
  where status in ('requested', 'pending_payment', 'paid');

-- Only the server (service role) runs these.
revoke all on function public.enforce_bookings_per_date() from public, anon, authenticated;

-- ROLLBACK (back to one booking per date; fails if a date already has two):
--   drop trigger if exists bookings_enforce_per_date on public.bookings;
--   drop index if exists public.bookings_active_event_date_idx;
--   create unique index bookings_active_event_date_idx on public.bookings (event_date)
--     where status in ('requested', 'pending_payment', 'paid');
