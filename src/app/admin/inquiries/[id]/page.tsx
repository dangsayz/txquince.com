import { notFound } from "next/navigation";
import { getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { InquiryRecord } from "@/components/admin/InquiryRecord";
import { requireAdminPage } from "@/lib/require-admin";
import { summarizeAttribution } from "@/lib/attribution";
import { getJourney, type Journey } from "@/lib/inquiry-journey";

export const dynamic = "force-dynamic";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("/admin/inquiries"); // server-side gate; middleware is not enough
  const [{ id }, inquiries, activity] = await Promise.all([params, getInquiries(), getInquiryActivity()]);
  const inquiry = inquiries.find((row) => row.id === id);
  if (!inquiry) notFound();
  const origin = summarizeAttribution(inquiry.attribution);
  const journey = await getJourney(inquiry.attribution?.vid, inquiry.created_at);
  return (
    <InquiryRecord
      inquiry={inquiry}
      activity={activity.filter((row) => row.inquiry_id === id)}
      now={new Date()}
      originPanel={<OriginPanel origin={origin} journey={journey} linkTag={inquiry.attribution?.src ?? inquiry.attribution?.ref ?? null} />}
    />
  );
}

const CT = "America/Chicago";
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: CT });
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: CT });

/** Where the inquiry came from: source, the page it was sent from, and the pages seen before. */
function OriginPanel({ origin, journey, linkTag }: { origin: ReturnType<typeof summarizeAttribution>; journey: Journey | null; linkTag: string | null }) {
  const rows: [string, string | null][] = origin ? [
    ["Source", origin.source],
    ["Sent from", origin.sentFrom],
    ["First landed on", origin.firstLanded],
    ["Referring site", origin.referrer],
    ["Link tag", linkTag ? `?src=${linkTag}` : null],
    ["Campaign", origin.campaign],
    ["Device", origin.device ? origin.device[0].toUpperCase() + origin.device.slice(1) : null],
    ["First visit", journey?.firstSeen ? day(journey.firstSeen) : origin.firstSeen ? day(origin.firstSeen) : null],
  ] : [];
  const shown = rows.filter(([, v]) => v);
  return (
    <section aria-labelledby="origin-heading">
      <h2 id="origin-heading" className="st-h2">Where they came from</h2>
      {!shown.length ? (
        <p className="mt-2 text-sm text-[var(--tq-ink-mute)]">Not recorded. Inquiries sent before tracking was added, or from a browser that blocks storage, have no source.</p>
      ) : (
        <dl className="mt-3 divide-y divide-[var(--tq-surface-2)] border-y border-[var(--tq-surface-2)] text-sm">
          {shown.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-[var(--tq-ink-mute)]">{label}</dt>
            <dd className="min-w-0 break-words font-medium text-[var(--tq-ink)]">{value}</dd>
          </div>)}
        </dl>
      )}
      {journey && <div className="mt-2 border-t border-[var(--tq-surface-2)] pt-4">
        <h3 className="text-sm text-[var(--tq-ink-mute)]">Their path to inquiring</h3>
        <p className="mt-1 text-sm text-[var(--tq-ink)]">
          <span className="tabular-nums">{journey.pageViews}</span> {journey.pageViews === 1 ? "page" : "pages"} over <span className="tabular-nums">{journey.visits}</span> {journey.visits === 1 ? "visit" : "visits"}
          {journey.daysToInquire > 0 ? <>, <span className="tabular-nums">{journey.daysToInquire}</span> {journey.daysToInquire === 1 ? "day" : "days"} from first visit</> : ", same day"}
        </p>
        <ol className="mt-4 space-y-0">
          {journey.steps.map((step, i) => <li key={`${step.at}-${i}`}>
            {journey.hidden > 0 && i === 4 && <p className="py-1.5 pl-5 text-xs text-[var(--tq-ink-mute)]">… {journey.hidden} more {journey.hidden === 1 ? "page" : "pages"}</p>}
            {step.newVisit && i > 0 && <p className="mt-2 border-t border-dashed border-[var(--tq-surface-2)] pt-2 text-[13px] font-medium text-[var(--tq-ink-mute)]">New visit</p>}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-1.5 text-sm">
              <span className="min-w-0 break-words text-[var(--tq-ink)]">{step.path}{step.count > 1 && <span className="ml-1 text-xs text-[var(--tq-ink-mute)]">×{step.count}</span>}</span>
              <time dateTime={step.at} className="whitespace-nowrap text-xs tabular-nums text-[var(--tq-ink-mute)]">{when(step.at)}</time>
            </div>
          </li>)}
        </ol>
      </div>}
    </section>
  );
}
