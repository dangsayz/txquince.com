/**
 * GET /api/commission/session?id=cs_… — what the homepage shows after Stripe
 * redirects back. Read straight from Stripe so the confirmation is right even
 * before the webhook lands (the webhook stays the source of truth for the DB
 * and emails). Returns no personal data beyond what the family just entered.
 */
import { NextResponse, type NextRequest } from "next/server";
import { isStripeConfigured, retrieveStripeCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(id) || !isStripeConfigured()) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const s = await retrieveStripeCheckoutSession(id);
    if (s.metadata?.source !== "commission") return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json(
      {
        ok: true,
        paid: s.payment_status === "paid",
        // Affirm/ACH can settle after the redirect.
        processing: s.payment_status === "unpaid",
        eventDate: s.metadata?.event_date ?? null,
        tier: s.metadata?.tier ?? null,
        amountUsd: s.amount_total != null ? s.amount_total / 100 : null,
        totalUsd: s.metadata?.total_usd ? Number(s.metadata.total_usd) : null,
        ref: s.client_reference_id
          ? `TXQ-${s.client_reference_id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
          : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
