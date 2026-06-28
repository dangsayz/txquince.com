import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { VENDOR_CATEGORY_IDS } from "@/content/portfolio-taxonomy";

export const dynamic = "force-dynamic";

function bust() {
  revalidatePath("/vendors");
  revalidatePath("/portfolio");
}

const categorySchema = z
  .string()
  .refine((s) => VENDOR_CATEGORY_IDS.includes(s), "Unknown vendor category");

/** "@RosasBlooms " → "rosasblooms" (store bare, lowercase, no spaces). */
function cleanHandle(raw: string | null | undefined): string | null {
  const h = (raw ?? "").trim().replace(/^@+/, "").replace(/\s+/g, "");
  return h || null;
}

function kebab(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** GET — full vendor directory (admin). */
export async function GET() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, name, business, category, ig_handle, email, phone, website, notes, slug")
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendors: data ?? [] });
}

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  business: z.string().trim().max(160).optional(),
  category: categorySchema.optional(),
  ig_handle: z.string().max(80).optional(),
  email: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** POST — create a vendor (mints a permanent public slug). */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = CreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const v = parsed.data;
  const supabase = getServiceSupabase();

  // Permanent slug from the display name (business as fallback). Suffix on
  // collision so /vendors/{slug} links never clash.
  const base = kebab(v.name || v.business || "vendor") || "vendor";
  const { data: clash } = await supabase
    .from("vendors")
    .select("id")
    .eq("slug", base)
    .maybeSingle();
  const slug = clash ? `${base}-${crypto.randomUUID().slice(0, 4)}` : base;

  const { data, error } = await supabase
    .from("vendors")
    .insert({
      name: v.name,
      business: v.business || null,
      category: v.category || null,
      ig_handle: cleanHandle(v.ig_handle),
      email: v.email || null,
      phone: v.phone || null,
      website: v.website || null,
      notes: v.notes || null,
      slug,
    })
    .select("id, name, business, category, ig_handle, email, phone, website, notes, slug")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ vendor: data });
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  business: z.string().trim().max(160).nullable().optional(),
  category: categorySchema.nullable().optional(),
  ig_handle: z.string().max(80).nullable().optional(),
  email: z.string().trim().max(160).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  website: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

/** PATCH — edit a vendor (slug is permanent and never changes). */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;
  if ("ig_handle" in fields) fields.ig_handle = cleanHandle(fields.ig_handle);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .update(fields)
    .eq("id", id)
    .select("id, name, business, category, ig_handle, email, phone, website, notes, slug")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ vendor: data });
}

/** DELETE — remove a vendor (cascades its photo links; photos themselves stay). */
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ ok: true });
}
