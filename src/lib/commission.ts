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

export const TIER_IDS = ["study", "cinema", "trio", "production", "archive"] as const;
export const ADD_ON_IDS = ["destination", "sameday", "super8", "parents", "secondday"] as const;
export type TierId = (typeof TIER_IDS)[number];
export type AddOnId = (typeof ADD_ON_IDS)[number];

/**
 * The packages families can choose today, in the order they are shown. The
 * Two-Day Celebration (`archive`) is retired — its second day is now the
 * `secondday` extra — but stays in TIER_IDS so older inquiries, bookings and
 * agreements still read and re-price exactly as they were made. New requests
 * are refused for a retired package on the server (isBookableTier).
 */
export const PUBLIC_TIER_IDS = ["study", "cinema", "trio", "production"] as const satisfies readonly TierId[];
export type PublicTierId = (typeof PUBLIC_TIER_IDS)[number];
export const isBookableTier = (id: TierId): id is PublicTierId => (PUBLIC_TIER_IDS as readonly TierId[]).includes(id);

/** English names for Stripe line items, receipts and operator email. */
export const TIER_NAME_EN: Record<TierId, string> = {
  study: "Portrait Session",
  cinema: "The Duo",
  trio: "The Trio",
  production: "Full Celebration",
  archive: "Two-Day Celebration (retired)",
};

export const ADD_ON_NAME_EN: Record<AddOnId, string> = {
  destination: "Dress Session",
  sameday: "Same-Day Edit (ready in 24 hours)",
  super8: "Vintage Film Clip (Super 8)",
  parents: "Albums for Mom & Dad",
  secondday: "Second Portrait Day",
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
 * The Oct 2026 lineup: Portrait Session, The Duo (1 photographer + 1
 * videographer), The Trio (2 + 1, the most-chosen offer) and the Full
 * Celebration (team of 4 + coordinator); each event package adds one hour.
 *
 * These constants are NOT read anywhere else. The live prices are the
 * runtime price book (src/lib/pricing.ts → R2 config/pricing.json, edited at
 * /admin/prices); these are only what it falls back to when nothing has been
 * saved yet or storage is unreachable (local dev, `next build`).
 */
const DEFAULT_TIER_PRICE_USD: Record<TierId, number> = {
  study: 400,
  cinema: 1500,
  trio: 2000,
  production: 2800,
  archive: 3500,
};
const DEFAULT_ADD_ON_PRICE_USD: Record<AddOnId, number> = {
  destination: 400,
  sameday: 300,
  super8: 600,
  parents: 550,
  secondday: 600,
};
/** Hours of coverage included in the package price. */
const DEFAULT_BASE_HOURS: Record<TierId, number> = {
  study: 1,
  cinema: 5,
  trio: 6,
  production: 7,
  archive: 7,
};
/** Price of each hour added beyond the included hours (0 = hours can't be added). */
const DEFAULT_EXTRA_HOUR_USD: Record<TierId, number> = {
  study: 150,
  cinema: 300,
  trio: 350,
  production: 450,
  archive: 0,
};
/** The Trio launch offer: this many dates at the Trio price, counted down by hand in admin. */
const DEFAULT_TRIO_SPOTS_TOTAL = 5;
const DEFAULT_MAX_HOURS = 8;
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
  /** Hours on the day included in the price. */
  hours: number;
  /** Price of each added hour, whole dollars. 0 = hours can't be added. */
  extraHour: number;
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
  })),
  addOns: mapAddOns((id) => DEFAULT_ADD_ON_PRICE_USD[id]),
  maxHours: DEFAULT_MAX_HOURS,
  depositPercent: DEFAULT_DEPOSIT_PERCENT,
  balanceDueDays: DEFAULT_BALANCE_DUE_DAYS,
  holdDays: DEFAULT_HOLD_DAYS,
  updatedAt: null,
  updatedBy: null,
  trioSpotsTotal: DEFAULT_TRIO_SPOTS_TOTAL,
  trioSpotsLeft: DEFAULT_TRIO_SPOTS_TOTAL,
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
} as const;

const whole = (min: number, max: number, what: string) =>
  z
    .number({ message: `${what} must be a number.` })
    .int(`${what} must be a whole number.`)
    .min(min, `${what} must be at least ${min.toLocaleString("en-US")}.`)
    .max(max, `${what} can be at most ${max.toLocaleString("en-US")}.`);

const L = PRICE_LIMITS;
const packageSchema = (id: TierId) =>
  z.object({
    price: whole(L.packagePrice.min, L.packagePrice.max, `${TIER_NAME_EN[id]} price`),
    hours: whole(L.hours.min, L.hours.max, `${TIER_NAME_EN[id]} hours`),
    extraHour: whole(L.extraHour.min, L.extraHour.max, `${TIER_NAME_EN[id]} extra-hour price`),
  });

/** Strict validation of a whole price book (what the admin form submits). */
export const priceBookSchema = z
  .object({
    packages: z.object(mapTiers(packageSchema)).strict(),
    addOns: z
      .object(mapAddOns((id) => whole(L.addOnPrice.min, L.addOnPrice.max, `${ADD_ON_NAME_EN[id]} price`)))
      .strict(),
    maxHours: whole(L.hours.min, L.hours.max, "Longest day"),
    depositPercent: whole(L.depositPercent.min, L.depositPercent.max, "Deposit %"),
    balanceDueDays: whole(L.balanceDueDays.min, L.balanceDueDays.max, "Days before the event"),
    holdDays: whole(L.holdDays.min, L.holdDays.max, "Hold days"),
    updatedAt: z.string().max(40).nullable().default(null),
    updatedBy: z.string().max(200).nullable().default(null),
    trioSpotsTotal: whole(L.trioSpots.min, L.trioSpots.max, "Trio offer dates"),
    trioSpotsLeft: whole(L.trioSpots.min, L.trioSpots.max, "Trio offer dates left"),
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
  return p.extraHour > 0 ? Math.max(p.hours, book.maxHours) : p.hours;
}

/** Can a family add hours to this package at all? */
export const canAddHours = (book: PriceBook, tier: TierId) => maxHoursFor(book, tier) > book.packages[tier].hours;

/** Fit any requested hours to the package: whole hours, included..max. */
export function normalizeHours(book: PriceBook, tier: TierId, hours?: number | null): number {
  const base = book.packages[tier].hours;
  const want = Number.isFinite(hours) ? Math.round(hours!) : base;
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
  cinema: false,
  trio: false,
  production: true,
  archive: true,
};

/** The Portrait Study is stills only; every event commission keeps at least one of each. */
const MIN_ROLE: Record<TierId, Crew> = {
  study: { photo: 1, motion: 0 },
  cinema: { photo: 1, motion: 1 },
  trio: { photo: 1, motion: 1 },
  production: { photo: 1, motion: 1 },
  archive: { photo: 1, motion: 1 },
};

const DEFAULT_MIX: Record<TierId, Crew> = {
  study: { photo: 1, motion: 0 },
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
  const extraHoursUsd = (hours - pkg.hours) * pkg.extraHour;
  const unique = Array.from(new Set(addOns));
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
  }
  for (const id of ADD_ON_IDS) money(ADD_ON_NAME_EN[id], before.addOns[id], after.addOns[id]);
  num("Longest day", before.maxHours, after.maxHours, "hours");
  if (before.depositPercent !== after.depositPercent) out.push(`Deposit: ${before.depositPercent}% → ${after.depositPercent}%`);
  num("Rest due before the event", before.balanceDueDays, after.balanceDueDays, "days");
  num("Date hold while reviewing", before.holdDays, after.holdDays, "days");
  num("Trio offer dates", before.trioSpotsTotal, after.trioSpotsTotal, "dates");
  num("Trio offer dates left", before.trioSpotsLeft, after.trioSpotsLeft, "dates");
  return out;
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
  hours: z.number().int().min(PRICE_LIMITS.hours.min).max(PRICE_LIMITS.hours.max).optional(),
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

function crewLine(tier: TierId, mix: Crew): string {
  const n = (k: number, one: string) => `${k} ${one}${k === 1 ? "" : "s"}`;
  return `Team (included, ${BASE_CREW[tier]}): ${n(mix.photo, "photographer")} + ${n(mix.motion, "videographer")}`;
}

/** Human-readable summary stored on the booking and shown to the operator. */
export function describeCommission(r: CommissionRequest, q: Quote, book: PriceBook): string {
  const lines = [
    `Package: ${TIER_NAME_EN[r.tier]} — ${usd(q.tierUsd)} (${q.baseHours} hrs included)`,
    q.extraHoursUsd ? `+ ${q.hours - q.baseHours} extra hr(s) — ${usd(q.extraHoursUsd)}` : "",
    `Hours on the day: ${q.hours}`,
    ...Array.from(new Set(r.add_ons)).map((a) => `+ ${ADD_ON_NAME_EN[a]} — ${usd(book.addOns[a])}`),
    crewLine(r.tier, normalizeCrew(r.tier, r.crew_mix)),
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
