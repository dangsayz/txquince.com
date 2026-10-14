-- ============================================================================
-- TX Quince — the client journey after a family books (docs/CLIENT-JOURNEY.md)
-- ============================================================================
-- request → approve/decline → sign + deposit → balance → event → delivery.
--
-- 1. Booking statuses get plain names. Legacy rows are mapped in place:
--      pending_payment → approved   (approved, deposit not paid yet)
--      paid            → confirmed  (deposit paid)
-- 2. Each booking snapshots its money at request time (total, deposit, balance,
--    deposit percent, balance-due days, the whole price book) so a later price
--    change never touches it.
-- 3. New tables: private links, audit/timeline events, the payments ledger,
--    checkout sessions, reminders, messages, private notes, contract templates.
--
-- SECURITY LAW: every table has RLS ON with NO policies and anon/authenticated
-- privileges revoked. Only the server (service role) reads or writes.
-- The state machine itself lives in ONE place: src/lib/journey/state.ts
-- (canTransition). SQL only guards what must never happen regardless of the
-- app: double-booking a date, double-recording a Stripe payment or refund,
-- sending a reminder twice, and editing a signed agreement.
-- ============================================================================

-- ---------------------------------------------------------------- statuses --
alter table public.bookings drop constraint if exists bookings_status_check;

update public.bookings set status = 'approved'  where status = 'pending_payment';
update public.bookings set status = 'confirmed' where status = 'paid';

alter table public.bookings add constraint bookings_status_check
  check (status in (
    'requested',      -- family asked; date held while the owner reviews
    'approved',       -- owner approved; family signs + pays the deposit
    'confirmed',      -- signed AND deposit paid
    'paid_in_full',   -- balance paid too
    'completed',      -- event done, delivery underway / finished
    'declined',       -- owner said no
    'expired',        -- a hold lapsed with nothing paid
    'cancelled',      -- cancelled by the owner (after a family request or otherwise)
    'refunded',       -- legacy: refunded in full
    'payment_review'  -- money arrived that needs the owner's eyes
  ));

-- One active booking per date (the double-booking guard). Same idea as 0007,
-- with the new names.
drop index if exists public.bookings_active_event_date_idx;
create unique index bookings_active_event_date_idx
  on public.bookings (event_date)
  where status in ('requested', 'approved', 'confirmed', 'paid_in_full', 'completed');

-- One active request per email per date (audit M1). Implied by the index
-- above today; kept explicit so relaxing the per-date rule later can't
-- silently let one email stack requests on a date.
create unique index if not exists bookings_active_email_date_idx
  on public.bookings (lower(email), event_date)
  where status in ('requested', 'approved', 'confirmed', 'paid_in_full', 'completed');

-- ---------------------------------------------------------- new columns --
alter table public.bookings
  add column if not exists lang text not null default 'en',
  add column if not exists total_cents integer,
  add column if not exists balance_cents integer,
  add column if not exists deposit_percent integer,
  add column if not exists balance_due_days integer,
  add column if not exists balance_due_date date,
  add column if not exists price_book jsonb,
  add column if not exists request jsonb,
  add column if not exists approved_at timestamptz,
  add column if not exists declined_at timestamptz,
  add column if not exists signed_at timestamptz,
  add column if not exists agreement jsonb,
  add column if not exists contract_sha256 text,
  add column if not exists contract_pdf_key text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists paid_in_full_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists gallery_url text,
  add column if not exists video_url text,
  add column if not exists album_status text not null default 'not_started',
  add column if not exists review_url text,
  add column if not exists delivery_note text,
  add column if not exists delivery_updated_at timestamptz;

alter table public.bookings drop constraint if exists bookings_lang_check;
alter table public.bookings add constraint bookings_lang_check check (lang in ('en', 'es'));
alter table public.bookings drop constraint if exists bookings_album_status_check;
alter table public.bookings add constraint bookings_album_status_check
  check (album_status in ('not_started', 'designing', 'sent_for_approval', 'printing', 'shipped'));
alter table public.bookings drop constraint if exists bookings_money_check;
alter table public.bookings add constraint bookings_money_check check (
  (total_cents is null or total_cents >= 0)
  and (balance_cents is null or balance_cents >= 0)
  and (deposit_percent is null or deposit_percent between 1 and 100)
  and (balance_due_days is null or balance_due_days between 0 and 365)
);
alter table public.bookings drop constraint if exists bookings_delivery_urls_check;
alter table public.bookings add constraint bookings_delivery_urls_check check (
  (gallery_url is null or gallery_url ~ '^https://')
  and (video_url is null or video_url ~ '^https://')
  and (review_url is null or review_url ~ '^https://')
);

-- Backfill legacy rows from what they already stored, so every later step
-- has a snapshot to read (metadata.total_usd / deposit_percent / language).
update public.bookings
set
  lang = case when metadata->>'language' = 'es' then 'es' else 'en' end,
  total_cents = coalesce(total_cents,
    case when (metadata->>'total_usd') ~ '^[0-9]+$' then (metadata->>'total_usd')::int * 100 end),
  deposit_percent = coalesce(deposit_percent,
    case when (metadata->>'deposit_percent') ~ '^[0-9]+$' then (metadata->>'deposit_percent')::int else 25 end),
  balance_due_days = coalesce(balance_due_days,
    case when (metadata->>'balance_due_days') ~ '^[0-9]+$' then (metadata->>'balance_due_days')::int else 2 end)
where total_cents is null;

update public.bookings
set balance_cents = greatest(total_cents - deposit_amount_cents, 0),
    balance_due_date = event_date - balance_due_days
where total_cents is not null and balance_cents is null;

create index if not exists bookings_balance_due_idx
  on public.bookings (balance_due_date) where status = 'confirmed';

-- A signed agreement and the money it states are immutable. The app never
-- re-signs (sign is `update ... where signed_at is null`); this makes it
-- impossible even for a buggy or hand-written query.
create or replace function public.bookings_signed_is_immutable()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.signed_at is not null and (
       new.signed_at is distinct from old.signed_at
    or new.agreement is distinct from old.agreement
    or new.contract_sha256 is distinct from old.contract_sha256
    or new.total_cents is distinct from old.total_cents
    or new.deposit_amount_cents is distinct from old.deposit_amount_cents
    or new.balance_cents is distinct from old.balance_cents
  ) then
    raise exception 'signed_agreement_immutable' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_signed_immutable on public.bookings;
create trigger bookings_signed_immutable
  before update on public.bookings
  for each row execute function public.bookings_signed_is_immutable();

-- The old hold-release RPC (called by pg_cron where it exists) now knows the
-- new names. The app's own /api/cron/daily does the same and also expires the
-- matching Stripe sessions; this is only the belt to that suspender.
create or replace function public.release_expired_booking_holds()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  released integer := 0;
begin
  update public.bookings
  set status = 'expired'
  where status in ('requested', 'approved')
    and expires_at < now()
    and paid_at is null;
  get diagnostics released = row_count;
  return released;
end;
$$;
revoke all on function public.release_expired_booking_holds() from public, anon, authenticated;
grant execute on function public.release_expired_booking_holds() to service_role;

-- The pre-journey RPCs wrote 'pending_payment'/'paid', which no longer exist.
drop function if exists public.create_booking_hold(text, text, text, date, text, text, integer, text, integer);
drop function if exists public.confirm_booking_payment(text, text, text);

-- ------------------------------------------------------- private links --
-- The family's link is /my/booking/<token>. Only sha256(token) is stored.
-- Several links can be live at once (the request email, "email me my link").
create table if not exists public.booking_access_tokens (
  token_hash   text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  purpose      text not null check (purpose in ('request', 'magic_link', 'legacy', 'admin')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  last_used_at timestamptz
);
create index if not exists booking_access_tokens_booking_idx on public.booking_access_tokens (booking_id);

-- ------------------------------------------------------ timeline / audit --
create table if not exists public.booking_events (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  at         timestamptz not null default now(),
  event      text not null check (char_length(event) between 1 and 80),
  actor      text not null check (actor in ('client', 'admin', 'system')),
  actor_email text,
  ip         text,
  user_agent text,
  detail     text check (detail is null or char_length(detail) <= 4000)
);
create index if not exists booking_events_booking_idx on public.booking_events (booking_id, at);

-- ------------------------------------------------------------- payments --
-- Every charge and refund. Stripe rows are keyed by Stripe's ids, so a
-- webhook delivered twice (or late, or replayed) records nothing new.
create table if not exists public.booking_payments (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete restrict,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('deposit', 'balance', 'payment', 'refund')),
  method      text not null check (method in ('stripe', 'zelle', 'cash', 'check', 'other')),
  amount_cents integer not null check (amount_cents > 0),
  currency    text not null default 'usd',
  refund_of   uuid references public.booking_payments (id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text,
  stripe_refund_id           text unique,
  stripe_event_id            text,
  recorded_by text,
  note        text check (note is null or char_length(note) <= 1000)
);
create index if not exists booking_payments_booking_idx on public.booking_payments (booking_id, created_at);
create index if not exists booking_payments_pi_idx on public.booking_payments (stripe_payment_intent_id);

-- ----------------------------------------------------- checkout sessions --
-- Every Stripe Checkout session we opened, so the webhook matches a payment by
-- (booking id + session id) even after a newer session replaced it (audit H2),
-- and superseded / declined / expired sessions can be expired at Stripe (M5).
create table if not exists public.booking_checkout_sessions (
  id           text primary key,
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  kind         text not null check (kind in ('deposit', 'balance')),
  amount_cents integer not null check (amount_cents > 0),
  url          text,
  status       text not null default 'open' check (status in ('open', 'processing', 'complete', 'expired')),
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists booking_checkout_sessions_booking_idx
  on public.booking_checkout_sessions (booking_id, kind, status);

-- ------------------------------------------------------------ reminders --
-- One row per (booking, kind) ever sent: the unique key is what makes the
-- daily cron idempotent.
create table if not exists public.booking_reminders (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  kind       text not null check (kind in (
    'balance_30', 'balance_14', 'balance_7', 'balance_1', 'balance_overdue',
    'owner_unapproved', 'owner_unpaid', 'family_unsigned', 'hold_expired'
  )),
  sent_at    timestamptz not null default now(),
  primary key (booking_id, kind)
);

-- ------------------------------------------------------------- messages --
create table if not exists public.booking_messages (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  created_at timestamptz not null default now(),
  author     text not null check (author in ('family', 'owner')),
  author_email text,
  kind       text not null default 'message'
    check (kind in ('message', 'change_date', 'change_time', 'change_package', 'cancel')),
  body       text not null check (char_length(body) between 1 and 4000),
  read_at    timestamptz
);
create index if not exists booking_messages_booking_idx on public.booking_messages (booking_id, created_at);
create index if not exists booking_messages_unread_idx
  on public.booking_messages (booking_id) where author = 'family' and read_at is null;

-- ------------------------------------------------------- private notes --
create table if not exists public.booking_notes (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  created_at   timestamptz not null default now(),
  author_email text not null,
  body         text not null check (char_length(body) between 1 and 4000)
);
create index if not exists booking_notes_booking_idx on public.booking_notes (booking_id, created_at);

-- --------------------------------------------------- contract templates --
-- Versioned, append-only. buildAgreement() applies the newest version's
-- overrides; a signed booking keeps the exact text it was signed with.
create table if not exists public.contract_templates (
  version    integer generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by text not null,
  en         jsonb not null default '{}'::jsonb,
  es         jsonb not null default '{}'::jsonb,
  note       text
);

-- ------------------------------------------------------ lock everything --
do $$
declare t text;
begin
  foreach t in array array[
    'booking_access_tokens', 'booking_events', 'booking_payments',
    'booking_checkout_sessions', 'booking_reminders', 'booking_messages',
    'booking_notes', 'contract_templates'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated, public', t);
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end
$$;

-- Re-assert the bookings lock (audit M6: anon still had table privileges).
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated, public;
grant select, insert, update, delete on public.bookings to service_role;

revoke all on function public.bookings_signed_is_immutable() from public, anon, authenticated;
