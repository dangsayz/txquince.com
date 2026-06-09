-- Focal anchor per portfolio image: where the subject is, as fractions of the
-- frame (0..1 from left / top). Cropped renders (homepage sequence, closing
-- spread, hero fallback) align this point instead of blind center — no more
-- cut-off faces. Set by clicking the photo in /admin/portfolio.
alter table public.portfolio_images
  add column if not exists focus_x real,
  add column if not exists focus_y real;

-- Sensible starting anchors for existing rows: subjects' faces sit in the
-- upper third of the current frames. The admin refines per-image by clicking.
update public.portfolio_images
  set focus_x = 0.5, focus_y = 0.3
  where focus_x is null;
