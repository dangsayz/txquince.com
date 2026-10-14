-- ============================================================================
-- LOCAL ONLY — make a vanilla Postgres 16 look enough like self-hosted
-- Supabase for the migrations in supabase/migrations to apply unchanged.
-- Never run against a real Supabase database (it already has all of this).
-- ============================================================================

-- PostgREST roles. `authenticator` logs in and switches to the JWT's role.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login noinherit password 'authenticator-local-only';
  end if;
end
$$;
grant anon, authenticated, service_role to authenticator;

-- auth schema shim with auth.uid() / auth.role() like GoTrue's.
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create or replace function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '')
$$;

-- pg_cron shim: 0004 schedules a job; locally we only record it.
create schema if not exists cron;
create table if not exists cron.job (jobid serial primary key, jobname text unique, schedule text, command text);
create or replace function cron.schedule(p_name text, p_schedule text, p_command text) returns bigint
language sql as $$
  insert into cron.job (jobname, schedule, command) values (p_name, p_schedule, p_command)
  on conflict (jobname) do update set schedule = excluded.schedule, command = excluded.command
  returning jobid::bigint
$$;
create or replace function cron.unschedule(p_name text) returns boolean
language sql as $$ delete from cron.job where jobname = p_name returning true $$;

-- Supabase's default grants: every new table in public is usable by all three
-- API roles. This is deliberately the permissive default, so the migrations'
-- own REVOKEs are what lock things down — exactly as on the real server.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Two tables were created in the Supabase dashboard before migrations were
-- tracked (0010+ alter them). Minimal pre-0010 baselines so the chain applies.
create table if not exists public.portfolio_images (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  section    text not null default 'portfolio',
  url        text not null default '',
  storage_path text,
  alt        text not null default '',
  sort_order integer not null default 0
);
alter table public.portfolio_images enable row level security;
create table if not exists public.videos (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title      text not null default '',
  url        text not null default '',
  sort_order integer not null default 0
);
alter table public.videos enable row level security;
