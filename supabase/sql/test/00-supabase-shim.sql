-- Minimal Supabase-like environment for testing lockdown-anon.sql locally.
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role authenticator login noinherit;
grant anon, authenticated, service_role to authenticator;
create role supabase_admin nologin;  -- owner role we (postgres) are NOT a member of? superuser here, so it works

grant usage on schema public to anon, authenticated, service_role;

-- Supabase's defaults: every new object in public is granted to the API roles.
alter default privileges for role postgres in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on functions to anon, authenticated, service_role;

-- auth schema shim (GoTrue-owned on Supabase; untouched by the lockdown).
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;

-- pg_cron shim (migration 0004).
create schema cron;
create table cron.job (jobid bigserial primary key, jobname text unique, schedule text, command text);
create function cron.schedule(name text, sched text, cmd text) returns bigint language sql as
  $$ insert into cron.job (jobname, schedule, command) values (name, sched, cmd) returning jobid $$;
create function cron.unschedule(name text) returns boolean language sql as
  $$ delete from cron.job where jobname = name returning true $$;

-- Tables the live database has but no migration creates (made in the Supabase
-- dashboard). Created WITHOUT RLS, like a forgotten dashboard table would be.
create table public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  storage_path text not null,
  alt text not null default '',
  section text not null default 'portraits',
  sort_order int not null default 0
);
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text not null default 'youtube',
  video_id text,
  url text not null,
  title text,
  sort_order int not null default 0
);
insert into public.portfolio_images (storage_path, alt) values ('portfolio/a.jpg', 'A portrait');
