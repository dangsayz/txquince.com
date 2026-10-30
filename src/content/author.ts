/**
 * author.ts — who wrote the journal (BlogPosting `author` in the JSON-LD).
 *
 * Google treats a named person with a profile page as a stronger authorship
 * signal than the business itself, but only a REAL name belongs here: never a
 * placeholder or pen name. While `name` is empty, every post falls back to the
 * Organization (TX Quince) as its author, which is what shipped before.
 *
 * TODO(owner): set `name` to the photographer's real full name (the person who
 * writes or signs off on the posts) and make sure /about introduces that person
 * by the same name. `url` is that person's profile page on this site.
 */
export const blogAuthor: { name: string; url: string } = {
  name: "",
  url: "/about",
};
