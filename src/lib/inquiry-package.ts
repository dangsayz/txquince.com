/**
 * inquiry-package.ts — the homepage package picker sends an INQUIRY, not a
 * booking. The family's picks (package, hours, extras, team, place, time) ride
 * along as `package`; the server re-validates them, re-prices them with its own
 * price book and writes the summary into the inquiry's message, so the owner
 * sees server-priced numbers, never a client-claimed total. Nothing is held,
 * signed or charged; the owner follows up and handles payment.
 */
import { z } from "zod";
import { addOnAllowed, commissionSchema, usd, describeCommission, isBookableTier, quoteCommission, type PriceBook, type TierId } from "@/lib/commission";

export const inquiryPackageSchema = commissionSchema
  .pick({
    city: true,
    venue: true,
    start_time: true,
    scope: true,
    tier: true,
    add_ons: true,
    crew_mix: true,
    hours: true,
    honoree: true,
    language: true,
    share_permission: true,
  })
  .extend({
    /**
     * From the budget page: the price the family offers for this coverage.
     * Never charged or accepted automatically: it goes to the owner as a
     * request to accept, counter or decline, next to the server's own price.
     */
    offer_usd: z.number().int().min(50).max(50_000).optional(),
  })
  .strict()
  // A retired package (the Two-Day Celebration) can't be requested any more,
  // whatever an old tab or a hand-built request sends.
  .refine((p) => isBookableTier(p.tier), { path: ["tier"], message: "That package is no longer offered." })
  // An extra this package doesn't offer (e.g. the Highlight Film on the Full
  // Celebration, which already includes one) is refused, not silently priced.
  .refine((p) => p.add_ons.every((a) => addOnAllowed(p.tier, a)), { path: ["add_ons"], message: "That extra isn't offered with this package." });

export type InquiryPackage = z.infer<typeof inquiryPackageSchema>;

/** Package → the inquiry's budget key (lib/inquiry BUDGET_OPTIONS). */
export const BUDGET_FOR_TIER: Record<TierId, "portrait" | "moments" | "solo" | "photo_video" | "trio"> = {
  study: "portrait",
  moments: "moments",
  solo: "solo",
  cinema: "photo_video",
  trio: "trio",
  // Retired; never sent by the picker any more (the server refuses them).
  production: "trio",
  archive: "trio",
};

/** Package → the inquiry's services value: the Portrait Session is photos only. */
export const servicesForTier = (tier: TierId, addOns: readonly string[] = []): "photo" | "both" =>
  tier === "study" || (tier === "moments" && !addOns.includes("momentsfilm")) ? "photo" : "both";

/** The owner-facing summary, priced with the server's book, plus the family's own note. */
export function describeInquiryPackage(
  p: InquiryPackage,
  ctx: { name: string; email: string; phone: string; eventDate: string; note: string },
  book: PriceBook,
): string {
  const q = quoteCommission(book, p.tier, p.add_ons, p.hours);
  const summary = describeCommission(
    {
      ...p,
      event_date: ctx.eventDate,
      name: ctx.name,
      email: ctx.email,
      phone: ctx.phone,
      note: ctx.note,
    } as Parameters<typeof describeCommission>[0],
    q,
    book,
  );
  return [
    p.offer_usd !== undefined
      ? `OFFER from the budget page: ${usd(p.offer_usd)} for this coverage (our price: ${usd(q.totalUsd)}). Reply to accept, counter or decline. Nothing was booked or charged.`
      : "Sent from the package picker. Nothing was booked or charged.",
    summary.replace("Request — not signed yet\n", ""),
    p.share_permission ? "OK to share some photos publicly: yes" : "OK to share some photos publicly: no",
  ].join("\n");
}
