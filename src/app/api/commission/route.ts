/**
 * /api/commission — the homepage intake's booking endpoint.
 *
 * Sign → approve → pay (src/lib/agreement.ts):
 *   The family picks a package, fills in their details and signs the booking
 *   agreement. We save the signed agreement on a 'requested' booking that
 *   holds the date for the price book's holdDays while the studio reviews it,
 *   and email both sides. Approving in /admin/bookings emails the family a pay
 *   link for the deposit (/booking/[id]); the Stripe webhook makes it final.
 *
 * Same defenses as before: honeypot, rate limit, Turnstile, zod. The price and
 * the agreement text are ALWAYS rebuilt server-side from the server's own live
 * price book (getPriceBook) — the client only says what it picked. If the
 * family's tab was priced from an older book (prices changed while it was
 * open), the request is refused with `prices_changed` and the current book, so
 * nobody signs a number they weren't shown. The partial unique index on
 * bookings.event_date makes double-booking impossible under concurrency.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  CITY_NAME,
  TIER_SERVICE,
  commissionSchema,
  describeCommission,
  COORDINATOR_INCLUDED,
  normalizeCrew,
  quoteCommission,
} from "@/lib/commission";
import { buildAgreement, type SignedAgreement } from "@/lib/agreement";
import { HONEYPOT_FIELD, TURNSTILE_FIELD } from "@/lib/booking";
import { sanitizeAttribution } from "@/lib/attribution";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendAgreementSignedClient, sendAgreementSignedOperator } from "@/lib/agreement-email";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";
import { getPriceBook } from "@/lib/pricing";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Durable per-IP limit (Workers Rate Limiting binding; in-memory in dev).
const rateLimited = rateLimiter("commission");

const fail = (status: number, code: string, error: string) =>
  NextResponse.json({ ok: false, code, error }, { status });

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "invalid", "Invalid request.");
  }

  // Honeypot — pretend success, don't tip off bots.
  const book = await getPriceBook();
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true, holdDays: book.holdDays, ref: "TXQ-000000" });
  }

  const ip = clientIp(req);
  if (await rateLimited(ip)) return fail(429, "rate_limited", "Too many requests. Please try again in a minute.");

  const token = typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined;
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) return fail(403, "verification", "Verification failed. Please refresh and try again.");

  const parsed = commissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid",
        error: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }
  const r = parsed.data;

  const q = quoteCommission(book, r.tier, r.add_ons, r.hours);
  // The family must have been shown THIS price. A tab opened before a price
  // change would otherwise sign one number and be stored at another.
  if (
    (r.quoted_total_usd !== undefined && r.quoted_total_usd !== q.totalUsd) ||
    (r.quoted_deposit_usd !== undefined && r.quoted_deposit_usd !== q.retainerUsd)
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "prices_changed",
        error: "Our prices were just updated. Please review your new total and sign again.",
        book,
      },
      { status: 409 },
    );
  }
  if (!isSupabaseConfigured()) {
    console.error("[commission] Supabase not configured.");
    return fail(503, "unavailable", "Booking is briefly unavailable. Please write to us directly.");
  }
  const crew = normalizeCrew(r.tier, r.crew_mix);
  const service = r.scope === "motion" ? "video" : r.scope === "stills" ? "photo" : TIER_SERVICE[r.tier];
  const summary = describeCommission(r, q, book);

  // The agreement is rebuilt here from the re-priced quote — the client's copy
  // is only for review. What we store is exactly what the family saw and signed.
  const agreement = buildAgreement({
    lang: r.language,
    tier: r.tier,
    hours: q.hours,
    crew,
    addOns: r.add_ons,
    eventDate: r.event_date,
    cityLabel: CITY_NAME[r.city],
    venue: r.venue,
    startTime: r.start_time,
    honoree: r.honoree,
    name: r.name,
    email: r.email,
    phone: r.phone,
    sharePermission: r.share_permission,
  }, book);
  const signed: SignedAgreement = {
    ...agreement,
    signedName: r.signed_name,
    signature: r.signature,
    signedAt: new Date().toISOString(),
    ip,
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300),
    sharePermission: r.share_permission,
  };

  const meta = {
    source: "commission",
    flow: "agreement",
    tier: r.tier,
    add_ons: r.add_ons,
    crew_mix: crew,
    crew_size: q.crewSize,
    hours: q.hours,
    coordinator_included: COORDINATOR_INCLUDED[r.tier],
    total_usd: q.totalUsd,
    retainer_usd: q.retainerUsd,
    deposit_percent: q.depositPercent,
    balance_due_days: book.balanceDueDays,
    city: r.city,
    venue: r.venue,
    start_time: r.start_time,
    scope: r.scope,
    honoree: r.honoree,
    language: r.language,
    agreement: signed,
  };
  const supabase = getServiceSupabase();

  // A family re-signing (changed their package) shouldn't be blocked by their
  // own unconfirmed hold on the same date. Paid bookings are never touched.
  await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("event_date", r.event_date)
    .eq("email", r.email)
    .in("status", ["pending_payment", "requested"]);

  const expiresAt = new Date(Date.now() + book.holdDays * 24 * 3600 * 1000).toISOString();
  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      name: r.name,
      email: r.email,
      phone: r.phone || null,
      event_date: r.event_date,
      package: service,
      notes: summary,
      status: "requested",
      deposit_amount_cents: q.retainerUsd * 100,
      currency: site.booking.currency,
      expires_at: expiresAt,
      metadata: meta,
      attribution: sanitizeAttribution(body.attribution),
    })
    .select("id, name, email, event_date")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") return fail(409, "date_taken", "That date was just reserved by another family.");
    console.error("[commission] insert:", error?.message);
    return fail(500, "save_failed", "We couldn't save your agreement. Please try again.");
  }

  const adminUrl = `${getSiteUrl()}/admin/bookings#${inserted.id}`;
  const [op, cl] = await Promise.all([
    sendAgreementSignedOperator(inserted, signed, adminUrl, summary),
    sendAgreementSignedClient(inserted, signed),
  ]);
  if (!op.ok) console.error("[commission] operator email:", op.error);
  if (!cl.ok) console.error("[commission] client email:", cl.error);

  return NextResponse.json({ ok: true, holdDays: book.holdDays, ref: refFor(inserted.id) });
}

/** Short, non-guessable-enough display reference derived from the booking id. */
function refFor(id: string) {
  return `TXQ-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
