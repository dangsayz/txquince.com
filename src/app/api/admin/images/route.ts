import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { deletePortfolioObjects } from "@/lib/r2-portfolio";
import { CATEGORY_IDS } from "@/content/portfolio-taxonomy";

export const dynamic = "force-dynamic";

// Allowed category ids come from the taxonomy (one source of truth), so adding
// a category never needs an API edit. Free-text column; validated here.
const sectionSchema = z
  .string()
  .refine((s) => CATEGORY_IDS.includes(s), "Unknown category");

function bust() {
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/vendors");
}

// Record a freshly-uploaded image.
const RecordSchema = z.object({
  storage_path: z.string().min(1),
  alt: z.string().max(300).optional().default(""),
  section: sectionSchema.optional().default("celebration"),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  location: z.string().max(160).optional(),
  hook: z.string().max(200).optional(),
  tags: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = RecordSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { storage_path, alt, section, width, height, location, hook, tags } = parsed.data;
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
    .insert({ storage_path, alt, section, sort_order, width: width ?? null, height: height ?? null, location: location || null, hook: hook || null, tags: tags || null, slug, title: alt || null })
    .select()
    .single();

  if (error) {
    await deletePortfolioObjects([storage_path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  bust();
  return NextResponse.json({ image: data });
}

// Update alt / section / feature flag / focal anchor / in-place replacement.
const UpdateSchema = z.object({
  id: z.string().uuid(),
  alt: z.string().max(300).optional(),
  // SEO description + title. caption feeds the image sitemap (<image:caption>),
  // the ImageObject.description, and the photo detail page; title feeds
  // <image:title> + ImageObject.name. Both stop those surfaces from collapsing
  // back to the short alt text.
  title: z.string().max(200).nullable().optional(),
  caption: z.string().max(600).nullable().optional(),
  // Punchy one-liner + free-form keyword tags (meta).
  hook: z.string().max(200).nullable().optional(),
  tags: z.string().max(400).nullable().optional(),
  section: sectionSchema.optional(),
  is_feature: z.boolean().optional(),
  // Replace the FULL set of vendors credited on this image (idempotent). Order
  // is preserved by insert order.
  vendor_ids: z.array(z.string().uuid()).max(20).optional(),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  location: z.string().max(160).nullable().optional(),
  // City slug (matches a /quinceanera-photographer/<city> page) so each city
  // page can show its OWN real work — the fix for duplicate-looking city pages.
  city: z.string().max(80).nullable().optional(),
  // Focal anchor — fractions of the frame (0..1 from left/top).
  focus_x: z.number().min(0).max(1).nullable().optional(),
  focus_y: z.number().min(0).max(1).nullable().optional(),
  // In-place photo replacement (slug/links stay; old object is removed).
  storage_path: z.string().min(1).optional(),
});

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // vendor_ids is a relationship (join table), not a column — handle separately.
  const { id, vendor_ids, ...fields } = parsed.data;
  if (fields.storage_path && !fields.storage_path.startsWith("portfolio/")) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 400 });
  }
  const supabase = getServiceSupabase();

  // Replace the image's vendor credits when vendor_ids is provided (idempotent:
  // clear then re-insert the given set, preserving order).
  if (vendor_ids) {
    await supabase.from("portfolio_image_vendors").delete().eq("image_id", id);
    if (vendor_ids.length) {
      const rows = vendor_ids.map((vendor_id) => ({ image_id: id, vendor_id }));
      const { error: linkErr } = await supabase
        .from("portfolio_image_vendors")
        .insert(rows);
      if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }
  }

  // No column fields (vendor-only edit)? Return the current row.
  if (Object.keys(fields).length === 0) {
    const { data } = await supabase
      .from("portfolio_images")
      .select()
      .eq("id", id)
      .single();
    bust();
    return NextResponse.json({ image: data });
  }

  // Replacing the file? Remember the old object so we can clean it up.
  let oldPath: string | null = null;
  if (fields.storage_path) {
    const { data: row } = await supabase
      .from("portfolio_images")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    oldPath = row?.storage_path ?? null;
  }

  const { data, error } = await supabase
    .from("portfolio_images")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (oldPath && fields.storage_path && oldPath !== fields.storage_path) {
    await deletePortfolioObjects([oldPath]);
  }
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
    await deletePortfolioObjects([row.storage_path]);
  }
  bust();
  return NextResponse.json({ ok: true });
}
