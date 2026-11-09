-- Blog quick polls (src/content/polls.ts). One counter per answer and nothing
-- else: no name, no account, no IP address, no free text.

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id     TEXT NOT NULL CHECK (length(poll_id) BETWEEN 1 AND 60),
  option_id   TEXT NOT NULL CHECK (length(option_id) BETWEEN 1 AND 60),
  votes       INTEGER NOT NULL DEFAULT 0 CHECK (votes >= 0),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (poll_id, option_id)
);
