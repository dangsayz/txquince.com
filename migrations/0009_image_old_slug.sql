-- A photo's public address (portfolio_images.slug) must not carry a client's
-- name or an upload filename. When a slug is replaced, the address it had is
-- kept here so /api/img/<old> and /photos/<section>/<old> redirect (308) to the
-- new one and shared links keep working.

ALTER TABLE portfolio_images ADD COLUMN old_slug TEXT;
CREATE INDEX IF NOT EXISTS portfolio_images_old_slug ON portfolio_images (old_slug);
