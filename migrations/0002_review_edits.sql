-- A mom can update her review from the same link. If the review is already
-- approved (or hidden), her update waits here and the live version stays as
-- it is until the owner approves the update or keeps the old one.
-- Apply: npx wrangler d1 migrations apply txquince --remote
ALTER TABLE reviews ADD COLUMN edit_submitted_at TEXT;
ALTER TABLE reviews ADD COLUMN edit_rating INTEGER CHECK (edit_rating IS NULL OR edit_rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN edit_body TEXT CHECK (edit_body IS NULL OR length(edit_body) BETWEEN 1 AND 4000);
ALTER TABLE reviews ADD COLUMN edit_display_name TEXT CHECK (edit_display_name IS NULL OR length(edit_display_name) <= 80);
ALTER TABLE reviews ADD COLUMN edit_daughter_name TEXT CHECK (edit_daughter_name IS NULL OR length(edit_daughter_name) <= 80);
ALTER TABLE reviews ADD COLUMN edit_city TEXT CHECK (edit_city IS NULL OR length(edit_city) <= 80);
ALTER TABLE reviews ADD COLUMN edit_language TEXT CHECK (edit_language IS NULL OR edit_language IN ('en', 'es'));
ALTER TABLE reviews ADD COLUMN edit_photo_paths TEXT;
ALTER TABLE reviews ADD COLUMN edit_consent_photos INTEGER;
