-- ============================================================================
-- TX Quince: lock the public (anon) and signed-in (authenticated) API roles
-- out of every table, view, sequence and function in schema `public`.
--
-- NOT A MIGRATION. Not auto-applied. Read docs/SECURITY-LOCKDOWN.md first.
-- Apply once, by hand, as the database owner (`postgres`):
--     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/lockdown-anon.sql
-- Undo:  supabase/sql/lockdown-anon-rollback.sql
--
-- WHY. db.txquince.com exposes PostgREST (/rest/v1) to anyone holding the
-- anon key, and that key is public by design (it ships to the browser for
-- the admin login). Supabase's default privileges grant anon + authenticated
-- ALL on every new table, so today Row Level Security is the only thing
-- between the internet and the bookings/inquiries tables. One table created
-- without RLS, or one permissive policy, would expose it.
--
-- WHAT THE SITE ACTUALLY NEEDS FROM THESE ROLES: nothing in `public`.
--   * The browser Supabase client (src/lib/supabase/client.ts) is used ONLY
--     for auth: signInWithPassword, resetPasswordForEmail,
--     exchangeCodeForSession, getSession, updateUser and signOut. Those go to
--     GoTrue (/auth/v1), which runs as its own role in the `auth` schema and
--     is untouched by this script.
--   * The server anon client (src/lib/supabase/server.ts, middleware.ts)
--     only calls auth.getUser() and auth.signOut().
--   * Every table read/write and every RPC goes through the SERVICE ROLE
--     (src/lib/supabase-server.ts), which keeps full access.
--   * No migration defines an RLS policy for anon or authenticated.
--
-- WHAT IT DOES (one transaction; any failure undoes everything):
--   1. Records every grant it is about to remove in schema
--      security_lockdown, so the rollback restores exactly what was there.
--   2. Revokes all table, view, sequence and column privileges in `public`
--      from anon, authenticated and PUBLIC.
--   3. Revokes EXECUTE on every non-extension function in `public` from
--      anon, authenticated and PUBLIC, and grants it to service_role (which
--      may have relied on the PUBLIC grant).
--   4. Removes default privileges that would re-grant anon/authenticated on
--      FUTURE tables, sequences and functions in `public`.
--   5. Turns on RLS for any `public` table that has it off. This is defence
--      in depth; service_role bypasses RLS, so the app is unaffected.
--   6. Verifies the result and RAISES (rolling everything back) if anon or
--      authenticated can still touch anything, or if service_role lost
--      anything the app needs.
--
-- NOT TOUCHED: the auth, storage, realtime, graphql*, extensions and cron
-- schemas; USAGE on schema public (harmless with no object privileges);
-- extension-owned functions.
-- ============================================================================

begin;

-- Fails (and aborts) if the lockdown is already applied: roll back first.
create schema security_lockdown;
revoke all on schema security_lockdown from public;
comment on schema security_lockdown is
  'Undo log for supabase/sql/lockdown-anon.sql. Dropped by the rollback script.';

create table security_lockdown.undo (
  id   serial primary key,
  kind text not null,   -- 'grant' | 'default' | 'rls' | 'service_role'
  stmt text not null    -- statement the rollback executes
);
create table security_lockdown.applied (
  applied_at timestamptz not null default now(),
  applied_by text not null default current_user
);
insert into security_lockdown.applied default values;

-- ── 1. Snapshot ─────────────────────────────────────────────────────────────
-- Grantee 0 is PUBLIC. A NULL ACL means the built-in default, made explicit
-- with acldefault() so nothing is missed (for functions that's PUBLIC EXECUTE).

-- Tables, views, materialized views, foreign and partitioned tables, sequences.
insert into security_lockdown.undo (kind, stmt)
select 'grant',
       format('grant %s on %s %s to %s%s',
              a.privilege_type,
              case when c.relkind = 'S' then 'sequence' else 'table' end,
              c.oid::regclass,
              case when a.grantee = 0 then 'public' else quote_ident(r.rolname) end,
              case when a.is_grantable then ' with grant option' else '' end)
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join lateral aclexplode(coalesce(c.relacl, acldefault((case when c.relkind = 'S' then 's' else 'r' end)::"char", c.relowner))) a
left join pg_roles r on r.oid = a.grantee
where n.nspname = 'public'
  and c.relkind in ('r', 'v', 'm', 'f', 'p', 'S')
  and (a.grantee = 0 or r.rolname in ('anon', 'authenticated'));

-- Column-level grants (REVOKE ... ON TABLE removes these too).
insert into security_lockdown.undo (kind, stmt)
select 'grant',
       format('grant %s (%I) on table %s to %s%s',
              a.privilege_type, att.attname, c.oid::regclass,
              case when a.grantee = 0 then 'public' else quote_ident(r.rolname) end,
              case when a.is_grantable then ' with grant option' else '' end)
from pg_attribute att
join pg_class c on c.oid = att.attrelid
join pg_namespace n on n.oid = c.relnamespace
cross join lateral aclexplode(att.attacl) a
left join pg_roles r on r.oid = a.grantee
where n.nspname = 'public'
  and att.attacl is not null
  and att.attnum > 0 and not att.attisdropped
  and (a.grantee = 0 or r.rolname in ('anon', 'authenticated'));

-- Functions and procedures (not extension members).
create temporary table lockdown_functions on commit drop as
select p.oid, p.oid::regprocedure as sig, p.prokind, p.proowner, p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prokind in ('f', 'p')
  and not exists (
    select 1 from pg_depend d
    where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e'
  );

insert into security_lockdown.undo (kind, stmt)
select 'grant',
       format('grant execute on %s %s to %s%s',
              case when f.prokind = 'p' then 'procedure' else 'function' end,
              f.sig,
              case when a.grantee = 0 then 'public' else quote_ident(r.rolname) end,
              case when a.is_grantable then ' with grant option' else '' end)
from lockdown_functions f
cross join lateral aclexplode(coalesce(f.proacl, acldefault('f', f.proowner))) a
left join pg_roles r on r.oid = a.grantee
where a.grantee = 0 or r.rolname in ('anon', 'authenticated');

-- service_role EXECUTE grants this script ADDS (so the rollback can remove them).
insert into security_lockdown.undo (kind, stmt)
select 'service_role',
       format('revoke execute on %s %s from service_role',
              case when f.prokind = 'p' then 'procedure' else 'function' end, f.sig)
from lockdown_functions f
where not exists (
  select 1
  from aclexplode(coalesce(f.proacl, acldefault('f', f.proowner))) a
  join pg_roles r on r.oid = a.grantee
  where r.rolname = 'service_role' and a.privilege_type = 'EXECUTE'
);

-- Default privileges in schema public that hand anon/authenticated/PUBLIC
-- rights on future objects.
create temporary table lockdown_defaults on commit drop as
select d.defaclrole::regrole::text as owner_role,
       case d.defaclobjtype when 'r' then 'tables' when 'S' then 'sequences' when 'f' then 'functions' end as objects,
       a.privilege_type,
       case when a.grantee = 0 then 'public' else quote_ident(r.rolname) end as grantee
from pg_default_acl d
join pg_namespace n on n.oid = d.defaclnamespace
cross join lateral aclexplode(d.defaclacl) a
left join pg_roles r on r.oid = a.grantee
where n.nspname = 'public'
  and d.defaclobjtype in ('r', 'S', 'f')
  and (a.grantee = 0 or r.rolname in ('anon', 'authenticated'));

-- ── 2. Tables, views, sequences ─────────────────────────────────────────────
revoke all on all tables    in schema public from anon, authenticated, public;
revoke all on all sequences in schema public from anon, authenticated, public;

-- ── 3. Functions ────────────────────────────────────────────────────────────
do $$
declare
  f record;
  kind text;
begin
  for f in select * from lockdown_functions loop
    kind := case when f.prokind = 'p' then 'procedure' else 'function' end;
    execute format('revoke execute on %s %s from anon, authenticated, public', kind, f.sig);
    execute format('grant execute on %s %s to service_role', kind, f.sig);
  end loop;
end
$$;

-- ── 4. Default privileges for future objects ────────────────────────────────
-- ALTER DEFAULT PRIVILEGES FOR ROLE x needs membership in x. If the database
-- user can't act for an owner role (e.g. supabase_admin on some setups), that
-- one is skipped with a NOTICE and NOT recorded for rollback. The table
-- revokes above still applied; re-run step 4 later as that role if needed.
do $$
declare
  d record;
begin
  for d in select * from lockdown_defaults loop
    begin
      execute format('alter default privileges for role %I in schema public revoke %s on %s from %s',
                     d.owner_role, d.privilege_type, d.objects, d.grantee);
      insert into security_lockdown.undo (kind, stmt)
      values ('default', format('alter default privileges for role %I in schema public grant %s on %s to %s',
                                d.owner_role, d.privilege_type, d.objects, d.grantee));
    exception when insufficient_privilege then
      raise notice 'lockdown: skipped default privileges of role % (% % to %): insufficient privilege',
        d.owner_role, d.privilege_type, d.objects, d.grantee;
    end;
  end loop;
end
$$;

-- ── 5. RLS on every public table ────────────────────────────────────────────
do $$
declare
  t record;
begin
  for t in
    select c.oid::regclass as rel
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
  loop
    execute format('alter table %s enable row level security', t.rel);
    insert into security_lockdown.undo (kind, stmt)
    values ('rls', format('alter table %s disable row level security', t.rel));
    raise notice 'lockdown: enabled RLS on %', t.rel;
  end loop;
end
$$;

-- ── 6. Verify (raises, and the whole transaction rolls back, on failure) ────
do $$
declare
  bad text;
begin
  -- anon / authenticated: no table, sequence or function access at all.
  select string_agg(format('%s on %s', r.rolname, c.oid::regclass), ', ') into bad
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  cross join (select rolname from pg_roles where rolname in ('anon', 'authenticated')) r
  where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'f', 'p')
    and (has_table_privilege(r.rolname, c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
         or has_any_column_privilege(r.rolname, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'));
  if bad is not null then raise exception 'lockdown verify: table access remains: %', bad; end if;

  select string_agg(format('%s on %s', r.rolname, c.oid::regclass), ', ') into bad
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  cross join (select rolname from pg_roles where rolname in ('anon', 'authenticated')) r
  where n.nspname = 'public' and c.relkind = 'S'
    and has_sequence_privilege(r.rolname, c.oid, 'USAGE, SELECT, UPDATE');
  if bad is not null then raise exception 'lockdown verify: sequence access remains: %', bad; end if;

  select string_agg(format('%s on %s', r.rolname, f.sig), ', ') into bad
  from lockdown_functions f
  cross join (select rolname from pg_roles where rolname in ('anon', 'authenticated')) r
  where has_function_privilege(r.rolname, f.oid, 'EXECUTE');
  if bad is not null then raise exception 'lockdown verify: function access remains: %', bad; end if;

  -- service_role (the app) must keep full data access and every function.
  select string_agg(c.oid::regclass::text, ', ') into bad
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
    and not has_table_privilege('service_role', c.oid, 'SELECT, INSERT, UPDATE, DELETE');
  if bad is not null then
    raise exception 'lockdown verify: service_role lacks SELECT/INSERT/UPDATE/DELETE on: % (grant it first, then re-run)', bad;
  end if;

  select string_agg(f.sig::text, ', ') into bad
  from lockdown_functions f
  where not has_function_privilege('service_role', f.oid, 'EXECUTE');
  if bad is not null then raise exception 'lockdown verify: service_role lacks EXECUTE on: %', bad; end if;

  raise notice 'lockdown: verified. % undo statements recorded in security_lockdown.undo',
    (select count(*) from security_lockdown.undo);
end
$$;

commit;
