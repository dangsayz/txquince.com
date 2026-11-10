import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { sendAgreementDeclinedClient } from "@/lib/agreement-email";
import { canArchive, canRemove } from "@/lib/booking-tidy";

export const dynamic = "force-dynamic";

// Operator-driven status changes. 'cancelled' frees the held date immediately
// (the public availability check only counts requested/pending_payment/paid).
const Schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["cancelled", "paid", "requested"]),
});
const TidySchema = z.object({ id: z.string().uuid(), action: z.enum(["archive", "restore"]) }).strict();
const RemoveSchema = z.object({ id: z.string().uuid() }).strict();
const chicagoToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

/** Archive / restore: hide a closed booking from the list. Nothing is deleted. */
async function tidy(id: string, action: "archive" | "restore") {
  const db = getDb();
  const { data: b } = await db.from("bookings").select("id, status, event_date, paid_at, metadata").eq("id", id).maybeSingle();
  if (!b) return NextResponse.json({ error: "That booking is gone." }, { status: 404 });
  if (action === "archive" && !canArchive(b, chicagoToday())) {
    return NextResponse.json({ error: "This booking is still active. Decline or release it first." }, { status: 409 });
  }
  const meta = { ...((b.metadata ?? {}) as Record<string, unknown>) };
  if (action === "archive") meta.archived_at = new Date().toISOString();
  else delete meta.archived_at;
  // Only if the status did not change under us (e.g. a late payment landed).
  const { data, error } = await db.from("bookings").update({ metadata: meta }).eq("id", id).eq("status", b.status).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "This booking just changed. Reload and try again." }, { status: 409 });
  revalidatePath("/admin/bookings");
  return NextResponse.json({ ok: true });
}

/** Remove for good. Only a closed booking that was never paid. */
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = RemoveSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id } = parsed.data;
  const db = getDb();
  const { data: b } = await db.from("bookings").select("id, status, event_date, paid_at, stripe_payment_intent_id").eq("id", id).maybeSingle();
  if (!b) return NextResponse.json({ ok: true });
  const { count } = await db.from("booking_payments").select("id", { count: "exact", head: true }).eq("booking_id", id);
  if (!canRemove(b) || b.stripe_payment_intent_id || (count ?? 0) > 0) {
    return NextResponse.json({ error: "This booking has a payment on record, so it can only be archived." }, { status: 409 });
  }
  // The filters repeat the rule, so a payment that lands right now still wins.
  const { error } = await db.from("bookings").delete().eq("id", id).in("status", ["expired", "cancelled"]).is("paid_at", null);
  if (error) return NextResponse.json({ error: "Could not remove it. Archive it instead." }, { status: 500 });
  revalidatePath("/admin/bookings");
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const body = await request.json().catch(() => ({}));
  const tidyReq = TidySchema.safeParse(body);
  if (tidyReq.success) return tidy(tidyReq.data.id, tidyReq.data.action);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, status } = parsed.data;

  const fields: Record<string, unknown> = { status };
  if (status === "paid") fields.paid_at = new Date().toISOString();

  const db = getDb();
  const { data: before } = await db
    .from("bookings")
    .select("status, metadata")
    .eq("id", id)
    .maybeSingle();
  const { data, error } = await db
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
