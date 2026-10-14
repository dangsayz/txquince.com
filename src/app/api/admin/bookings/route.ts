import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { sendAgreementDeclinedClient } from "@/lib/agreement-email";

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
  const { data: before } = await supabase
    .from("bookings")
    .select("status, metadata")
    .eq("id", id)
    .maybeSingle();
  const { data, error } = await supabase
    .from("bookings")
    .update(fields)
    .eq("id", id)
    .select("id, status, name, email, event_date")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Declining a signed agreement that was still waiting: tell the family
  // (nothing was charged — deposits are only taken after approval).
  const meta = (before?.metadata ?? {}) as Record<string, unknown>;
  if (
    status === "cancelled" &&
    meta.flow === "agreement" &&
    (before?.status === "requested" || before?.status === "pending_payment")
  ) {
    const mail = await sendAgreementDeclinedClient(data, meta.language === "es" ? "es" : "en");
    if (!mail.ok) console.error("[admin/bookings] decline email:", mail.error);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/"); // availability/date-holds
  return NextResponse.json({ booking: data });
}
