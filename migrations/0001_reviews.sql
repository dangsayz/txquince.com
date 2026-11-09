-- TX Quince on Cloudflare D1 (binding DB, database "txquince").
-- Apply: npx wrangler d1 migrations apply txquince --remote
--
-- First-party reviews. One row per invitation: the owner makes it at
-- /admin/reviews for a family he worked with and texts the mom
-- /review/<slug>. The link works once ('invited' → 'pending'), and nothing is
-- public until the owner approves it ('approved'). Only the Worker reads or
-- writes this database; there is no public access path.

CREATE TABLE IF NOT EXISTS reviews (
  id              TEXT PRIMARY KEY,
  -- The ONLY thing in the invite URL: 10 random characters, never a name.
  slug            TEXT NOT NULL UNIQUE CHECK (length(slug) = 10),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  status          TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'pending', 'approved', 'hidden')),

  -- Filled by the owner when he makes the link (private until approved).
  invite_name     TEXT NOT NULL CHECK (length(trim(invite_name)) BETWEEN 1 AND 120),
  daughter_name   TEXT CHECK (daughter_name IS NULL OR length(daughter_name) <= 80),
  event_date      TEXT,

  -- Filled by the mom.
  submitted_at    TEXT,
  rating          INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  body            TEXT CHECK (body IS NULL OR length(body) BETWEEN 1 AND 4000),
  display_name    TEXT CHECK (display_name IS NULL OR length(display_name) <= 80),
  city            TEXT CHECK (city IS NULL OR length(city) <= 80),
  language        TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  -- JSON array of R2 keys under reviews/<slug>/ in the private PORTFOLIO bucket.
  photo_paths     TEXT NOT NULL DEFAULT '[]',
  consent_publish INTEGER NOT NULL DEFAULT 0,
  consent_photos  INTEGER NOT NULL DEFAULT 0,

  -- Owner controls.
  approved_at     TEXT,
  featured        INTEGER NOT NULL DEFAULT 0,
  show_photos     INTEGER NOT NULL DEFAULT 1,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews (status, submitted_at DESC);
