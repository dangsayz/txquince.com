-- ============================================================================
-- TX Quince — auto-release expired booking holds (pg_cron)
-- ============================================================================
-- A stale 'pending_payment' hold frees its date the next time anyone calls
-- create_booking_hold() (it runs release_expired_booking_holds() first). This
-- adds a belt-and-suspenders schedule so a date frees even with zero new traffic.
--
-- Enables pg_cron (Supabase-supported) and schedules the cleanup every 15 min.
-- Idempotent: re-running re-schedules cleanly. Apply only if you want the safety
-- net — the inline cleanup already covers the common case.
-- ============================================================================

create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'release-expired-booking-holds') then
    perform cron.unschedule('release-expired-booking-holds');
  end if;
end
$$;

select cron.schedule(
  'release-expired-booking-holds',
  '*/15 * * * *',
  $$select public.release_expired_booking_holds();$$
);
