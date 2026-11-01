/**
 * PATCH /api/admin/plans — change a plan's status (New / Replied / Booked /
 * Lost) or its private notes. Admin only (Supabase session + ADMIN_EMAILS).
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { updatePlan } from "@/lib/plan-db";
import { PLAN_STATUSES } from "@/lib/plan";

export const dynamic = "force-dynamic";

const Schema = z
  .object({
    id: z.string().uuid(),
    status: z.enum(PLAN_STATUSES).optional(),
    notes: z.string().max(4000).nullable().optional(),
  })
  .refine((b) => b.status !== undefined || b.notes !== undefined);

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id, ...fields } = parsed.data;
  try {
    await updatePlan(id, { ...fields, ...(fields.notes !== undefined ? { notes: fields.notes?.trim() || null } : {}) });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
  revalidatePath("/admin/plans");
  return NextResponse.json({ ok: true });
}
