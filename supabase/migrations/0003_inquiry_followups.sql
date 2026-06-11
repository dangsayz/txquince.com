-- ============================================================================
-- TX Quince — inquiry follow-up tracking (run in Supabase SQL editor)
-- ============================================================================
-- Adds the columns the automated 3-touch follow-up sequence needs. The sequence
-- is driven by /api/cron/followups (daily Vercel cron) and only ever touches
-- rows via the SERVICE-ROLE key — RLS stays locked, no public access.
--
-- Booking-funnel research: ~50% of leads ghost after first contact; a 3–5 touch
-- value-add sequence is the highest-leverage recovery. Each touch links to the
-- galleries / payment plans / a soft scarcity nudge, with a one-click unsubscribe.
--
-- All additive + idempotent. Existing rows default to status='new', step 0.
-- ============================================================================

alter table public.inquiries
  add column if not exists status text not null default 'new'
    check (status in ('new', 'won', 'lost', 'unsubscribed')),
  add column if not exists followup_step integer not null default 0
    check (followup_step between 0 and 5),
  add column if not exists last_touch_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

-- Drives the cron's "who is due for the next touch" query.
create index if not exists inquiries_followup_idx
  on public.inquiries (status, followup_step, last_touch_at);
