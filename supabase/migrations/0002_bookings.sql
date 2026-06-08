-- ============================================================================
-- TX Quince — bookings table + atomic date-hold RPCs (run in Supabase SQL editor)
-- ============================================================================
-- Self-service deposit booking. A quinceañera is ONE event per day, so the
-- EVENT DATE itself is the unique bookable resource (no time slots). The flow:
--
--   /api/booking → create_booking_hold() (status 'pending_payment', 30-min hold)
--   → Stripe Checkout (deposit) → webhook → confirm_booking_payment() ('paid').
--
-- A PARTIAL UNIQUE INDEX on event_date (for active statuses) guarantees the same
-- date can never be double-sold, even under concurrent checkouts.
--
-- SECURITY LAW: RLS is ENABLED with NO policies — anon/authenticated are fully
-- blocked. All access is server-side via the SERVICE-ROLE key + SECURITY DEFINER
-- RPCs, mirroring the locked-down `inquiries` table.
-- ============================================================================

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  name          text not null check (char_length(trim(name)) >= 2),
  email         text not null,
  phone         text,
  event_date    date not null,
  package       text not null check (package in ('photo', 'video', 'both')),
  notes         text,
  status        text not null default 'pending_payment' check (
    status in ('pending_payment', 'paid', 'expired', 'cancelled', 'refunded', 'payment_review')
  ),
  deposit_amount_cents integer not null check (deposit_amount_cents > 0),
  currency      text not null default 'usd' check (currency = lower(currency) and currency ~ '^[a-z]{3}$'),
  expires_at    timestamptz not null,
  paid_at       timestamptz,
  cancelled_at  timestamptz,
  refunded_at   timestamptz,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text,
  stripe_customer_email      text,
  confirmation_owner_status  text,
  confirmation_client_status text,
  confirmation_sent_at       timestamptz,
  metadata      jsonb not null default '{}'::jsonb
);

-- THE double-booking guard: at most one ACTIVE booking per date.
-- 'expired'/'cancelled'/'refunded'/'payment_review' rows free the date again.
create unique index if not exists bookings_active_event_date_idx
  on public.bookings (event_date)
  where status in ('pending_payment', 'paid');

-- Dashboard / reporting helpers.
create index if not exists bookings_status_created_at_idx
  on public.bookings (status, created_at desc);
create index if not exists bookings_event_date_idx
  on public.bookings (event_date);

-- updated_at trigger (shared helper; safe to (re)create).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Lock the table: RLS on, no policies → anon + authenticated fully blocked.
alter table public.bookings enable row level security;
revoke all on public.bookings from anon;
revoke all on public.bookings from authenticated;

-- ----------------------------------------------------------------------------
-- release_expired_booking_holds() — flips stale unpaid holds to 'expired',
-- which frees their date (drops out of the partial unique index).
-- ----------------------------------------------------------------------------
create or replace function public.release_expired_booking_holds()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  released integer := 0;
begin
  update public.bookings
  set status = 'expired'
  where status = 'pending_payment'
    and expires_at < now();

  get diagnostics released = row_count;
  return released;
end;
$$;

-- ----------------------------------------------------------------------------
-- create_booking_hold() — atomically reserves a date for the checkout window.
-- Raises 'date_unavailable' if the date is already actively booked/held.
-- ----------------------------------------------------------------------------
create or replace function public.create_booking_hold(
  p_name          text,
  p_email         text,
  p_phone         text,
  p_event_date    date,
  p_package       text,
  p_notes         text,
  p_deposit_cents integer,
  p_currency      text,
  p_hold_minutes  integer
)
returns table (
  booking_id           uuid,
  event_date           date,
  deposit_amount_cents integer,
  currency             text,
  expires_at           timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_id       uuid;
  hold_expires timestamptz;
begin
  perform public.release_expired_booking_holds();

  hold_expires := now() + make_interval(mins => greatest(p_hold_minutes, 10));

  begin
    insert into public.bookings (
      name, email, phone, event_date, package, notes,
      deposit_amount_cents, currency, expires_at
    )
    values (
      trim(p_name),
      lower(trim(p_email)),
      nullif(trim(coalesce(p_phone, '')), ''),
      p_event_date,
      p_package,
      nullif(trim(coalesce(p_notes, '')), ''),
      p_deposit_cents,
      lower(p_currency),
      hold_expires
    )
    returning id into new_id;
  exception when unique_violation then
    raise exception 'date_unavailable';
  end;

  return query
  select new_id, p_event_date, p_deposit_cents, lower(p_currency), hold_expires;
end;
$$;

-- ----------------------------------------------------------------------------
-- confirm_booking_payment() — called from the Stripe webhook. Idempotent.
-- If the date was claimed by another paid/pending booking while this one was in
-- checkout, the row lands in 'payment_review' for the operator to refund/resolve
-- instead of silently double-booking.
-- ----------------------------------------------------------------------------
create or replace function public.confirm_booking_payment(
  p_checkout_session_id text,
  p_payment_intent_id   text default null,
  p_customer_email      text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  booking_row public.bookings%rowtype;
begin
  select *
  into booking_row
  from public.bookings
  where stripe_checkout_session_id = p_checkout_session_id
  for update;

  if not found then
    raise exception 'booking_not_found';
  end if;

  if booking_row.status in ('paid', 'payment_review') then
    return booking_row.id;
  end if;

  begin
    update public.bookings
    set
      status = 'paid',
      paid_at = coalesce(paid_at, now()),
      stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
      stripe_customer_email = coalesce(p_customer_email, stripe_customer_email)
    where id = booking_row.id;
  exception when unique_violation then
    -- The date was taken by another active booking during checkout.
    update public.bookings
    set
      status = 'payment_review',
      paid_at = coalesce(paid_at, now()),
      stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
      stripe_customer_email = coalesce(p_customer_email, stripe_customer_email)
    where id = booking_row.id;
  end;

  return booking_row.id;
end;
$$;

-- Only the service-role key (server) may execute these.
revoke all on function public.release_expired_booking_holds() from public;
revoke all on function public.create_booking_hold(text, text, text, date, text, text, integer, text, integer) from public;
revoke all on function public.confirm_booking_payment(text, text, text) from public;

grant execute on function public.release_expired_booking_holds() to service_role;
grant execute on function public.create_booking_hold(text, text, text, date, text, text, integer, text, integer) to service_role;
grant execute on function public.confirm_booking_payment(text, text, text) to service_role;
