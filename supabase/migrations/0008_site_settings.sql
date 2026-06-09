-- Key/value store for editable site content (hero media, etc.). Read server-side
-- via the service role; never exposed to the anon client, so RLS stays locked.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
-- No policies: only the service role (which bypasses RLS) may read/write.

comment on table public.site_settings is 'Editable site content (key/value). Service-role only.';
