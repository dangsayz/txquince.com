-- Portfolio: full quince-day taxonomy + a reusable vendor directory.
--
-- 1) Per-image fields the "photo dump" workflow needs beyond alt/title/caption:
--    * hook  — a short, punchy one-liner shown under the title.
--    * tags  — free-form comma-separated keywords (meta) for search/SEO.
--    The `section` column stays free text; the (much larger) set of allowed
--    category ids is enforced in the app layer (portfolio-taxonomy.ts), so
--    adding a category never needs a migration. Existing rows keep their
--    legacy sections (save-the-date/church/portraits/celebration/films).
--
-- 2) A reusable vendor directory so a florist/HMUA/venue is typed ONCE and then
--    autocompletes on every later shoot, gets a public credit page, and links
--    each photo you tagged her in. Email/phone are admin-only (never public).
--
-- Fully additive — no existing column or row is altered destructively.

-- ── per-image fields ────────────────────────────────────────────────────────
alter table public.portfolio_images
  add column if not exists hook text,
  add column if not exists tags text;

-- ── vendor directory ────────────────────────────────────────────────────────
create table if not exists public.vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  business    text,
  -- category id from VENDOR_CATEGORIES (florist, hmua, venue, …). Free text;
  -- validated in the app layer.
  category    text,
  ig_handle   text,        -- stored without the leading "@"
  email       text,        -- ADMIN ONLY — never rendered publicly
  phone       text,        -- ADMIN ONLY — never rendered publicly
  website     text,
  notes       text,        -- private working notes
  -- permanent public slug → /vendors/{slug}; minted on insert, never changes.
  slug        text not null,
  created_at  timestamptz not null default now()
);

create unique index if not exists vendors_slug_key on public.vendors (slug);
create index if not exists vendors_category_idx on public.vendors (category);

-- ── image ↔ vendor links (many-to-many; one photo can credit several) ────────
create table if not exists public.portfolio_image_vendors (
  image_id   uuid not null references public.portfolio_images(id) on delete cascade,
  vendor_id  uuid not null references public.vendors(id) on delete cascade,
  -- credit label override ("Florals", "Venue"…); falls back to the vendor's
  -- category credit when null.
  role       text,
  created_at timestamptz not null default now(),
  primary key (image_id, vendor_id)
);

create index if not exists piv_vendor_idx on public.portfolio_image_vendors (vendor_id);
create index if not exists piv_image_idx  on public.portfolio_image_vendors (image_id);

-- RLS: mirror portfolio_images — service role (admin API) does all writes; the
-- public site reads through the service-role server client, so no anon policy is
-- required. Enable RLS so the tables aren't world-writable via anon by default.
alter table public.vendors enable row level security;
alter table public.portfolio_image_vendors enable row level security;
