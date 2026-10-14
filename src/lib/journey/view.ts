/**
 * view.ts — what a FAMILY may see of their booking. Pure.
 *
 * The private page renders ONLY this projection, never a booking row: no
 * private notes, no event log, no Stripe ids, no admin emails, no attribution,
 * no IP/user agent, no price book. A field not listed here cannot leak through
 * a future component (CLAUDE.md, "queries project before they return").
 */
import type { Agreement } from "@/lib/agreement";
import type { AgreementDraft } from "./contract";
import { ledgerFor } from "./ledger";
import { eventHasPassed } from "./policy";
import type { Status } from "./state";
import { refFor } from "./ref";
import type { AlbumStatus, BookingRow, Lang, MessageKind, PaymentKind, PaymentMethod, PaymentRow, MessageRow } from "./types";

export type FamilyStage =
  | "requested"
  | "sign"
  | "pay_deposit"
  | "booked"
  | "paid_in_full"
  | "delivery"
  | "declined"
  | "expired"
  | "cancelled"
  | "review";

export type FamilyView = {
  ref: string;
  lang: Lang;
  name: string;
  eventDate: string;
  status: Status;
  stage: FamilyStage;
  holdUntil: string | null;
  pkg: {
    tier: string | null;
    hours: number | null;
    addOns: string[];
    venue: string;
    cityLabel: string;
    startTime: string;
    honoree: string;
  };
  money: {
    totalCents: number;
    depositCents: number;
    depositPercent: number;
    paidCents: number;
    refundedCents: number;
    remainingCents: number;
    depositPaid: boolean;
    depositDueCents: number;
    balanceDueDate: string | null;
  };
  agreement: Pick<Agreement, "title" | "intro" | "sections" | "version"> | null;
  signed: { name: string; at: string; signature: string } | null;
  canSign: boolean;
  canPayDeposit: boolean;
  canPayBalance: boolean;
  payments: { kind: PaymentKind; method: PaymentMethod; amountCents: number; at: string }[];
  messages: { author: "family" | "owner"; kind: MessageKind; body: string; at: string }[];
  delivery: {
    galleryUrl: string | null;
    videoUrl: string | null;
    albumStatus: AlbumStatus;
    reviewUrl: string | null;
    note: string | null;
  } | null;
};

export function familyStage(b: Pick<BookingRow, "status" | "signed_at" | "event_date">, depositPaid: boolean, now: Date): FamilyStage {
  const passed = eventHasPassed(b.event_date, now);
  switch (b.status) {
    case "requested":
      return "requested";
    case "approved":
      if (!b.signed_at) return "sign";
      return depositPaid ? "booked" : "pay_deposit";
    case "confirmed":
      return passed ? "delivery" : "booked";
    case "paid_in_full":
      return passed ? "delivery" : "paid_in_full";
    case "completed":
      return "delivery";
    case "declined":
      return "declined";
    case "expired":
      return "expired";
    case "payment_review":
      return "review";
    default:
      return "cancelled";
  }
}

export function familyView(
  b: BookingRow,
  payments: readonly PaymentRow[],
  messages: readonly MessageRow[],
  draft: AgreementDraft | null,
  now: Date,
): FamilyView {
  const l = ledgerFor(b, payments);
  const stage = familyStage(b, l.depositPaid, now);
  const holdLive = (b.status === "requested" || b.status === "approved") && Date.parse(b.expires_at) > now.getTime();
  const signedAgreement = b.signed_at && b.agreement ? b.agreement : null;
  const agreementSrc = signedAgreement ?? (b.status === "approved" ? draft : null);
  const showDelivery = stage === "delivery" || Boolean(b.gallery_url || b.video_url);
  return {
    ref: refFor(b.id),
    lang: b.lang === "es" ? "es" : "en",
    name: b.name,
    eventDate: b.event_date,
    status: b.status,
    stage,
    holdUntil: holdLive ? b.expires_at : null,
    pkg: {
      tier: b.request?.tier ?? (typeof b.metadata?.tier === "string" ? (b.metadata.tier as string) : null),
      hours: b.request?.hours ?? null,
      addOns: b.request?.addOns ?? [],
      venue: b.request?.venue ?? "",
      cityLabel: b.request?.cityLabel ?? "",
      startTime: b.request?.startTime ?? "",
      honoree: b.request?.honoree ?? "",
    },
    money: {
      totalCents: l.totalCents,
      depositCents: l.depositCents,
      depositPercent: b.deposit_percent ?? 25,
      paidCents: l.paidCents,
      refundedCents: l.refundedCents,
      remainingCents: l.remainingCents,
      depositPaid: l.depositPaid,
      depositDueCents: l.depositDueCents,
      balanceDueDate: b.balance_due_date,
    },
    agreement: agreementSrc
      ? { title: agreementSrc.title, intro: agreementSrc.intro, sections: agreementSrc.sections, version: agreementSrc.version }
      : null,
    signed: signedAgreement
      ? { name: signedAgreement.signedName, at: signedAgreement.signedAt, signature: signedAgreement.signature }
      : null,
    canSign: b.status === "approved" && !b.signed_at && holdLive && Boolean(draft),
    canPayDeposit: b.status === "approved" && Boolean(b.signed_at) && !l.depositPaid && holdLive,
    canPayBalance: b.status === "confirmed" && l.remainingCents > 0,
    payments: payments.map((p) => ({ kind: p.kind, method: p.method, amountCents: p.amount_cents, at: p.created_at })),
    messages: messages.map((m) => ({ author: m.author, kind: m.kind, body: m.body, at: m.created_at })),
    delivery: showDelivery
      ? {
          galleryUrl: b.gallery_url,
          videoUrl: b.video_url,
          albumStatus: b.album_status ?? "not_started",
          reviewUrl: b.review_url,
          note: b.delivery_note,
        }
      : null,
  };
}
