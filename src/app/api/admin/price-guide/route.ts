/**
 * PUT /api/admin/price-guide — replace the DFW price guide with rows pasted
 * from the lead sheet. { text, dryRun? } → parsed rows + any row errors. With
 * errors nothing is saved; dryRun previews without saving. Admin only.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { replacePriceGuide } from "@/lib/plan-db";
import { parsePriceGuideSheet } from "@/lib/price-guide";
import { todayInDallas } from "@/lib/plan";

export const dynamic = "force-dynamic";

const Schema = z.object({ text: z.string().max(100_000), dryRun: z.boolean().optional() });

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { rows, errors } = parsePriceGuideSheet(parsed.data.text, todayInDallas());
  if (errors.length || !rows.length) {
    return NextResponse.json({ ok: false, rows, errors: errors.length ? errors : ["No rows found."] }, { status: 422 });
  }
  if (parsed.data.dryRun) return NextResponse.json({ ok: true, rows, saved: false });
  try {
    await replacePriceGuide(rows);
  } catch (err) {
    return NextResponse.json({ ok: false, rows, errors: [String(err instanceof Error ? err.message : err)] }, { status: 500 });
  }
  revalidatePath("/admin/price-guide");
  revalidatePath("/precios-quince-dfw");
  revalidatePath("/quince-prices-dfw");
  return NextResponse.json({ ok: true, rows, saved: true });
}
