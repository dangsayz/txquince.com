/**
 * commission.ts — the commission price book + booking contract (client + server).
 *
 * SINGLE SOURCE OF TRUTH for how a commission is priced. Every number lives in
 * a PriceBook (below): the server loads the live one with getPriceBook()
 * (src/lib/pricing.ts — R2, edited by the owner at /admin/prices) and hands it
 * to the client; every quote, matrix, FAQ, schema and email is computed from
 * that book with the pure functions here. The server ALWAYS re-prices with its
 * own book — a tampered request body can never change what Stripe charges.
 */
import { z } from "zod";
import {
  DEFAULT_ADD_ON_NOTES,
  DEFAULT_PACKAGE_CONTENT,
  DEFAULT_SESSION_PHOTOS,
  addOnNoteSchema,
  packageContentSchema,
  sessionPhotosSchema,
  type L as ContentText,
  type PackageContent,
} from "./package-content";

export const TIER_IDS = ["study", "moments", "solo", "cinema", "trio", "production", "archive"] as const;
export const ADD_ON_IDS = ["destination", "sameday", "super8", "parents", "secondday", "highlight", "coordinator", "momentsfilm"] as const;
export type TierId = (typeof TIER_IDS)[number];
export type AddOnId = (typeof ADD_ON_IDS)[number];

/**
 * The packages families can choose today, in the order they are shown:
 * Portrait Session, Just the Moments (2 to 4 hours of one photographer for the
 * parts of the day a family cares most about: the presentation, family
 * portraits, some dancing), The Solo (one hybrid shooter running a 2–3 camera setup,
 * photos and film at once), The Duo (1 photographer + 1 videographer) and The
 * Trio (2 + 1). Retired packages stay in TIER_IDS so older inquiries, bookings and
 * agreements still read and re-price exactly as they were made: the Two-Day
 * Celebration (`archive`, its second day is now the `secondday` extra) and
 * the Full Celebration (`production`, its coordinator is now the
 * `coordinator` extra). New requests are refused for a retired package on the
 * server (isBookableTier).
 */
export const PUBLIC_TIER_IDS = ["study", "moments", "solo", "cinema", "trio"] as const satisfies readonly TierId[];
export type PublicTierId = (typeof PUBLIC_TIER_IDS)[number];
export const isBookableTier = (id: TierId): id is PublicTierId => (PUBLIC_TIER_IDS as readonly TierId[]).includes(id);

/**
 * `?collection=` on /reserve (it redirects to /?collection=…#intake). Links
 * have always carried the package id (`/reserve?collection=moments`); the two
 * packages whose display name differs from their id also answer to that name,
 * so a hand-typed `?collection=duo` or `?collection=portrait` still works.
 * Anything else (retired or unknown) is null: the panel stays as it was.
 */
const COLLECTION_ALIASES = new Map<string, PublicTierId>([
  ["duo", "cinema"],
  ["portrait", "study"],
]);
export function collectionParamTier(value: string | null | undefined): PublicTierId | null {
  const v = (value ?? "").trim().toLowerCase();
  if ((PUBLIC_TIER_IDS as readonly string[]).includes(v)) return v as PublicTierId;
  return COLLECTION_ALIASES.get(v) ?? null;
}

/** English names for Stripe line items, receipts and operator email. */
export const TIER_NAME_EN: Record<TierId, string> = {
  study: "Portrait Session",
  moments: "Just the Moments",
  solo: "The Solo",
  cinema: "The Duo",
  trio: "The Trio",
  production: "Full Celebration (retired)",
  archive: "Two-Day Celebration (retired)",
};

export const ADD_ON_NAME_EN: Record<AddOnId, string> = {
  destination: "Dress Session",
  sameday: "Same-Day Edit (ready in 24 hours)",
  super8: "Vintage Film Clip (Super 8)",
  parents: "Albums for Mom & Dad",
  secondday: "Second Portrait Day",
  highlight: "Highlight Film (3–5 min)",
  coordinator: "Day-of Coordinator (per day)",
  momentsfilm: "Presentation Film",
};


/**
 * Extras offered on some packages only (an extra not listed here is offered
 * on all). Enforced by the server (quote + inquiry schema + agreement), not
 * only by what the booking panel shows.
 *  - Video extras need a videographer, so not the Portrait Session.
 *  - The Highlight Film is already part of the Trio.
 *  - Albums for Mom & Dad are copies of the Trio's printed album.
 *  - The Dress Session is now included in the Duo and Trio (a dress or
 *    save-the-date session after the deposit), so it is not sold separately.
 *  - Just the Moments is short coverage by one photographer: only its own
 *    Presentation Film can be added (no coordinator, no second day).
 *  - The Solo is the budget package: one shooter, no second-location or
 *    second-day work, so only the Highlight Film and a Coordinator can be
 *    added. Anything more is what the Duo is for.
 */
export const ADD_ON_TIERS: Partial<Record<AddOnId, readonly TierId[]>> = {
  destination: [],
  sameday: ["cinema", "trio"],
  super8: ["cinema", "trio"],
  parents: ["trio"],
  secondday: ["cinema", "trio"],
  highlight: ["solo", "cinema"],
  coordinator: ["solo", "cinema", "trio"],
  momentsfilm: ["moments"],
};
export const addOnAllowed = (tier: TierId, id: AddOnId) => {
  const only = ADD_ON_TIERS[id];
  return !only || only.includes(tier);
};

/* ------------------------------------------------------------------ */
/* Defaults — the launch price book                                     */
/* ------------------------------------------------------------------ */
/*
 * Whole US dollars. Priced for what DFW quinceañera families actually spend
 * (research Oct 2026, docs/dfw-pricing-search-booking.md):
 *  - Most DFW quince budgets are $12–25K all-in; photo + film takes 8–15%.
 *  - Published DFW quince packages: photo-only $1.5–3K, photo + video
 *    $3–5.5K, luxury collections $5.5–8K (highest published ~$6K).
 * The Oct 31 2026 lineup: Portrait Session, The Solo (one hybrid shooter,
 * 5 hours, capped at 6), The Duo (1 photographer + 1
 * videographer, 6 hours) and The Trio (2 + 1, 7 hours). Both event packages
 * include a dress or save-the-date session once the deposit is paid; a
 * day-of coordinator is an extra.
 *
 * These constants are NOT read anywhere else. The live prices are the
 * runtime price book (src/lib/pricing.ts → R2 config/pricing.json, edited at
 * /admin/prices); these are only what it falls back to when nothing has been
 * saved yet or storage is unreachable (local dev, `next build`).
 */
const DEFAULT_TIER_PRICE_USD: Record<TierId, number> = {
  study: 400,
  moments: 500,
  solo: 1200,
  cinema: 2000,
  trio: 2800,
  production: 2800,
  archive: 3500,
};
const DEFAULT_ADD_ON_PRICE_USD: Record<AddOnId, number> = {
  destination: 400,
  sameday: 600,
  super8: 600,
  parents: 550,
  secondday: 600,
  highlight: 500,
  coordinator: 500,
  momentsfilm: 250,
};
/** Hours of coverage included in the package price. */
const DEFAULT_BASE_HOURS: Record<TierId, number> = {
  study: 1,
  moments: 2,
  solo: 5,
  cinema: 6,
  trio: 7,
  production: 7,
  archive: 7,
};
/** Price of each hour added beyond the included hours (0 = hours can't be added). */
const DEFAULT_EXTRA_HOUR_USD: Record<TierId, number> = {
  study: 150,
  moments: 250,
  solo: 200,
  cinema: 400,
  trio: 450,
  production: 450,
  archive: 0,
};
/** The Trio launch offer: this many dates at the Trio price, counted down by hand in admin. Off (0 left) by default. */
const DEFAULT_TRIO_SPOTS_TOTAL = 5;
const DEFAULT_TRIO_SPOTS_LEFT = 0;
const DEFAULT_MAX_HOURS = 8;
/**
 * Each package's own ceiling under the book's longest day. Just the Moments
 * is short coverage (up to 4 hours); the Solo is one person carrying every
 * camera, so it stops at 6: a family that wants a longer day books the Duo or
 * the Trio. Owner-editable per package at /admin/prices.
 */
const DEFAULT_PACKAGE_MAX_HOURS: Record<TierId, number> = {
  study: 8,
  moments: 4,
  solo: 6,
  cinema: 8,
  trio: 8,
  production: 8,
  archive: 7,
};
/** Flat date-hold deposit on a quince plan ("Hold my date"), whole dollars. */
const DEFAULT_PLAN_HOLD_USD = 500;
/** Just the Moments takes a Saturday only this many days before the date (see momentsDateAllowed). */
const DEFAULT_MOMENTS_SATURDAY_DAYS = 30;
/** Deposit: 25% down once we approve the signed agreement; the rest 14 days before. */
const DEFAULT_DEPOSIT_PERCENT = 25;
const DEFAULT_BALANCE_DUE_DAYS = 14;
/** Consultation-first courtesy hold while the studio reviews a signed agreement. */
const DEFAULT_HOLD_DAYS = 7;

/* ------------------------------------------------------------------ */
/* The price book — every number the owner can change at /admin/prices */
/* ------------------------------------------------------------------ */

export type PackagePrice = {
  /** Package price, whole dollars. */
  price: number;
  /** Hours on the day included in the price, in half-hour steps (1.5 = 1 h 30 min). */
  hours: number;
  /** Price of each added hour, whole dollars; a half hour costs half. 0 = hours can't be added. */
  extraHour: number;
  /** Most hours this package can grow to (never above the book's longest day). */
  maxHours: number;
};

export type PriceBook = {
  packages: Record<TierId, PackagePrice>;
  addOns: Record<AddOnId, number>;
  /** Longest day we cover: families can add hours up to this. */
  maxHours: number;
  /** Deposit, as a whole percent of the total (25 = 25%). */
  depositPercent: number;
  /** The rest is due this many days before the event. */
  balanceDueDays: number;
  /** Days we hold a date while we review a signed agreement. */
  holdDays: number;
  /** ISO time of the last save (null = never saved; defaults). */
  updatedAt: string | null;
  /** Who saved it (admin email). */
  updatedBy: string | null;
  /**
   * The Trio launch offer ("only 5 dates at this price"). The owner counts
   * `trioSpotsLeft` down in admin as Trio dates are confirmed; the site shows
   * "N of total left" while it is above 0 and says nothing once it reaches 0.
   * It never changes a price by itself: the owner raises the Trio price in
   * admin when the offer is over.
   */
  trioSpotsTotal: number;
  trioSpotsLeft: number;
  /** Flat deposit to hold a date from a quince plan ("Hold my date"), whole dollars. */
  planHoldUsd: number;
  /** Just the Moments can take a Saturday only this many days (or fewer) before the date. */
  momentsSaturdayDays: number;
  /** Photos in the dress or save-the-date session ("30–40"), used by {session}. */
  sessionPhotos: string;
  /** What each package includes, in words (src/lib/package-content.ts). */
  content: Record<PublicTierId, PackageContent>;
  /** What each extra is, in words. */
  addOnNotes: Record<AddOnId, ContentText>;
};

const mapTiers = <T,>(f: (id: TierId) => T) =>
  Object.fromEntries(TIER_IDS.map((id) => [id, f(id)])) as Record<TierId, T>;
const mapAddOns = <T,>(f: (id: AddOnId) => T) =>
  Object.fromEntries(ADD_ON_IDS.map((id) => [id, f(id)])) as Record<AddOnId, T>;

function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object") {
    for (const v of Object.values(o)) deepFreeze(v);
    Object.freeze(o);
  }
  return o;
}

/** The launch price book. Deep-frozen so nothing can mutate the fallback. */
export const DEFAULT_PRICE_BOOK: PriceBook = deepFreeze({
  packages: mapTiers((id) => ({
    price: DEFAULT_TIER_PRICE_USD[id],
    hours: DEFAULT_BASE_HOURS[id],
    extraHour: DEFAULT_EXTRA_HOUR_USD[id],
    maxHours: DEFAULT_PACKAGE_MAX_HOURS[id],
  })),
  addOns: mapAddOns((id) => DEFAULT_ADD_ON_PRICE_USD[id]),
  maxHours: DEFAULT_MAX_HOURS,
  depositPercent: DEFAULT_DEPOSIT_PERCENT,
  balanceDueDays: DEFAULT_BALANCE_DUE_DAYS,
  holdDays: DEFAULT_HOLD_DAYS,
  updatedAt: null,
  updatedBy: null,
  trioSpotsTotal: DEFAULT_TRIO_SPOTS_TOTAL,
  trioSpotsLeft: DEFAULT_TRIO_SPOTS_LEFT,
  planHoldUsd: DEFAULT_PLAN_HOLD_USD,
  momentsSaturdayDays: DEFAULT_MOMENTS_SATURDAY_DAYS,
  sessionPhotos: DEFAULT_SESSION_PHOTOS,
  content: structuredClone(DEFAULT_PACKAGE_CONTENT),
  addOnNotes: structuredClone(DEFAULT_ADD_ON_NOTES),
});

/** Hard limits for every editable number (the admin form shows the same). */
export const PRICE_LIMITS = {
  packagePrice: { min: 50, max: 50_000 },
  addOnPrice: { min: 1, max: 10_000 },
  extraHour: { min: 0, max: 5_000 },
  hours: { min: 1, max: 12 },
  depositPercent: { min: 5, max: 100 },
  balanceDueDays: { min: 1, max: 90 },
  holdDays: { min: 1, max: 30 },
  trioSpots: { min: 0, max: 50 },
  planHold: { min: 50, max: 5_000 },
  momentsSaturdayDays: { min: 0, max: 365 },
} as const;

/** Hours move in half-hour steps everywhere: 1, 1.5, 2 … */
export const HOUR_STEP = 0.5;
/** Snap any number of hours to the nearest half hour. */
export const toHalfHour = (h: number) => Math.round(h / HOUR_STEP) * HOUR_STEP;
/** "1.5", "2" — hours in prose. */
export const fmtHours = (h: number) => String(toHalfHour(h));

const whole = (min: number, max: number, what: string) =>
  z
    .number({ message: `${what} must be a number.` })
    .int(`${what} must be a whole number.`)
    .min(min, `${what} must be at least ${min.toLocaleString("en-US")}.`)
    .max(max, `${what} can be at most ${max.toLocaleString("en-US")}.`);

const halves = (min: number, max: number, what: string) =>
  z
    .number({ message: `${what} must be a number.` })
    .min(min, `${what} must be at least ${min}.`)
    .max(max, `${what} can be at most ${max}.`)
    .refine((n) => Number.isInteger(n / HOUR_STEP), `${what} must be in half hours (like 2 or 1.5).`);

const L = PRICE_LIMITS;
const packageSchema = (id: TierId) =>
  z.object({
    price: whole(L.packagePrice.min, L.packagePrice.max, `${TIER_NAME_EN[id]} price`),
    hours: halves(L.hours.min, L.hours.max, `${TIER_NAME_EN[id]} hours`),
    extraHour: whole(L.extraHour.min, L.extraHour.max, `${TIER_NAME_EN[id]} extra-hour price`),
    maxHours: halves(L.hours.min, L.hours.max, `${TIER_NAME_EN[id]} most hours`),
  });

/** Strict validation of a whole price book (what the admin form submits). */
export const priceBookSchema = z
  .object({
    packages: z.object(mapTiers(packageSchema)).strict(),
    addOns: z
      .object(mapAddOns((id) => whole(L.addOnPrice.min, L.addOnPrice.max, `${ADD_ON_NAME_EN[id]} price`)))
      .strict(),
    maxHours: halves(L.hours.min, L.hours.max, "Longest day"),
    depositPercent: whole(L.depositPercent.min, L.depositPercent.max, "Deposit %"),
    balanceDueDays: whole(L.balanceDueDays.min, L.balanceDueDays.max, "Days before the event"),
    holdDays: whole(L.holdDays.min, L.holdDays.max, "Hold days"),
    updatedAt: z.string().max(40).nullable().default(null),
    updatedBy: z.string().max(200).nullable().default(null),
    trioSpotsTotal: whole(L.trioSpots.min, L.trioSpots.max, "Trio offer dates"),
    trioSpotsLeft: whole(L.trioSpots.min, L.trioSpots.max, "Trio offer dates left"),
    planHoldUsd: whole(L.planHold.min, L.planHold.max, "Hold-my-date deposit"),
    momentsSaturdayDays: whole(L.momentsSaturdayDays.min, L.momentsSaturdayDays.max, "Just the Moments Saturday window"),
    sessionPhotos: sessionPhotosSchema,
    content: z.object(Object.fromEntries(PUBLIC_TIER_IDS.map((id) => [id, packageContentSchema(TIER_NAME_EN[id])])) as Record<PublicTierId, ReturnType<typeof packageContentSchema>>).strict(),
    addOnNotes: z.object(mapAddOns((id) => addOnNoteSchema(ADD_ON_NAME_EN[id]))).strict(),
  })
  .strict()
  .superRefine((b, ctx) => {
    if (b.trioSpotsLeft > b.trioSpotsTotal) {
      ctx.addIssue({
        code: "custom",
        path: ["trioSpotsLeft"],
        message: `Trio dates left (${b.trioSpotsLeft}) can't be more than the offer's total (${b.trioSpotsTotal}).`,
      });
    }
    for (const id of TIER_IDS) {
      if (b.packages[id].hours > b.maxHours) {
        ctx.addIssue({
          code: "custom",
          path: ["packages", id, "hours"],
          message: `${TIER_NAME_EN[id]} includes ${b.packages[id].hours} hours, more than the longest day (${b.maxHours}).`,
        });
      }
      if (b.packages[id].maxHours < b.packages[id].hours) {
        ctx.addIssue({
          code: "custom",
          path: ["packages", id, "maxHours"],
          message: `${TIER_NAME_EN[id]} can grow to ${b.packages[id].maxHours} hours, fewer than it includes (${b.packages[id].hours}).`,
        });
      }
    }
  });

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Hours — each package includes a set number of hours on the day;     */
/* families can add hours, one at a time, up to the book's maxHours.   */
/* ------------------------------------------------------------------ */

/** Most hours this package can have on the day (included hours if hours can't be added). */
export function maxHoursFor(book: PriceBook, tier: TierId): number {
  const p = book.packages[tier];
  const cap = Math.min(book.maxHours, p.maxHours);
  return p.extraHour > 0 ? Math.max(p.hours, cap) : p.hours;
}

/** Every choice of hours for this package: included, then each half hour up to its most. */
export function hourSteps(book: PriceBook, tier: TierId): number[] {
  const base = book.packages[tier].hours;
  const n = Math.round((maxHoursFor(book, tier) - base) / HOUR_STEP);
  return Array.from({ length: Math.max(0, n) + 1 }, (_, i) => base + i * HOUR_STEP);
}

/** Can a family add hours to this package at all? */
export const canAddHours = (book: PriceBook, tier: TierId) => maxHoursFor(book, tier) > book.packages[tier].hours;

/** Fit any requested hours to the package: half-hour steps, included..max. */
export function normalizeHours(book: PriceBook, tier: TierId, hours?: number | null): number {
  const base = book.packages[tier].hours;
  const want = Number.isFinite(hours) ? toHalfHour(hours!) : base;
  return Math.max(base, Math.min(maxHoursFor(book, tier), want));
}

/* ------------------------------------------------------------------ */
/* Crew — included value. Each commission includes a number of         */
/* directors; families choose the mix of photographers and             */
/* videographers (they are interchangeable) at no extra cost.          */
/* ------------------------------------------------------------------ */

export const CREW_ROLES = ["photo", "motion"] as const;
export type CrewRole = (typeof CREW_ROLES)[number];
/** The chosen mix: how many of the included directors shoot stills vs. motion. */
export type Crew = Record<CrewRole, number>;

/** Directors included on the celebration day. */
export const BASE_CREW: Record<TierId, number> = {
  study: 1,
  moments: 1,
  solo: 1,
  cinema: 2,
  trio: 3,
  production: 4,
  archive: 5,
};

/** Largest crew we field on one day. */
export const MAX_CREW = Math.max(...Object.values(BASE_CREW));

/** A day-of coordinator comes with the larger productions. */
export const COORDINATOR_INCLUDED: Record<TierId, boolean> = {
  study: false,
  moments: false,
  solo: false,
  cinema: false,
  trio: false,
  production: true,
  archive: true,
};

/**
 * The Portrait Study is stills only; every event commission keeps at least one
 * of each. The Solo is one hybrid shooter (photos and film at once from a 2–3
 * camera setup), counted as one seat with nothing to rearrange.
 */
const MIN_ROLE: Record<TierId, Crew> = {
  study: { photo: 1, motion: 0 },
  moments: { photo: 1, motion: 0 },
  solo: { photo: 1, motion: 0 },
  cinema: { photo: 1, motion: 1 },
  trio: { photo: 1, motion: 1 },
  production: { photo: 1, motion: 1 },
  archive: { photo: 1, motion: 1 },
};

const DEFAULT_MIX: Record<TierId, Crew> = {
  study: { photo: 1, motion: 0 },
  moments: { photo: 1, motion: 0 },
  solo: { photo: 1, motion: 0 },
  cinema: { photo: 1, motion: 1 },
  trio: { photo: 2, motion: 1 },
  production: { photo: 2, motion: 2 },
  archive: { photo: 3, motion: 2 },
};

export const defaultCrew = (tier: TierId): Crew => ({ ...DEFAULT_MIX[tier] });

/** Fit any requested mix to the tier: total = included crew, minimums respected. */
export function normalizeCrew(tier: TierId, mix?: Partial<Crew> | null): Crew {
  const total = BASE_CREW[tier];
  const min = MIN_ROLE[tier];
  const want = Number.isFinite(mix?.photo) ? Math.floor(mix!.photo!) : DEFAULT_MIX[tier].photo;
  const photo = Math.max(min.photo, Math.min(want, total - min.motion));
  return { photo, motion: total - photo };
}

/** Can the family still move a seat to this role? */
export const canShift = (tier: TierId, mix: Crew, to: CrewRole) => {
  const from: CrewRole = to === "photo" ? "motion" : "photo";
  return mix[from] > MIN_ROLE[tier][from];
};

/** Single-craft tiers carry a photo-only service; the rest are photo + film. */
export const TIER_SERVICE: Record<TierId, "photo" | "both"> = {
  study: "photo",
  moments: "photo",
  solo: "both",
  cinema: "both",
  trio: "both",
  production: "both",
  archive: "both",
};

/** Unpaid checkout hold (Stripe's own limit; not owner-editable). */
export const CHECKOUT_HOLD_MINUTES = 30;

export type Quote = {
  tierUsd: number;
  /** Hours on the day (included + added). */
  hours: number;
  /** Hours included in the package. */
  baseHours: number;
  extraHoursUsd: number;
  addOnsUsd: number;
  /** Directors included on the celebration day. */
  crewSize: number;
  totalUsd: number;
  retainerUsd: number;
  balanceUsd: number;
  /** Deposit percent this quote was priced with. */
  depositPercent: number;
};

/** Deposit on a total: the book's percent, whole dollars, never more than the total. */
export function depositFor(book: PriceBook, totalUsd: number): number {
  return Math.min(totalUsd, Math.max(0, Math.round((totalUsd * book.depositPercent) / 100)));
}

export function quoteCommission(
  book: PriceBook,
  tier: TierId,
  addOns: readonly AddOnId[],
  hoursWanted?: number | null,
): Quote {
  const pkg = book.packages[tier];
  const tierUsd = pkg.price;
  const hours = normalizeHours(book, tier, hoursWanted);
  // A half hour costs half the hourly rate, rounded to whole dollars.
  const extraHoursUsd = Math.round((hours - pkg.hours) * pkg.extraHour);
  const unique = Array.from(new Set(addOns)).filter((a) => addOnAllowed(tier, a));
  const addOnsUsd = unique.reduce((sum, a) => sum + book.addOns[a], 0);
  const crewSize = BASE_CREW[tier];
  const totalUsd = tierUsd + extraHoursUsd + addOnsUsd;
  const retainerUsd = depositFor(book, totalUsd);
  return {
    tierUsd,
    hours,
    baseHours: pkg.hours,
    extraHoursUsd,
    addOnsUsd,
    crewSize,
    totalUsd,
    retainerUsd,
    balanceUsd: totalUsd - retainerUsd,
    depositPercent: book.depositPercent,
  };
}

/** Test/tooling convenience: a quote from the launch defaults. Never use for a real charge. */
export const quoteWithDefaults = (tier: TierId, addOns: readonly AddOnId[] = [], hours?: number | null) =>
  quoteCommission(DEFAULT_PRICE_BOOK, tier, addOns, hours);

/** "$11,500" — use in prose so copy reads straight from the price book. */
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Lowest and highest package families can choose — for "from $X" copy and schema. */
export const priceFloor = (book: PriceBook) => Math.min(...PUBLIC_TIER_IDS.map((id) => book.packages[id].price));
export const priceCeiling = (book: PriceBook) => Math.max(...PUBLIC_TIER_IDS.map((id) => book.packages[id].price));

/** Cheapest price per added hour across packages that allow it (null = none do). */
export function extraHourFrom(book: PriceBook): number | null {
  const rates = PUBLIC_TIER_IDS.filter((id) => canAddHours(book, id)).map((id) => book.packages[id].extraHour);
  return rates.length ? Math.min(...rates) : null;
}

/** Plain-language list of what changed between two books (admin confirm + history). */
export function describeChanges(before: PriceBook, after: PriceBook): string[] {
  const out: string[] = [];
  const money = (label: string, a: number, b: number) => a !== b && out.push(`${label}: ${usd(a)} → ${usd(b)}`);
  const num = (label: string, a: number, b: number, unit: string) =>
    a !== b && out.push(`${label}: ${a} → ${b} ${unit}`);
  for (const id of TIER_IDS) {
    const a = before.packages[id];
    const b = after.packages[id];
    money(`${TIER_NAME_EN[id]} price`, a.price, b.price);
    num(`${TIER_NAME_EN[id]} hours included`, a.hours, b.hours, "hours");
    money(`${TIER_NAME_EN[id]} extra hour`, a.extraHour, b.extraHour);
    num(`${TIER_NAME_EN[id]} most hours`, a.maxHours, b.maxHours, "hours");
  }
  for (const id of ADD_ON_IDS) money(ADD_ON_NAME_EN[id], before.addOns[id], after.addOns[id]);
  num("Longest day", before.maxHours, after.maxHours, "hours");
  if (before.depositPercent !== after.depositPercent) out.push(`Deposit: ${before.depositPercent}% → ${after.depositPercent}%`);
  num("Rest due before the event", before.balanceDueDays, after.balanceDueDays, "days");
  num("Date hold while reviewing", before.holdDays, after.holdDays, "days");
  num("Trio offer dates", before.trioSpotsTotal, after.trioSpotsTotal, "dates");
  num("Trio offer dates left", before.trioSpotsLeft, after.trioSpotsLeft, "dates");
  money("Hold-my-date deposit", before.planHoldUsd, after.planHoldUsd);
  num("Just the Moments Saturday window", before.momentsSaturdayDays, after.momentsSaturdayDays, "days");
  if (before.sessionPhotos !== after.sessionPhotos) out.push(`Dress session photos: ${before.sessionPhotos} → ${after.sessionPhotos}`);
  for (const id of PUBLIC_TIER_IDS) {
    const a = before.content[id];
    const b = after.content[id];
    const changed = (Object.keys(b) as (keyof PackageContent)[]).filter((k) => JSON.stringify(a?.[k]) !== JSON.stringify(b[k]));
    if (changed.length) out.push(`${TIER_NAME_EN[id]} wording: ${changed.map((k) => CONTENT_FIELD_NAME[k]).join(", ")}`);
  }
  for (const id of ADD_ON_IDS) {
    if (JSON.stringify(before.addOnNotes[id]) !== JSON.stringify(after.addOnNotes[id])) out.push(`${ADD_ON_NAME_EN[id]} description`);
  }
  return out;
}

/** Plain names for the wording fields (history + admin). */
export const CONTENT_FIELD_NAME: Record<keyof PackageContent, string> = {
  photos: "photo count",
  photosNote: "photo note",
  cameras: "cameras",
  team: "team",
  summary: "card paragraph",
  detail: "home page line",
  bullets: "card points",
  coverage: "what we cover",
  video: "full-length film",
  highlight: "highlight film",
  social: "short videos",
  session: "dress session",
  album: "album",
  files: "original files",
  notIncluded: "not included",
};

/* ------------------------------------------------------------------ */
/* Just the Moments on Saturdays                                       */
/* ------------------------------------------------------------------ */

/**
 * Saturdays are when full-day packages book, so a short Moments booking may
 * take a Saturday only this close to the date (book.momentsSaturdayDays,
 * owner-editable), when a full-day booking is unlikely to come. Fridays,
 * Sundays and weekdays are open any time. Enforced by the server (inquiry
 * route), not only by the calendar.
 */
/** Can this package be requested for this date? `today` is YYYY-MM-DD in Dallas. */
export function momentsDateAllowed(book: PriceBook, tier: TierId, eventDate: string, today: string): boolean {
  if (tier !== "moments") return true;
  const d = new Date(`${eventDate}T12:00:00Z`);
  const t = new Date(`${today}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || Number.isNaN(t.getTime())) return false;
  if (d.getUTCDay() !== 6) return true;
  return Math.round((d.getTime() - t.getTime()) / 86_400_000) <= book.momentsSaturdayDays;
}

/* ------------------------------------------------------------------ */
/* Request contract                                                    */
/* ------------------------------------------------------------------ */

export const CITY_IDS = ["dfw", "hou", "atx", "satx", "other"] as const;
export const SCOPE_IDS = ["both", "stills", "motion"] as const;

const MAX_YEARS_OUT = 3;

function isBookableDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const max = new Date(today.getFullYear() + MAX_YEARS_OUT, today.getMonth(), today.getDate());
  return d > today && d <= max;
}

export const commissionSchema = z.object({
  event_date: z.string().trim().refine(isBookableDate, {
    message: "Choose a future date within the next three years.",
  }),
  city: z.enum(CITY_IDS),
  venue: z.string().trim().max(160).optional().default(""),
  /** Event start time as the family wrote it ("4:00 PM"); optional. */
  start_time: z.string().trim().max(40).optional().default(""),
  scope: z.enum(SCOPE_IDS),
  tier: z.enum(TIER_IDS),
  add_ons: z.array(z.enum(ADD_ON_IDS)).max(ADD_ON_IDS.length).default([]),
  /** Requested photographer / videographer mix; normalized to the tier's included crew. */
  crew_mix: z
    .object({
      photo: z.number().int().min(0).max(MAX_CREW),
      motion: z.number().int().min(0).max(MAX_CREW),
    })
    .optional(),
  /** Requested hours on the day; normalized to the package's included..max hours. */
  hours: z
    .number()
    .min(PRICE_LIMITS.hours.min)
    .max(PRICE_LIMITS.hours.max)
    .refine((n) => Number.isInteger(n / HOUR_STEP), "Hours go in half-hour steps.")
    .optional(),
  /**
   * What the family was shown when they signed (total + deposit). Optional so
   * an older open tab still works; when present and different from the
   * server's own re-quote (prices changed while the tab was open), the
   * booking is refused with `prices_changed` so nobody signs a number they
   * didn't see. The server's quote is what gets stored and charged either way.
   */
  quoted_total_usd: z.number().int().min(0).max(1_000_000).optional(),
  quoted_deposit_usd: z.number().int().min(0).max(1_000_000).optional(),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  honoree: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  phone: z.string().trim().min(7, "Please enter a phone number.").max(40),
  language: z.enum(["en", "es"]),
  note: z.string().trim().max(2000).optional().default(""),
  /** May we share some photos/videos publicly? */
  share_permission: z.boolean().default(true),
  /**
   * The signed agreement: typed full name + drawn signature + consent.
   * Optional at request time — the homepage sends a REQUEST; the family signs
   * later, on their private booking page, once the studio confirms the date.
   */
  signed_name: z.string().trim().min(2, "Type your full name to sign.").max(120).optional(),
  signature: z
    .string()
    .max(400_000)
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/, "Please sign in the box.")
    .optional(),
  agree: z.literal(true, { message: "Please check the box to agree." }).optional(),
});

export type CommissionRequest = z.infer<typeof commissionSchema>;

export const CITY_NAME: Record<(typeof CITY_IDS)[number], string> = {
  dfw: "Dallas–Fort Worth",
  hou: "Houston",
  atx: "Austin",
  satx: "San Antonio",
  other: "Elsewhere in Texas",
};

function crewLine(tier: TierId, mix: Crew, book: PriceBook): string {
  if (tier === "solo") return `Team (included, 1): ${book.content.solo.team.en.replaceAll("{cameras}", book.content.solo.cameras)}`;
  const n = (k: number, one: string) => `${k} ${one}${k === 1 ? "" : "s"}`;
  return `Team (included, ${BASE_CREW[tier]}): ${n(mix.photo, "photographer")} + ${n(mix.motion, "videographer")}`;
}

/** Human-readable summary stored on the booking and shown to the operator. */
export function describeCommission(r: CommissionRequest, q: Quote, book: PriceBook): string {
  const lines = [
    `Package: ${TIER_NAME_EN[r.tier]} — ${usd(q.tierUsd)} (${fmtHours(q.baseHours)} hrs included)`,
    q.extraHoursUsd ? `+ ${fmtHours(q.hours - q.baseHours)} extra hr(s) — ${usd(q.extraHoursUsd)}` : "",
    `Hours on the day: ${q.hours}`,
    ...Array.from(new Set(r.add_ons))
      .filter((a) => addOnAllowed(r.tier, a))
      .map((a) => `+ ${ADD_ON_NAME_EN[a]} — ${usd(book.addOns[a])}`),
    crewLine(r.tier, normalizeCrew(r.tier, r.crew_mix), book),
    COORDINATOR_INCLUDED[r.tier] ? "Day-of coordinator: included" : "",
    `Total: ${usd(q.totalUsd)} · Deposit (${q.depositPercent}%): ${usd(q.retainerUsd)} · Balance: ${usd(q.balanceUsd)}`,
    r.signed_name ? `Signed by: ${r.signed_name}` : "Request — not signed yet",
    `City: ${CITY_NAME[r.city]}${r.venue ? ` · Venue: ${r.venue}` : ""}${r.start_time ? ` · Starts: ${r.start_time}` : ""}`,
    `Scope: ${r.scope}`,
    r.honoree ? `Quinceañera: ${r.honoree}` : "",
    `Preferred language: ${r.language === "es" ? "Español" : "English"}`,
    r.note ? `\nNote from family:\n${r.note}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}
