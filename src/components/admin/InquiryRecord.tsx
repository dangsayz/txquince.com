import Link from "next/link";
import type { ReactNode } from "react";
import type { InquiryActivityRow, InquiryRow } from "@/lib/clients-db";
import { formatEventDate, packageLabel } from "@/lib/booking";
import { InquiryActions } from "@/components/InquiryActions";
import { InquiryActivityPanel } from "@/components/admin/InquiryActivityPanel";
import { countdownLabel, dallasDateTime, daysUntil, formatPhone, hoursSince, phoneDigits, waitLabel } from "@/lib/inquiry-time";
import { venues } from "@/content/venues";

/**
 * InquiryRecord — one family's inquiry, laid out for the owner on a phone
 * between shoots: what to do now first (status, how long they have waited,
 * one-tap reply), then the celebration at a glance, their own words, and the
 * working record. Refs: Homerun candidate profile (status + "applied 5 days
 * ago" + actions on top), Clay (timeline left, contact rail right), folk
 * ("last interaction · 5 hours ago").
 *
 * Pure presentation: the route loads the data and passes `now`.
 */

type Tone = "urgent" | "due" | "calm" | "done" | "stop";

const TONE: Record<Tone, { band: string; pill: string }> = {
  urgent: { band: "border-[#c0574d] bg-[#fbf0ef]", pill: "bg-[#f8e8e7] text-[#8f4039]" },
  due: { band: "border-[#b98a2c] bg-[#fdf6e8]", pill: "bg-[#fdf1dd] text-[#76520f]" },
  calm: { band: "border-[#c9c9c4] bg-white", pill: "bg-[#f0f0ee] text-[#555550]" },
  done: { band: "border-[#6f9a7c] bg-[#f2f7f2]", pill: "bg-[#e9f1e9] text-[#365c43]" },
  stop: { band: "border-[#a96c30] bg-[#f9f2e9]", pill: "bg-[#f9f2e9] text-[#65451e]" },
};

const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-sm px-5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]";
// `!text-white`: the site sheet sets `.txq :where(a) { color: inherit }`, unlayered, which beats
// Tailwind's layered text colors on links. Without it the label is dark on dark.
const btnPrimary = `${btn} bg-[#242424] !text-white hover:bg-[#444]`;
const btnGhost = `${btn} border border-[#cfcfcb] bg-white text-[#252525] hover:border-[#252525]`;

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function InquiryRecord({
  inquiry,
  activity,
  now,
  originPanel,
}: {
  inquiry: InquiryRow;
  activity: InquiryActivityRow[];
  now: Date;
  /** The route's "Where they came from" panel (attribution + page path); replaces the simple list. */
  originPanel?: ReactNode;
}) {
  const contacts = activity.filter((row) => row.kind === "contact").sort((a, b) => b.created_at.localeCompare(a.created_at));
  const lastContact = contacts[0] ?? null;
  const nextReminder =
    activity.filter((row) => row.kind === "reminder" && !row.completed_at && row.due_at).sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))[0] ?? null;
  const canContact = !inquiry.unsubscribed_at;
  const canSchedule = canContact && inquiry.status === "new";
  const serviceLabel = inquiry.services ? packageLabel(inquiry.services) : null;
  const eventLabel = inquiry.event_date ? formatEventDate(inquiry.event_date) : null;
  const countdown = inquiry.event_date ? countdownLabel(daysUntil(inquiry.event_date, now)) : null;
  const received = dallasDateTime(inquiry.created_at);
  const waited = waitLabel(inquiry.created_at, now);
  const venueMatch = inquiry.venue ? venues.find((v) => inquiry.venue!.toLowerCase().includes(v.venue.toLowerCase())) : undefined;
  const digits = phoneDigits(inquiry.phone);
  const name = firstName(inquiry.name);

  // ---- What to do now ----
  let tone: Tone;
  let status: string;
  let headline: string;
  let detail: string;
  if (inquiry.unsubscribed_at) {
    tone = "stop";
    status = "Unsubscribed";
    headline = "Do not contact";
    detail = "This family unsubscribed. Don't send follow-up messages.";
  } else if (inquiry.status === "won") {
    tone = "done";
    status = "Won";
    headline = "Booked";
    detail = lastContact ? `Last personal contact ${waitLabel(lastContact.created_at, now)} ago.` : "Booked.";
  } else if (inquiry.status === "lost") {
    tone = "calm";
    status = "Lost";
    headline = "Closed";
    detail = [inquiry.lost_reason, inquiry.competitor_name ? `Booked ${inquiry.competitor_name}` : null].filter(Boolean).join(" · ") || "Marked lost.";
  } else if (!lastContact) {
    const h = hoursSince(inquiry.created_at, now);
    tone = h >= 24 ? "urgent" : "due";
    status = "Needs reply";
    headline = `Reply to ${name}`;
    detail = waited === "Just now" ? "Just came in. No reply recorded yet." : `Waiting ${waited}. No reply recorded yet.`;
  } else if (nextReminder?.due_at && new Date(nextReminder.due_at) <= now) {
    tone = "due";
    status = "Follow-up due";
    headline = `Follow up with ${name}`;
    detail = `${nextReminder.note || "Follow-up"} was due ${dallasDateTime(nextReminder.due_at)}.`;
  } else if (nextReminder?.due_at) {
    tone = "calm";
    status = "Scheduled";
    headline = `Next: follow up ${dallasDateTime(nextReminder.due_at)}`;
    detail = `Last contact ${waitLabel(lastContact.created_at, now)} ago.`;
  } else {
    tone = "calm";
    status = "Open";
    headline = "Plan the next step";
    detail = `Last contact ${waitLabel(lastContact.created_at, now)} ago. No follow-up planned yet.`;
  }

  const subject = `Your quinceañera${eventLabel ? ` on ${eventLabel}` : ""} · TX Quince`;
  const body = `Hi ${name},\n\nThank you for reaching out to TX Quince${eventLabel ? ` about ${eventLabel}` : ""}${inquiry.venue ? ` at ${inquiry.venue}` : ""}.\n\n`;
  const text = `Hi ${name}, it's Dang from TX Quince. Thank you for your inquiry${eventLabel ? ` for ${eventLabel}` : ""}!`;
  const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const facts: { label: string; value: string; sub?: string | null; href?: string }[] = [
    { label: "Celebration", value: eventLabel ?? "Date to confirm", sub: countdown },
    { label: "Venue", value: inquiry.venue || "To confirm", href: venueMatch ? `/venues/${venueMatch.slug}` : undefined, sub: venueMatch ? "See our venue page ↗" : null },
    { label: "Package", value: serviceLabel || "To confirm" },
    { label: "Budget", value: inquiry.budget_range || "Not given" },
  ];

  const source = [
    ["How they found us", inquiry.referral || inquiry.attribution?.source],
    ["Link tag", inquiry.attribution?.src ? `${inquiry.attribution.src}${inquiry.attribution.srcLanding ? ` · on ${inquiry.attribution.srcLanding}` : ""}` : inquiry.attribution?.ref ?? null],
    ["First page", inquiry.attribution?.source ? `${inquiry.attribution.source}${inquiry.attribution.landing ? ` → ${inquiry.attribution.landing}` : ""}` : null],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <main className="mx-auto max-w-[86rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:px-12 lg:pt-11">
      <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center text-sm text-[#5f5f5b] hover:text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">← All inquiries</Link>

      {/* Who and when */}
      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="min-w-0 break-words text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.15] tracking-[-0.04em]">{inquiry.name}</h1>
          <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${TONE[tone].pill}`}>{status}</span>
        </div>
        <p className="mt-2 text-sm text-[#5f5f5b]">
          Received <time dateTime={inquiry.created_at}>{received}</time>
          <span aria-hidden> · </span>
          <span className="font-medium text-[#252525]">{waited === "Just now" ? "just now" : `${waited} ago`}</span>
        </p>
      </header>

      {/* What to do now */}
      <section aria-labelledby="next-title" className={`mt-6 border-l-[3px] px-5 py-5 sm:px-6 ${TONE[tone].band}`}>
        <h2 id="next-title" className="text-lg font-medium tracking-[-0.02em]">{headline}</h2>
        <p className="mt-1 text-sm text-[#4d4d49]">{detail}</p>
        {canContact && inquiry.status !== "lost" ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={mailto} className={btnPrimary}>Email {name} ↗</a>
              {digits ? <a href={`sms:+${digits}?&body=${encodeURIComponent(text)}`} className={btnGhost}>Text</a> : null}
              {digits ? <a href={`tel:+${digits}`} className={btnGhost}>Call</a> : null}
              {digits ? <a href={`https://wa.me/${digits}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={btnGhost}>WhatsApp ↗</a> : null}
            </div>
            {!lastContact ? <p className="mt-3 text-xs text-[#5f5f5b]">Email and text open pre-written. After you reach out, log it under Record activity so the clock stops.</p> : null}
          </>
        ) : null}
      </section>

      {/* The celebration at a glance */}
      <dl className="mt-8 grid grid-cols-2 border-y border-[#e5e5e3] md:grid-cols-4">
        {facts.map((f, i) => (
          <div key={f.label} className={`min-w-0 py-4 pr-4 ${i % 2 ? "pl-4 border-l border-[#ededeb]" : ""} ${i > 1 ? "border-t border-[#ededeb] md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-4" : ""}`}>
            <dt className="text-xs text-[#5f5f5b]">{f.label}</dt>
            <dd className="mt-1 break-words text-base font-medium leading-snug">{f.value}</dd>
            {f.sub ? (
              f.href ? (
                <dd><Link href={f.href} className="mt-1 inline-flex min-h-11 items-center text-xs text-[#5f5f5b] underline underline-offset-4 hover:text-[#252525]">{f.sub}</Link></dd>
              ) : (
                <dd className="mt-1 text-xs text-[#5f5f5b]">{f.sub}</dd>
              )
            ) : null}
          </div>
        ))}
      </dl>

      {inquiry.message ? (
        <figure className="mt-8 max-w-3xl">
          <figcaption className="text-xs text-[#5f5f5b]">Their message</figcaption>
          <blockquote className="mt-2 whitespace-pre-wrap break-words border-l-2 border-[#d6d6d2] pl-4 text-base leading-7 text-[#3a3a37]">{inquiry.message}</blockquote>
        </figure>
      ) : null}

      <div className="mt-10 grid items-start gap-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.8fr)]">
        <div>
          <h2 className="mb-4 text-lg font-medium tracking-[-0.02em]">Activity</h2>
          <InquiryActivityPanel inquiryId={inquiry.id} activity={activity} canSchedule={canSchedule} />
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="contact-title">
            <h2 id="contact-title" className="text-base font-medium tracking-[-0.02em]">Contact</h2>
            <dl className="mt-3 divide-y divide-[#ededeb] border-y border-[#ededeb] text-sm">
              <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[#5f5f5b]">Email</dt>
                <dd className="min-w-0 break-all font-medium"><a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a></dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[#5f5f5b]">Phone</dt>
                <dd className="font-medium tabular-nums">{inquiry.phone ? (digits ? <a href={`tel:+${digits}`} className="hover:underline">{formatPhone(inquiry.phone)}</a> : inquiry.phone) : "Not given"}</dd>
              </div>
              {inquiry.referral ? (
                <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                  <dt className="text-[#5f5f5b]">Heard about us</dt>
                  <dd className="min-w-0 break-words font-medium">{inquiry.referral}</dd>
                </div>
              ) : null}
              <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[#5f5f5b]">Last contact</dt>
                <dd className="font-medium">{lastContact ? `${dallasDateTime(lastContact.created_at)} (${waitLabel(lastContact.created_at, now)} ago)` : "Not recorded"}</dd>
              </div>
            </dl>
          </section>

          {originPanel ?? (source.length ? (
            <section aria-labelledby="source-title">
              <h2 id="source-title" className="text-base font-medium tracking-[-0.02em]">Where they came from</h2>
              <dl className="mt-3 divide-y divide-[#ededeb] border-y border-[#ededeb] text-sm">
                {source.map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                    <dt className="text-[#5f5f5b]">{label}</dt>
                    <dd className="min-w-0 break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null)}

          <section aria-labelledby="pipeline-title">
            <h2 id="pipeline-title" className="text-base font-medium tracking-[-0.02em]">Booked or closed?</h2>
            <p className="mt-1 text-sm text-[#5f5f5b]">Update when the family books or decides not to.</p>
            <InquiryActions id={inquiry.id} status={inquiry.status} lostReason={inquiry.lost_reason} competitorName={inquiry.competitor_name} />
          </section>
        </aside>
      </div>
    </main>
  );
}
