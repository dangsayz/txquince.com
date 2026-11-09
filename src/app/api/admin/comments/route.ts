/**
 * /api/admin/comments — the owner's comment controls. Admin only.
 *   PATCH  { id, status?, reply? } → approve / hide / answer ("" removes the answer)
 *   DELETE { id } → delete for good
 * Every change revalidates the post the comment sits on.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { ModerateCommentSchema, commentPostPath, type CommentRecord } from "@/lib/comments";
import { deleteComment, moderateComment } from "@/lib/comments-db";

export const dynamic = "force-dynamic";

function refresh(c: CommentRecord) {
  revalidatePath(commentPostPath(c));
  revalidatePath("/admin/comments");
}

const fail = (err: unknown) => NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = ModerateCommentSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id, ...change } = parsed.data;
  if (change.status === undefined && change.reply === undefined) {
    return NextResponse.json({ error: "Nothing to change" }, { status: 400 });
  }
  try {
    const c = await moderateComment(id, change);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    refresh(c);
    return NextResponse.json({ ok: true, comment: c });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  try {
    const c = await deleteComment(parsed.data.id);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    refresh(c);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
