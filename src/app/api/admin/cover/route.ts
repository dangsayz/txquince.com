import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { COVER_SLOTS } from "@/lib/content-db";

export const dynamic = "force-dynamic";

const slots = Object.keys(COVER_SLOTS);
const slotSchema = z.string().refine((value) => slots.includes(value), "Invalid cover slot.");
const saveSchema = z.object({
  slot: slotSchema,
  storage_path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const deleteSchema = z.object({ slot: slotSchema });

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = saveSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  const { slot, storage_path, width, height } = parsed.data;
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_settings").upsert({
    key: `cover:${slot}`,
    value: { storage_path, width, height },
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath(COVER_SLOTS[slot].path);
  return NextResponse.json({ ok: true, slot });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = deleteSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  const { slot } = parsed.data;
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_settings").delete().eq("key", `cover:${slot}`);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath(COVER_SLOTS[slot].path);
  return NextResponse.json({ ok: true, slot });
}
