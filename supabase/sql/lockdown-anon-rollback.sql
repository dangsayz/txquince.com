-- ============================================================================
-- TX Quince: UNDO supabase/sql/lockdown-anon.sql.
--
-- Replays the undo log the lockdown recorded in schema security_lockdown:
-- every grant it removed is re-granted, every default privilege restored,
-- RLS turned back off on exactly the tables it turned on, and the
-- service_role EXECUTE grants it added are removed. Then it drops the log.
--
--     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/lockdown-anon-rollback.sql
--
-- One transaction: if any statement fails, nothing changes and the undo log
-- stays in place for another attempt.
-- ============================================================================

begin;

do $$
begin
  if not exists (select 1 from pg_namespace where nspname = 'security_lockdown') then
    raise exception 'rollback: schema security_lockdown not found. Is the lockdown applied?';
  end if;
end
$$;

do $$
declare
  u record;
begin
  -- Default privileges first, then object grants, then RLS, then the
  -- service_role grants the lockdown added. Within a kind, the original order.
  for u in
    select * from security_lockdown.undo
    order by case kind when 'default' then 1 when 'grant' then 2 when 'rls' then 3 else 4 end, id
  loop
    execute u.stmt;
  end loop;
  raise notice 'rollback: replayed % statements', (select count(*) from security_lockdown.undo);
end
$$;

drop schema security_lockdown cascade;

commit;
