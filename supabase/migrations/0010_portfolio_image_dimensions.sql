-- Store intrinsic pixel dimensions so the masonry grid can reserve each tile's
-- exact aspect ratio before the image loads (eliminates layout shift / CLS) and
-- next/image can serve correctly-sized responsive sources. Nullable: existing
-- rows keep working; new uploads capture w/h in the browser before upload.
alter table public.portfolio_images
  add column if not exists width integer,
  add column if not exists height integer;
