-- First-party, cookieless analytics owned by us (powers the admin dashboard).
-- Written only by the server (service role via /api/track); never read by the
-- anon client, so RLS stays locked with no policies.
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,            -- form_started | cta_clicked | share | ...
  path text,
  target text,
  session_id text,
  created_at timestamptz not null default now()
);
create index if not exists lead_events_created_at_idx on public.lead_events (created_at desc);

alter table public.page_views enable row level security;
alter table public.lead_events enable row level security;
-- No policies: only the service role (which bypasses RLS) may read/write.

comment on table public.page_views is 'First-party page-view analytics. Service-role only.';
comment on table public.lead_events is 'First-party lead/intent events. Service-role only.';
