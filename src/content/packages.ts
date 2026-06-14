/**
 * packages.ts — INVESTMENT TIERS (CONVERSION-CRITICAL anchoring)
 *
 * Good / better / best, plus an honest entry option. Prices ALWAYS visible
 * (visible pricing = the filter). Coverage HOURS climb with the tier: 5 / 6 / 7 / 8.
 *  - MOMENTS ($1,800 · 5 hrs) is the NEW FLOOR + FILTER — the cheapest number on
 *    the page so budget shoppers self-select. A real, short-coverage option; the
 *    hours are stated everywhere so families know exactly what 5 hours buys.
 *  - ESSENTIAL ($2,500 · 6 hrs) — one craft, a little more room than Moments.
 *  - SIGNATURE ($3,900 · 7 hrs) is THE TARGET SALE — steer everyone here.
 *  - LEGACY ($5,500 · 8 hrs) is the ANCHOR at the ceiling so $3,900 reads sensible.
 *
 * The collection dropdown on the form mirrors these AND shows the hours, so the
 * coverage length is impossible to miss at the moment of booking.
 */

export type CollectionId = "moments" | "essential" | "signature" | "legacy";

export type Package = {
  id: CollectionId;
  name: string;
  price: number; // USD, whole dollars
  priceLabel: string; // pre-formatted for display
  hours: number; // hours of coverage — surfaced everywhere so it's clear at booking
  tagline: string;
  /** Internal note (not rendered) — keeps the strategy legible to the operator. */
  role: string;
  highlight?: boolean; // middle tier = "Most Popular"
  badge?: string;
  includes: string[];
  // One-line teaser used on the Home packages strip.
  teaser: string;
  /**
   * Deposit to reserve the date for this collection (cents). Scales with the
   * collection so the commitment matches the investment — bigger day, bigger
   * hold. Operator-editable. Each applies to the final balance.
   */
  depositCents: number;
  depositLabel: string;
};

export const packages: Package[] = [
  {
    id: "moments",
    name: "Moments",
    price: 1800,
    priceLabel: "$1,800",
    hours: 5,
    tagline: "The day's key moments, one artist, five focused hours.",
    role: "NEW FLOOR + FILTER. Lowest number on the page — budget shoppers self-select. A genuine 5-hour option; hours stated plainly so expectations are set.",
    depositCents: 30_000, // $300
    depositLabel: "$300",
    teaser: "Photo or film, one artist, 5 focused hours — la misa through the early reception.",
    includes: [
      "Photo OR film — one service, one artist",
      "5 hours of coverage — la misa through the early reception",
      "Edited gallery OR a highlight film",
      "Complimentary save-the-date session",
    ],
  },
  {
    id: "essential",
    name: "Essential",
    price: 2500,
    priceLabel: "$2,500",
    hours: 6,
    tagline: "One artist, one craft, a little more of the night.",
    role: "FILTER + floor companion. One craft, 6 hours. Not meant to be the steer.",
    depositCents: 50_000, // $500
    depositLabel: "$500",
    teaser: "Photo or film, one artist, 6 hours of the day's milestones.",
    includes: [
      "Photo OR film — one service, one artist",
      "Up to 6 hours of coverage (church + reception)",
      "Edited gallery OR a highlight film",
      "Complimentary save-the-date session",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    price: 3900,
    priceLabel: "$3,900",
    hours: 7,
    tagline: "Two storytellers. The whole day, remembered in full.",
    role: "THE TARGET SALE. Steer everyone here.",
    highlight: true,
    badge: "Most Popular",
    depositCents: 75_000, // $750
    depositLabel: "$750",
    teaser: "Photo + film, two storytellers, 7 hours with a same-week sneak peek.",
    includes: [
      "Photo + film — two storytellers, all day",
      "Up to 7 hours of full-day coverage",
      "Highlight film + complete edited gallery",
      "Same-week sneak peek",
      "Complimentary save-the-date session",
    ],
  },
  {
    id: "legacy",
    name: "Legacy",
    price: 5500,
    priceLabel: "$5,500",
    hours: 8,
    tagline: "The complete cinematic record, nothing left out.",
    role: "ANCHOR at the market ceiling so $3,900 reads as the sensible choice.",
    depositCents: 100_000, // $1,000
    depositLabel: "$1,000",
    teaser: "Everything in Signature, plus long-form film, drone, and a premium album.",
    includes: [
      "Everything in Signature",
      "Up to 8 hours of coverage + a second portrait session",
      "Cinematic long-form film (1–3 hours)",
      "Drone / aerial coverage",
      "Premium album & print credit",
      "Priority calendar placement",
    ],
  },
];

/** Lookup a collection by id. */
export function collectionById(id: string): Package | undefined {
  return packages.find((p) => p.id === id);
}

/** Is this a valid collection id? (narrows unknown query/body values.) */
export function isCollectionId(value: unknown): value is CollectionId {
  return (
    value === "moments" ||
    value === "essential" ||
    value === "signature" ||
    value === "legacy"
  );
}

/** Display name for a collection id ("signature" → "Signature"). */
export function collectionLabel(id: string | null | undefined): string {
  return collectionById(id ?? "")?.name ?? "—";
}

/**
 * Deposit (cents) to reserve a given collection. Server-side source of truth —
 * the deposit is ALWAYS derived from the collection here, never trusted from
 * the client. Falls back to the floor ($500) for any unknown id.
 */
export function depositForCollection(id: string): number {
  return collectionById(id)?.depositCents ?? packages[0].depositCents;
}

/** The lowest deposit across collections — the "from $X" floor for copy. */
export const depositFloorLabel = packages[0].depositLabel;

/** The hook above the tiers. */
export const investmentIntro = {
  eyebrow: "Investment",
  heading: "Collections built around one day you cannot repeat.",
  // The complimentary save-the-date is the hook that runs through every tier.
  hook: "Every collection includes a complimentary save-the-date session.",
  subhead:
    "Fixed pricing, no surprises. Most families choose Signature — two of us, the full day, your film and gallery both.",
};

export type Faq = { q: string; a: string };

export const investmentFaqs: Faq[] = [
  {
    q: "How far in advance should we book?",
    a: "As early as you can. I take a limited number of quinceañeras each season so every family gets my full attention, and the best dates go first — often a year out. If your date is close, reach out anyway; I'll tell you honestly what's still open.",
  },
  {
    q: "How many hours does each collection cover?",
    a: "Coverage climbs with the collection: Moments is 5 hours, Essential 6, Signature 7, and Legacy 8. Moments is built for la misa through the early reception; Signature and Legacy run the full day so the vals, the baile sorpresa, and the last dance all make it on camera. Pick the hours to match how much of the night you want filmed — and if you're unsure, tell me your timeline and I'll tell you honestly which one fits.",
  },
  {
    q: "What if our date is already taken?",
    a: "It happens — I only book a handful of dates per season. If yours is taken, I'll add you to the cancellation waitlist and we'll look at nearby dates. Reaching out early is the surest way to hold your day.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes. Every collection can be reserved with a deposit and split into installments leading up to your date — so the investment is comfortable without anyone discounting the work.",
  },
];
