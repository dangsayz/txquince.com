/** → owner: money arrived, or money arrived that needs a decision. */
import { money, ownerEmail, prettyDate, type Built } from "./layout";
import type { OwnerCtx } from "./context";

export function ownerPaymentEmail(
  c: OwnerCtx & { amountCents: number; kind: string; status: string; review?: string },
): Built {
  const date = prettyDate(c.eventDate, "en");
  return ownerEmail({
    subject: c.review
      ? `ACTION NEEDED — payment to review, ${c.name} (${c.ref})`
      : `Payment — ${money(c.amountCents)} from ${c.name}, ${date}`,
    title: c.review ? "A payment needs your eyes" : "Payment received",
    paragraphs: c.review
      ? [
          `${money(c.amountCents)} (${c.kind}) arrived for ${c.name}'s booking on ${date}, but: ${c.review}`,
          "Nothing was refunded automatically. Open the booking to decide — refund, or confirm it.",
        ]
      : [`${c.name} paid ${money(c.amountCents)} (${c.kind}) for ${date}. Booking is now: ${c.status}.`],
    adminUrl: c.adminUrl,
  });
}
