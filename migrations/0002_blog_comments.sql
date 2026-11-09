-- Blog comments. Apply: npx wrangler d1 migrations apply txquince --remote
--
-- Anyone with a Quince Network account (Clerk, shared with txquince.com) can
-- write one. Nothing is public until the owner approves it at /admin/comments.
-- The owner can answer each comment; the answer shows under it as "TX Quince".
-- We store the Clerk user id and the public display name ("Maria G."), never
-- the commenter's email.

CREATE TABLE IF NOT EXISTS blog_comments (
  id            TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  post_slug     TEXT NOT NULL CHECK (length(post_slug) BETWEEN 1 AND 200),
  lang          TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'es')),
  user_id       TEXT NOT NULL CHECK (length(user_id) BETWEEN 1 AND 100),
  author_name   TEXT NOT NULL CHECK (length(author_name) BETWEEN 1 AND 80),
  author_image  TEXT CHECK (author_image IS NULL OR length(author_image) <= 500),
  body          TEXT NOT NULL CHECK (length(body) BETWEEN 2 AND 2000),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  approved_at   TEXT,
  reply         TEXT CHECK (reply IS NULL OR length(reply) BETWEEN 1 AND 2000),
  replied_at    TEXT
);

CREATE INDEX IF NOT EXISTS blog_comments_post_idx ON blog_comments (post_slug, lang, status, created_at);
CREATE INDEX IF NOT EXISTS blog_comments_status_idx ON blog_comments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS blog_comments_user_idx ON blog_comments (user_id, created_at DESC);
