/**
 * /api/admin/reviews — the owner's review controls. Admin only.
 *   POST   { invite_name, daughter_name?, event_date? } → new one-time link
 *   PATCH  { id, status?, featured?, show_photos?, notes? } → moderate
 *   DELETE { id } → delete an UNUSED link (a submitted review is hidden, not deleted)
 * Every change revalidates the public pages that show reviews.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { createInvite, deleteInvite, updateReview } from "@/lib/reviews-db";
import { InviteSchema, ModerateSchema, inviteMessage, reviewPath } from "@/lib/review";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

function refresh() {
  for (const p of ["/admin/reviews", "/reviews", "/", "/es"]) revalidatePath(p);
}

const fail = (err: unknown) => NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = InviteSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Add the mom's name." }, { status: 400 });
  try {
    const review = await createInvite(parsed.data);
    refresh();
    const url = `${getSiteUrl()}${reviewPath(review.slug)}`;
    return NextResponse.json({ ok: true, id: review.id, url, message: inviteMessage(review, url) });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = ModerateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id, ...fields } = parsed.data;
  try {
    await updateReview(id, { ...fields, ...(fields.notes !== undefined ? { notes: fields.notes?.trim() || null } : {}) });
  } catch (err) {
    return fail(err);
  }
  refresh();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  try {
    const gone = await deleteInvite(parsed.data.id);
    if (!gone) return NextResponse.json({ error: "Only an unused link can be deleted. Hide the review instead." }, { status: 409 });
  } catch (err) {
    return fail(err);
  }
  refresh();
  return NextResponse.json({ ok: true });
}
