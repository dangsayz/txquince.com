/**
 * inquiry-package.ts — the homepage package picker sends an INQUIRY, not a
 * booking. The family's picks (package, hours, extras, team, place, time) ride
 * along as `package`; the server re-validates them, re-prices them with its own
 * price book and writes the summary into the inquiry's message, so the owner
 * sees server-priced numbers, never a client-claimed total. Nothing is held,
 * signed or charged; the owner follows up and handles payment.
 */
import { z } from "zod";
import { commissionSchema, describeCommission, quoteCommission, type PriceBook, type TierId } from "@/lib/commission";

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
  .strict();

export type InquiryPackage = z.infer<typeof inquiryPackageSchema>;

/** Package → the inquiry's budget key (lib/inquiry BUDGET_OPTIONS). */
export const BUDGET_FOR_TIER: Record<TierId, "portrait" | "photo_video" | "full" | "two_day"> = {
  study: "portrait",
  cinema: "photo_video",
  production: "full",
  archive: "two_day",
};

/** Package → the inquiry's services value: the Portrait Session is photos only. */
export const servicesForTier = (tier: TierId): "photo" | "both" => (tier === "study" ? "photo" : "both");

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
    "Sent from the package picker. Nothing was booked or charged.",
    summary.replace("Request — not signed yet\n", ""),
    p.share_permission ? "OK to share some photos publicly: yes" : "OK to share some photos publicly: no",
  ].join("\n");
}
