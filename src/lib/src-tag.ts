/**
 * src-tag.ts — the `?src=` tags put on links shared OUTSIDE the site, so a
 * visit, inquiry or plan knows which platform sent it. One parameter, eight
 * values: instagram, facebook, tiktok, youtube, pinterest, quora, gbp
 * (Google Business Profile posts, kept apart from plain Google search) and
 * whatsapp (links sent in WhatsApp chats). Links between our own pages never
 * carry a tag.
 *
 * A venue we work with gets its own tag, `venue-<name>` (VENUE_NAMES below):
 * `txquince.com/budget?src=venue-vm-ballroom` is the link that venue hands to
 * its families, so the inquiry says which venue sent them and the venue
 * discount can be applied. The list is closed: an unknown venue tag is dropped
 * like any other unknown tag. To add a venue, add one line to VENUE_NAMES.
 *
 * The browser keeps the LATEST src it saw (Tracker), so a visitor who first
 * arrived from Google and later tapped a ?src=instagram link still gets the
 * tag; the first-touch source is kept alongside it. Every inquiry, plan,
 * offer and date request carries it in `attribution.src`, and the admin
 * groups leads by it.
 */

export const SRC_TAGS = ["instagram", "facebook", "tiktok", "youtube", "pinterest", "quora", "gbp", "whatsapp"] as const;
export type SrcTag = (typeof SRC_TAGS)[number];

/** Venues that have (or may be given) a link for their families: tag name → display name. */
export const VENUE_NAMES: Record<string, string> = {
  "tp-station": "T&P Station",
  "convention-plaza": "Convention Plaza",
  "las-lomas": "Las Lomas",
  "slate-venues": "Slate Venues",
  "vm-ballroom": "VM Ballroom",
  "luxury-venue": "Luxury Wedding & Event Venue",
  "enchanted-event-hall": "Enchanted Event Hall",
  "the-hamptons": "The Hamptons",
  dreamhaus: "Dreamhaus",
  "fgs-ranch": "FGS Ranch",
  "la-prada": "La Prada Event Center",
  "latino-ballroom": "Latino Ballroom",
};
const VENUE_PREFIX = "venue-";
export type VenueTag = `venue-${string}`;

/** "venue-vm-ballroom" → "VM Ballroom"; null when the key is not a known venue tag. */
export function venueTagName(key: string | null | undefined): string | null {
  const t = (key ?? "").trim().toLowerCase();
  if (!t.startsWith(VENUE_PREFIX)) return null;
  const name = t.slice(VENUE_PREFIX.length);
  return Object.hasOwn(VENUE_NAMES, name) ? VENUE_NAMES[name] : null;
}

/**
 * One of the eight platform tags ("Instagram " → "instagram") or a known venue
 * tag ("venue-vm-ballroom"), or null for anything else.
 */
export function normalizeSrc(v: unknown): SrcTag | VenueTag | null {
  if (typeof v !== "string") return null;
  const t = v.trim().toLowerCase();
  if ((SRC_TAGS as readonly string[]).includes(t)) return t as SrcTag;
  return venueTagName(t) ? (t as VenueTag) : null;
}

/**
 * The dashboard's "by source" key: the src tag when there is one, else the
 * first-touch source. (`ref` is read only for inquiries saved before the
 * switch to ?src=.)
 */
export function sourceKey(a: Record<string, string> | null | undefined): string {
  return (normalizeSrc(a?.src) ?? normalizeSrc(a?.ref) ?? (a?.source || "direct")).toLowerCase();
}

/**
 * The same key for a VISIT (a session's first page view): the src tag the
 * beacon stored as utm_source (so ?src=gbp is its own "gbp" row), else any
 * other utm_source, else the referring site, else "direct".
 */
export function visitSourceKey(utmSource: string | null | undefined, referrerHost: string | null | undefined): string {
  return (normalizeSrc(utmSource) ?? (utmSource?.trim() || referrerHost || "direct")).toLowerCase();
}

/** The dashboard row that counts taps on the site's WhatsApp buttons. */
export const WHATSAPP_SOURCE = "whatsapp";
