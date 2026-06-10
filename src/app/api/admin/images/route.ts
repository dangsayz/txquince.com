import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const SECTIONS = ["save-the-date", "church", "portraits", "celebration", "films"] as const;

function bust() {
  revalidatePath("/");
  revalidatePath("/portfolio");
}

// Record a freshly-uploaded image.
const RecordSchema = z.object({
  storage_path: z.string().min(1),
  alt: z.string().max(300).optional().default(""),
  section: z.enum(SECTIONS).optional().default("celebration"),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  location: z.string().max(160).optional(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = RecordSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { storage_path, alt, section, width, height, location } = parsed.data;
  if (!storage_path.startsWith("portfolio/")) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  // place new image at the end of its section
  const { data: maxRow } = await supabase
    .from("portfolio_images")
    .select("sort_order")
    .eq("section", section)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  // Permanent SEO slug, minted at insert (alt edits never change a shared
  // link). Descriptive when alt exists; date-stamped fallback otherwise.
  const base = (alt || `${section} quinceanera dfw`)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  const slug = `${base}-${crypto.randomUUID().slice(0, 4)}`;

  const { data, error } = await supabase
    .from("portfolio_images")
    .insert({ storage_path, alt, section, sort_order, width: width ?? null, height: height ?? null, location: location || null, slug, title: alt || null })
    .select()
    .single();

  if (error) {
    await supabase.storage.from("portfolio").remove([storage_path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  bust();
  return NextResponse.json({ image: data });
}

// Update alt / section / feature flag.
const UpdateSchema = z.object({
  id: z.string().uuid(),
  alt: z.string().max(300).optional(),
  section: z.enum(SECTIONS).optional(),
  is_feature: z.boolean().optional(),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  location: z.string().max(160).nullable().optional(),
  // Focal anchor — fractions of the frame (0..1 from left/top).
  focus_x: z.number().min(0).max(1).nullable().optional(),
  focus_y: z.number().min(0).max(1).nullable().optional(),
});

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("portfolio_images")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ image: data });
}

// Delete (row + storage object).
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getServiceSupabase();
  const { data: row } = await supabase
    .from("portfolio_images")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("portfolio_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (row?.storage_path) {
    await supabase.storage.from("portfolio").remove([row.storage_path]);
  }
  bust();
  return NextResponse.json({ ok: true });
}
