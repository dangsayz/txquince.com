-- ============================================================================
-- TX Quince — first-party reviews. Run once in the SQL editor (or psql) after 0026.
-- ============================================================================
-- One row per invitation. The owner creates it at /admin/reviews for a family
-- he actually worked with and texts the mom the link /review/<slug>. The link
-- works once: the mom's submission moves the row from 'invited' to 'pending',
-- and nothing is public until the owner approves it ('approved').
--
-- Same lockdown as every other table: RLS on, no policies, anon/authenticated
-- revoked. Only the server (service-role key) reads or writes it.
-- ============================================================================

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  -- The ONLY thing in the invite URL: 10 random characters, never a name.
  slug           text not null unique
                   check (slug ~ '^[23456789abcdefghjkmnpqrstuvwxyz]{10}$'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  status         text not null default 'invited'
                   check (status in ('invited', 'pending', 'approved', 'hidden')),

  -- Filled by the owner when he makes the link (private until approved).
  invite_name    text not null check (char_length(trim(invite_name)) between 1 and 120),
  daughter_name  text check (daughter_name is null or char_length(daughter_name) <= 80),
  event_date     date,
  booking_id     uuid references public.bookings(id) on delete set null,

  -- Filled by the mom.
  submitted_at   timestamptz,
  rating         smallint check (rating is null or rating between 1 and 5),
  body           text check (body is null or char_length(body) between 1 and 4000),
  -- How she wants to be signed, e.g. "Maria G.".
  display_name   text check (display_name is null or char_length(display_name) <= 80),
  city           text check (city is null or char_length(city) <= 80),
  language       text not null default 'en' check (language in ('en', 'es')),
  -- R2 object keys under reviews/<slug>/ in the private PORTFOLIO bucket.
  photo_paths    text[] not null default '{}' check (cardinality(photo_paths) <= 40),
  consent_publish boolean not null default false,
  consent_photos  boolean not null default false,

  -- Owner controls.
  approved_at    timestamptz,
  featured       boolean not null default false,
  show_photos    boolean not null default true,
  notes          text
);

create index if not exists reviews_status_idx on public.reviews (status, submitted_at desc);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select, insert, update, delete on public.reviews to service_role;

comment on table public.reviews is 'First-party reviews: invite-only links, owner-approved before publishing. Service-role only.';
