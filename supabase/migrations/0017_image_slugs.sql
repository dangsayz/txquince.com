-- Branded image architecture: every portfolio image gets a permanent SEO slug
-- (served at /photos/{section}/{slug}, bytes at /api/img/{slug}). UUID storage
-- paths become internal-only. Slug derives from the descriptive alt text; once
-- set it never changes (share links are forever).
alter table public.portfolio_images
  add column if not exists slug text,
  add column if not exists title text,
  add column if not exists caption text,
  add column if not exists city text;

-- Backfill slugs from alt text: lowercase, fold accents, kebab-case, cap length.
update public.portfolio_images
set slug = left(
  trim(both '-' from regexp_replace(
    translate(lower(coalesce(nullif(alt, ''), section || ' quinceanera photo dfw')),
              'áéíóúüñ’''', 'aeiouun'),
    '[^a-z0-9]+', '-', 'g')),
  72)
where slug is null;

-- Guarantee uniqueness: suffix duplicates with a short stable id fragment.
update public.portfolio_images p
set slug = p.slug || '-' || left(md5(p.id::text), 4)
where exists (
  select 1 from public.portfolio_images q
  where q.slug = p.slug and q.id <> p.id and q.created_at < p.created_at
);

-- Display title from the alt sentence (admin can refine later).
update public.portfolio_images set title = alt where title is null and alt <> '';

create unique index if not exists portfolio_images_slug_key
  on public.portfolio_images (slug);
