import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { formatEventDate, packageLabel } from "@/lib/booking";
import { InquiryActions } from "@/components/InquiryActions";
import { InquiryActivityPanel } from "@/components/admin/InquiryActivityPanel";
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
  const clientActivity = activity.filter((row) => row.inquiry_id === id);
  const lastContact = clientActivity.find((row) => row.kind === "contact");
  const canContact = !inquiry.unsubscribed_at;
  const canSchedule = canContact && inquiry.status === "new";
  const serviceLabel = inquiry.services ? packageLabel(inquiry.services) : null;
  const status = inquiry.unsubscribed_at ? "Unsubscribed" : inquiry.status === "won" ? "Won" : inquiry.status === "lost" ? "Lost" : "Open";
  const details = [
    ["Services", serviceLabel],
    ["Budget", inquiry.budget_range],
    ["Venue", inquiry.venue],
    ["Heard about us", inquiry.referral],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Received", new Date(inquiry.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })],
    ["Last personal contact", lastContact ? new Date(lastContact.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }) : "Not recorded"],
  ];

  return (
    <main className="mx-auto max-w-[86rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:px-12 lg:pt-11">
      <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center text-sm text-[#696965] hover:text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">← All inquiries</Link>

      <header className="mt-5 border-b border-[#e5e5e3] pb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Client record</p>
            <h1 className="mt-3 break-words text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.15] tracking-[-0.04em]">{inquiry.name}</h1>
            <p className="mt-3 break-words text-sm text-[#696965]">{inquiry.event_date ? formatEventDate(inquiry.event_date) : "Event date to confirm"}{inquiry.venue ? ` · ${inquiry.venue}` : ""}</p>
          </div>
          {canContact && <div className="flex flex-wrap items-center gap-2">
            <a href={`mailto:${inquiry.email}`} className="inline-flex min-h-11 items-center rounded-sm bg-[#242424] px-5 text-sm font-medium text-white hover:bg-[#444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">Email client ↗</a>
            {inquiry.phone && <a href={`tel:${inquiry.phone}`} className="inline-flex min-h-11 items-center rounded-sm border border-[#dcdcd9] bg-white px-5 text-sm font-medium hover:border-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">Call client</a>}
          </div>}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-[#ededeb] pt-5 text-sm">
          <div><span className="mr-2 text-[#62625f]">Pipeline</span><span className="font-medium">{status}</span></div>
          <div><span className="mr-2 text-[#62625f]">Collection</span><span className="font-medium">{serviceLabel || "To confirm"}</span></div>
          <div><span className="mr-2 text-[#62625f]">Activity</span><span className="font-medium tabular-nums">{clientActivity.length}</span></div>
        </div>
      </header>

      {inquiry.unsubscribed_at && <p className="mt-6 border-l-[3px] border-[#a96c30] bg-[#f9f2e9] px-4 py-3 text-sm text-[#65451e]">This client unsubscribed. Do not send follow-up messages.</p>}

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.8fr)]">
        <div>
          <div className="mb-5 border-b border-[#e5e5e3] pb-4">
            <h2 className="text-lg font-medium tracking-[-0.02em]">Activity & next steps</h2>
            <p className="mt-1 text-sm text-[#696965]">A working record of this relationship.</p>
          </div>
          <InquiryActivityPanel inquiryId={id} activity={clientActivity} canSchedule={canSchedule} />
        </div>
        <aside className="space-y-7">
          <section className="border border-[#e5e5e3] bg-white px-5 py-6 sm:px-6">
            <h2 className="text-base font-medium tracking-[-0.02em]">Inquiry details</h2>
            <dl className="mt-5 divide-y divide-[#ededeb] text-sm">
              {details.map(([label, value]) => <div key={label} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[#62625f]">{label}</dt>
                <dd className="min-w-0 break-words font-medium text-[#333]">{value || "—"}</dd>
              </div>)}
            </dl>
            {inquiry.message && <div className="border-t border-[#ededeb] pt-4"><h3 className="text-sm text-[#62625f]">Their message</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#41413e]">{inquiry.message}</p></div>}
          </section>
          <OriginPanel origin={origin} journey={journey} linkTag={inquiry.attribution?.src ?? inquiry.attribution?.ref ?? null} />
          <section className="border border-[#e5e5e3] bg-white px-5 py-6 sm:px-6">
            <h2 className="text-base font-medium tracking-[-0.02em]">Pipeline status</h2>
            <p className="mt-1 text-sm text-[#696965]">Update this when the inquiry is booked or closed.</p>
            <InquiryActions id={id} status={inquiry.status} lostReason={inquiry.lost_reason} competitorName={inquiry.competitor_name} />
          </section>
        </aside>
      </div>
    </main>
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
    <section aria-labelledby="origin-heading" className="border border-[#e5e5e3] bg-white px-5 py-6 sm:px-6">
      <h2 id="origin-heading" className="text-base font-medium tracking-[-0.02em]">Where they came from</h2>
      {!shown.length ? (
        <p className="mt-2 text-sm text-[#696965]">Not recorded. Inquiries sent before tracking was added, or from a browser that blocks storage, have no source.</p>
      ) : (
        <dl className="mt-5 divide-y divide-[#ededeb] text-sm">
          {shown.map(([label, value]) => <div key={label} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-[#62625f]">{label}</dt>
            <dd className="min-w-0 break-words font-medium text-[#333]">{value}</dd>
          </div>)}
        </dl>
      )}
      {journey && <div className="mt-2 border-t border-[#ededeb] pt-4">
        <h3 className="text-sm text-[#62625f]">Their path to inquiring</h3>
        <p className="mt-1 text-sm text-[#41413e]">
          <span className="tabular-nums">{journey.pageViews}</span> {journey.pageViews === 1 ? "page" : "pages"} over <span className="tabular-nums">{journey.visits}</span> {journey.visits === 1 ? "visit" : "visits"}
          {journey.daysToInquire > 0 ? <>, <span className="tabular-nums">{journey.daysToInquire}</span> {journey.daysToInquire === 1 ? "day" : "days"} from first visit</> : ", same day"}
        </p>
        <ol className="mt-4 space-y-0">
          {journey.steps.map((step, i) => <li key={`${step.at}-${i}`}>
            {journey.hidden > 0 && i === 4 && <p className="py-1.5 pl-5 text-xs text-[#62625f]">… {journey.hidden} more {journey.hidden === 1 ? "page" : "pages"}</p>}
            {step.newVisit && i > 0 && <p className="mt-2 border-t border-dashed border-[#e5e5e3] pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">New visit</p>}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-1.5 text-sm">
              <span className="min-w-0 break-words text-[#333]">{step.path}{step.count > 1 && <span className="ml-1 text-xs text-[#62625f]">×{step.count}</span>}</span>
              <time dateTime={step.at} className="whitespace-nowrap text-xs tabular-nums text-[#62625f]">{when(step.at)}</time>
            </div>
          </li>)}
        </ol>
      </div>}
    </section>
  );
}
