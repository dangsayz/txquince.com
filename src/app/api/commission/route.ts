/**
 * /api/commission — the homepage intake's REQUEST endpoint (step 1 of the
 * client journey, docs/CLIENT-JOURNEY.md).
 *
 * The family picks a package, hours, extras and a date and sends a request.
 * No signature here any more: they sign on their private page after the owner
 * approves. Signing fields from an older intake are accepted and ignored.
 *
 * Defenses: honeypot, durable per-IP rate limit, Turnstile (required), zod, a
 * MIN_LEAD_DAYS lead time, one active request per email per date (an existing
 * hold is never replaced), a cap on open requests per email, the partial unique
 * index on the date, and the owner is emailed about every request (audit M1).
 * Prices are re-quoted with the server's own book; a stale tab gets 409
 * `prices_changed` with the current book.
 */
import { NextResponse, type NextRequest } from "next/server";
import { HONEYPOT_FIELD, TURNSTILE_FIELD } from "@/lib/booking";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { journeyDeps } from "@/lib/journey/deps";
import { createRequest } from "@/lib/journey/request";
import { failResponse, readJson, userAgent } from "@/lib/journey/http";
import { fail } from "@/lib/journey/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Durable per-IP limit (Workers Rate Limiting binding; in-memory in dev).
const rateLimited = rateLimiter("commission");

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return failResponse(fail(400, "invalid", "Invalid request."));
  const deps = journeyDeps();

  // Honeypot — pretend success, don't tip off bots.
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    const book = await deps.priceBook();
    return NextResponse.json({ ok: true, holdDays: book.holdDays, ref: "TXQ-000000" });
  }

  const ip = clientIp(req);
  if (await rateLimited(ip)) {
    return failResponse(fail(429, "rate_limited", "Too many requests. Please try again in a minute."));
  }
  const token = typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined;
  if (!(await deps.turnstile(token, ip)).ok) {
    return failResponse(fail(403, "verification", "Verification failed. Please refresh and try again."));
  }
  if (!isSupabaseConfigured()) {
    console.error("[commission] Supabase not configured.");
    return failResponse(fail(503, "unavailable", "Booking is briefly unavailable. Please write to us directly."));
  }

  const r = await createRequest(deps, body, { ip, userAgent: userAgent(req) });
  if (!r.ok) return failResponse(r);
  return NextResponse.json({ ok: true, holdDays: r.holdDays, ref: r.ref, link: r.link }, { headers: { "Cache-Control": "no-store" } });
}
