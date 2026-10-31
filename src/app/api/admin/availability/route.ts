/**
 * POST /api/admin/availability — set a date's status for plan pages.
 * { date: "YYYY-MM-DD", status: "available" | "limited" | "booked", note? }
 * "available" without a note clears the date back to the default. Admin only.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { setAvailability } from "@/lib/plan-db";
import { DATE_STATUSES, isRealIsoDate } from "@/lib/plan";

export const dynamic = "force-dynamic";

const Schema = z.object({
  dates: z.array(z.string().refine(isRealIsoDate)).min(1).max(60),
  status: z.enum(DATE_STATUSES),
  note: z.string().trim().max(200).optional().default(""),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  // Accept one date or several (the editor can mark a run of Saturdays at once).
  const parsed = Schema.safeParse({ ...body, dates: Array.isArray(body.dates) ? body.dates : [body.date] });
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid date and status." }, { status: 400 });
  try {
    for (const date of new Set(parsed.data.dates)) {
      await setAvailability(date, parsed.data.status, parsed.data.note || null);
    }
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
  revalidatePath("/admin/availability");
  return NextResponse.json({ ok: true });
}
