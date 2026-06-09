import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Operator-driven status changes. 'cancelled' frees the held date immediately
// (the public availability check only counts requested/pending_payment/paid).
const Schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["cancelled", "paid", "requested"]),
});

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, status } = parsed.data;

  const fields: Record<string, unknown> = { status };
  if (status === "paid") fields.paid_at = new Date().toISOString();

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .update(fields)
    .eq("id", id)
    .select("id, status")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/admin/bookings");
  revalidatePath("/"); // availability/date-holds
  return NextResponse.json({ booking: data });
}
