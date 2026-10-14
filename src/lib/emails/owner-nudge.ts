/** → owner, from the daily run: things waiting on you (or on a family). */
import { money, ownerEmail, prettyDate, type Built } from "./layout";

export type NudgeItem = { name: string; ref: string; eventDate: string; adminUrl: string; totalCents?: number | null };

export function ownerNudgeEmail(c: {
  unapproved: NudgeItem[];
  unpaid: NudgeItem[];
  expired: NudgeItem[];
  adminUrl: string;
}): Built {
  const line = (i: NudgeItem) =>
    `• ${i.name} — ${prettyDate(i.eventDate, "en")} (${i.ref})${i.totalCents ? ` · ${money(i.totalCents)}` : ""}\n  ${i.adminUrl}`;
  const blocks = [
    c.unapproved.length ? `Waiting on YOUR approval for over a day:\n${c.unapproved.map(line).join("\n")}` : "",
    c.unpaid.length ? `Approved, but the family hasn't signed and paid yet:\n${c.unpaid.map(line).join("\n")}` : "",
    c.expired.length ? `Holds that lapsed today (dates are free again):\n${c.expired.map(line).join("\n")}` : "",
  ].filter(Boolean);
  const n = c.unapproved.length + c.unpaid.length + c.expired.length;
  return ownerEmail({
    subject: `Bookings: ${n} ${n === 1 ? "thing needs" : "things need"} a look`,
    title: "Today's booking check",
    paragraphs: ["Here's what's waiting. Nothing was approved, charged or refunded automatically."],
    preformatted: blocks.join("\n\n"),
    adminUrl: c.adminUrl,
    ctaLabel: "Open bookings",
  });
}
