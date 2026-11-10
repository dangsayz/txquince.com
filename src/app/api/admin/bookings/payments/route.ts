/**
 * /api/admin/bookings/payments — money taken outside Stripe (admin only).
 *   POST    record a cash / Zelle / check payment toward a booked date's balance
 *   DELETE  remove one that was recorded by mistake (never a Stripe payment)
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminEmail } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { LIVE_STATUSES, paidCents } from "@/lib/balance";
import { balanceOf, checkOffline, OFFLINE_METHODS } from "@/lib/offline-payment";

export const dynamic = "force-dynamic";

const Record = z
  .object({
    bookingId: z.string().uuid(),
    amountCents: z.number().int(),
    method: z.enum(OFFLINE_METHODS),
    paidOn: z.string(),
    note: z.string().trim().max(200).optional(),
  })
  .strict();
const Remove = z.object({ paymentId: z.string().uuid() }).strict();
const chicagoToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  const admin = await getAdminEmail();
  if (!admin) return unauthorizedAdminResponse();
  const parsed = Record.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail(400, "Check the amount, the method and the day.");
  const { bookingId, amountCents, method, paidOn, note } = parsed.data;

  const db = getDb();
  const { data: b } = await db.from("bookings").select("id, status, deposit_amount_cents, currency, metadata").eq("id", bookingId).maybeSingle();
  if (!b) return fail(404, "That booking is gone.");
  // The deposit comes first: "Mark paid" books the date. This form is for the balance after it.
  if (b.status !== "paid") return fail(409, "This booking is not booked yet. Use Mark paid for the deposit first.");

  const { data: rows, error: rowsError } = await db.from("booking_payments").select("status, amount_cents").eq("booking_id", bookingId);
  if (rowsError) return fail(500, "Could not read this booking's payments. Try again.");
  // A card checkout in flight could pay the same money twice.
  if ((rows ?? []).some((r: { status: string }) => (LIVE_STATUSES as readonly string[]).includes(r.status))) {
    return fail(409, "The family has a card payment in progress right now. Try again in a few minutes.");
  }
  const balance = balanceOf(b);
  const left = balance === null ? null : Math.max(0, balance - paidCents(rows ?? []));
  const check = checkOffline(amountCents, paidOn, left, chicagoToday());
  if (!check.ok) return fail(400, check.error);

  const { error } = await db.from("booking_payments").insert({
    booking_id: bookingId,
    kind: "balance",
    amount_cents: amountCents,
    currency: b.currency ?? "usd",
    status: "paid",
    method,
    note: note || null,
    recorded_by: admin,
    paid_at: `${paidOn}T18:00:00.000Z`, // noon in Dallas: the calendar day is what matters
  });
  if (error) return fail(500, "Could not save the payment. Nothing was recorded.");
  revalidatePath("/admin/bookings");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await getAdminEmail())) return unauthorizedAdminResponse();
  const parsed = Remove.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail(400, "Invalid request.");
  // The filter is the rule: a Stripe payment can never be removed here.
  const { error } = await getDb().from("booking_payments").delete().eq("id", parsed.data.paymentId).in("method", [...OFFLINE_METHODS]);
  if (error) return fail(500, "Could not remove it.");
  revalidatePath("/admin/bookings");
  return NextResponse.json({ ok: true });
}
