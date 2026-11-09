/**
 * /api/admin/comments/block — block or unblock a commenter. Admin only.
 *   POST   { id }       → block the person who wrote comment `id`: all their
 *                         comments are hidden and they cannot post again
 *   DELETE { user_id }  → let them comment again (hidden comments stay hidden)
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { commentPostPath } from "@/lib/comments";
import { blockCommentAuthor, unblockCommenter } from "@/lib/comments-db";

export const dynamic = "force-dynamic";

const fail = (err: unknown) => NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  try {
    const done = await blockCommentAuthor(parsed.data.id);
    if (!done) return NextResponse.json({ error: "Not found" }, { status: 404 });
    for (const p of new Set(done.hidden.map(commentPostPath))) revalidatePath(p);
    revalidatePath("/admin/comments");
    return NextResponse.json({ ok: true, who: done.who, hidden: done.hidden.map((c) => c.id) });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = z.object({ user_id: z.string().min(1).max(100) }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  try {
    if (!(await unblockCommenter(parsed.data.user_id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePath("/admin/comments");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
