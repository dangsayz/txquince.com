import Link from "next/link";
import { getBookings, countPaid, type BookingRow } from "@/lib/clients-db";
import { formatEventDate, formatMoney, packageLabel } from "@/lib/booking";
import { BookingActions } from "@/components/admin/BookingActions";

export const dynamic = "force-dynamic";

const COLLECTION_LABEL: Record<string, string> = {
  essential: "Essential",
  signature: "Signature",
  legacy: "Legacy",
};

/** status → { label, tone } for the pill. */
function statusPill(status: string): { label: string; cls: string } {
  switch (status) {
    case "requested":
      return {
        label: "Requested",
        cls: "bg-sky-50 text-sky-700 ring-sky-600/20",
      };
    case "paid":
      return {
        label: "Paid",
        cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      };
    case "pending_payment":
      return {
        label: "Pending",
        cls: "bg-amber-50 text-amber-700 ring-amber-600/20",
      };
    case "payment_review":
      return {
        label: "Review",
        cls: "bg-orange-50 text-orange-700 ring-orange-600/20",
      };
    case "refunded":
      return {
        label: "Refunded",
        cls: "bg-rose-50 text-rose-700 ring-rose-600/20",
      };
    case "cancelled":
      return { label: "Cancelled", cls: "bg-stone-100 text-stone-500 ring-stone-400/20" };
    case "expired":
      return { label: "Expired", cls: "bg-stone-100 text-stone-400 ring-stone-300/20" };
    default:
      return { label: status, cls: "bg-stone-100 text-stone-500 ring-stone-400/20" };
  }
}

function shortDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BookingCard({ b }: { b: BookingRow }) {
  const pill = statusPill(b.status);
  const collection = b.collection ? COLLECTION_LABEL[b.collection] : null;
  return (
    <div className="border border-line bg-ivory p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl text-ink">{b.name}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            {formatEventDate(b.event_date)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ${pill.cls}`}
        >
          {pill.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            Collection
          </dt>
          <dd className="text-ink">
            {collection ?? <span className="text-ink-faint">—</span>}
            <span className="text-ink-soft"> · {packageLabel(b.package)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            Deposit
          </dt>
          <dd className="text-ink">
            {formatMoney(b.deposit_amount_cents, b.currency)}
            {b.paid_at && (
              <span className="text-ink-soft"> · {shortDateTime(b.paid_at)}</span>
            )}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            Contact
          </dt>
          <dd className="text-ink">
            <a className="underline decoration-line hover:text-wine" href={`mailto:${b.email}`}>
              {b.email}
            </a>
            {b.phone && (
              <>
                {" · "}
                <a className="underline decoration-line hover:text-wine" href={`tel:${b.phone}`}>
                  {b.phone}
                </a>
              </>
            )}
          </dd>
        </div>
        {b.notes && (
          <div className="col-span-2">
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
              Notes
            </dt>
            <dd className="whitespace-pre-wrap text-ink-soft">{b.notes}</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        Reserved {shortDateTime(b.created_at)}
      </p>

      <BookingActions id={b.id} status={b.status} />
    </div>
  );
}

export default async function AdminBookings() {
  const bookings = await getBookings();
  const paid = countPaid(bookings);
  const pending = bookings.filter((b) => b.status === "pending_payment").length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <Link
        href="/admin"
        className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint hover:text-wine"
      >
        ← Studio
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Bookings</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {bookings.length === 0
          ? "Reservations will appear here the moment a deposit is started."
          : `${paid} paid · ${pending} pending · ${bookings.length} total`}
      </p>

      {bookings.length === 0 ? (
        <div className="mt-10 border border-dashed border-line bg-ivory p-10 text-center">
          <p className="text-sm text-ink-soft">
            No bookings yet. When a client reserves their date, you&apos;ll see
            their name, collection, date, payment status, and contact here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </main>
  );
}
