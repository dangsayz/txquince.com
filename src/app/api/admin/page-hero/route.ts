/**
 * /api/admin/page-hero — set or clear the operator-chosen hero photo for a
 * specific marketing page (Blog, Investment, About, Areas Served). The image is
 * referenced by its portfolio `slug`, stored in site_settings under
 * `page_hero:<page>`. Clearing reverts the page to its automatic featured pick.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { HERO_PAGES } from "@/lib/content-db";

export const dynamic = "force-dynamic";

const PAGE_KEYS = Object.keys(HERO_PAGES) as [string, ...string[]];

const SetSchema = z.object({
  page: z.enum(PAGE_KEYS),
  slug: z.string().min(1, "Pick a photo."),
});
const ClearSchema = z.object({ page: z.enum(PAGE_KEYS) });

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = SetSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }
  const { page, slug } = parsed.data;

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_settings").upsert({
    key: `page_hero:${page}`,
    value: { slug },
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath(HERO_PAGES[page].path);
  return NextResponse.json({ ok: true, page, slug });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = ClearSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }
  const { page } = parsed.data;

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("site_settings")
    .delete()
    .eq("key", `page_hero:${page}`);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath(HERO_PAGES[page].path);
  return NextResponse.json({ ok: true, page });
}
