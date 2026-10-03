import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { formatEventDate, packageLabel } from "@/lib/booking";
import { InquiryActions } from "@/components/InquiryActions";
import { InquiryActivityPanel } from "@/components/admin/InquiryActivityPanel";

export const dynamic = "force-dynamic";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, inquiries, activity] = await Promise.all([params, getInquiries(), getInquiryActivity()]);
  const inquiry = inquiries.find((row) => row.id === id);
  if (!inquiry) notFound();
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
    ["How they found us", inquiry.referral || inquiry.attribution?.source],
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
