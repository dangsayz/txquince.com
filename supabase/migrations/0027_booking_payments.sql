-- ============================================================================
-- TX Quince — booking_payments: the family pays the REST of their total online
-- (run in Supabase SQL editor)
-- ============================================================================
-- The deposit lives on `bookings` (one Stripe checkout per booking). Balance
-- payments are a LEDGER: one row per balance checkout, so a family can pay the
-- rest all at once, in parts, or with Klarna / Afterpay / Affirm at checkout.
--
-- What's left = agreement.balanceUsd (signed snapshot) − sum(rows 'paid').
--
-- Safety rails, enforced HERE (not just in app code):
--   - at most ONE live checkout per booking (partial unique index), so two
--     tabs / a double tap / a script can't open two sessions and overpay;
--   - amount is a positive whole number of cents, capped;
--   - every Stripe session id maps to exactly one row (unique).
--
-- SECURITY LAW: RLS on, NO policies — anon/authenticated fully blocked. Only
-- the server (service role) reads or writes this table.
-- ============================================================================

create table if not exists public.booking_payments (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  booking_id    uuid not null references public.bookings(id) on delete restrict,
  kind          text not null default 'balance' check (kind in ('balance')),
  amount_cents  integer not null check (amount_cents > 0 and amount_cents <= 10000000),
  currency      text not null default 'usd' check (currency = lower(currency) and currency ~ '^[a-z]{3}$'),
  -- opening    = row reserved, Stripe session being created
  -- open       = checkout live at Stripe
  -- processing = checkout finished, money still settling (async methods)
  -- paid       = money in
  -- review     = Stripe collected something unexpected; operator checks it
  status        text not null default 'opening' check (
    status in ('opening', 'open', 'processing', 'paid', 'expired', 'failed', 'refunded', 'review')
  ),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text,
  checkout_url        text,
  checkout_expires_at timestamptz,
  paid_at             timestamptz
);

-- THE double-pay guard: one live checkout per booking at a time.
create unique index if not exists booking_payments_one_live_idx
  on public.booking_payments (booking_id)
  where status in ('opening', 'open', 'processing');

create index if not exists booking_payments_booking_idx
  on public.booking_payments (booking_id, status);
create index if not exists booking_payments_pi_idx
  on public.booking_payments (stripe_payment_intent_id);

drop trigger if exists booking_payments_set_updated_at on public.booking_payments;
create trigger booking_payments_set_updated_at
  before update on public.booking_payments
  for each row execute function public.set_updated_at();

alter table public.booking_payments enable row level security;
revoke all on public.booking_payments from anon;
revoke all on public.booking_payments from authenticated;

-- ROLLBACK: drop table if exists public.booking_payments;
