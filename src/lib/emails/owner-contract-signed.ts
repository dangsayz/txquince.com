/** → owner: a family signed (PDF attached, with the audit line). */
import { ownerEmail, prettyDate, type Built } from "./layout";
import type { OwnerCtx } from "./context";

export function ownerContractSignedEmail(c: OwnerCtx & { signedName: string; ip: string; sha256: string; depositPaid: boolean }): Built {
  const date = prettyDate(c.eventDate, "en");
  return ownerEmail({
    subject: `Signed — ${c.name}, ${date} (${c.ref})`,
    title: "Agreement signed",
    paragraphs: [
      `${c.signedName} signed the agreement for ${date}. The signed PDF is attached and saved on the booking.`,
      c.depositPaid ? "Their deposit is already paid, so the booking is now confirmed." : "Their deposit isn't paid yet.",
    ],
    preformatted: `IP ${c.ip}\nsha256 ${c.sha256}`,
    adminUrl: c.adminUrl,
  });
}
