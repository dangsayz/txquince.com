/**
 * POST /api/admin/bookings/{id} — { action, note? }
 * approve | decline | cancel | complete | confirm_review | send_balance_link |
 * family_link | mark_read. Admin re-checked inside runAdminAction.
 */
import { revalidatePath } from "next/cache";
import { journeyDeps } from "@/lib/journey/deps";
import { runAdminAction } from "@/lib/journey/admin";
import { fail } from "@/lib/journey/core";
import { failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await readJson(req)) ?? {};
  try {
    const r = await runAdminAction(journeyDeps(), id, body.action, { note: typeof body.note === "string" ? body.note : undefined });
    if (!r.ok) return failResponse(r);
    try {
      revalidatePath("/admin/bookings");
    } catch {
      /* outside a request (tests) */
    }
    return okResponse(r);
  } catch (err) {
    console.error("[admin/bookings/action]", err);
    return failResponse(fail(502, "failed", "That didn't go through. Please try again."));
  }
}
