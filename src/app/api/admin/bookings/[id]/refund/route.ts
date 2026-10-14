/**
 * POST /api/admin/bookings/{id}/refund — { paymentId, amountCents, requestId, note? }
 * The ONLY place money leaves: the owner typed an amount and confirmed.
 * Admin-only, capped server-side at what is still refundable on that charge,
 * Stripe Idempotency-Key per confirm dialog.
 */
import { journeyDeps } from "@/lib/journey/deps";
import { refundPayment } from "@/lib/journey/admin";
import { fail } from "@/lib/journey/core";
import { failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const r = await refundPayment(journeyDeps(), id, (await readJson(req)) ?? {});
    return r.ok ? okResponse(r) : failResponse(r);
  } catch (err) {
    console.error("[admin/refund]", err);
    return failResponse(fail(502, "stripe_error", err instanceof Error ? err.message : "Stripe refused the refund."));
  }
}
