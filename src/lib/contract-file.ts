/**
 * contract-file.ts — the signed contract PDF for one booking (email attachment
 * and the family's download). Built from the STORED signed agreement, never a
 * rebuilt one. Returns null instead of throwing: a PDF problem must never
 * block a booking or an email.
 */
import "server-only";
import { isSignedAgreement } from "@/lib/agreement";
import { renderSignedContractPdf, type ContractAuditEvent } from "@/lib/contract-pdf";

export const bookingRef = (id: string) => `TXQ-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

export async function signedContractPdf(booking: { id: string; paid_at?: string | null; metadata?: unknown }): Promise<{ filename: string; content: Uint8Array } | null> {
  const meta = (booking.metadata ?? {}) as Record<string, unknown>;
  const a = meta.agreement;
  if (!isSignedAgreement(a)) return null;
  const audit: ContractAuditEvent[] = [
    { at: a.signedAt, event: "signed", actor: "client", ip: a.ip, userAgent: a.userAgent },
    ...(a.approvedAt ? [{ at: a.approvedAt, event: "approved", actor: "admin" as const }] : []),
    ...(booking.paid_at ? [{ at: String(booking.paid_at), event: "deposit_paid", actor: "client" as const }] : []),
  ];
  try {
    const { pdf, filename } = await renderSignedContractPdf({ ref: bookingRef(booking.id), agreement: a, audit, generatedAt: new Date().toISOString() });
    return { filename, content: pdf };
  } catch (err) {
    console.error("[contract-file] render:", err);
    return null;
  }
}
