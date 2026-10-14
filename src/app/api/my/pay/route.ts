/**
 * POST /api/my/pay — { token, kind: "deposit" | "balance" } → a Stripe
 * Checkout URL. Only the family's own click starts a charge; the amount is
 * always the booking's snapshot/ledger, never anything in the request.
 */
import { journeyDeps } from "@/lib/journey/deps";
import { startCheckout } from "@/lib/journey/family";
import { fail } from "@/lib/journey/core";
import { clientIp, failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return failResponse(fail(400, "invalid", "Invalid request."));
  const deps = journeyDeps();
  if (await deps.rateLimit("pay", clientIp(req), 10, 60_000)) return failResponse(fail(429, "rate_limited", "Please wait a minute and try again."));
  try {
    const r = await startCheckout(deps, body);
    return r.ok ? okResponse({ url: r.url }) : failResponse(r);
  } catch (err) {
    console.error("[my/pay]", err);
    return failResponse(fail(502, "checkout_failed", "We couldn't open secure checkout. Please try again."));
  }
}
