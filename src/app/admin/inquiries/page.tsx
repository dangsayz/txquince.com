import Link from "next/link";
import { getInquiries, countOpenLeads, type InquiryRow } from "@/lib/clients-db";
import { formatEventDate } from "@/lib/booking";

export const dynamic = "force-dynamic";

const SERVICE_LABEL: Record<string, string> = {
  photo: "Photography",
  video: "Film / Video",
  both: "Photo + Film",
};

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusPill(i: InquiryRow): { label: string; cls: string } {
  if (i.unsubscribed_at)
    return { label: "Unsubscribed", cls: "bg-stone-100 text-stone-400 ring-stone-300/20" };
  // Match the DB constraint: new | won | lost (unsubscribed handled above).
  switch (i.status) {
    case "won":
      return { label: "Won", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
    case "lost":
      return { label: "Lost", cls: "bg-stone-100 text-stone-500 ring-stone-400/20" };
    default:
      return { label: "New", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  }
}

function InquiryCard({ i }: { i: InquiryRow }) {
  const pill = statusPill(i);
  return (
    <div className="border border-line bg-ivory p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl text-ink">{i.name}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            {i.event_date ? formatEventDate(i.event_date) : "Date TBD"}
            {i.venue && <span> · {i.venue}</span>}
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
            Wants
          </dt>
          <dd className="text-ink">
            {(i.services && SERVICE_LABEL[i.services]) || i.services || "—"}
            {i.budget_range && (
              <span className="text-ink-soft"> · {i.budget_range}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            Heard via
          </dt>
          <dd className="text-ink">
            {i.referral || <span className="text-ink-faint">—</span>}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            Contact
          </dt>
          <dd className="text-ink">
            <a className="underline decoration-line hover:text-wine" href={`mailto:${i.email}`}>
              {i.email}
            </a>
            {i.phone && (
              <>
                {" · "}
                <a className="underline decoration-line hover:text-wine" href={`tel:${i.phone}`}>
                  {i.phone}
                </a>
              </>
            )}
          </dd>
        </div>
        {i.message && (
          <div className="col-span-2">
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
              Message
            </dt>
            <dd className="whitespace-pre-wrap text-ink-soft">{i.message}</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        Inquired {shortDate(i.created_at)}
        {i.last_touch_at && <span> · last touch {shortDate(i.last_touch_at)}</span>}
      </p>
    </div>
  );
}

export default async function AdminInquiries() {
  const inquiries = await getInquiries();
  const open = countOpenLeads(inquiries);

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <Link
        href="/admin"
        className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint hover:text-wine"
      >
        ← Studio
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Leads</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {inquiries.length === 0
          ? "Inquiries from your contact form will land here."
          : `${open} open · ${inquiries.length} total`}
      </p>

      {inquiries.length === 0 ? (
        <div className="mt-10 border border-dashed border-line bg-ivory p-10 text-center">
          <p className="text-sm text-ink-soft">
            No leads yet. Every inquiry form submission shows up here with the
            family&apos;s date, budget, and message — so you can follow up fast.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {inquiries.map((i) => (
            <InquiryCard key={i.id} i={i} />
          ))}
        </div>
      )}
    </main>
  );
}
