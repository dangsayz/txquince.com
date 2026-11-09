-- People the owner blocked from commenting on the Journal. A blocked account
-- cannot post, and its comments are hidden at the moment of the block.
-- We keep the Clerk user id and the public display name, never an email.

CREATE TABLE IF NOT EXISTS blocked_commenters (
  user_id      TEXT PRIMARY KEY CHECK (length(user_id) BETWEEN 1 AND 100),
  author_name  TEXT NOT NULL CHECK (length(author_name) BETWEEN 1 AND 80),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
