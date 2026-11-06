import { StudioPage } from "@/components/admin/StudioPage";
import { getBookings, countPaid, type BookingRow } from "@/lib/clients-db";
import { formatEventDate, formatMoney, packageLabel } from "@/lib/booking";
import { BookingActions } from "@/components/admin/BookingActions";
import { TIER_NAME_EN, type TierId } from "@/lib/commission";
import { isSignedAgreement } from "@/lib/agreement";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const COLLECTION_LABEL: Record<string, string> = {
  moments: "Moments",
  essential: "Essential",
  signature: "Signature",
  legacy: "Legacy",
};

function statusPill(status: string, signed: boolean): { label: string; cls: string } {
  switch (status) {
    case "requested": return signed
      ? { label: "Signed — needs approval", cls: "" }
      : { label: "Requested", cls: "" };
    case "paid": return { label: "Paid", cls: "good" };
    case "pending_payment": return signed
      ? { label: "Approved — awaiting deposit", cls: "urgent" }
      : { label: "Pending", cls: "urgent" };
    case "payment_review": return { label: "Review", cls: "urgent" };
    case "refunded": return { label: "Refunded", cls: "urgent" };
    case "cancelled": return { label: "Cancelled", cls: "" };
    case "expired": return { label: "Expired", cls: "" };
    default: return { label: status, cls: "" };
  }
}

function shortDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function BookingRecord({ booking }: { booking: BookingRow }) {
  const agreement = isSignedAgreement(booking.metadata?.agreement) ? booking.metadata.agreement : null;
  const pill = statusPill(booking.status, Boolean(agreement));
  // Homepage commissions carry their tier + total in metadata; older rows use collection.
  const tier = booking.metadata?.tier;
  const total = booking.metadata?.total_usd;
  const collection =
    typeof tier === "string" && tier in TIER_NAME_EN
      ? `${TIER_NAME_EN[tier as TierId]}${typeof total === "number" ? ` · $${total.toLocaleString("en-US")}` : ""}`
      : booking.collection
        ? COLLECTION_LABEL[booking.collection]
        : null;

  return (
    <article id={booking.id} className="scroll-mt-6 border-b border-[var(--tq-surface-2)] px-5 py-5 last:border-0 sm:px-6">
      <dl className="m-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] lg:items-start lg:gap-5">
        <div className="min-w-0">
          <dt className="mb-1 text-[13px] text-[var(--tq-ink-mute)] lg:sr-only">Client</dt>
          <dd><p className="m-0 break-words text-[15px] font-semibold">{booking.name}</p><p className="mt-1 break-all text-[13px] text-[var(--tq-ink-mute)]">{booking.email}</p></dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-[13px] text-[var(--tq-ink-mute)] lg:sr-only">Celebration</dt>
          <dd><p className="text-sm text-[var(--tq-ink)]">{formatEventDate(booking.event_date)}</p><p className="mt-1 text-[13px] text-[var(--tq-ink-mute)]">Reserved {shortDateTime(booking.created_at)}</p></dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-[13px] text-[var(--tq-ink-mute)] lg:sr-only">Collection</dt>
          <dd><p className="text-sm text-[var(--tq-ink)]">{collection ?? "—"}</p><p className="mt-1 break-words text-[13px] text-[var(--tq-ink-mute)]">{packageLabel(booking.package)}</p></dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-[13px] text-[var(--tq-ink-mute)] lg:sr-only">Deposit</dt>
          <dd><p className="text-sm font-medium tabular-nums text-[var(--tq-ink)]">{formatMoney(booking.deposit_amount_cents, booking.currency)}</p>{booking.paid_at && <p className="mt-1 text-[13px] text-[var(--tq-ink-mute)]">Paid {shortDateTime(booking.paid_at)}</p>}</dd>
        </div>
        <div><dt className="mb-1 text-[13px] text-[var(--tq-ink-mute)] lg:sr-only">Status</dt><dd><span className="st-chip" data-tone={pill.cls || undefined}>{pill.label}</span></dd></div>
      </dl>

      {(booking.phone || booking.notes) && <div className="mt-5 grid gap-x-8 gap-y-3 border-t border-[var(--tq-surface-2)] pt-4 text-sm sm:grid-cols-2">
        {booking.phone && <div><span className="mr-3 text-[var(--tq-ink-mute)]">Phone</span><a href={`tel:${booking.phone}`} className="break-all text-[var(--tq-ink)] underline decoration-[var(--tq-stone)] underline-offset-2 hover:decoration-[var(--tq-ink)]">{booking.phone}</a></div>}
        {booking.notes && <div className="sm:col-span-2"><span className="text-[var(--tq-ink-mute)]">Notes</span><p className="mt-1 whitespace-pre-wrap break-words text-[var(--tq-ink-mute)]">{booking.notes}</p></div>}
      </div>}
      {agreement ? (
        <details className="mt-5 border-t border-[var(--tq-surface-2)] pt-4 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-[var(--tq-ink)]">
            Signed agreement · {agreement.signedName} · {shortDateTime(agreement.signedAt)}
            {agreement.approvedAt ? ` · approved ${shortDateTime(agreement.approvedAt)}` : ""}
          </summary>
          <div className="mt-3 max-w-3xl space-y-4 text-[var(--tq-ink)]">
            <p className="font-medium">{agreement.title}</p>
            <p>{agreement.intro}</p>
            {agreement.sections.map((sec) => (
              <div key={sec.title}>
                <p className="font-semibold">{sec.title}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">{sec.lines.map((l) => <li key={l}>{l}</li>)}</ul>
              </div>
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={agreement.signature} alt={`Signature of ${agreement.signedName}`} width={300} height={100} className="border border-[var(--tq-surface-2)] bg-white" />
            <p className="text-[13px] text-[var(--tq-ink-mute)]">Signed {new Date(agreement.signedAt).toUTCString()} · IP {agreement.ip} · version {agreement.version}</p>
          </div>
        </details>
      ) : null}
      <a href={`mailto:${booking.email}`} className="st-link mt-2">Email {booking.name.split(" ")[0]}</a>
      <BookingActions id={booking.id} status={booking.status} signed={Boolean(agreement)} />
    </article>
  );
}

export default async function AdminBookings() {
  await requireAdminPage("/admin/bookings"); // server-side gate; middleware is not enough
  const bookings = await getBookings();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  const needs = bookings.filter((b) => ["payment_review", "requested", "pending_payment"].includes(b.status));
  const upcoming = bookings.filter((b) => b.status === "paid" && b.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = bookings.filter((b) => !needs.includes(b) && !upcoming.includes(b));
  const groups = [
    { id: "needs", title: "Needs you", intro: "Check the date, approve, or wait for the deposit.", rows: needs },
    { id: "upcoming", title: "Coming up", intro: "Paid celebrations, soonest first.", rows: upcoming },
    { id: "past", title: "Past and closed", intro: "Finished, refunded, cancelled or expired.", rows: past },
  ].filter((g) => g.rows.length);

  return (
    <StudioPage
      title="Bookings"
      intro={`${countPaid(bookings)} paid · ${upcoming.length} coming up${needs.length ? ` · ${needs.length} need${needs.length === 1 ? "s" : ""} you` : ""}.`}
    >
      {bookings.length === 0 ? (
        <div className="st-card st-empty">
          <p className="m-0 text-lg font-medium">No bookings yet.</p>
          <p className="st-note mt-1">When a family reserves a date, their package, deposit and contact details show up here.</p>
        </div>
      ) : groups.map((g) => (
        <section key={g.id} aria-labelledby={`b-${g.id}`} className="st-card overflow-hidden">
          <div className="px-5 pt-5 sm:px-6">
            <h2 id={`b-${g.id}`} className="st-h2">{g.title} <span className="st-num text-[var(--tq-ink-mute)]">{g.rows.length}</span></h2>
            <p className="st-note mt-1">{g.intro}</p>
          </div>
          <div aria-hidden="true" className="st-label mt-4 hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] gap-5 border-t border-[var(--tq-surface-2)] px-6 py-3 lg:grid">
            <span>Family</span><span>Celebration</span><span>Collection</span><span>Deposit</span><span>Status</span>
          </div>
          <div className="mt-4 border-t border-[var(--tq-surface-2)] lg:mt-0">
            {g.rows.map((booking) => <BookingRecord key={booking.id} booking={booking} />)}
          </div>
        </section>
      ))}
    </StudioPage>
  );
}
