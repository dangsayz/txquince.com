-- Phantom-hold backstop: a 'requested' date-hold that's never confirmed must
-- eventually free its date, just like a stale Stripe 'pending_payment' hold.
-- New requests set expires_at ~21 days out (see /api/reserve-request); this lets
-- the existing every-15-min cron release them once that window passes.
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
  where status in ('pending_payment', 'requested')
    and expires_at < now();

  get diagnostics released = row_count;
  return released;
end;
$$;

revoke all on function public.release_expired_booking_holds() from public;
grant execute on function public.release_expired_booking_holds() to service_role;
