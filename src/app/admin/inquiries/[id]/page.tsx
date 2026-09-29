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
  return (
    <main className="mx-auto max-w-[92rem] px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center text-base font-medium text-ink-soft hover:text-ink focus-visible:underline">← All inquiries</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5 border-b border-line pb-7">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">Client record</p>
          <h1 className="mt-2 break-words font-display text-[clamp(2rem,4vw,2.5rem)] font-normal leading-tight text-ink">{inquiry.name}</h1>
          <p className="mt-3 break-words text-base text-ink-soft">{inquiry.event_date ? formatEventDate(inquiry.event_date) : "Event date to confirm"}{inquiry.venue ? ` · ${inquiry.venue}` : ""}</p>
        </div>
        {canContact && (
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${inquiry.email}`} className="inline-flex min-h-12 items-center rounded-md bg-ink px-5 text-base font-medium text-cream hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Email client ↗</a>
            {inquiry.phone && <a href={`tel:${inquiry.phone}`} className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-5 text-base font-medium text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Call client</a>}
          </div>
        )}
      </div>
      {inquiry.unsubscribed_at && <p className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-base text-amber-950">This client unsubscribed. Do not send follow-up messages.</p>}
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <InquiryActivityPanel inquiryId={id} activity={clientActivity} canSchedule={canSchedule} />
        <aside className="space-y-6">
          <section className="rounded-lg border border-line bg-white p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Inquiry details</p>
            <h2 className="mt-2 font-display text-2xl font-normal text-ink">The celebration</h2>
            <dl className="mt-5 space-y-4 text-base">
              {[["Services", serviceLabel], ["Budget", inquiry.budget_range], ["Venue", inquiry.venue], ["How they found us", inquiry.referral || inquiry.attribution?.source], ["Email", inquiry.email], ["Phone", inquiry.phone], ["Received", new Date(inquiry.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })], ["Last personal contact", lastContact ? new Date(lastContact.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }) : "Not recorded"]].map(([label, value]) => (
                <div key={label} className="grid gap-1 border-t border-line pt-3 sm:grid-cols-[9rem_1fr] sm:gap-3">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="min-w-0 break-words font-medium text-ink">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            {inquiry.message && <div className="mt-6 border-t border-line pt-4"><p className="text-base text-ink-soft">Their message</p><p className="mt-2 whitespace-pre-wrap break-words text-base leading-relaxed text-ink">{inquiry.message}</p></div>}
          </section>
          <section className="rounded-lg border border-line bg-white p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Pipeline</p>
            <h2 className="mt-2 font-display text-2xl font-normal text-ink">Status</h2>
            <p className="mt-2 text-base text-ink-soft">Update this when the inquiry is booked or closed.</p>
            <InquiryActions id={id} status={inquiry.status} lostReason={inquiry.lost_reason} competitorName={inquiry.competitor_name} />
          </section>
        </aside>
      </div>
    </main>
  );
}
