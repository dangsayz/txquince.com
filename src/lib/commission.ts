/**
 * commission.ts — the commission price book + booking contract (client + server).
 *
 * SINGLE SOURCE OF TRUTH for what a commission costs. The homepage matrix, the
 * live estimate, the intake summary, structured data and /api/commission all
 * read these tables, and the server ALWAYS re-prices from here — a tampered
 * request body can never change what Stripe charges.
 *
 * Operator-editable: change a number below and every surface updates.
 */
import { z } from "zod";

export const TIER_IDS = ["study", "cinema", "production", "archive"] as const;
export const ADD_ON_IDS = ["destination", "sameday", "super8", "parents"] as const;
export type TierId = (typeof TIER_IDS)[number];
export type AddOnId = (typeof ADD_ON_IDS)[number];

/**
 * Whole US dollars. Priced for what DFW quinceañera families actually spend
 * (research Oct 2026, docs/dfw-pricing-search-booking.md):
 *  - Most DFW quince budgets are $12–25K all-in; photo + film takes 8–15%.
 *  - Published DFW quince packages: photo-only $1.5–3K, photo + video
 *    $3–5.5K, luxury collections $5.5–8K (highest published ~$6K).
 *  - II sits in the photo + video band, III (the intended sale, with 4 crew
 *    and a coordinator included) stays under the highest published package,
 *    IV is the luxury anchor inside the market's top band.
 */
export const TIER_PRICE_USD: Record<TierId, number> = {
  study: 1200,
  cinema: 3500,
  production: 4900,
  archive: 6900,
};
export const ADD_ON_PRICE_USD: Record<AddOnId, number> = {
  destination: 650,
  sameday: 900,
  super8: 600,
  parents: 550,
};

/** English names for Stripe line items, receipts and operator email. */
export const TIER_NAME_EN: Record<TierId, string> = {
  study: "I. Portrait Study",
  cinema: "II. Cinema & Stills",
  production: "III. The Full Production",
  archive: "IV. Multi-Day Editorial Archive",
};

export const ADD_ON_NAME_EN: Record<AddOnId, string> = {
  destination: "Pre-Event Destination Portrait Session",
  sameday: "Same-Day Reception Edit",
  super8: "Super 8mm Film Roll",
  parents: "Fine Art Parent Albums",
};

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
  production: 4,
  archive: 5,
};

/** Largest crew we field on one day. */
export const MAX_CREW = Math.max(...Object.values(BASE_CREW));

/** A day-of coordinator comes with the larger productions. */
export const COORDINATOR_INCLUDED: Record<TierId, boolean> = {
  study: false,
  cinema: false,
  production: true,
  archive: true,
};

/** The Portrait Study is stills only; every event commission keeps at least one of each. */
const MIN_ROLE: Record<TierId, Crew> = {
  study: { photo: 1, motion: 0 },
  cinema: { photo: 1, motion: 1 },
  production: { photo: 1, motion: 1 },
  archive: { photo: 1, motion: 1 },
};

const DEFAULT_MIX: Record<TierId, Crew> = {
  study: { photo: 1, motion: 0 },
  cinema: { photo: 1, motion: 1 },
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
  production: "both",
  archive: "both",
};

/**
 * Retainer to hold the date: a share of the commission, with a floor so a
 * smaller commission still carries a meaningful hold, rounded to a clean
 * figure. Applied in full to the balance.
 */
export const RETAINER = {
  rate: 0.3,
  floorUsd: 350,
  roundToUsd: 50,
  /** Balance due this many days before the celebration. */
  balanceDueDays: 30,
} as const;

/** Unpaid checkout hold, and the consultation-first courtesy hold. */
export const CHECKOUT_HOLD_MINUTES = 30;
export const CONSULT_HOLD_DAYS = 7;

export type Quote = {
  tierUsd: number;
  addOnsUsd: number;
  /** Directors included on the celebration day. */
  crewSize: number;
  totalUsd: number;
  retainerUsd: number;
  balanceUsd: number;
};

export function quoteCommission(tier: TierId, addOns: readonly AddOnId[]): Quote {
  const tierUsd = TIER_PRICE_USD[tier];
  const unique = Array.from(new Set(addOns));
  const addOnsUsd = unique.reduce((sum, a) => sum + ADD_ON_PRICE_USD[a], 0);
  const crewSize = BASE_CREW[tier];
  const totalUsd = tierUsd + addOnsUsd;
  const raw = Math.max(totalUsd * RETAINER.rate, RETAINER.floorUsd);
  const retainerUsd = Math.min(
    totalUsd,
    Math.round(raw / RETAINER.roundToUsd) * RETAINER.roundToUsd,
  );
  return { tierUsd, addOnsUsd, crewSize, totalUsd, retainerUsd, balanceUsd: totalUsd - retainerUsd };
}

/** "$11,500" — use in prose so copy reads straight from the price book. */
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Lowest and highest published commission — for "from $X" copy and schema. */
export const PRICE_FLOOR_USD = Math.min(...Object.values(TIER_PRICE_USD));
export const PRICE_CEILING_USD = Math.max(...Object.values(TIER_PRICE_USD));

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
  /** "retainer" → Stripe Checkout now; "consult" → courtesy hold, pay after a call. */
  path: z.enum(["retainer", "consult"]),
  event_date: z.string().trim().refine(isBookableDate, {
    message: "Choose a future date within the next three years.",
  }),
  city: z.enum(CITY_IDS),
  venue: z.string().trim().max(160).optional().default(""),
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
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  honoree: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  phone: z.string().trim().max(40).optional().default(""),
  language: z.enum(["en", "es"]),
  note: z.string().trim().max(2000).optional().default(""),
});

export type CommissionRequest = z.infer<typeof commissionSchema>;

const CITY_NAME: Record<(typeof CITY_IDS)[number], string> = {
  dfw: "Dallas–Fort Worth",
  hou: "Houston",
  atx: "Austin",
  satx: "San Antonio",
  other: "Elsewhere in Texas",
};

function crewLine(tier: TierId, mix: Crew): string {
  const n = (k: number, one: string) => `${k} ${one}${k === 1 ? "" : "s"}`;
  return `Crew (included, ${BASE_CREW[tier]}): ${n(mix.photo, "photographer")} + ${n(mix.motion, "videographer")}`;
}

/** Human-readable summary stored on the booking and shown to the operator. */
export function describeCommission(r: CommissionRequest, q: Quote): string {
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
  const lines = [
    `Commission: ${TIER_NAME_EN[r.tier]} — ${usd(q.tierUsd)}`,
    ...r.add_ons.map((a) => `+ ${ADD_ON_NAME_EN[a]} — ${usd(ADD_ON_PRICE_USD[a])}`),
    crewLine(r.tier, normalizeCrew(r.tier, r.crew_mix)),
    COORDINATOR_INCLUDED[r.tier] ? "Day-of coordinator: included" : "",
    `Total: ${usd(q.totalUsd)} · Retainer: ${usd(q.retainerUsd)} · Balance: ${usd(q.balanceUsd)}`,
    `Path: ${r.path === "retainer" ? "Paid retainer online" : "Consultation first"}`,
    `City: ${CITY_NAME[r.city]}${r.venue ? ` · Venue: ${r.venue}` : ""}`,
    `Scope: ${r.scope}`,
    r.honoree ? `Quinceañera: ${r.honoree}` : "",
    `Preferred language: ${r.language === "es" ? "Español" : "English"}`,
    r.note ? `\nNote from family:\n${r.note}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}
