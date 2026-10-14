/**
 * /api/track — first-party, cookieless analytics ingest. The browser beacon
 * (components/Tracker.tsx) posts page views and intent events here; we write
 * them via the service role. No PII, no cookies. Admin paths are ignored.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-IP limit: Workers Rate Limiting binding in production, in-memory in dev.
const rateLimited = rateLimiter("track");

function clip(v: unknown, max = 512): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (await rateLimited(clientIp(req))) return NextResponse.json({ ok: true }); // silently drop

  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

  const path = clip(body.path, 300);
  if (!path || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getServiceSupabase();
  const session_id = clip(body.sid, 64);

  try {
    if (body.t === "ev") {
      const event_type = clip(body.et, 40);
      if (!event_type) return NextResponse.json({ ok: true });
      await supabase.from("lead_events").insert({
        event_type,
        path,
        target: clip(body.tg, 300),
        session_id,
      });
    } else {
      await supabase.from("page_views").insert({
        path,
        referrer: clip(body.ref, 300),
        session_id,
        utm_source: clip(body.us, 80),
        utm_medium: clip(body.um, 80),
        utm_campaign: clip(body.uc, 80),
      });
    }
  } catch {
    /* analytics must never break the page */
  }

  return NextResponse.json({ ok: true });
}
