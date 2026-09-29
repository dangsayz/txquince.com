-- Videos: distinguish landscape films from vertical "shorts" clips so the
-- homepage can render them as two separate galleries (shorts get their own
-- 9:16 grid below the existing 16:9 film section).
--
-- Additive + backfilled: every existing row defaults to 'landscape', so the
-- current film gallery is unaffected.

alter table public.videos
  add column if not exists orientation text not null default 'landscape';

alter table public.videos
  drop constraint if exists videos_orientation_check;

alter table public.videos
  add constraint videos_orientation_check check (orientation in ('landscape', 'vertical'));

create index if not exists videos_orientation_idx on public.videos (orientation);
