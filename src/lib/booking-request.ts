/**
 * booking-request.ts — what a family sends when they REQUEST a date.
 *
 * The homepage intake (/api/commission) no longer takes a signature: the
 * family signs later, on their own booking page, after the owner approves.
 * This schema is commissionSchema minus the signing fields. Unknown fields
 * (an older intake still sending signed_name / signature / agree, Turnstile,
 * attribution) are accepted and ignored — zod strips them.
 *
 * snapshotFromBook() freezes the money at request time. Every later step
 * (agreement, deposit checkout, balance, reminders, refunds) reads the
 * booking's own snapshot, never the live price book.
 */
import { z } from "zod";
import {
  CITY_NAME,
  TIER_SERVICE,
  commissionSchema,
  normalizeCrew,
  quoteCommission,
  type PriceBook,
  type Quote,
} from "@/lib/commission";
import { balanceDueDate, MIN_LEAD_DAYS } from "@/lib/journey/policy";
import type { BookingRequestDetails } from "@/lib/journey/types";

export { MIN_LEAD_DAYS };

export const bookingRequestSchema = commissionSchema.omit({
  signed_name: true,
  signature: true,
  agree: true,
});
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export type MoneySnapshot = {
  totalCents: number;
  depositCents: number;
  balanceCents: number;
  depositPercent: number;
  balanceDueDays: number;
  balanceDueDate: string;
  /** The whole book as it was, so the agreement can be rebuilt line for line. */
  book: PriceBook;
  quote: Quote;
};

export function snapshotFromBook(r: BookingRequestInput, book: PriceBook): MoneySnapshot {
  const q = quoteCommission(book, r.tier, r.add_ons, r.hours);
  return {
    totalCents: q.totalUsd * 100,
    depositCents: q.retainerUsd * 100,
    balanceCents: q.balanceUsd * 100,
    depositPercent: q.depositPercent,
    balanceDueDays: book.balanceDueDays,
    balanceDueDate: balanceDueDate(r.event_date, book.balanceDueDays),
    // A plain copy: the live book is frozen and may carry getters later.
    book: JSON.parse(JSON.stringify(book)) as PriceBook,
    quote: q,
  };
}

export function requestDetails(r: BookingRequestInput, q: Quote): BookingRequestDetails {
  return {
    tier: r.tier,
    addOns: Array.from(new Set(r.add_ons)),
    hours: q.hours,
    crew: normalizeCrew(r.tier, r.crew_mix),
    city: r.city,
    cityLabel: CITY_NAME[r.city],
    venue: r.venue,
    startTime: r.start_time,
    honoree: r.honoree,
    scope: r.scope,
    note: r.note,
    sharePermission: r.share_permission,
  };
}

/** photo | video | both — the legacy `package` column. */
export function serviceFor(r: Pick<BookingRequestInput, "scope" | "tier">): "photo" | "video" | "both" {
  return r.scope === "motion" ? "video" : r.scope === "stills" ? "photo" : TIER_SERVICE[r.tier];
}
