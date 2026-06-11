-- First-touch acquisition source captured on the client and stored with each
-- lead/booking so the dashboard can attribute revenue to a channel. Display-only
-- JSON: { source, medium, campaign, referrer, landing, ts }. Nullable; written
-- server-side via the service role (RLS already locked on both tables).
alter table public.bookings add column if not exists attribution jsonb;
alter table public.inquiries add column if not exists attribution jsonb;
