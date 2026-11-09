-- "Our experience at this venue and its staff": the owner's own account of
-- working at a venue (src/lib/venue-experience.ts). One row per venue slug
-- (src/content/venues.json). Written only by the owner, at the venue's page or
-- post while logged in to Studio. No row = nothing is shown to visitors.

CREATE TABLE IF NOT EXISTS venue_experience (
  venue_slug  TEXT PRIMARY KEY CHECK (length(venue_slug) BETWEEN 1 AND 120),
  verdict     TEXT CHECK (verdict IS NULL OR verdict IN ('great', 'mixed', 'poor')),
  body_en     TEXT NOT NULL CHECK (length(body_en) BETWEEN 1 AND 6000),
  body_es     TEXT CHECK (body_es IS NULL OR length(body_es) BETWEEN 1 AND 6000),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_by  TEXT CHECK (updated_by IS NULL OR length(updated_by) <= 200)
);
