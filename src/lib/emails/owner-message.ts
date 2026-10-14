/** → owner: the family wrote from their page (a question or a change request). */
import { ownerEmail, prettyDate, type Built } from "./layout";
import type { OwnerCtx } from "./context";

const KIND_LABEL: Record<string, string> = {
  message: "Message",
  change_date: "Date change request",
  change_time: "Time change request",
  change_package: "Package change request",
  cancel: "Cancellation request",
};

export function ownerMessageEmail(c: OwnerCtx & { kind: string; body: string }): Built {
  const label = KIND_LABEL[c.kind] ?? "Message";
  return ownerEmail({
    subject: `${label} — ${c.name}, ${prettyDate(c.eventDate, "en")} (${c.ref})`,
    title: label,
    paragraphs: [
      `${c.name} wrote from their booking page. Nothing changes until you act on it in admin.`,
    ],
    preformatted: c.body,
    adminUrl: c.adminUrl,
    ctaLabel: "Reply in admin",
  });
}
