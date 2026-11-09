import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Schema = z.array(
  z.object({ id: z.string().uuid(), sort_order: z.number().int().min(0) }),
);

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const db = getDb();
  const results = await Promise.all(
    parsed.data.map(({ id, sort_order }) =>
      db.from("videos").update({ sort_order }).eq("id", id),
    ),
  );
  if (results.some((r) => r.error)) {
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
  revalidatePath("/");
  revalidatePath("/portfolio");
  return NextResponse.json({ ok: true });
}
