/**
 * /api/track — first-party, cookieless analytics ingest. The browser beacon
 * (components/Tracker.tsx) posts page views and intent events here; we write
 * them via the service role. No PII, no cookies. Admin paths are ignored.
 *
 * Only real families are stored (src/lib/own-traffic.ts): robots and test
 * tools, a browser signed in to Studio, and the owner's own network are
 * answered "ok" and dropped.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { deviceOf } from "@/lib/device";
import { isAutomatedUA } from "@/lib/own-traffic";
import { isOwnerNetwork } from "@/lib/own-traffic-db";
import { SESSION_COOKIE } from "@/lib/admin-session";

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

  // Not a real family: a robot or test tool, or the owner's signed-in browser.
  if (isAutomatedUA(req.headers.get("user-agent")) || req.cookies.has(SESSION_COOKIE)) {
    return NextResponse.json({ ok: true });
  }

  if (await rateLimited(clientIp(req))) return NextResponse.json({ ok: true }); // silently drop

  if (!isDbConfigured()) return NextResponse.json({ ok: true });

  const path = clip(body.path, 300);
  if (!path || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  // The owner's network (home wifi): nobody in the house counts.
  if (await isOwnerNetwork(req)) return NextResponse.json({ ok: true });

  const db = getDb();
  const session_id = clip(body.sid, 64);

  try {
    if (body.t === "ev") {
      const event_type = clip(body.et, 40);
      if (!event_type) return NextResponse.json({ ok: true });
      await db.from("lead_events").insert({
        event_type,
        path,
        target: clip(body.tg, 300),
        session_id,
      });
    } else {
      const row: Record<string, string | null> = {
        path,
        referrer: clip(body.ref, 300),
        session_id,
        utm_source: clip(body.us, 80),
        utm_medium: clip(body.um, 80),
        utm_campaign: clip(body.uc, 80),
      };
      // visitor_id (migration 0025) and device (0026): until they run, the
      // insert fails and the row is stored without them.
      const extra = { visitor_id: clip(body.vid, 64), device: deviceOf(req.headers.get("user-agent")) };
      const { error } = await db.from("page_views").insert({ ...row, ...extra });
      if (error) await db.from("page_views").insert(row);
    }
  } catch {
    /* analytics must never break the page */
  }

  return NextResponse.json({ ok: true });
}
