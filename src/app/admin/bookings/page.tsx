import Link from "next/link";
import { getBookings, countPaid, type BookingRow } from "@/lib/clients-db";
import { formatEventDate, formatMoney, packageLabel } from "@/lib/booking";
import { BookingActions } from "@/components/admin/BookingActions";

export const dynamic = "force-dynamic";

const COLLECTION_LABEL: Record<string, string> = {
  moments: "Moments",
  essential: "Essential",
  signature: "Signature",
  legacy: "Legacy",
};

function statusPill(status: string): { label: string; cls: string } {
  switch (status) {
    case "requested": return { label: "Requested", cls: "bg-[#eceff2] text-[#44515d]" };
    case "paid": return { label: "Paid", cls: "bg-[#e9f1e9] text-[#365c43]" };
    case "pending_payment": return { label: "Pending", cls: "bg-[#fdf1dd] text-[#76520f]" };
    case "payment_review": return { label: "Review", cls: "bg-[#faeee5] text-[#81532a]" };
    case "refunded": return { label: "Refunded", cls: "bg-[#f8e8e7] text-[#8f4039]" };
    case "cancelled": return { label: "Cancelled", cls: "bg-[#f0f0ee] text-[#666662]" };
    case "expired": return { label: "Expired", cls: "bg-[#f0f0ee] text-[#696965]" };
    default: return { label: status, cls: "bg-[#f0f0ee] text-[#666662]" };
  }
}

function shortDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function BookingRecord({ booking }: { booking: BookingRow }) {
  const pill = statusPill(booking.status);
  const collection = booking.collection ? COLLECTION_LABEL[booking.collection] : null;

  return (
    <article className="border-b border-[#ededeb] bg-white px-5 py-6 last:border-0 sm:px-6">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] lg:items-start lg:gap-5">
        <div className="min-w-0">
          <dt className="mb-1 text-xs text-[#62625f] lg:sr-only">Client</dt>
          <dd><h2 className="break-words text-base font-medium text-[#252525]">{booking.name}</h2><p className="mt-1 break-all text-xs text-[#696965]">{booking.email}</p></dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-xs text-[#62625f] lg:sr-only">Celebration</dt>
          <dd><p className="text-sm text-[#333]">{formatEventDate(booking.event_date)}</p><p className="mt-1 text-xs text-[#62625f]">Reserved {shortDateTime(booking.created_at)}</p></dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-xs text-[#62625f] lg:sr-only">Collection</dt>
          <dd><p className="text-sm text-[#333]">{collection ?? "—"}</p><p className="mt-1 break-words text-xs text-[#62625f]">{packageLabel(booking.package)}</p></dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-xs text-[#62625f] lg:sr-only">Deposit</dt>
          <dd><p className="text-sm font-medium tabular-nums text-[#333]">{formatMoney(booking.deposit_amount_cents, booking.currency)}</p>{booking.paid_at && <p className="mt-1 text-xs text-[#62625f]">Paid {shortDateTime(booking.paid_at)}</p>}</dd>
        </div>
        <div><dt className="mb-1 text-xs text-[#62625f] lg:sr-only">Status</dt><dd><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pill.cls}`}>{pill.label}</span></dd></div>
      </dl>

      {(booking.phone || booking.notes) && <div className="mt-5 grid gap-x-8 gap-y-3 border-t border-[#f0f0ee] pt-4 text-sm sm:grid-cols-2">
        {booking.phone && <div><span className="mr-3 text-[#62625f]">Phone</span><a href={`tel:${booking.phone}`} className="break-all text-[#333] underline decoration-[#bbb] underline-offset-2 hover:decoration-[#333]">{booking.phone}</a></div>}
        {booking.notes && <div className="sm:col-span-2"><span className="text-[#62625f]">Notes</span><p className="mt-1 whitespace-pre-wrap break-words text-[#555]">{booking.notes}</p></div>}
      </div>}
      <a href={`mailto:${booking.email}`} className="mt-4 inline-flex min-h-11 items-center text-sm text-[#444] underline decoration-[#bbb] underline-offset-4 hover:decoration-[#333] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">Email client ↗</a>
      <BookingActions id={booking.id} status={booking.status} />
    </article>
  );
}

export default async function AdminBookings() {
  const bookings = await getBookings();
  const paid = countPaid(bookings);
  const pending = bookings.filter((booking) => booking.status === "pending_payment").length;

  return (
    <main className="mx-auto max-w-[86rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:px-12 lg:pt-11">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e5e5e3] pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Client work / Bookings</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal leading-tight tracking-[-0.035em]">Bookings</h1>
        </div>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-[#696965] hover:text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">← Today</Link>
      </header>

      <div className="grid grid-cols-3 gap-4 border-b border-[#e5e5e3] py-7 sm:max-w-xl sm:gap-8">
        <div><p className="text-[11px] uppercase tracking-[0.14em] text-[#62625f]">Total</p><p className="mt-1 text-2xl font-normal tabular-nums tracking-[-0.04em]">{bookings.length}</p></div>
        <div><p className="text-[11px] uppercase tracking-[0.14em] text-[#62625f]">Paid</p><p className="mt-1 text-2xl font-normal tabular-nums tracking-[-0.04em]">{paid}</p></div>
        <div><p className="text-[11px] uppercase tracking-[0.14em] text-[#62625f]">Pending</p><p className="mt-1 text-2xl font-normal tabular-nums tracking-[-0.04em]">{pending}</p></div>
      </div>

      {bookings.length === 0 ? <div className="border-b border-[#e5e5e3] px-5 py-16 text-center">
        <h2 className="text-lg font-medium tracking-[-0.02em]">No bookings yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#696965]">When a client reserves a date, their collection, deposit, and contact details will appear here.</p>
      </div> : <section aria-label="Bookings" className="mt-7 border-y border-[#e5e5e3] bg-white">
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] gap-5 border-b border-[#e5e5e3] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f] lg:grid">
          <span>Client</span><span>Celebration</span><span>Collection</span><span>Deposit</span><span>Status</span>
        </div>
        {bookings.map((booking) => <BookingRecord key={booking.id} booking={booking} />)}
      </section>}
    </main>
  );
}
