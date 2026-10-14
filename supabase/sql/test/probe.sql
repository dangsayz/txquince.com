-- Behavioural probe: what can each API role actually do, as that role?
\set QUIET on
\pset tuples_only on
\pset format unaligned
create or replace function pg_temp.probe(r text) returns setof text language plpgsql as $$
declare
  t record; n bigint; out text;
begin
  for t in
    select c.oid::regclass as rel, c.relkind
    from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and c.relkind in ('r','v') order by c.oid::regclass::text
  loop
    begin
      execute format('set local role %I', r);
      execute format('select count(*) from %s', t.rel) into n;
      out := format('%-14s %-28s SELECT ok (%s rows)', r, t.rel, n);
    exception when insufficient_privilege then
      out := format('%-14s %-28s SELECT denied', r, t.rel);
    end;
    reset role;
    return next out;
  end loop;
  for t in
    select p.oid::regprocedure as sig from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public' order by p.oid::regprocedure::text
  loop
    return next format('%-14s %-60s EXECUTE %s', r, t.sig,
      case when has_function_privilege(r, t.sig, 'EXECUTE') then 'ok' else 'denied' end);
  end loop;
  begin
    execute format('set local role %I', r);
    insert into public.inquiries (name, email) values ('probe', 'probe@example.com');
    out := format('%-14s %-28s INSERT ok', r, 'public.inquiries');
  exception when insufficient_privilege then
    out := format('%-14s %-28s INSERT denied', r, 'public.inquiries');
  end;
  reset role;
  return next out;
end $$;
begin;
select * from pg_temp.probe('anon');
select * from pg_temp.probe('authenticated');
select * from pg_temp.probe('service_role');
rollback;
