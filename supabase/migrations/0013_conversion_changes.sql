-- Operator change-log: record what changed, why, and the baseline metrics at the
-- moment of the change, so impact can be measured later. Service-role only.
create table if not exists public.conversion_changes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text not null,
  area         text,
  reason       text,
  target_metric text,
  baseline     jsonb,
  status       text not null default 'active',  -- active | reviewed | archived
  notes        text
);
create index if not exists conversion_changes_created_at_idx
  on public.conversion_changes (created_at desc);

alter table public.conversion_changes enable row level security;
comment on table public.conversion_changes is 'Operator change-log + metric baselines. Service-role only.';
