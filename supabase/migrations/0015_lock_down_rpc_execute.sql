-- Lock down SECURITY DEFINER RPCs so the public PostgREST API (the anon +
-- authenticated roles, exposed via /rest/v1/rpc/*) can't invoke them directly.
-- The app calls these only with the service-role key (server-side), so
-- service_role keeps EXECUTE. Closes Supabase advisor lints 0028 + 0029.
revoke execute on function public.confirm_booking_payment(text, text, text)
  from anon, authenticated, public;
revoke execute on function public.create_booking_hold(text, text, text, date, text, text, integer, text, integer)
  from anon, authenticated, public;
revoke execute on function public.release_expired_booking_holds()
  from anon, authenticated, public;

grant execute on function public.confirm_booking_payment(text, text, text)
  to service_role;
grant execute on function public.create_booking_hold(text, text, text, date, text, text, integer, text, integer)
  to service_role;
grant execute on function public.release_expired_booking_holds()
  to service_role;

-- Pin the trigger function's search_path (advisor lint 0011).
alter function public.set_updated_at() set search_path = public, pg_temp;
