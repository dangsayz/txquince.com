/**
 * /api/commission — online booking is paused.
 *
 * The homepage package picker now sends an inquiry (/api/inquiry) and the
 * studio follows up with the agreement and deposit link. This endpoint used to
 * create a date-holding booking; it now refuses every request, so a
 * hand-built POST can't hold a date either. Existing bookings keep working
 * through /booking/[id] and the admin approve flow.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(
    { ok: false, error: "Online booking is paused. Please send us your package as an inquiry." },
    { status: 410 },
  );
}
