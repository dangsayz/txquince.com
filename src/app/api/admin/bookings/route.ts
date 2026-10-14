/**
 * PATCH /api/admin/bookings — kept for older admin screens: { id, status }.
 * Delegates to the journey's guarded actions (src/lib/journey/admin.ts) so the
 * one state machine applies. Only release/decline is supported here; marking a
 * booking paid now means recording the payment (method + amount) on its record.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { journeyDeps } from "@/lib/journey/deps";
import { runAdminAction } from "@/lib/journey/admin";
import { failResponse } from "@/lib/journey/http";

export const dynamic = "force-dynamic";

const Schema = z.object({ id: z.string().uuid(), status: z.enum(["cancelled", "declined"]) });

export async function PATCH(request: Request) {
  const deps = journeyDeps();
  if (!(await deps.adminEmail())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const b = await deps.db.getBooking(parsed.data.id);
  if (!b) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  const action = b.status === "requested" || b.status === "approved" ? "decline" : "cancel";
  const r = await runAdminAction(deps, b.id, action);
  return r.ok ? NextResponse.json({ booking: { id: b.id, status: r.status } }) : failResponse(r);
}
