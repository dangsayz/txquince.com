/**
 * POST /api/account/book — a signed-in family books from their dashboard:
 * package + date + details + SIGNED agreement, in one request.
 *
 * It creates a 'requested' booking (metadata.flow "agreement") that holds the
 * date for the price book's holdDays while the owner reviews it. Nothing is
 * charged. The owner approves in the Studio, then the family pays the deposit
 * from their dashboard (/api/booking/pay).
 *
 * Trust nothing from the browser:
 *   - WHO: the Clerk session. The booking's email is the account's verified
 *     email, whatever the body says, so it shows on their dashboard and
 *     nobody can file a booking under someone else's address.
 *   - PRICE and AGREEMENT TEXT: rebuilt here from the live price book. If the
 *     family was shown other numbers (prices changed while the tab was open)
 *     the request is refused with `prices_changed`.
 *   - DATE: the database capacity trigger refuses a full date (23505).
 * Plus: same-origin, rate limits (IP + account), Turnstile, honeypot, zod.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  CITY_NAME,
  TIER_SERVICE,
  commissionSchema,
  describeCommission,
  COORDINATOR_INCLUDED,
  isBookableTier,
  normalizeCrew,
  quoteCommission,
} from "@/lib/commission";
import { buildAgreement, type SignedAgreement } from "@/lib/agreement";
import { HONEYPOT_FIELD, TURNSTILE_FIELD } from "@/lib/booking";
import { sanitizeAttribution } from "@/lib/attribution";
import { getDb, isDbConfigured, releaseExpiredHolds } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendAgreementSignedClient, sendAgreementSignedOperator } from "@/lib/agreement-email";
import { getSignedInUser } from "@/lib/clerk-user";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";
import { getPriceBook } from "@/lib/pricing";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateLimited = rateLimiter("commission");
const fail = (status: number, code: string, error: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, code, error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return fail(403, "forbidden", "Not allowed.");
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "invalid", "Invalid request.");
  }
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") return fail(400, "invalid", "Invalid request.");

  const ip = clientIp(req);
  if (await rateLimited(ip)) return fail(429, "rate_limited", "Too many requests. Please try again in a minute.");
  const user = await getSignedInUser();
  const email = user?.verifiedEmails[0];
  if (!user || !email) return fail(401, "signed_out", "Please log in again.");
  if (await rateLimited(`user:${user.id}`)) return fail(429, "rate_limited", "Too many requests. Please try again in a minute.");

  const token = typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined;
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) return fail(403, "verification", "Verification failed. Please refresh and try again.");

  // The account's verified email, never the one in the body.
  const parsed = commissionSchema.safeParse({ ...body, email });
  if (!parsed.success) {
    return fail(422, "invalid", "Please check the highlighted fields.", { fieldErrors: parsed.error.flatten().fieldErrors });
  }
  const r = parsed.data;
  if (!isBookableTier(r.tier)) return fail(422, "invalid", "That package is no longer offered.");
  if (!r.signed_name || !r.signature || !r.agree) {
    return fail(422, "unsigned", "Please sign the agreement and check the box to agree.");
  }

  const book = await getPriceBook();
  const q = quoteCommission(book, r.tier, r.add_ons, r.hours);
  if (r.quoted_total_usd !== q.totalUsd || r.quoted_deposit_usd !== q.retainerUsd) {
    return fail(409, "prices_changed", "Our prices were just updated. Please check your new total, then sign again.", { book });
  }
  if (!isDbConfigured()) return fail(503, "unavailable", "Booking is briefly unavailable. Please text or call us.");

  const crew = normalizeCrew(r.tier, r.crew_mix);
  const service = r.scope === "motion" ? "video" : r.scope === "stills" ? "photo" : TIER_SERVICE[r.tier];
  const summary = describeCommission(r, q, book);
  const agreement = buildAgreement(
    {
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
      email,
      phone: r.phone,
      sharePermission: r.share_permission,
    },
    book,
  );
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
    via: "account",
    clerk_user: user.id,
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
    share_permission: r.share_permission,
    note: r.note,
    agreement: signed,
  };

  const db = getDb();
  // A hold that ran out must not keep this date (or this family) blocked.
  await releaseExpiredHolds();
  // Re-signing for the same date (she changed her package) replaces her own
  // unconfirmed request. Approved or paid bookings are never touched.
  await db.from("bookings").update({ status: "expired" }).eq("event_date", r.event_date).eq("email", email).in("status", ["requested"]);

  const expiresAt = new Date(Date.now() + book.holdDays * 24 * 3600 * 1000).toISOString();
  const { data: inserted, error } = await db
    .from("bookings")
    .insert({
      name: r.name,
      email,
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
    if (error?.code === "23505") return fail(409, "date_taken", "That date just filled up. Please pick another date.");
    console.error("[account/book] insert:", error?.message);
    return fail(500, "save_failed", "We couldn't save your booking. Please try again.");
  }

  const adminUrl = `${getSiteUrl()}/admin/bookings#${inserted.id}`;
  const [op, cl] = await Promise.all([
    sendAgreementSignedOperator(inserted, signed, adminUrl, summary),
    sendAgreementSignedClient(inserted, signed),
  ]);
  if (!op.ok) console.error("[account/book] operator email:", op.error);
  if (!cl.ok) console.error("[account/book] client email:", cl.error);

  return NextResponse.json({ ok: true, id: inserted.id, holdDays: book.holdDays }, { headers: { "Cache-Control": "no-store" } });
}
