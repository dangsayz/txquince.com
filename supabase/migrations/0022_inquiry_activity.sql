create table if not exists public.inquiry_activity (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  kind text not null check (kind in ('note', 'contact', 'reminder')),
  note text not null default '',
  actor_email text not null,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint inquiry_activity_shape check (
    (kind = 'reminder' and due_at is not null)
    or (kind <> 'reminder' and due_at is null and completed_at is null)
  )
);

create index if not exists inquiry_activity_inquiry_created_idx
  on public.inquiry_activity (inquiry_id, created_at desc);
create index if not exists inquiry_activity_open_due_idx
  on public.inquiry_activity (due_at, inquiry_id)
  where kind = 'reminder' and completed_at is null;

alter table public.inquiry_activity enable row level security;
revoke all on public.inquiry_activity from anon, authenticated;
grant select, insert, update on public.inquiry_activity to service_role;
