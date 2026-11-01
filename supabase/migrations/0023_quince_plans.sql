-- ============================================================================
-- TX Quince — personalized quince plans, date availability, gallery colors,
-- and the DFW price guide. Run once in the SQL editor (or psql) after 0022.
-- ============================================================================
-- Same lockdown as every other table: RLS on, no policies, anon/authenticated
-- revoked. Only the server (service-role key) reads or writes these.
-- ============================================================================

-- 1) Plans --------------------------------------------------------------------
-- One row per family who filled /plan. `slug` is the ONLY thing in the plan's
-- URL: 10 random characters, never the family's name (links are pasted into
-- public Facebook threads). A family can give a phone OR an email.
create table if not exists public.quince_plans (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique
                 check (slug ~ '^[23456789abcdefghjkmnpqrstuvwxyz]{10}$'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  event_date   date not null,
  city         text not null check (char_length(trim(city)) between 2 and 80),
  colors       text[] not null default '{}' check (cardinality(colors) <= 5),
  theme        text check (theme is null or char_length(theme) <= 120),
  name         text not null check (char_length(trim(name)) between 2 and 120),
  email        text,
  phone        text,
  language     text not null default 'en' check (language in ('en', 'es')),
  -- The ?src= tag on the link that brought them (e.g. 'fb-group').
  source       text check (source is null or source ~ '^[a-z0-9_-]{2,40}$'),
  -- First-touch attribution from the browser (same shape as inquiries).
  attribution  jsonb,
  status       text not null default 'new'
                 check (status in ('new', 'replied', 'booked', 'lost')),
  -- The date-hold booking created from this plan's "Hold my date" button.
  booking_id   uuid references public.bookings(id) on delete set null,
  -- Private working notes (admin only, never rendered publicly).
  notes        text,
  constraint quince_plans_contact check (email is not null or phone is not null)
);

create index if not exists quince_plans_created_at_idx on public.quince_plans (created_at desc);
create index if not exists quince_plans_event_date_idx on public.quince_plans (event_date);
create index if not exists quince_plans_source_idx on public.quince_plans (source);

drop trigger if exists quince_plans_set_updated_at on public.quince_plans;
create trigger quince_plans_set_updated_at
  before update on public.quince_plans
  for each row execute function public.set_updated_at();

alter table public.quince_plans enable row level security;
revoke all on public.quince_plans from anon, authenticated;
grant select, insert, update, delete on public.quince_plans to service_role;

comment on table public.quince_plans is 'Personalized quince plans from /plan (leads). Service-role only.';

-- 2) Date availability ----------------------------------------------------------
-- EXCEPTIONS ONLY: a date with no row is Available. The owner marks a date
-- Limited or Booked at /admin/availability. A live hold or paid booking in
-- public.bookings always shows as Booked regardless of this table.
create table if not exists public.date_availability (
  event_date  date primary key,
  status      text not null check (status in ('available', 'limited', 'booked')),
  note        text check (note is null or char_length(note) <= 200),
  updated_at  timestamptz not null default now()
);

alter table public.date_availability enable row level security;
revoke all on public.date_availability from anon, authenticated;
grant select, insert, update, delete on public.date_availability to service_role;

comment on table public.date_availability is 'Owner-set date status overrides for plan pages. Service-role only.';

-- 3) Gallery colors ---------------------------------------------------------------
-- Canonical color ids (src/lib/quince-colors.ts), set in Admin → Portfolio.
-- Untagged photos still match by the color words in their alt/title/caption.
alter table public.portfolio_images
  add column if not exists colors text[] not null default '{}';
create index if not exists portfolio_images_colors_idx
  on public.portfolio_images using gin (colors);

-- 4) DFW price guide --------------------------------------------------------------
-- Rendered at /precios-quince-dfw and /quince-prices-dfw. Paste rows from the
-- lead sheet at /admin/price-guide (or insert here). Whole US dollars.
create table if not exists public.price_guide (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (char_length(trim(category)) between 2 and 80),
  category_es   text check (category_es is null or char_length(category_es) <= 80),
  low_usd       integer not null check (low_usd >= 0),
  typical_usd   integer not null check (typical_usd >= 0),
  high_usd      integer not null check (high_usd >= 0),
  sample_count  integer not null default 0 check (sample_count >= 0),
  last_updated  date not null default current_date,
  sort_order    integer not null default 0,
  published     boolean not null default true,
  constraint price_guide_order check (low_usd <= typical_usd and typical_usd <= high_usd)
);

create index if not exists price_guide_sort_idx on public.price_guide (sort_order, category);

alter table public.price_guide enable row level security;
revoke all on public.price_guide from anon, authenticated;
grant select, insert, update, delete on public.price_guide to service_role;

comment on table public.price_guide is 'DFW quinceañera price ranges from real quotes. Service-role only.';
