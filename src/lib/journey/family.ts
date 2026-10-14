/**
 * family.ts — everything a family can do with their private link. Each
 * operation re-derives its own preconditions from the token and the row:
 * nothing trusts that the page only showed a button when it was allowed.
 */
import "server-only";
import { z } from "zod";
import { ESIGN_CONSENT, renderSignedContractPdf, ContractPdfError, type ContractAuditEvent } from "@/lib/contract-pdf";
import type { SignedAgreement } from "@/lib/agreement";
import { contractSignedEmail } from "@/lib/emails/contract-signed";
import { ownerContractSignedEmail } from "@/lib/emails/owner-contract-signed";
import { ownerMessageEmail } from "@/lib/emails/owner-message";
import { magicLinkEmail } from "@/lib/emails/magic-link";
import { site } from "@/content/site";
import { agreementForBooking } from "./contract";
import {
  closeOpenSessions,
  fail,
  familyCtx,
  logEvent,
  mailFamily,
  mailOwner,
  mintLink,
  ownerCtx,
  resolveToken,
  settle,
  type Fail,
} from "./core";
import { DbConflict } from "./db";
import type { JourneyDeps } from "./deps";
import { ledgerFor } from "./ledger";
import { DAY_MS, LEGACY_PAY_TOKEN_DAYS, todayInDallas, addDays } from "./policy";
import { familyView, type FamilyView } from "./view";
import { HOLDS_DATE } from "./state";
import { refFor, secretsEqual } from "./tokens";
import { MESSAGE_KINDS, type BookingRow, type CheckoutSessionRow, type SessionKind, type StoredAgreement } from "./types";

const NOT_FOUND = () => fail(404, "not_found", "This link isn't valid.");

/* ---------------- the page ---------------- */

export async function loadFamilyView(deps: JourneyDeps, token: unknown): Promise<FamilyView | null> {
  const b = await resolveToken(deps, token);
  if (!b) return null;
  const [payments, messages, template] = await Promise.all([
    deps.db.listPayments(b.id),
    deps.db.listMessages(b.id),
    b.status === "approved" && !b.signed_at ? deps.db.latestTemplate() : Promise.resolve(null),
  ]);
  const draft = b.status === "approved" && !b.signed_at ? agreementForBooking(b, template) : null;
  return familyView(b, payments, messages, draft, deps.now());
}

/* ---------------- sign ---------------- */

export const signSchema = z.object({
  token: z.string().max(64),
  signedName: z.string().trim().min(2).max(120),
  signature: z
    .string()
    .max(560_000)
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/),
  consent: z.literal(true),
  consentVersion: z.string().max(40),
});

export async function signAgreement(
  deps: JourneyDeps,
  body: unknown,
  ctx: { ip: string; userAgent: string },
): Promise<{ ok: true; contractReady: boolean } | Fail> {
  const parsed = signSchema.safeParse(body);
  const b = await resolveToken(deps, (body as { token?: unknown })?.token);
  if (!b) return NOT_FOUND();
  if (!parsed.success) return fail(422, "invalid", b.lang === "es" ? "Revisa tu nombre, tu firma y la casilla." : "Please check your name, your signature and the box.");
  const input = parsed.data;
  if (input.consentVersion !== ESIGN_CONSENT.version) {
    return fail(409, "consent_changed", b.lang === "es" ? "Actualizamos el texto. Recarga la página." : "We updated the wording. Please reload the page.");
  }
  if (b.signed_at) return fail(409, "already_signed", b.lang === "es" ? "Este contrato ya está firmado." : "This agreement is already signed.");
  if (b.status !== "approved") return fail(409, "not_ready", b.lang === "es" ? "Todavía no se puede firmar." : "This booking can't be signed right now.");
  if (Date.parse(b.expires_at) <= deps.now().getTime()) {
    return fail(410, "hold_expired", b.lang === "es" ? "El plazo venció. Escríbenos." : "Your hold has ended. Please write to us.");
  }

  const draft = agreementForBooking(b, await deps.db.latestTemplate());
  if (!draft) return fail(409, "not_ready", "Please write to us to sign.");
  const signedAt = deps.now().toISOString();
  const { templateVersion, ...agreementOnly } = draft;
  const signed: SignedAgreement = {
    ...agreementOnly,
    signedName: input.signedName,
    signature: input.signature,
    signedAt,
    ip: ctx.ip,
    userAgent: ctx.userAgent.slice(0, 300),
    sharePermission: b.request?.sharePermission ?? true,
  };

  // Audit trail that goes into the PDF (and the event log below).
  const prior = await deps.db.listEvents(b.id);
  const audit: ContractAuditEvent[] = [
    ...prior
      .filter((e) => !e.event.startsWith("email:"))
      .map((e) => ({ at: e.at, event: e.event, actor: e.actor, ip: e.ip ?? undefined, userAgent: e.user_agent ?? undefined, detail: e.detail ?? undefined })),
    { at: signedAt, event: "consented", actor: "client", ip: ctx.ip, userAgent: ctx.userAgent, detail: `esign ${ESIGN_CONSENT.version}` },
    { at: signedAt, event: "signed", actor: "client", ip: ctx.ip, userAgent: ctx.userAgent, detail: `agreement ${signed.version}` },
  ];

  // Render first: it validates the signature PNG before anything is saved.
  let pdf: { pdf: Uint8Array; sha256: string; filename: string };
  try {
    pdf = await renderSignedContractPdf({ ref: refFor(b.id), agreement: signed, audit, generatedAt: signedAt });
  } catch (err) {
    if (err instanceof ContractPdfError) {
      return fail(422, err.code, b.lang === "es" ? "No pudimos leer tu firma. Intenta de nuevo." : "We couldn't read your signature. Please try again.");
    }
    throw err;
  }

  const stored: StoredAgreement = {
    ...signed,
    consentVersion: ESIGN_CONSENT.version,
    consentText: ESIGN_CONSENT[b.lang === "es" ? "es" : "en"],
    templateVersion,
    sha256: pdf.sha256,
  };
  let row: BookingRow | null;
  try {
    // Immutable once signed: only lands while status is approved AND signed_at is null.
    row = await deps.db.updateBooking(
      b.id,
      { signed_at: signedAt, agreement: stored, contract_sha256: pdf.sha256 },
      { status: ["approved"], isNull: ["signed_at"] },
    );
  } catch (err) {
    if (err instanceof DbConflict && err.code === "immutable") row = null;
    else throw err;
  }
  if (!row) return fail(409, "already_signed", b.lang === "es" ? "Este contrato ya está firmado." : "This agreement is already signed.");

  await logEvent(deps, b.id, "consented", "client", { ip: ctx.ip, userAgent: ctx.userAgent, detail: `esign ${ESIGN_CONSENT.version}` });
  await logEvent(deps, b.id, "signed", "client", {
    ip: ctx.ip,
    userAgent: ctx.userAgent,
    detail: `agreement ${signed.version} · template v${templateVersion} · esign ${ESIGN_CONSENT.version} · sha256 ${pdf.sha256}`,
  });

  const key = `contracts/${b.id}/${pdf.sha256}.pdf`;
  let contractReady = false;
  try {
    contractReady = await deps.contracts.put(key, pdf.pdf);
    if (contractReady) await deps.db.updateBooking(b.id, { contract_pdf_key: key });
    await logEvent(deps, b.id, contractReady ? "contract_pdf_stored" : "contract_pdf_not_stored", "system", { detail: key });
  } catch (err) {
    console.error("[journey] contract store failed:", err);
    await logEvent(deps, b.id, "contract_pdf_not_stored", "system", { detail: String(err) });
  }

  const { booking } = await settle(deps, b.id, "client");
  const l = ledgerFor(booking, await deps.db.listPayments(b.id));
  const attachment = [{ filename: pdf.filename, content: pdf.pdf, contentType: "application/pdf" }];
  await Promise.all([
    mailFamily(
      deps,
      booking,
      contractSignedEmail({ ...(await familyCtx(deps, booking)), agreement: stored, depositCents: l.depositDueCents || booking.deposit_amount_cents, depositPaid: l.depositPaid }),
      "contract-signed",
      attachment,
    ),
    mailOwner(
      deps,
      b.id,
      ownerContractSignedEmail({ ...ownerCtx(deps, booking), signedName: stored.signedName, ip: ctx.ip, sha256: pdf.sha256, depositPaid: l.depositPaid }),
      "owner-contract-signed",
      attachment,
    ),
  ]);
  return { ok: true, contractReady };
}

/* ---------------- the signed PDF ---------------- */

/** Serves the stored PDF; regenerates it from the stored agreement if storage lost it. */
export async function contractPdfFor(deps: JourneyDeps, b: BookingRow): Promise<{ pdf: Uint8Array; filename: string } | null> {
  if (!b.signed_at || !b.agreement) return null;
  const filename = `${refFor(b.id)}-agreement.pdf`;
  if (b.contract_pdf_key) {
    const stored = await deps.contracts.get(b.contract_pdf_key).catch(() => null);
    if (stored) return { pdf: stored, filename };
  }
  const events = await deps.db.listEvents(b.id);
  const out = await renderSignedContractPdf({
    ref: refFor(b.id),
    agreement: b.agreement,
    audit: events
      .filter((e) => !e.event.startsWith("email:"))
      .map((e) => ({ at: e.at, event: e.event, actor: e.actor, ip: e.ip ?? undefined, userAgent: e.user_agent ?? undefined, detail: e.detail ?? undefined })),
    generatedAt: deps.now().toISOString(),
  });
  return { pdf: out.pdf, filename };
}

/* ---------------- pay (deposit / balance) ---------------- */

const MIN_SESSION_MS = 31 * 60 * 1000; // Stripe's floor is 30 minutes
const MAX_SESSION_MS = 23 * 3600 * 1000;
const REUSE_IF_LEFT_MS = 10 * 60 * 1000;

export const paySchema = z.object({ token: z.string().max(64), kind: z.enum(["deposit", "balance"]) });

/**
 * The family clicks "Pay deposit" / "Pay balance". Only they start a charge;
 * nothing here ever charges on its own. The amount always comes from the
 * booking's snapshot and ledger, never from the request.
 */
export async function startCheckout(deps: JourneyDeps, body: unknown): Promise<{ ok: true; url: string } | Fail> {
  const b = await resolveToken(deps, (body as { token?: unknown })?.token);
  if (!b) return NOT_FOUND();
  const parsed = paySchema.safeParse(body);
  if (!parsed.success) return fail(400, "invalid", "Invalid request.");
  const kind: SessionKind = parsed.data.kind;
  const es = b.lang === "es";
  if (!deps.stripe.configured()) return fail(503, "unavailable", es ? "Los pagos no están disponibles por un momento." : "Payments are briefly unavailable.");

  const l = ledgerFor(b, await deps.db.listPayments(b.id));
  const now = deps.now();
  let amount = 0;
  if (kind === "deposit") {
    if (b.status !== "approved") return fail(409, "not_ready", es ? "Todavía no se puede pagar el depósito." : "The deposit can't be paid right now.");
    if (!b.signed_at) return fail(409, "sign_first", es ? "Primero firma tu contrato." : "Please sign your agreement first.");
    if (l.depositPaid) return fail(409, "already_paid", es ? "Tu depósito ya está pagado." : "Your deposit is already paid.");
    if (Date.parse(b.expires_at) <= now.getTime()) return fail(410, "hold_expired", es ? "El plazo venció. Escríbenos." : "Your hold has ended. Please write to us.");
    amount = l.depositDueCents;
  } else {
    if (b.status !== "confirmed") return fail(409, "not_ready", es ? "El saldo no se puede pagar ahora." : "The balance can't be paid right now.");
    if (l.remainingCents <= 0) return fail(409, "already_paid", es ? "Ya no debes nada." : "Nothing is left to pay.");
    amount = l.remainingCents;
  }

  const sessions = await deps.db.listSessions(b.id, { kind });
  if (sessions.some((s) => s.status === "processing")) {
    return fail(409, "processing", es ? "Tu pago se está procesando." : "Your payment is processing.");
  }
  // Reuse a still-open session for the same amount (double clicks, back button).
  const reusable = sessions.find(
    (s: CheckoutSessionRow) =>
      s.status === "open" && s.amount_cents === amount && s.url && Date.parse(s.expires_at) - now.getTime() > REUSE_IF_LEFT_MS,
  );
  if (reusable?.url) return { ok: true, url: reusable.url };

  // Expire anything superseded first (audit H2). If one was already paid, stop.
  const closed = await closeOpenSessions(deps, b.id, kind);
  if (closed.inFlight) return fail(409, "processing", es ? "Tu pago se está procesando." : "Your payment is processing.");

  const back = `${deps.siteUrl()}${es ? "/es/mi-reserva" : "/my/booking"}/${(body as { token: string }).token}`;
  // Idempotency: two clicks in the same minute send byte-identical params under
  // the same key, so Stripe returns ONE session. A replaced session bumps the
  // count, so the next attempt gets a new key (never the expired session back).
  const minute = Math.floor(now.getTime() / 60_000) * 60_000;
  const holdLeft = kind === "deposit" ? Date.parse(b.expires_at) - minute : MAX_SESSION_MS;
  const expiresAt = new Date(minute + Math.max(MIN_SESSION_MS, Math.min(MAX_SESSION_MS, holdLeft)));
  const attempt = (await deps.db.listSessions(b.id, { kind })).length;
  const date = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${b.event_date}T12:00:00Z`),
  );
  const label = kind === "deposit" ? (es ? "Depósito" : "Deposit") : es ? "Saldo" : "Balance";
  const session = await deps.stripe.createCheckoutSession({
    amountCents: amount,
    currency: b.currency || "usd",
    productName: `${site.brand} — ${label} · ${refFor(b.id)}`,
    productDescription: es ? `Quinceañera, ${date}` : `Quinceañera on ${date}`,
    paymentDescription: `TX Quince ${kind} — ${refFor(b.id)} — ${date}`,
    clientReferenceId: b.id,
    customerEmail: b.email,
    locale: es ? "es" : "en",
    successUrl: `${back}?paid=1`,
    cancelUrl: back,
    expiresAt,
    idempotencyKey: `txq-${b.id}-${kind}-${amount}-${attempt}-${minute}`,
    metadata: { source: "txquince-journey", flow: "journey", booking_id: b.id, kind, amount_cents: amount },
  });
  if (!session.url) throw new Error("Stripe returned no checkout url");
  try {
    await deps.db.insertSession({ id: session.id, booking_id: b.id, kind, amount_cents: amount, url: session.url, expires_at: expiresAt.toISOString() });
  } catch (err) {
    // Same idempotency key twice (a double click) → same session id; already recorded.
    if (!(await deps.db.getSession(session.id))) throw err;
  }
  await logEvent(deps, b.id, `checkout_started:${kind}`, "client", { detail: `${amount} cents` });
  return { ok: true, url: session.url };
}

/* ---------------- messages ---------------- */

export const messageSchema = z.object({
  token: z.string().max(64),
  kind: z.enum(MESSAGE_KINDS),
  body: z.string().trim().min(1).max(4000),
});

/** A question or a change/cancel request. It is only a message: nothing changes on its own. */
export async function postFamilyMessage(deps: JourneyDeps, body: unknown): Promise<{ ok: true } | Fail> {
  const b = await resolveToken(deps, (body as { token?: unknown })?.token);
  if (!b) return NOT_FOUND();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return fail(422, "invalid", b.lang === "es" ? "Escribe tu mensaje." : "Please write your message.");
  if (await deps.rateLimit("family-message", b.id, 10, 3600_000)) {
    return fail(429, "rate_limited", b.lang === "es" ? "Demasiados mensajes. Intenta más tarde." : "Too many messages. Please try again later.");
  }
  const m = await deps.db.insertMessage({ booking_id: b.id, author: "family", author_email: null, kind: parsed.data.kind, body: parsed.data.body });
  await logEvent(deps, b.id, `message:${m.kind}`, "client");
  await mailOwner(deps, b.id, ownerMessageEmail({ ...ownerCtx(deps, b), kind: m.kind, body: m.body }), "owner-message");
  return { ok: true };
}

/* ---------------- "Email me my link" ---------------- */

export const MAGIC_LINK_RESPONSE = {
  ok: true,
  message: "If that email has a booking with us, we just sent its link. Check your inbox (and spam).",
  message_es: "Si ese correo tiene una reservación con nosotros, te enviamos el enlace. Revisa tu bandeja (y spam).",
} as const;

/**
 * Looks up bookings for an email and mails fresh links ONLY to the stored
 * address. The caller always returns MAGIC_LINK_RESPONSE, whatever happens
 * here, and runs this after the response — so the answer and its timing are
 * the same for known and unknown emails.
 */
export async function sendMagicLinks(deps: JourneyDeps, email: string, lang: "en" | "es"): Promise<number> {
  const since = addDays(todayInDallas(deps.now()), -365);
  const rows = (await deps.db.listBookings({ email: email.toLowerCase(), limit: 20 })).filter(
    (b) => b.email.toLowerCase() === email.toLowerCase() && b.event_date >= since && (HOLDS_DATE.includes(b.status) || b.status === "payment_review"),
  );
  if (!rows.length) return 0;
  const links = [];
  for (const b of rows) {
    links.push({ eventDate: b.event_date, ref: refFor(b.id), link: await mintLink(deps, { ...b, lang: rows[0]!.lang ?? lang }, "magic_link") });
    await logEvent(deps, b.id, "magic_link_sent", "system");
  }
  const built = magicLinkEmail({ lang: rows[0]!.lang ?? lang, links });
  await deps.mail({ to: rows[0]!.email, ...built, tag: "magic-link" });
  return rows.length;
}

/* ---------------- legacy /booking/{id}?t= links ---------------- */

/**
 * Old approval emails linked to /booking/{id}?t={payToken}. If the pay token
 * still matches (constant time) and is younger than LEGACY_PAY_TOKEN_DAYS,
 * mint a new private link and return it for a redirect. Otherwise null → 404.
 */
export async function legacyRedirect(deps: JourneyDeps, id: string, t: string | undefined): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const b = await deps.db.getBooking(id);
  const legacy = (b?.metadata?.agreement ?? b?.agreement) as { payToken?: string; approvedAt?: string } | null | undefined;
  const expected = legacy?.payToken;
  if (!b || !secretsEqual(expected, t ?? "")) return null;
  const approvedAt = Date.parse(legacy?.approvedAt ?? "");
  if (!Number.isFinite(approvedAt) || deps.now().getTime() - approvedAt > LEGACY_PAY_TOKEN_DAYS * DAY_MS) return null;
  if (!["approved", "confirmed", "paid_in_full", "completed", "payment_review"].includes(b.status)) return null;
  const url = await mintLink(deps, b, "legacy");
  await logEvent(deps, b.id, "legacy_link_upgraded", "client");
  return url;
}
