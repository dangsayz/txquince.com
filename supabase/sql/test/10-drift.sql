-- Drift a real database may carry: a column grant, a view, a public-grant
-- function, and seed rows so reads are meaningful.
grant select (id, name) on public.inquiries to anon;
create view public.recent_inquiries as select id, created_at from public.inquiries;
create function public.count_inquiries() returns bigint language sql security definer as
  $$ select count(*) from public.inquiries $$;
insert into public.inquiries (name, email) values ('Test Family', 'family@example.com');
insert into public.site_settings (key, value) values ('hero', '{}');
