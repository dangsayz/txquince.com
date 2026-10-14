/**
 * types.ts — row shapes for the journey tables (migration 0023).
 * Server-side only in practice; the family ever sees only `FamilyView`
 * (src/lib/journey/view.ts), never one of these rows.
 */
import type { AddOnId, Crew, PriceBook, TierId } from "@/lib/commission";
import type { SignedAgreement } from "@/lib/agreement";
import type { Status } from "./state";

export type Lang = "en" | "es";

/** What the family asked for (bookings.request). Never contains prices. */
export type BookingRequestDetails = {
  tier: TierId;
  addOns: AddOnId[];
  hours: number;
  crew: Crew;
  city: string;
  cityLabel: string;
  venue: string;
  startTime: string;
  honoree: string;
  scope: string;
  note: string;
  sharePermission: boolean;
};

export const ALBUM_STATUSES = ["not_started", "designing", "sent_for_approval", "printing", "shipped"] as const;
export type AlbumStatus = (typeof ALBUM_STATUSES)[number];

/** Signed agreement as stored on the booking: the PDF agent's SignedAgreement + audit fields. */
export type StoredAgreement = SignedAgreement & {
  consentVersion: string;
  consentText: string;
  /** Contract template version the text was built from (0 = built-in wording). */
  templateVersion: number;
  sha256: string;
};

export type BookingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string;
  package: string;
  notes: string | null;
  status: Status;
  deposit_amount_cents: number;
  currency: string;
  expires_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  lang: Lang;
  total_cents: number | null;
  balance_cents: number | null;
  deposit_percent: number | null;
  balance_due_days: number | null;
  balance_due_date: string | null;
  price_book: PriceBook | null;
  request: BookingRequestDetails | null;
  approved_at: string | null;
  declined_at: string | null;
  signed_at: string | null;
  agreement: StoredAgreement | null;
  contract_sha256: string | null;
  contract_pdf_key: string | null;
  confirmed_at: string | null;
  paid_in_full_at: string | null;
  completed_at: string | null;
  gallery_url: string | null;
  video_url: string | null;
  album_status: AlbumStatus;
  review_url: string | null;
  delivery_note: string | null;
  delivery_updated_at: string | null;
  metadata: Record<string, unknown> | null;
};

export type NewBooking = Pick<
  BookingRow,
  | "name"
  | "email"
  | "phone"
  | "event_date"
  | "package"
  | "notes"
  | "status"
  | "deposit_amount_cents"
  | "currency"
  | "expires_at"
  | "lang"
  | "total_cents"
  | "balance_cents"
  | "deposit_percent"
  | "balance_due_days"
  | "balance_due_date"
  | "price_book"
  | "request"
  | "metadata"
> & { attribution?: unknown };

export type AccessTokenRow = {
  token_hash: string;
  booking_id: string;
  purpose: "request" | "email" | "magic_link" | "legacy" | "admin";
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
};

export type EventActor = "client" | "admin" | "system";
export type BookingEventRow = {
  id: string;
  booking_id: string;
  at: string;
  event: string;
  actor: EventActor;
  actor_email: string | null;
  ip: string | null;
  user_agent: string | null;
  detail: string | null;
};

export type PaymentKind = "deposit" | "balance" | "payment" | "refund";
export type PaymentMethod = "stripe" | "zelle" | "cash" | "check" | "other";
export type PaymentRow = {
  id: string;
  booking_id: string;
  created_at: string;
  kind: PaymentKind;
  method: PaymentMethod;
  amount_cents: number;
  currency: string;
  refund_of: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_refund_id: string | null;
  stripe_event_id: string | null;
  recorded_by: string | null;
  note: string | null;
};
export type NewPayment = Omit<PaymentRow, "id" | "created_at">;

export type SessionKind = "deposit" | "balance";
export type SessionStatus = "open" | "processing" | "complete" | "expired";
export type CheckoutSessionRow = {
  id: string;
  booking_id: string;
  kind: SessionKind;
  amount_cents: number;
  url: string | null;
  status: SessionStatus;
  expires_at: string;
  created_at: string;
  completed_at: string | null;
};

export const REMINDER_KINDS = [
  "balance_30",
  "balance_14",
  "balance_7",
  "balance_1",
  "balance_overdue",
  "owner_unapproved",
  "owner_unpaid",
  "family_unsigned",
  "hold_expired",
] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];
export type ReminderRow = { booking_id: string; kind: ReminderKind; sent_at: string };

export const MESSAGE_KINDS = ["message", "change_date", "change_time", "change_package", "cancel"] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number];
export type MessageRow = {
  id: string;
  booking_id: string;
  created_at: string;
  author: "family" | "owner";
  author_email: string | null;
  kind: MessageKind;
  body: string;
  read_at: string | null;
};

export type NoteRow = { id: string; booking_id: string; created_at: string; author_email: string; body: string };

/** Per-language overrides an owner can save at /admin/bookings/contract. */
export type TemplateLangOverrides = {
  /** Replaces the "Changes and cancellations" lines. */
  changes?: string[];
  /** Extra sections appended before "Your photos and videos". */
  extra?: { title: string; lines: string[] }[];
};
export type ContractTemplateRow = {
  version: number;
  created_at: string;
  created_by: string;
  en: TemplateLangOverrides;
  es: TemplateLangOverrides;
  note: string | null;
};
