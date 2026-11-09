-- TX Quince on Cloudflare D1: everything that used to live in Supabase.
-- Apply: npx wrangler d1 migrations apply txquince --remote
--
-- Mirrors the live Postgres schema (read from the live database on
-- 2026-11-09), translated to SQLite:
--   uuid / text / date / timestamptz → TEXT (ISO 8601, UTC, "…Z")
--   jsonb / text[]                   → TEXT holding JSON (src/lib/db parses it)
--   boolean                          → INTEGER 0/1
-- Only the Worker reads or writes this database; there is no public path.
-- The data layer (src/lib/db/d1-query.ts) fills `id` and `updated_at`.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id              TEXT PRIMARY KEY,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  event_date      TEXT,
  venue           TEXT,
  services        TEXT,
  budget_range    TEXT,
  referral        TEXT,
  message         TEXT,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'won', 'lost', 'unsubscribed')),
  followup_step   INTEGER NOT NULL DEFAULT 0 CHECK (followup_step BETWEEN 0 AND 5),
  last_touch_at   TEXT,
  unsubscribed_at TEXT,
  attribution     TEXT,
  lost_reason     TEXT,
  competitor_name TEXT
);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_followup_idx ON inquiries (status, followup_step, last_touch_at);

CREATE TABLE IF NOT EXISTS inquiry_activity (
  id           TEXT PRIMARY KEY,
  inquiry_id   TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('note', 'contact', 'reminder')),
  note         TEXT NOT NULL DEFAULT '',
  actor_email  TEXT NOT NULL,
  due_at       TEXT,
  completed_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS inquiry_activity_inquiry_created_idx ON inquiry_activity (inquiry_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiry_activity_open_due_idx ON inquiry_activity (due_at) WHERE kind = 'reminder' AND completed_at IS NULL;

-- ----------------------------------------------------------------- bookings
CREATE TABLE IF NOT EXISTS bookings (
  id                         TEXT PRIMARY KEY,
  created_at                 TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at                 TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name                       TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  email                      TEXT NOT NULL,
  phone                      TEXT,
  event_date                 TEXT NOT NULL,
  package                    TEXT NOT NULL CHECK (package IN ('photo', 'video', 'both')),
  notes                      TEXT,
  status                     TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('requested', 'pending_payment', 'paid', 'expired', 'cancelled', 'refunded', 'payment_review')
  ),
  deposit_amount_cents       INTEGER NOT NULL CHECK (deposit_amount_cents > 0),
  currency                   TEXT NOT NULL DEFAULT 'usd' CHECK (currency = lower(currency) AND length(currency) = 3),
  expires_at                 TEXT NOT NULL,
  paid_at                    TEXT,
  cancelled_at               TEXT,
  refunded_at                TEXT,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id   TEXT,
  stripe_customer_email      TEXT,
  confirmation_owner_status  TEXT,
  confirmation_client_status TEXT,
  confirmation_sent_at       TEXT,
  metadata                   TEXT NOT NULL DEFAULT '{}',
  collection                 TEXT CHECK (collection IS NULL OR collection IN ('essential', 'signature', 'legacy')),
  recovery_sent_at           TEXT,
  attribution                TEXT,
  review_request_sent_at     TEXT
);
CREATE INDEX IF NOT EXISTS bookings_status_created_at_idx ON bookings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_event_date_idx ON bookings (event_date);
CREATE INDEX IF NOT EXISTS bookings_active_event_date_idx ON bookings (event_date)
  WHERE status IN ('requested', 'pending_payment', 'paid');
CREATE INDEX IF NOT EXISTS bookings_pi_idx ON bookings (stripe_payment_intent_id);

-- THE capacity guard: at most 3 active bookings per date (src/lib/booking-capacity.ts).
-- D1 runs one write at a time, so this check can't race. Raises 'date_unavailable'.
CREATE TRIGGER IF NOT EXISTS bookings_capacity_insert
BEFORE INSERT ON bookings
WHEN NEW.status IN ('requested', 'pending_payment', 'paid')
  AND (SELECT count(*) FROM bookings
       WHERE event_date = NEW.event_date AND status IN ('requested', 'pending_payment', 'paid')) >= 3
BEGIN
  SELECT RAISE(ABORT, 'date_unavailable');
END;

CREATE TRIGGER IF NOT EXISTS bookings_capacity_update
BEFORE UPDATE OF status, event_date ON bookings
WHEN NEW.status IN ('requested', 'pending_payment', 'paid')
  AND NOT (OLD.event_date = NEW.event_date AND OLD.status IN ('requested', 'pending_payment', 'paid'))
  AND (SELECT count(*) FROM bookings
       WHERE event_date = NEW.event_date AND status IN ('requested', 'pending_payment', 'paid') AND id <> NEW.id) >= 3
BEGIN
  SELECT RAISE(ABORT, 'date_unavailable');
END;

-- Balance payments after the deposit (one row per checkout). One live checkout per booking.
CREATE TABLE IF NOT EXISTS booking_payments (
  id                         TEXT PRIMARY KEY,
  created_at                 TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at                 TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  booking_id                 TEXT NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  kind                       TEXT NOT NULL DEFAULT 'balance' CHECK (kind IN ('balance')),
  amount_cents               INTEGER NOT NULL CHECK (amount_cents > 0 AND amount_cents <= 10000000),
  currency                   TEXT NOT NULL DEFAULT 'usd' CHECK (currency = lower(currency) AND length(currency) = 3),
  status                     TEXT NOT NULL DEFAULT 'opening' CHECK (
    status IN ('opening', 'open', 'processing', 'paid', 'expired', 'failed', 'refunded', 'review')
  ),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id   TEXT,
  checkout_url               TEXT,
  checkout_expires_at        TEXT,
  paid_at                    TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS booking_payments_one_live_idx ON booking_payments (booking_id)
  WHERE status IN ('opening', 'open', 'processing');
CREATE INDEX IF NOT EXISTS booking_payments_booking_idx ON booking_payments (booking_id, status);
CREATE INDEX IF NOT EXISTS booking_payments_pi_idx ON booking_payments (stripe_payment_intent_id);

-- ------------------------------------------------------------ quince plans
CREATE TABLE IF NOT EXISTS quince_plans (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE CHECK (length(slug) = 10),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  event_date  TEXT NOT NULL,
  city        TEXT NOT NULL CHECK (length(trim(city)) BETWEEN 2 AND 80),
  colors      TEXT NOT NULL DEFAULT '[]',
  theme       TEXT CHECK (theme IS NULL OR length(theme) <= 120),
  name        TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  email       TEXT,
  phone       TEXT,
  language    TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  source      TEXT CHECK (source IS NULL OR length(source) BETWEEN 2 AND 40),
  attribution TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'booked', 'lost')),
  booking_id  TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  notes       TEXT,
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS quince_plans_created_at_idx ON quince_plans (created_at DESC);
CREATE INDEX IF NOT EXISTS quince_plans_event_date_idx ON quince_plans (event_date);
CREATE INDEX IF NOT EXISTS quince_plans_source_idx ON quince_plans (source);

CREATE TABLE IF NOT EXISTS date_availability (
  event_date TEXT PRIMARY KEY,
  status     TEXT NOT NULL CHECK (status IN ('available', 'limited', 'booked')),
  note       TEXT CHECK (note IS NULL OR length(note) <= 200),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS price_guide (
  id           TEXT PRIMARY KEY,
  category     TEXT NOT NULL CHECK (length(trim(category)) BETWEEN 2 AND 80),
  category_es  TEXT CHECK (category_es IS NULL OR length(category_es) <= 80),
  low_usd      INTEGER NOT NULL CHECK (low_usd >= 0),
  typical_usd  INTEGER NOT NULL CHECK (typical_usd >= 0),
  high_usd     INTEGER NOT NULL CHECK (high_usd >= 0),
  sample_count INTEGER NOT NULL DEFAULT 0 CHECK (sample_count >= 0),
  last_updated TEXT NOT NULL DEFAULT (date('now')),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  published    INTEGER NOT NULL DEFAULT 1,
  CHECK (low_usd <= typical_usd AND typical_usd <= high_usd)
);
CREATE INDEX IF NOT EXISTS price_guide_sort_idx ON price_guide (sort_order, category);

-- ----------------------------------------------------------- site content
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS portfolio_images (
  id           TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  storage_path TEXT NOT NULL,
  alt          TEXT,
  section      TEXT,
  is_feature   INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  width        INTEGER,
  height       INTEGER,
  location     TEXT,
  focus_x      REAL,
  focus_y      REAL,
  slug         TEXT,
  title        TEXT,
  caption      TEXT,
  city         TEXT,
  hook         TEXT,
  tags         TEXT,
  colors       TEXT NOT NULL DEFAULT '[]'
);
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_images_slug_key ON portfolio_images (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS portfolio_images_section_idx ON portfolio_images (section, sort_order);

CREATE TABLE IF NOT EXISTS videos (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  url         TEXT,
  provider    TEXT,
  video_id    TEXT,
  title       TEXT,
  poster_url  TEXT,
  is_feature  INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'vertical'))
);
CREATE INDEX IF NOT EXISTS videos_orientation_idx ON videos (orientation);

CREATE TABLE IF NOT EXISTS vendors (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  business   TEXT,
  category   TEXT,
  ig_handle  TEXT,
  email      TEXT,
  phone      TEXT,
  website    TEXT,
  notes      TEXT,
  slug       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS vendors_category_idx ON vendors (category);

CREATE TABLE IF NOT EXISTS portfolio_image_vendors (
  image_id   TEXT NOT NULL REFERENCES portfolio_images(id) ON DELETE CASCADE,
  vendor_id  TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  role       TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (image_id, vendor_id)
);
CREATE INDEX IF NOT EXISTS piv_vendor_idx ON portfolio_image_vendors (vendor_id);

CREATE TABLE IF NOT EXISTS venues (
  slug       TEXT PRIMARY KEY,
  about      TEXT,
  faq        TEXT NOT NULL DEFAULT '[]',
  address    TEXT,
  area       TEXT,
  ig_handle  TEXT,
  website    TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS conversion_changes (
  id            TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  title         TEXT NOT NULL,
  area          TEXT,
  reason        TEXT,
  target_metric TEXT,
  baseline      TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  notes         TEXT
);
CREATE INDEX IF NOT EXISTS conversion_changes_created_at_idx ON conversion_changes (created_at DESC);

-- ---------------------------------------------------------------- analytics
CREATE TABLE IF NOT EXISTS page_views (
  id           TEXT PRIMARY KEY,
  path         TEXT NOT NULL,
  referrer     TEXT,
  session_id   TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  visitor_id   TEXT,
  device       TEXT
);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path);
CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx ON page_views (visitor_id);
CREATE INDEX IF NOT EXISTS page_views_device_idx ON page_views (device);

CREATE TABLE IF NOT EXISTS lead_events (
  id         TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  path       TEXT,
  target     TEXT,
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON lead_events (created_at DESC);

-- ------------------------------------------------------------- admin login
-- One-time email codes and sessions for /admin (src/lib/admin-session.ts).
-- Only HASHES are stored: a leaked database can't sign anyone in.
CREATE TABLE IF NOT EXISTS admin_login_codes (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at  TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  used_at     TEXT
);
CREATE INDEX IF NOT EXISTS admin_login_codes_email_idx ON admin_login_codes (email, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id           TEXT PRIMARY KEY,
  token_hash   TEXT NOT NULL UNIQUE,
  email        TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at   TEXT NOT NULL,
  last_seen_at TEXT,
  revoked_at   TEXT,
  user_agent   TEXT
);
