import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Operator-driven lead status changes. Marking 'won'/'lost' takes a lead OUT of
// the automated follow-up sequence (the cron only ever touches status='new').
// When a lead is 'lost', we capture WHY so it stops being a black box.
const Schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "won", "lost"]),
  lost_reason: z
    .enum(["price", "availability", "ghosted", "booked_competitor", "other"])
    .nullable()
    .optional(),
  competitor_name: z.string().max(120).nullable().optional(),
});

/** Same-site only: a form on another site can't change or delete leads. */
function crossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

function refresh(id: string) {
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  if (crossSite(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, status, lost_reason, competitor_name } = parsed.data;

  const fields: Record<string, unknown> = { status };
  // Only a 'lost' lead carries a reason; clear it otherwise so data stays clean.
  if (status === "lost") {
    fields.lost_reason = lost_reason ?? null;
    fields.competitor_name = competitor_name?.trim() || null;
  } else {
    fields.lost_reason = null;
    fields.competitor_name = null;
  }

  const supabase = getServiceSupabase();
  let res = await supabase
    .from("inquiries")
    .update(fields)
    .eq("id", id)
    .select("id, status")
    .single();
  // If migration 0018 hasn't run yet, the reason columns don't exist — fall back
  // to a status-only update so the core action still works.
  if (res.error) {
    res = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single();
  }
  if (res.error) {
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }

  refresh(id);
  return NextResponse.json({ inquiry: res.data });
}

const DeleteSchema = z.object({ id: z.string().uuid() }).strict();

/**
 * Delete an inquiry for good (spam, a test, a duplicate). Admin session and
 * same-site origin are re-checked here; its activity log goes with it
 * (on delete cascade). Bookings are separate rows and are never touched.
 */
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  if (crossSite(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = DeleteSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id } = parsed.data;
  const { data, error } = await getServiceSupabase().from("inquiries").delete().eq("id", id).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  refresh(id);
  return NextResponse.json({ deleted: id });
}
