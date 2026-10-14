/**
 * request.ts — step 1: a family requests a date (no signature, no money).
 *
 * Guards, in order (the route adds honeypot + rate limit + Turnstile first):
 *   - the request schema (commissionSchema minus signing; extra fields ignored)
 *   - lead time ≥ MIN_LEAD_DAYS
 *   - the server re-prices with its own book; a stale tab gets `prices_changed`
 *   - this email already holds this date → 409 already_requested. We NEVER
 *     expire an existing hold on someone's behalf (audit: "re-signing with
 *     someone's email+date expires their hold").
 *   - at most MAX_OPEN_REQUESTS_PER_EMAIL unapproved requests per email (M1)
 *   - the partial unique index makes the date itself un-double-bookable.
 */
import "server-only";
import { describeCommission, type CommissionRequest } from "@/lib/commission";
import { bookingRequestSchema, requestDetails, serviceFor, snapshotFromBook } from "@/lib/booking-request";
import { sanitizeAttribution } from "@/lib/attribution";
import { site } from "@/content/site";
import { requestReceivedEmail } from "@/lib/emails/request-received";
import { ownerNewRequestEmail } from "@/lib/emails/owner-new-request";
import { DbConflict } from "./db";
import type { JourneyDeps } from "./deps";
import { fail, logEvent, mailFamily, mailOwner, mintLink, ownerCtx, type Fail } from "./core";
import { DAY_MS, MAX_OPEN_REQUESTS_PER_EMAIL, meetsLeadTime, MIN_LEAD_DAYS } from "./policy";
import { HOLDS_DATE } from "./state";
import { refFor } from "./tokens";

export type RequestOk = { ok: true; ref: string; holdDays: number; link: string; bookingId: string };

export async function createRequest(
  deps: JourneyDeps,
  body: Record<string, unknown>,
  ctx: { ip: string; userAgent: string },
): Promise<RequestOk | (Fail & { fieldErrors?: Record<string, string[] | undefined>; book?: unknown })> {
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ...fail(422, "invalid", "Please check the highlighted fields."), fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const r = parsed.data;
  const now = deps.now();

  if (!meetsLeadTime(r.event_date, now)) {
    return fail(
      422,
      "too_soon",
      r.language === "es"
        ? `Necesitamos al menos ${MIN_LEAD_DAYS} días de anticipación. Escríbenos y vemos qué podemos hacer.`
        : `We need at least ${MIN_LEAD_DAYS} days' notice. Write to us and we'll see what we can do.`,
    );
  }

  const book = await deps.priceBook();
  const snap = snapshotFromBook(r, book);
  if (
    (r.quoted_total_usd !== undefined && r.quoted_total_usd !== snap.quote.totalUsd) ||
    (r.quoted_deposit_usd !== undefined && r.quoted_deposit_usd !== snap.quote.retainerUsd)
  ) {
    return {
      ...fail(409, "prices_changed", "Our prices were just updated. Please review your new total and send again."),
      book,
    };
  }

  // Same email already holds this date: point them to their link, never replace it.
  const mine = await deps.db.listBookings({ email: r.email, statuses: HOLDS_DATE, limit: 50 });
  if (mine.some((b) => b.event_date === r.event_date)) {
    return fail(
      409,
      "already_requested",
      r.language === "es"
        ? "Ya tienes una solicitud para esa fecha. Te podemos enviar tu enlace por correo."
        : "You already have a request for that date. We can email you your link.",
    );
  }
  if (mine.filter((b) => b.status === "requested").length >= MAX_OPEN_REQUESTS_PER_EMAIL) {
    return fail(
      429,
      "too_many_requests",
      r.language === "es"
        ? "Ya tienes solicitudes esperando respuesta. Te escribimos pronto."
        : "You already have requests waiting for our reply. We'll write to you soon.",
    );
  }

  const details = requestDetails(r, snap.quote);
  // describeCommission still wants the old shape; it only prints `signed_name`.
  const summary = describeCommission({ ...r, signed_name: "(signs after approval)" } as unknown as CommissionRequest, snap.quote, book)
    .split("\n")
    .filter((l) => !l.startsWith("Signed by:"))
    .join("\n");

  let booking;
  try {
    booking = await deps.db.insertBooking({
      name: r.name,
      email: r.email,
      phone: r.phone || null,
      event_date: r.event_date,
      package: serviceFor(r),
      notes: summary,
      status: "requested",
      deposit_amount_cents: snap.depositCents,
      currency: site.booking.currency,
      expires_at: new Date(now.getTime() + book.holdDays * DAY_MS).toISOString(),
      lang: r.language,
      total_cents: snap.totalCents,
      balance_cents: snap.balanceCents,
      deposit_percent: snap.depositPercent,
      balance_due_days: snap.balanceDueDays,
      balance_due_date: snap.balanceDueDate,
      price_book: snap.book,
      request: details,
      metadata: { source: "commission", flow: "journey", tier: r.tier, language: r.language },
      attribution: sanitizeAttribution(body.attribution),
    });
  } catch (err) {
    if (err instanceof DbConflict && (err.code === "date_taken" || err.code === "already_requested")) {
      return fail(409, err.code, r.language === "es" ? "Otra familia acaba de apartar esa fecha." : "That date was just reserved by another family.");
    }
    throw err;
  }

  await logEvent(deps, booking.id, "requested", "client", { ip: ctx.ip, userAgent: ctx.userAgent, detail: `hold ${book.holdDays} days` });
  const link = await mintLink(deps, booking, "request");

  const openForEmail = mine.filter((b) => b.status === "requested").length + 1;
  await Promise.all([
    mailFamily(
      deps,
      booking,
      requestReceivedEmail({
        lang: booking.lang,
        name: booking.name,
        eventDate: booking.event_date,
        ref: refFor(booking.id),
        link,
        holdUntil: booking.expires_at.slice(0, 10),
        totalCents: snap.totalCents,
        depositCents: snap.depositCents,
        depositPercent: snap.depositPercent,
      }),
      "request-received",
    ),
    mailOwner(
      deps,
      booking.id,
      ownerNewRequestEmail({ ...ownerCtx(deps, booking), summary, totalCents: snap.totalCents, openRequestsForEmail: openForEmail, ip: ctx.ip }),
      "owner-new-request",
    ),
  ]);

  return { ok: true, ref: refFor(booking.id), holdDays: book.holdDays, link, bookingId: booking.id };
}
