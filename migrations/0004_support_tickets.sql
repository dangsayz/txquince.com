-- Support tickets from a signed-in family's account page (/account).
-- The owner gets an email for each one; this table is the record.
-- Only the Worker reads or writes it.
CREATE TABLE IF NOT EXISTS support_tickets (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  clerk_user  TEXT NOT NULL,
  name        TEXT NOT NULL CHECK (length(name) <= 120),
  email       TEXT NOT NULL CHECK (length(email) <= 200),
  phone       TEXT CHECK (phone IS NULL OR length(phone) <= 40),
  topic       TEXT NOT NULL CHECK (topic IN ('booking', 'payment', 'contract', 'other')),
  message     TEXT NOT NULL CHECK (length(message) BETWEEN 5 AND 4000),
  booking_id  TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  language    TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);
CREATE INDEX IF NOT EXISTS support_tickets_created_idx ON support_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON support_tickets (clerk_user, created_at DESC);
