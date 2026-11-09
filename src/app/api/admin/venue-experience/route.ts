/**
 * /api/admin/venue-experience — the owner writes "Our experience at this venue
 * and its staff". Admin only (Studio session); visitors can never write here.
 *   PUT    { slug, verdict, body_en, body_es? } → save (create or replace)
 *   DELETE { slug } → remove it from the site
 * Every change refreshes the venue page and each post about that venue.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminEmail } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getVenue } from "@/content/venues";
import { getAllEsPosts, postsForVenue } from "@/content/blog";
import { SaveExperienceSchema } from "@/lib/venue-experience";
import { deleteVenueExperience, saveVenueExperience } from "@/lib/venue-experience-db";

export const dynamic = "force-dynamic";

function refresh(slug: string) {
  revalidatePath(`/venues/${slug}`);
  revalidatePath(`/venues/${slug}/experience`);
  for (const p of postsForVenue(slug)) revalidatePath(`/blog/${p.slug}`);
  for (const p of getAllEsPosts()) if (p.venues?.includes(slug)) revalidatePath(`/es/blog/${p.slug}`);
}

const fail = (err: unknown) => NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });

export async function PUT(request: Request) {
  const email = await getAdminEmail();
  if (!email) return unauthorizedAdminResponse();
  const parsed = SaveExperienceSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }
  if (!getVenue(parsed.data.slug)) return NextResponse.json({ error: "Unknown venue" }, { status: 404 });
  try {
    const experience = await saveVenueExperience(parsed.data, email);
    refresh(parsed.data.slug);
    return NextResponse.json({ ok: true, experience });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminEmail())) return unauthorizedAdminResponse();
  const parsed = z.object({ slug: z.string().min(1).max(120) }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (!getVenue(parsed.data.slug)) return NextResponse.json({ error: "Unknown venue" }, { status: 404 });
  try {
    await deleteVenueExperience(parsed.data.slug);
    refresh(parsed.data.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
