/**
 * core.ts — shared building blocks for every journey operation: guarded
 * transitions, the one "settle" step that moves a booking forward after money
 * or a signature, private links, the event log, Stripe-session cleanup and
 * email plumbing. Server-only.
 */
import "server-only";
import type { Built } from "@/lib/emails/layout";
import type { Attachment } from "@/lib/emails/transport";
import type { FamilyCtx, OwnerCtx } from "@/lib/emails/context";
import { DbConflict } from "./db";
import type { JourneyDeps } from "./deps";
import { ledgerFor, paidInFull, readyToConfirm } from "./ledger";
import { addDays, DAY_MS, LINK_DAYS_AFTER_EVENT, LINK_MIN_DAYS } from "./policy";
import { canTransition, sourcesOf, type Status } from "./state";
import { hashesEqual, hashToken, looksLikeToken, newToken, refFor } from "./tokens";
import type { AccessTokenRow, BookingRow, EventActor, Lang, SessionKind } from "./types";

export type Fail = { ok: false; status: number; code: string; error: string };
export const fail = (status: number, code: string, error: string): Fail => ({ ok: false, status, code, error });

/* ---------------- private links ---------------- */

export function familyUrl(deps: JourneyDeps, lang: Lang, token: string): string {
  return `${deps.siteUrl()}${lang === "es" ? "/es/mi-reserva" : "/my/booking"}/${token}`;
}

/** Mint a new private link for this booking. Only its hash is stored. */
export async function mintLink(
  deps: JourneyDeps,
  b: Pick<BookingRow, "id" | "event_date" | "lang">,
  purpose: AccessTokenRow["purpose"],
): Promise<string> {
  const token = newToken();
  const now = deps.now();
  const byEvent = Date.parse(`${addDays(b.event_date, LINK_DAYS_AFTER_EVENT)}T23:59:59Z`);
  const expires = new Date(Math.max(byEvent, now.getTime() + LINK_MIN_DAYS * DAY_MS));
  await deps.db.insertAccessToken({
    token_hash: hashToken(token),
    booking_id: b.id,
    purpose,
    expires_at: expires.toISOString(),
  });
  return familyUrl(deps, b.lang, token);
}

const DUMMY_HASH = "0".repeat(64);

/**
 * Token → booking, or null. Every miss (bad shape, unknown, revoked, expired)
 * returns the same null after the same constant-time compare, and the caller
 * turns it into the same 404.
 */
export async function resolveToken(deps: JourneyDeps, token: unknown): Promise<BookingRow | null> {
  const hash = looksLikeToken(token) ? hashToken(token) : DUMMY_HASH;
  const row = hash === DUMMY_HASH ? null : await deps.db.findAccessToken(hash);
  const match = hashesEqual(row?.token_hash ?? DUMMY_HASH, hash) && row !== null;
  if (!match || !row || row.revoked_at || Date.parse(row.expires_at) <= deps.now().getTime()) return null;
  const booking = await deps.db.getBooking(row.booking_id);
  if (!booking || booking.id !== row.booking_id) return null;
  void deps.db.touchAccessToken(hash, deps.now().toISOString()).catch(() => undefined);
  return booking;
}

/* ---------------- events ---------------- */

export async function logEvent(
  deps: JourneyDeps,
  bookingId: string,
  event: string,
  actor: EventActor,
  extra: { actorEmail?: string | null; ip?: string | null; userAgent?: string | null; detail?: string | null } = {},
) {
  await deps.db.insertEvent({
    booking_id: bookingId,
    event,
    actor,
    actor_email: extra.actorEmail ?? null,
    ip: extra.ip ?? null,
    user_agent: extra.userAgent ? extra.userAgent.slice(0, 300) : null,
    detail: extra.detail ? extra.detail.slice(0, 4000) : null,
  });
}

/* ---------------- guarded transitions ---------------- */

export type TransitionResult = { ok: true; booking: BookingRow } | { ok: false; reason: "state" | "date_taken" };

/**
 * Move a booking to `to`. The WHERE clause is `status in (from ∩ sourcesOf(to))`
 * — the state check and the write are one statement.
 */
export async function transition(
  deps: JourneyDeps,
  id: string,
  from: readonly Status[] | "any",
  to: Status,
  patch: Partial<BookingRow> = {},
): Promise<TransitionResult> {
  const sources = sourcesOf(to);
  const allowed = from === "any" ? sources : from.filter((s) => canTransition(s, to));
  if (!allowed.length) return { ok: false, reason: "state" };
  try {
    const row = await deps.db.updateBooking(id, { ...patch, status: to }, { status: allowed });
    return row ? { ok: true, booking: row } : { ok: false, reason: "state" };
  } catch (err) {
    if (err instanceof DbConflict && err.code === "date_taken") return { ok: false, reason: "date_taken" };
    throw err;
  }
}

/**
 * After a signature or a payment: move the booking forward if (and only if)
 * the rules say so. approved → confirmed needs signed AND deposit paid;
 * confirmed → paid_in_full needs nothing left to pay. Idempotent — calling it
 * twice changes nothing the second time.
 */
export async function settle(deps: JourneyDeps, bookingId: string, actor: EventActor): Promise<{ booking: BookingRow; changed: Status[] }> {
  const changed: Status[] = [];
  let b = await deps.db.getBooking(bookingId);
  if (!b) throw new Error(`settle: booking ${bookingId} vanished`);
  for (let i = 0; i < 3; i++) {
    const l = ledgerFor(b, await deps.db.listPayments(bookingId));
    const nowIso = deps.now().toISOString();
    let to: Status | null = null;
    let patch: Partial<BookingRow> = {};
    if (b.status === "approved" && readyToConfirm(b, l)) {
      to = "confirmed";
      patch = { confirmed_at: nowIso, paid_at: b.paid_at ?? nowIso };
    } else if (b.status === "confirmed" && paidInFull(l)) {
      to = "paid_in_full";
      patch = { paid_in_full_at: nowIso };
    }
    if (!to) break;
    const r = await transition(deps, bookingId, [b.status], to, patch);
    if (!r.ok) {
      const fresh = await deps.db.getBooking(bookingId);
      if (!fresh) break;
      b = fresh;
      continue;
    }
    b = r.booking;
    changed.push(to);
    await logEvent(deps, bookingId, to, actor === "admin" ? "admin" : "system");
  }
  return { booking: b, changed };
}

/* ---------------- Stripe sessions ---------------- */

/**
 * Expire every open Checkout session for this booking (optionally one kind).
 * Returns inFlight=true when one had already been paid or is processing — the
 * caller must then NOT pretend nothing was paid.
 */
export async function closeOpenSessions(deps: JourneyDeps, bookingId: string, kind?: SessionKind): Promise<{ inFlight: boolean; expired: number }> {
  const sessions = await deps.db.listSessions(bookingId, { kind, status: ["open", "processing"] });
  let inFlight = false;
  let expired = 0;
  for (const s of sessions) {
    if (s.status === "processing") {
      inFlight = true;
      continue;
    }
    let status: string | null = "expired";
    if (deps.stripe.configured()) {
      const res = await deps.stripe.expireCheckoutSession(s.id);
      status = res.status;
      if (res.status === "complete") {
        inFlight = true;
        await deps.db.updateSession(s.id, { status: res.payment_status === "paid" ? "complete" : "processing" }, ["open"]);
        continue;
      }
    }
    if (status === "expired" || !deps.stripe.configured()) {
      if (await deps.db.updateSession(s.id, { status: "expired" }, ["open"])) expired++;
    }
  }
  return { inFlight, expired };
}

/* ---------------- email plumbing ---------------- */

export async function familyCtx(deps: JourneyDeps, b: BookingRow): Promise<FamilyCtx> {
  return {
    lang: b.lang === "es" ? "es" : "en",
    name: b.name,
    eventDate: b.event_date,
    ref: refFor(b.id),
    link: await mintLink(deps, b, "email"),
  };
}

export function adminUrl(deps: JourneyDeps, id: string) {
  return `${deps.siteUrl()}/admin/bookings/${id}`;
}

export function ownerCtx(deps: JourneyDeps, b: BookingRow): OwnerCtx {
  return { name: b.name, email: b.email, eventDate: b.event_date, ref: refFor(b.id), adminUrl: adminUrl(deps, b.id) };
}

/** Send to the family's STORED address only (never an address from a request body). */
export async function mailFamily(deps: JourneyDeps, b: BookingRow, built: Built, tag: string, attachments?: Attachment[]) {
  const r = await deps.mail({ to: b.email, ...built, tag, attachments });
  await logEvent(deps, b.id, `email:${tag}`, "system", { detail: r.ok ? (r.sink ? "sink" : "sent") : `failed: ${r.error}` });
  return r;
}

export async function mailOwner(deps: JourneyDeps, bookingId: string | null, built: Built, tag: string, attachments?: Attachment[]) {
  const to = deps.ownerEmail();
  if (!to) return { ok: false, error: "no-owner-email" };
  const r = await deps.mail({ to, ...built, tag, attachments });
  if (bookingId) await logEvent(deps, bookingId, `email:${tag}`, "system", { detail: r.ok ? "owner" : `owner failed: ${r.error}` });
  return r;
}
