-- Deterministic dump of everything the lockdown can change.
select 'rel' as k, c.oid::regclass::text as obj, coalesce(c.relacl::text, '<default>') as acl, c.relrowsecurity::text as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','v','m','f','p','S')
union all
select 'col', format('%s.%s', c.oid::regclass, a.attname), a.attacl::text, ''
from pg_attribute a join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and a.attacl is not null
union all
select 'fn', p.oid::regprocedure::text, coalesce(p.proacl::text, '<default>'), ''
from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'
union all
select 'defacl', format('%s/%s', d.defaclrole::regrole, d.defaclobjtype), d.defaclacl::text, ''
from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace where n.nspname = 'public'
order by 1, 2;
