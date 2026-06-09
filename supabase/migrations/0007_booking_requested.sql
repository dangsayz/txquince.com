-- ============================================================================
-- TX Quince — "requested" bookings (capture-first, pay-second)
-- ============================================================================
-- The reserve form now SAVES a date-reservation request (no payment). The
-- operator talks to the family, confirms the date, and sends a Stripe deposit
-- link manually — so the deposit is step two, not step one. A 'requested'
-- booking still holds the date so it can't be double-requested.
-- ============================================================================

alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in (
    'requested', 'pending_payment', 'paid',
    'expired', 'cancelled', 'refunded', 'payment_review'
  ));

-- One active booking per event_date — now includes 'requested' so a saved
-- request reserves the day until the operator confirms or declines it.
drop index if exists bookings_active_event_date_idx;
create unique index bookings_active_event_date_idx
  on public.bookings (event_date)
  where status in ('requested', 'pending_payment', 'paid');
