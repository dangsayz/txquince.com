-- ============================================================================
-- TX Quince — abandoned-booking recovery
-- ============================================================================
-- When a date-hold expires unpaid, the family was one click from paying. This
-- column lets a cron send them exactly ONE "your date is still open — finish
-- reserving" email and never email them twice. Nullable; set the moment the
-- recovery email goes out.
-- ============================================================================

alter table public.bookings
  add column if not exists recovery_sent_at timestamptz;

-- The recovery cron scans recently-expired, not-yet-recovered holds.
create index if not exists bookings_recovery_idx
  on public.bookings (status, recovery_sent_at, created_at);
