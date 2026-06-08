/**
 * /api/inquiry — the ONLY backend. (LAW: owned capture)
 *
 * Flow: parse → honeypot → best-effort rate limit → Turnstile (primary gate) →
 * server-side zod validation → insert to Supabase (service role, RLS-locked) →
 * two Resend emails → JSON success. The client then redirects to /thank-you and
 * fires the inquiry_submitted analytics event.
 *
 * Never trust the client: every field is re-validated here.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  inquirySchema,
  HONEYPOT_FIELD,
  TURNSTILE_FIELD,
} from "@/lib/inquiry";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendOperatorEmail, sendInquirerEmail } from "@/lib/resend";

// Always run server-side at request time.
export const dynamic = "force-dynamic";

/**
 * Best-effort in-memory rate limit. NOTE (RATE LIMITING LAW): serverless
 * instances don't share memory, so this only throttles bursts hitting the same
 * warm instance. Turnstile is the REAL defense; swap in Upstash/@upstash/ratelimit
 * for durable limiting (see README). Kept tiny + dependency-free on purpose.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  // light cleanup to avoid unbounded growth on a warm instance
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

  // 1) Honeypot — a filled hidden field means a bot. Pretend success (don't tip off).
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // 2) Best-effort rate limit (Turnstile is the primary gate).
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  // 3) Turnstile — primary abuse gate, verified BEFORE any DB write.
  const token =
    (typeof body[TURNSTILE_FIELD] === "string"
      ? (body[TURNSTILE_FIELD] as string)
      : undefined) ??
    (typeof body["turnstileToken"] === "string"
      ? (body["turnstileToken"] as string)
      : undefined);
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please refresh and try again." },
      { status: 403 },
    );
  }

  // 4) Server-side validation (never trust the client).
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // 5) Insert to Supabase (service role; RLS blocks anon entirely).
  if (!isSupabaseConfigured()) {
    console.error("[inquiry] Supabase not configured — cannot save lead.");
    return NextResponse.json(
      { ok: false, error: "We couldn't save your inquiry. Please try again shortly." },
      { status: 500 },
    );
  }

  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("inquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      event_date: data.event_date || null,
      venue: data.venue || null,
      services: data.services,
      budget_range: data.budget_range,
      referral: data.referral || null,
      message: data.message || null,
    });
    if (error) {
      console.error("[inquiry] Supabase insert error:", error.message);
      return NextResponse.json(
        { ok: false, error: "We couldn't save your inquiry. Please try again shortly." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[inquiry] Supabase exception:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your inquiry. Please try again shortly." },
      { status: 500 },
    );
  }

  // 6) Emails — the lead is already saved, so email failures don't block success.
  const [op, ack] = await Promise.all([
    sendOperatorEmail(data),
    sendInquirerEmail(data),
  ]);
  if (!op.ok) console.error("[inquiry] operator email failed:", op.error);
  if (!ack.ok) console.error("[inquiry] inquirer email failed:", ack.error);

  return NextResponse.json({ ok: true });
}
