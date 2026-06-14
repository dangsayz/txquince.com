import Link from "next/link";
import { getInquiries, countOpenLeads, type InquiryRow } from "@/lib/clients-db";
import { formatEventDate } from "@/lib/booking";
import { InquiryActions } from "@/components/InquiryActions";

export const dynamic = "force-dynamic";

const SERVICE_LABEL: Record<string, string> = {
  photo: "Photography",
  video: "Film / Video",
  both: "Photo + Film",
};

const LOST_REASON_LABEL: Record<string, string> = {
  price: "Price",
  availability: "Availability",
  ghosted: "Ghosted",
  booked_competitor: "Booked competitor",
  other: "Other",
};

/** Real first-touch channel (falls back to "direct" when no attribution). */
function sourceOf(i: InquiryRow): string {
  return (i.attribution?.source || "direct").toLowerCase();
}

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
        <div>
          <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            First touch
          </dt>
          <dd className="text-ink capitalize">
            {sourceOf(i)}
            {i.attribution?.medium && (
              <span className="text-ink-soft"> · {i.attribution.medium}</span>
            )}
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
        {i.status === "lost" && i.lost_reason && (
          <span>
            {" · lost: "}
            {LOST_REASON_LABEL[i.lost_reason] ?? i.lost_reason}
            {i.competitor_name ? ` (${i.competitor_name})` : ""}
          </span>
        )}
      </p>

      {!i.unsubscribed_at && (
        <InquiryActions
          id={i.id}
          status={i.status}
          lostReason={i.lost_reason}
          competitorName={i.competitor_name}
        />
      )}
    </div>
  );
}

export default async function AdminInquiries() {
  const inquiries = await getInquiries();
  const open = countOpenLeads(inquiries);

  // Rollups: win/loss, why-we-lose, and per-source win rate.
  const won = inquiries.filter((i) => i.status === "won").length;
  const lost = inquiries.filter((i) => i.status === "lost").length;
  const decided = won + lost;
  const winRate = decided ? Math.round((won / decided) * 100) : null;

  const lossRows = Object.entries(
    inquiries
      .filter((i) => i.status === "lost")
      .reduce<Record<string, number>>((acc, i) => {
        const key = i.lost_reason || "untagged";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const sourceRows = Object.entries(
    inquiries.reduce<Record<string, { total: number; won: number }>>((acc, i) => {
      const key = sourceOf(i);
      acc[key] = acc[key] || { total: 0, won: 0 };
      acc[key].total += 1;
      if (i.status === "won") acc[key].won += 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);

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

      {inquiries.length > 0 && (
        <div className="mt-6 border border-line bg-ivory p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: String(open), l: "Open" },
              { n: String(won), l: "Won" },
              { n: String(lost), l: "Lost" },
              { n: winRate === null ? "—" : `${winRate}%`, l: "Win rate" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-2xl text-ink">{s.n}</p>
                <p className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          {(lossRows.length > 0 || sourceRows.length > 0) && (
            <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
              {lossRows.length > 0 && (
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                    Why we lose
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                    {lossRows.map(([k, n]) => (
                      <li key={k} className="flex justify-between gap-4">
                        <span>
                          {k === "untagged"
                            ? "Untagged"
                            : LOST_REASON_LABEL[k] ?? k}
                        </span>
                        <span className="text-ink">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                  By source (won / total)
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                  {sourceRows.map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-4">
                      <span className="capitalize">{k}</span>
                      <span className="text-ink">
                        {v.won} / {v.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

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
