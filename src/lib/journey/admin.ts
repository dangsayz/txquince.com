/**
 * admin.ts — what the owner can do, each a click. Every function:
 *   1. re-checks the admin (Supabase session + ADMIN_EMAILS) itself,
 *   2. re-reads the booking and re-derives the state rule,
 *   3. writes with the state predicate in the UPDATE (transition()).
 * Money only moves here when the owner clicks Refund (Stripe Refunds API,
 * with an idempotency key, capped server-side at what is refundable).
 */
import "server-only";
import { z } from "zod";
import { approvedEmail } from "@/lib/emails/approved";
import { declinedEmail } from "@/lib/emails/declined";
import { cancelledEmail } from "@/lib/emails/cancelled";
import { balanceLinkEmail } from "@/lib/emails/balance-link";
import { refundIssuedEmail } from "@/lib/emails/refund-issued";
import { ownerReplyEmail } from "@/lib/emails/owner-reply";
import { paymentReceivedEmail } from "@/lib/emails/payment-received";
import { deliveryUpdateEmail } from "@/lib/emails/delivery-update";
import { normalizeOverrides } from "./contract";
import { closeOpenSessions, fail, familyCtx, logEvent, mailFamily, mintLink, settle, transition, type Fail } from "./core";
import type { JourneyDeps } from "./deps";
import { ledgerFor, refundableCents } from "./ledger";
import { APPROVAL_HOLD_DAYS, DAY_MS } from "./policy";
import { STATUS_LABEL } from "./state";
import { ALBUM_STATUSES, type BookingRow, type ContractTemplateRow } from "./types";

type Ok<T = object> = { ok: true } & T;

async function guard(deps: JourneyDeps, id: unknown): Promise<{ admin: string; b: BookingRow } | Fail> {
  const admin = await deps.adminEmail();
  if (!admin) return fail(401, "unauthorized", "Unauthorized");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return fail(400, "invalid", "Invalid booking id.");
  const b = await deps.db.getBooking(id);
  if (!b) return fail(404, "not_found", "Booking not found.");
  return { admin, b };
}
const isFail = (x: unknown): x is Fail => Boolean(x && typeof x === "object" && (x as Fail).ok === false);
const stateFail = (b: BookingRow, what: string) =>
  fail(409, "bad_state", `Can't ${what}: this booking is "${STATUS_LABEL[b.status]}".`);

export const ACTIONS = [
  "approve",
  "decline",
  "cancel",
  "complete",
  "confirm_review",
  "send_balance_link",
  "family_link",
  "mark_read",
] as const;
export type AdminAction = (typeof ACTIONS)[number];

export async function runAdminAction(
  deps: JourneyDeps,
  id: unknown,
  action: unknown,
  opts: { note?: string } = {},
): Promise<Ok<{ status?: string; url?: string }> | Fail> {
  const g = await guard(deps, id);
  if (isFail(g)) return g;
  const { admin, b } = g;
  const now = deps.now();
  const note = typeof opts.note === "string" ? opts.note.trim().slice(0, 1000) : "";

  switch (action) {
    case "approve": {
      const r = await transition(deps, b.id, ["requested", "expired"], "approved", {
        approved_at: now.toISOString(),
        expires_at: new Date(now.getTime() + APPROVAL_HOLD_DAYS * DAY_MS).toISOString(),
      });
      if (!r.ok) {
        return r.reason === "date_taken" ? fail(409, "date_taken", "That date is now taken by another booking.") : stateFail(b, "approve");
      }
      await logEvent(deps, b.id, "approved", "admin", { actorEmail: admin });
      await mailFamily(
        deps,
        r.booking,
        approvedEmail({
          ...(await familyCtx(deps, r.booking)),
          depositCents: r.booking.deposit_amount_cents,
          depositPercent: r.booking.deposit_percent ?? 25,
          holdUntil: r.booking.expires_at.slice(0, 10),
        }),
        "approved",
      );
      return { ok: true, status: r.booking.status };
    }
    case "decline":
    case "cancel": {
      const to = action === "decline" ? "declined" : "cancelled";
      // Close any open checkout first; if one was already paid, stop — refund instead (M5).
      const closed = await closeOpenSessions(deps, b.id);
      if (closed.inFlight) {
        return fail(409, "payment_in_flight", "A payment for this booking already went through or is processing. Wait for it to land, then cancel and refund.");
      }
      const from = action === "decline" ? (["requested", "approved"] as const) : ("any" as const);
      const r = await transition(deps, b.id, from, to, action === "decline" ? { declined_at: now.toISOString() } : { cancelled_at: now.toISOString() });
      if (!r.ok) return stateFail(b, action);
      await logEvent(deps, b.id, to, "admin", { actorEmail: admin, detail: note || null });
      const ctx = await familyCtx(deps, r.booking);
      await mailFamily(
        deps,
        r.booking,
        action === "decline" ? declinedEmail({ ...ctx, reason: note || undefined }) : cancelledEmail({ ...ctx, note: note || undefined }),
        to,
      );
      return { ok: true, status: to };
    }
    case "complete": {
      const r = await transition(deps, b.id, ["confirmed", "paid_in_full"], "completed", { completed_at: now.toISOString() });
      if (!r.ok) return stateFail(b, "mark completed");
      await logEvent(deps, b.id, "completed", "admin", { actorEmail: admin });
      return { ok: true, status: "completed" };
    }
    case "confirm_review": {
      // The owner looked at a payment_review booking and wants it booked.
      const l = ledgerFor(b, await deps.db.listPayments(b.id));
      if (!b.signed_at || !l.depositPaid) return fail(409, "not_ready", "It needs a signature and the deposit before it can be booked.");
      const r = await transition(deps, b.id, ["payment_review"], "confirmed", { confirmed_at: now.toISOString(), paid_at: b.paid_at ?? now.toISOString() });
      if (!r.ok) return r.reason === "date_taken" ? fail(409, "date_taken", "That date is now held by another booking.") : stateFail(b, "confirm");
      await logEvent(deps, b.id, "confirmed", "admin", { actorEmail: admin, detail: "resolved payment review" });
      await settle(deps, b.id, "admin");
      return { ok: true, status: "confirmed" };
    }
    case "send_balance_link": {
      const l = ledgerFor(b, await deps.db.listPayments(b.id));
      if (b.status !== "confirmed" || l.remainingCents <= 0) return stateFail(b, "send a balance link");
      // No Stripe session is created here: the family starts checkout themselves by clicking.
      await mailFamily(deps, b, balanceLinkEmail({ ...(await familyCtx(deps, b)), remainingCents: l.remainingCents, dueDate: b.balance_due_date }), "balance-link");
      await logEvent(deps, b.id, "balance_link_sent", "admin", { actorEmail: admin });
      return { ok: true };
    }
    case "family_link": {
      const url = await mintLink(deps, b, "admin");
      await logEvent(deps, b.id, "family_link_copied", "admin", { actorEmail: admin });
      return { ok: true, url };
    }
    case "mark_read": {
      await deps.db.markFamilyMessagesRead(b.id, now.toISOString());
      return { ok: true };
    }
    default:
      return fail(400, "invalid", "Unknown action.");
  }
}

/* ---------------- payments made outside Stripe ---------------- */

export const offlinePaymentSchema = z.object({
  amountCents: z.number().int().positive().max(10_000_000),
  method: z.enum(["zelle", "cash", "check", "other"]),
  note: z.string().trim().max(500).optional().default(""),
});

export async function recordOfflinePayment(deps: JourneyDeps, id: unknown, body: unknown): Promise<Ok<{ status: string }> | Fail> {
  const g = await guard(deps, id);
  if (isFail(g)) return g;
  const { admin, b } = g;
  const parsed = offlinePaymentSchema.safeParse(body);
  if (!parsed.success) return fail(422, "invalid", "Enter an amount and how they paid.");
  if (!["approved", "confirmed", "payment_review"].includes(b.status)) return stateFail(b, "record a payment");
  const l = ledgerFor(b, await deps.db.listPayments(b.id));
  if (parsed.data.amountCents > l.remainingCents) {
    return fail(422, "too_much", `That's more than what's left to pay (${(l.remainingCents / 100).toFixed(2)}).`);
  }
  const kind = l.depositPaid ? "balance" : "deposit";
  await deps.db.insertPayment({
    booking_id: b.id,
    kind,
    method: parsed.data.method,
    amount_cents: parsed.data.amountCents,
    currency: b.currency,
    refund_of: null,
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: null,
    stripe_refund_id: null,
    stripe_event_id: null,
    recorded_by: admin,
    note: parsed.data.note || null,
  });
  await logEvent(deps, b.id, `paid:${kind}`, "admin", { actorEmail: admin, detail: `${parsed.data.amountCents} cents by ${parsed.data.method}` });
  const { booking } = await settle(deps, b.id, "admin");
  const after = ledgerFor(booking, await deps.db.listPayments(b.id));
  const outcome =
    booking.status === "paid_in_full"
      ? "paid_in_full"
      : booking.status === "confirmed" && b.status === "approved"
        ? "confirmed"
        : booking.status === "approved" && !booking.signed_at && after.depositPaid
          ? "deposit_waiting_signature"
          : "partial";
  await mailFamily(
    deps,
    booking,
    paymentReceivedEmail({ ...(await familyCtx(deps, booking)), amountCents: parsed.data.amountCents, outcome, remainingCents: after.remainingCents, balanceDueDate: booking.balance_due_date }),
    "payment-received-offline",
  );
  return { ok: true, status: booking.status };
}

/* ---------------- refunds: owner-only, Stripe Refunds API ---------------- */

export const refundSchema = z.object({
  paymentId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  /** One per confirm dialog: a double click re-sends the same id → same Stripe refund. */
  requestId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  note: z.string().trim().max(500).optional().default(""),
});

export async function refundPayment(deps: JourneyDeps, id: unknown, body: unknown): Promise<Ok<{ refundedCents: number }> | Fail> {
  const g = await guard(deps, id);
  if (isFail(g)) return g;
  const { admin, b } = g;
  const parsed = refundSchema.safeParse(body);
  if (!parsed.success) return fail(422, "invalid", "Choose a payment and type an amount.");
  if (!deps.stripe.configured()) return fail(503, "unavailable", "Stripe isn't configured.");
  const payments = await deps.db.listPayments(b.id);
  const charge = payments.find((p) => p.id === parsed.data.paymentId);
  if (!charge || charge.booking_id !== b.id) return fail(404, "not_found", "That payment isn't on this booking.");
  const cap = refundableCents(charge, payments);
  if (cap <= 0) return fail(422, "not_refundable", "That payment can't be refunded through Stripe (or is already fully refunded).");
  if (parsed.data.amountCents > cap) {
    return fail(422, "over_cap", `You can refund at most $${(cap / 100).toFixed(2)} of that payment.`);
  }
  const refund = await deps.stripe.createRefund({
    paymentIntentId: charge.stripe_payment_intent_id!,
    amountCents: parsed.data.amountCents,
    idempotencyKey: `txq-refund-${charge.id}-${parsed.data.requestId}`,
    metadata: { source: "txquince-journey", booking_id: b.id, payment_id: charge.id, by: admin },
  });
  const { inserted } = await deps.db.insertPayment({
    booking_id: b.id,
    kind: "refund",
    method: "stripe",
    amount_cents: refund.amount,
    currency: refund.currency || charge.currency,
    refund_of: charge.id,
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: charge.stripe_payment_intent_id,
    stripe_refund_id: refund.id,
    stripe_event_id: null,
    recorded_by: admin,
    note: parsed.data.note || null,
  });
  if (inserted) {
    await logEvent(deps, b.id, "refunded", "admin", { actorEmail: admin, detail: `${refund.amount} cents · ${refund.id}` });
    await mailFamily(deps, b, refundIssuedEmail({ ...(await familyCtx(deps, b)), amountCents: refund.amount, note: parsed.data.note || undefined }), "refund-issued");
  }
  return { ok: true, refundedCents: refund.amount };
}

/* ---------------- messages, notes, delivery ---------------- */

const textSchema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function replyToFamily(deps: JourneyDeps, id: unknown, body: unknown): Promise<Ok | Fail> {
  const g = await guard(deps, id);
  if (isFail(g)) return g;
  const parsed = textSchema.safeParse(body);
  if (!parsed.success) return fail(422, "invalid", "Write a reply.");
  await deps.db.insertMessage({ booking_id: g.b.id, author: "owner", author_email: g.admin, kind: "message", body: parsed.data.body });
  await deps.db.markFamilyMessagesRead(g.b.id, deps.now().toISOString());
  await logEvent(deps, g.b.id, "replied", "admin", { actorEmail: g.admin });
  await mailFamily(deps, g.b, ownerReplyEmail({ ...(await familyCtx(deps, g.b)), body: parsed.data.body }), "owner-reply");
  return { ok: true };
}

export async function addNote(deps: JourneyDeps, id: unknown, body: unknown): Promise<Ok | Fail> {
  const g = await guard(deps, id);
  if (isFail(g)) return g;
  const parsed = textSchema.safeParse(body);
  if (!parsed.success) return fail(422, "invalid", "Write a note.");
  await deps.db.insertNote({ booking_id: g.b.id, author_email: g.admin, body: parsed.data.body });
  return { ok: true };
}

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Links must start with https://");

export const deliverySchema = z.object({
  gallery_url: httpsUrl.optional(),
  video_url: httpsUrl.optional(),
  review_url: httpsUrl.optional(),
  album_status: z.enum(ALBUM_STATUSES).optional(),
  delivery_note: z.string().trim().max(1000).optional(),
  notify: z.boolean().optional().default(false),
});

export const ALBUM_LABEL: Record<(typeof ALBUM_STATUSES)[number], { en: string; es: string }> = {
  not_started: { en: "Not started", es: "Sin empezar" },
  designing: { en: "Designing", es: "En diseño" },
  sent_for_approval: { en: "Sent to you for approval", es: "Enviado para tu aprobación" },
  printing: { en: "Printing", es: "Imprimiendo" },
  shipped: { en: "Shipped", es: "Enviado" },
};

export async function updateDelivery(deps: JourneyDeps, id: unknown, body: unknown): Promise<Ok | Fail> {
  const g = await guard(deps, id);
  if (isFail(g)) return g;
  const parsed = deliverySchema.safeParse(body);
  if (!parsed.success) return fail(422, "invalid", parsed.error.issues[0]?.message ?? "Check the links.");
  if (!["confirmed", "paid_in_full", "completed"].includes(g.b.status)) return stateFail(g.b, "edit delivery");
  const d = parsed.data;
  const patch: Partial<BookingRow> = { delivery_updated_at: deps.now().toISOString() };
  if (d.gallery_url !== undefined) patch.gallery_url = d.gallery_url || null;
  if (d.video_url !== undefined) patch.video_url = d.video_url || null;
  if (d.review_url !== undefined) patch.review_url = d.review_url || null;
  if (d.album_status !== undefined) patch.album_status = d.album_status;
  if (d.delivery_note !== undefined) patch.delivery_note = d.delivery_note || null;
  const row = await deps.db.updateBooking(g.b.id, patch, { status: ["confirmed", "paid_in_full", "completed"] });
  if (!row) return stateFail(g.b, "edit delivery");
  await logEvent(deps, g.b.id, "delivery_updated", "admin", { actorEmail: g.admin });
  if (d.notify) {
    await mailFamily(
      deps,
      row,
      deliveryUpdateEmail({
        ...(await familyCtx(deps, row)),
        hasGallery: Boolean(row.gallery_url),
        hasVideo: Boolean(row.video_url),
        albumLabel: ALBUM_LABEL[row.album_status][row.lang === "es" ? "es" : "en"],
      }),
      "delivery-update",
    );
  }
  return { ok: true };
}

/* ---------------- contract template ---------------- */

export async function saveContractTemplate(deps: JourneyDeps, body: unknown): Promise<Ok<{ template: ContractTemplateRow }> | Fail> {
  const admin = await deps.adminEmail();
  if (!admin) return fail(401, "unauthorized", "Unauthorized");
  const o = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const template = await deps.db.insertTemplate({
    created_by: admin,
    en: normalizeOverrides(o.en),
    es: normalizeOverrides(o.es),
    note: typeof o.note === "string" ? o.note.trim().slice(0, 300) || null : null,
  });
  return { ok: true, template };
}
