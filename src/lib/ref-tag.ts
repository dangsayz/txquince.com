/**
 * ref-tag.ts — the `?ref=` link tags Dang and Grokbot put on shared links
 * (?ref=pinterest, gbp, youtube, reddit, quora, mandalay, blog…).
 *
 * The browser keeps the LATEST ref it saw (Tracker), so a visitor who first
 * arrived from Google and later followed a ?ref=mandalay link still gets the
 * tag; the first-touch source is kept alongside it. Every inquiry, offer and
 * date request carries it in `attribution.ref`, and the admin groups by it.
 */

/** A clean ref tag ("Pinterest " → "pinterest"), or null if it isn't one. */
export function normalizeRef(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9_-]{0,39}$/.test(t) ? t : null;
}

/** The dashboard's "by source" key: the ref tag when there is one, else the first-touch source. */
export function sourceKey(a: Record<string, string> | null | undefined): string {
  return (normalizeRef(a?.ref) ?? (a?.source || "direct")).toLowerCase();
}
