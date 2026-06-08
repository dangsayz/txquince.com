/**
 * packages.ts — INVESTMENT TIERS (CONVERSION-CRITICAL anchoring)
 *
 * Good / better / best. Prices ALWAYS visible (visible pricing = the filter).
 *  - ESSENTIAL ($2,500) is the FLOOR + FILTER — cheapest number on the page so
 *    budget shoppers self-select away. Not meant to be sold.
 *  - SIGNATURE ($3,900) is THE TARGET SALE — steer everyone here.
 *  - LEGACY ($5,500) is the ANCHOR at the market ceiling so $3,900 reads sensible.
 *
 * The budget-range dropdown on the form mirrors these (lowest = $2,500).
 */

export type Package = {
  id: "essential" | "signature" | "legacy";
  name: string;
  price: number; // USD, whole dollars
  priceLabel: string; // pre-formatted for display
  tagline: string;
  /** Internal note (not rendered) — keeps the strategy legible to the operator. */
  role: string;
  highlight?: boolean; // middle tier = "Most Popular"
  badge?: string;
  includes: string[];
  // One-line teaser used on the Home packages strip.
  teaser: string;
};

export const packages: Package[] = [
  {
    id: "essential",
    name: "Essential",
    price: 2500,
    priceLabel: "$2,500",
    tagline: "One artist, one craft, beautifully done.",
    role: "FILTER + floor. The cheapest number on the page. Not meant to be sold.",
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
    teaser: "Photo + film, two storytellers, your full day with a same-week sneak peek.",
    includes: [
      "Photo + film — two storytellers, all day",
      "Up to 8 hours of full-day coverage",
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
    teaser: "Everything in Signature, plus long-form film, drone, and a premium album.",
    includes: [
      "Everything in Signature",
      "Cinematic long-form film (1–3 hours)",
      "Drone / aerial coverage",
      "Extra hours + a second portrait session",
      "Premium album & print credit",
      "Priority calendar placement",
    ],
  },
];

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
    q: "Do you cover both the church and the reception?",
    a: "Yes. Every collection is built around the full day — la misa, portraits, el vals, and the celebration. Essential covers up to 6 hours; Signature and Legacy cover the full day so nothing important happens off-camera.",
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
