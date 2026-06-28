import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { getVenue } from "@/content/venues";

export const dynamic = "force-dynamic";

/** GET — all venue copy rows (admin). */
export async function GET() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("venues")
    .select("slug, about, faq, address, area, ig_handle, website");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ venues: data ?? [] });
}

const FaqSchema = z.object({
  q: z.string().trim().max(200),
  a: z.string().trim().max(800),
});

const UpsertSchema = z.object({
  slug: z.string().min(1),
  about: z.string().max(1200).nullable().optional(),
  faq: z.array(FaqSchema).max(12).optional(),
  address: z.string().max(200).nullable().optional(),
  area: z.string().max(120).nullable().optional(),
  ig_handle: z.string().max(80).nullable().optional(),
  website: z.string().max(200).nullable().optional(),
});

/** PATCH — upsert a venue's editable copy (keyed by registry slug). */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = UpsertSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { slug, ...fields } = parsed.data;
  const venue = getVenue(slug);
  if (!venue) {
    return NextResponse.json({ error: "Unknown venue" }, { status: 400 });
  }
  const igClean = fields.ig_handle?.trim().replace(/^@+/, "").replace(/\s+/g, "") || null;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("venues")
    .upsert(
      {
        slug,
        about: fields.about ?? null,
        faq: fields.faq ?? [],
        address: fields.address ?? null,
        area: fields.area ?? null,
        ig_handle: igClean,
        website: fields.website ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("slug, about, faq, address, area, ig_handle, website")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/venues");
  revalidatePath(`/venues/${slug}`);
  if (venue.citySlug) revalidatePath(`/quinceanera-photographer/${venue.citySlug}`);
  return NextResponse.json({ venue: data });
}
