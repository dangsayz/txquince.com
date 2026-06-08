/**
 * GET /api/availability — which future dates are already claimed.
 *
 * Public + read-only. Returns just the list of taken YYYY-MM-DD dates (no PII)
 * so the reserve form can tell a family their date is open or taken BEFORE they
 * fill anything out — removing the worst drop-off point (filling the form, then
 * getting bounced at checkout because the date was gone).
 *
 * The atomic hold in /api/booking is still the real guard against double-booking;
 * this is a UX courtesy. Cached briefly at the edge — staleness only ever shows
 * an open date as open a little longer, which the hold then rejects safely.
 */
import { NextResponse } from "next/server";
import { getTakenEventDates } from "@/lib/clients-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const takenDates = await getTakenEventDates();
    return NextResponse.json(
      { ok: true, takenDates },
      {
        headers: {
          // 60s edge cache; one event/day means this list moves slowly.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    // Never block the form — degrade to "everything open" and let the hold guard.
    return NextResponse.json({ ok: true, takenDates: [] });
  }
}
