/**
 * src-tag.ts — the `?src=` tags put on links shared OUTSIDE the site, so a
 * visit, inquiry or plan knows which platform sent it. One parameter, six
 * values: instagram, facebook, tiktok, youtube, pinterest, quora. Links
 * between our own pages never carry a tag.
 *
 * The browser keeps the LATEST src it saw (Tracker), so a visitor who first
 * arrived from Google and later tapped a ?src=instagram link still gets the
 * tag; the first-touch source is kept alongside it. Every inquiry, plan,
 * offer and date request carries it in `attribution.src`, and the admin
 * groups leads by it.
 */

export const SRC_TAGS = ["instagram", "facebook", "tiktok", "youtube", "pinterest", "quora"] as const;
export type SrcTag = (typeof SRC_TAGS)[number];

/** One of the six tags ("Instagram " → "instagram"), or null for anything else. */
export function normalizeSrc(v: unknown): SrcTag | null {
  if (typeof v !== "string") return null;
  const t = v.trim().toLowerCase();
  return (SRC_TAGS as readonly string[]).includes(t) ? (t as SrcTag) : null;
}

/**
 * The dashboard's "by source" key: the src tag when there is one, else the
 * first-touch source. (`ref` is read only for inquiries saved before the
 * switch to ?src=.)
 */
export function sourceKey(a: Record<string, string> | null | undefined): string {
  return (normalizeSrc(a?.src) ?? normalizeSrc(a?.ref) ?? (a?.source || "direct")).toLowerCase();
}
