/**
 * GET /api/cron/daily — the journey's daily run (src/lib/journey/cron.ts):
 * expire lapsed holds + their Stripe sessions, balance reminders, owner and
 * family nudges. Idempotent. Never charges, refunds or approves.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>`, compared in constant time.
 * Inert (401) until CRON_SECRET is set. Called by the Cloudflare Cron Trigger
 * in cloudflare/worker.ts (wrangler.jsonc triggers.crons), which invokes this
 * route in-process — no public round trip.
 */
import { NextResponse } from "next/server";
import { journeyDeps } from "@/lib/journey/deps";
import { runDaily } from "@/lib/journey/cron";
import { secretsEqual } from "@/lib/journey/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const deps = journeyDeps();
  const secret = deps.cronSecret();
  const header = req.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || !secretsEqual(secret, given)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const report = await runDaily(deps);
    return NextResponse.json({ ok: true, ...report }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[cron/daily]", err);
    return NextResponse.json({ ok: false, error: "daily run failed" }, { status: 500 });
  }
}
