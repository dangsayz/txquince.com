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
 * Whole US dollars. Positioned for the top of the Dallas–Fort Worth market
 * (research Oct 2026, docs/dfw-pricing-search-booking.md):
 *  - The highest published DFW quince package sits near $6K; luxury Dallas
 *    wedding photo + film averages ~$10K and runs to ~$25K. II enters the
 *    premium band just above every published quince competitor, III is the
 *    intended sale, IV anchors the ultra-premium ceiling.
 *  - At an 8–15% photo/film share, a $75–150K hotel celebration (Rosewood,
 *    The Adolphus, the Ritz-Carlton) budgets roughly $6K–22K for this line.
 */
export const TIER_PRICE_USD: Record<TierId, number> = {
  study: 2500,
  cinema: 7500,
  production: 11500,
  archive: 18500,
};

export const ADD_ON_PRICE_USD: Record<AddOnId, number> = {
  destination: 2000,
  sameday: 2400,
  super8: 1800,
  parents: 1100,
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
  floorUsd: 750,
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
  totalUsd: number;
  retainerUsd: number;
  balanceUsd: number;
};

export function quoteCommission(tier: TierId, addOns: readonly AddOnId[]): Quote {
  const tierUsd = TIER_PRICE_USD[tier];
  const unique = Array.from(new Set(addOns));
  const addOnsUsd = unique.reduce((sum, a) => sum + ADD_ON_PRICE_USD[a], 0);
  const totalUsd = tierUsd + addOnsUsd;
  const raw = Math.max(totalUsd * RETAINER.rate, RETAINER.floorUsd);
  const retainerUsd = Math.min(
    totalUsd,
    Math.round(raw / RETAINER.roundToUsd) * RETAINER.roundToUsd,
  );
  return { tierUsd, addOnsUsd, totalUsd, retainerUsd, balanceUsd: totalUsd - retainerUsd };
}

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

/** Human-readable summary stored on the booking and shown to the operator. */
export function describeCommission(r: CommissionRequest, q: Quote): string {
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
  const lines = [
    `Commission: ${TIER_NAME_EN[r.tier]} — ${usd(q.tierUsd)}`,
    ...r.add_ons.map((a) => `+ ${ADD_ON_NAME_EN[a]} — ${usd(ADD_ON_PRICE_USD[a])}`),
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
