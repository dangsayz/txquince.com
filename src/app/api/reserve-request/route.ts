/**
 * /api/reserve-request — capture a date-reservation REQUEST (no payment).
 *
 * The family submits the reserve form; we save a 'requested' booking that holds
 * the date (one active booking per event_date, enforced by a partial unique
 * index), notify the operator, and acknowledge the family. The operator then
 * confirms and sends a Stripe deposit link manually — deposit is step two.
 *
 * Mirrors /api/inquiry's defenses (honeypot, rate-limit, Turnstile). Never
 * trusts the client: deposit + service are derived server-side from collection.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  bookingSchema,
  HONEYPOT_FIELD,
  TURNSTILE_FIELD,
  DEPOSIT_CURRENCY,
  serviceForCollection,
  type BookingRecord,
} from "@/lib/booking";
import { depositForCollection } from "@/content/packages";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  sendReservationRequestOperatorEmail,
  sendReservationRequestClientEmail,
} from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear();
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — silently accept.
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  const token =
    (typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined) ??
    (typeof body["turnstileToken"] === "string" ? (body["turnstileToken"] as string) : undefined);
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please refresh and try again." },
      { status: 403 },
    );
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }
  const data = parsed.data;

  if (!isSupabaseConfigured()) {
    console.error("[reserve-request] Supabase not configured.");
    return NextResponse.json(
      { ok: false, error: "Reservations are temporarily unavailable. Please use the inquiry form." },
      { status: 503 },
    );
  }

  const supabase = getServiceSupabase();
  const depositCents = depositForCollection(data.collection);
  const service = serviceForCollection(data.collection, data.package);
  // Backstop: hold the date 21 days while we confirm + collect the deposit. If
  // the family never confirms, the every-15-min cron frees the date (see
  // release_expired_booking_holds / migration 0009). The operator can release
  // it sooner from /admin/bookings.
  const expiresAt = new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString();

  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      event_date: data.event_date,
      package: service,
      collection: data.collection,
      notes: data.notes || null,
      status: "requested",
      deposit_amount_cents: depositCents,
      currency: DEPOSIT_CURRENCY,
      expires_at: expiresAt,
    })
    .select(
      "id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency",
    )
    .single();

  if (error) {
    // 23505 = unique violation on the active-event-date index → already held.
    if (error.code === "23505") {
      return NextResponse.json(
        {
          ok: false,
          error: "That date was just requested by another family. Please choose another.",
          fieldErrors: { event_date: ["This date is no longer available."] },
        },
        { status: 409 },
      );
    }
    console.error("[reserve-request] insert error:", error.message);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your request. Please try again." },
      { status: 500 },
    );
  }

  // Notify operator + acknowledge the family (best-effort; don't fail the save).
  const record = inserted as BookingRecord;
  const [op, cl] = await Promise.all([
    sendReservationRequestOperatorEmail(record),
    sendReservationRequestClientEmail(record),
  ]);
  if (!op.ok) console.error("[reserve-request] operator email:", op.error);
  if (!cl.ok) console.error("[reserve-request] client email:", cl.error);

  return NextResponse.json({ ok: true });
}
