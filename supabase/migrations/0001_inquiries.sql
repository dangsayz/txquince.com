-- ============================================================================
-- TX Quince — inquiries table (run in Supabase SQL editor)
-- ============================================================================
-- ONE table, locked down. RLS is ENABLED with NO policies, so the anon/public
-- role has NO select/insert/update/delete. All inserts happen SERVER-SIDE in
-- /api/inquiry using the SERVICE-ROLE key, which bypasses RLS. The public/anon
-- key must NEVER touch this table. (SECURITY LAW)
-- ============================================================================

create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  phone        text,
  event_date   date,
  venue        text,
  services     text,          -- 'photo' | 'video' | 'both'
  budget_range text,          -- lowest option = $2,500 (the filter)
  referral     text,
  message      text
);

-- Helpful for sorting newest-first in the Supabase dashboard.
create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

-- Enable RLS. With no policies defined, anon + authenticated are fully blocked.
alter table public.inquiries enable row level security;

-- Belt-and-suspenders: ensure the public roles have no table privileges.
revoke all on public.inquiries from anon;
revoke all on public.inquiries from authenticated;

-- (The service_role key bypasses RLS and retains full access by default — that
--  is the only path used to insert rows, from the server.)
