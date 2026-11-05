-- 0026 — device class per page view (phone / tablet / desktop), from the
-- request's User-Agent in /api/track. Lets the dashboard split drop-off by
-- device. Nullable: older rows have no device. Safe to run more than once.
alter table public.page_views
  add column if not exists device text;
create index if not exists page_views_device_idx on public.page_views (device);
