-- Venue landing pages: editable marketing copy per venue.
--
-- Venue FACTS (name, city, section, which photos) come from the shared registry
-- src/content/venues.json (also read by scripts/ingest-venues.mjs). This table
-- holds only the COPY a human/AI writes — the unique text Google needs to rank a
-- venue page ("Quinceañera Photographer at {Venue}") — keyed by the venue slug.
--
-- Service-role only (admin API writes, public site reads via service role).
create table if not exists public.venues (
  slug        text primary key,
  about       text,                       -- intro paragraph (also meta desc)
  faq         jsonb not null default '[]'::jsonb,  -- [{ "q": "...", "a": "..." }]
  address     text,                       -- street address (Place schema)
  area        text,                       -- neighborhood / sub-area label
  ig_handle   text,                       -- venue IG (bare handle)
  website     text,                       -- venue website
  updated_at  timestamptz not null default now()
);

alter table public.venues enable row level security;
