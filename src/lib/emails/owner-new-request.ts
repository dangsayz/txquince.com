/** → owner: a new request is waiting (one email per request — audit M1). */
import { money, ownerEmail, prettyDate, type Built } from "./layout";
import type { OwnerCtx } from "./context";

export function ownerNewRequestEmail(
  c: OwnerCtx & { summary: string; totalCents: number; openRequestsForEmail: number; ip: string },
): Built {
  const date = prettyDate(c.eventDate, "en");
  return ownerEmail({
    subject: `New request — ${c.name}, ${date} (${c.ref})`,
    title: "New booking request",
    paragraphs: [
      `${c.name} (${c.email}) asked for ${date}. Total ${money(c.totalCents)}. The date is held while you decide.`,
      "Approve it and they can sign and pay their deposit from their page. Decline it and the date is freed and they're told kindly.",
      ...(c.openRequestsForEmail > 1
        ? [`Heads up: this email now has ${c.openRequestsForEmail} open requests.`]
        : []),
    ],
    preformatted: `${c.summary}\n\nRequest IP: ${c.ip}`,
    adminUrl: c.adminUrl,
    ctaLabel: "Review request",
  });
}
