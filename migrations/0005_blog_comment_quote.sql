-- Blog comments can point at a passage: the words the reader highlighted in
-- the post (plain text, one line). Shown above the comment and marked in the
-- article once the comment is approved.
ALTER TABLE blog_comments ADD COLUMN quote TEXT CHECK (quote IS NULL OR length(quote) <= 320);
