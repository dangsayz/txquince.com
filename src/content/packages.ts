/**
 * packages.ts — INVESTMENT TIERS (CONVERSION-CRITICAL anchoring)
 *
 * Entry / good / better / best. Prices ALWAYS visible (visible pricing = the filter).
 *  - MOMENTS ($1,800) is the FLOOR + FILTER — lowest number on the page so
 *    budget shoppers self-select. A genuine 5-hour, one-craft option, not a trap.
 *  - ESSENTIAL ($2,500) is the entry full-coverage tier — one craft, fuller day.
 *  - SIGNATURE ($3,900) is THE TARGET SALE — steer everyone here.
 *  - LEGACY ($5,500) is the ANCHOR at the market ceiling so $3,900 reads sensible.
 *
 * The budget-range dropdown on the form mirrors these (lowest = $1,800).
 */

export type CollectionId = "moments" | "essential" | "signature" | "legacy";

export type Package = {
  id: CollectionId;
  name: string;
  price: number; // USD, whole dollars
  priceLabel: string; // pre-formatted for display
  tagline: string;
  /** Internal note (not rendered) — keeps the strategy legible to the operator. */
  role: string;
  highlight?: boolean; // middle tier = "Most Popular"
  badge?: string;
  /** Photo OR film (one craft) — drives the form's "photo or film?" sub-question. */
  singleCraft?: boolean;
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
    tagline: "The day's key moments, one artist, five focused hours.",
    role: "NEW FLOOR + FILTER. Lowest number on the page — budget shoppers self-select. A genuine 5-hour option; hours stated plainly so expectations are set.",
    singleCraft: true,
    depositCents: 30_000, // $300
    depositLabel: "$300",
    teaser: "Photo or film, one artist, 5 focused hours — la misa through the early reception.",
    includes: [
      "Photo OR film — one service, one artist",
      "5 hours of coverage — la misa through the early reception",
      "Edited gallery OR a highlight film",
    ],
  },
  {
    id: "essential",
    name: "Essential",
    price: 2500,
    priceLabel: "$2,500",
    tagline: "One artist, one craft, beautifully done.",
    role: "Entry full-coverage tier — one craft, fuller day. Bridges Moments and Signature.",
    singleCraft: true,
    depositCents: 50_000, // $500
    depositLabel: "$500",
    teaser: "Photo or film, one artist, the full day's milestones.",
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
    tagline: "Two storytellers. The whole day, remembered in full.",
    role: "THE TARGET SALE. Steer everyone here.",
    highlight: true,
    badge: "Most Popular",
    depositCents: 75_000, // $750
    depositLabel: "$750",
    teaser: "Photo + film, two storytellers, your full day with a same-week sneak peek.",
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
    tagline: "The complete cinematic record, nothing left out.",
    role: "ANCHOR at the market ceiling so $3,900 reads as the sensible choice.",
    depositCents: 100_000, // $1,000
    depositLabel: "$1,000",
    teaser: "Everything in Signature, plus long-form film, drone, and a premium album.",
    includes: [
      "Everything in Signature",
      "Cinematic long-form film (1–3 hours)",
      "Drone / aerial coverage",
      "Up to 8 hours of coverage + a second portrait session",
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
  // Eyebrow carries the searched keyword + geo (crawlable, prominent); the H1
  // keeps the editorial voice. Mirrors the homepage system: keyword in the
  // overline, emotion in the headline. Targets "quinceañera photography prices".
  eyebrow: "Quinceañera Photography & Film · Dallas–Fort Worth",
  heading: "Prices, stated plainly.",
  // The complimentary save-the-date is the hook from Essential up — Moments is
  // the bare floor, so its session is a $500 add-on, not included.
  hook: "A complimentary save-the-date session, included from the Essential collection up.",
  subhead:
    "Fixed pricing, no surprises. Most families choose Signature — two of us, the full day, your film and gallery both. Collections built around one day you cannot repeat.",
};

export type Faq = { q: string; a: string };

export const investmentFaqs: Faq[] = [
  {
    q: "How much does a quinceañera photographer cost in Dallas–Fort Worth?",
    a: "Our collections are fixed-price and start at $1,800 — that's Moments, five focused hours with one artist. Most families choose Signature at $3,900 — two of us covering the full day with both film and a complete gallery — with Essential at $2,500 and Legacy at $5,500. Every price is listed right here, never “inquire for pricing,” and from Essential up every collection includes a complimentary save-the-date session — with interest-free payment plans on all of them. The standalone save-the-date session is $500, and additional coverage hours are $350 each.",
  },
  {
    q: "How far in advance should we book?",
    a: "As early as you can. I take a limited number of quinceañeras each season so every family gets my full attention, and the best dates go first — often a year out. If your date is close, reach out anyway; I'll tell you honestly what's still open.",
  },
  {
    q: "Do you cover both the church and the reception?",
    a: "Yes. Every collection is built around the day — la misa, portraits, el vals, and the celebration. Moments covers five focused hours, Essential up to six, Signature up to seven, and Legacy up to eight — the full day, so nothing important happens off-camera.",
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
