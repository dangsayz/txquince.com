import Link from "next/link";
import type { ReactNode } from "react";
import type { InquiryActivityRow, InquiryRow } from "@/lib/clients-db";
import { formatEventDate, packageLabel } from "@/lib/booking";
import { InquiryActions } from "@/components/InquiryActions";
import { InquiryActivityPanel } from "@/components/admin/InquiryActivityPanel";
import { countdownLabel, dallasDateTime, daysUntil, formatPhone, hoursSince, phoneDigits, waitLabel } from "@/lib/inquiry-time";
import { venues } from "@/content/venues";
import { callScript, parsePickedRequest, scriptBookends, scriptLangFor, startTimeCheck } from "@/lib/inquiry-message";

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
  urgent: { band: "st-card", pill: "urgent" },
  due: { band: "st-card", pill: "urgent" },
  calm: { band: "st-card", pill: "" },
  done: { band: "st-card", pill: "good" },
  stop: { band: "st-card", pill: "" },
};

// `!text-white`: the site sheet sets `.txq :where(a) { color: inherit }`, unlayered, which beats
// Tailwind's layered text colors on links. Without it the label is dark on dark.
const btnPrimary = "st-btn";
const btnGhost = "st-btn-ghost bg-white";
/** The small label above a value: one style for every group on the page. */
const eyebrow = "m-0 text-[13px] font-medium uppercase leading-5 tracking-[0.08em] text-[var(--tq-ink-mute)]";

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

  // A package-picker request reads as fields and as a call script; a typed message stays as written.
  const picked = parsePickedRequest(inquiry.message);
  // The script goes in the family's language; package names stay as the site shows them.
  const scriptLang = picked ? scriptLangFor(picked) : "en";
  const eventLabelEs = inquiry.event_date
    ? new Date(`${inquiry.event_date.slice(0, 10)}T12:00:00Z`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;
  const script = picked ? callScript(picked, scriptLang === "es" ? eventLabelEs : eventLabel, scriptLang) : [];
  const bookends = scriptBookends(scriptLang, name);
  const timeCheck = picked ? startTimeCheck(picked) : null;
  const requestRows = picked
    ? ([
        ["Hours on the day", picked.hours],
        ["Team", picked.team],
        ["Extras", picked.extras.length ? picked.extras.map((e) => (e.price ? `${e.name} · ${e.price}` : e.name)).join("\n") : null],
        ["Coordinator", picked.coordinatorIncluded ? "Included" : null],
        ["City", picked.city],
        ["Venue", picked.venue],
        ["Starts", picked.startTime],
        ["Quinceañera", picked.honoree],
        ["Language", picked.language],
        ["Photo sharing", picked.sharePhotos === null ? null : picked.sharePhotos ? "Yes, some photos can be public" : "No public photos"],
        ["Signed by", picked.signedBy],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  const source = [
    ["How they found us", inquiry.referral || inquiry.attribution?.source],
    ["Link tag", inquiry.attribution?.src ? `${inquiry.attribution.src}${inquiry.attribution.srcLanding ? ` · on ${inquiry.attribution.srcLanding}` : ""}` : inquiry.attribution?.ref ?? null],
    ["First page", inquiry.attribution?.source ? `${inquiry.attribution.source}${inquiry.attribution.landing ? ` → ${inquiry.attribution.landing}` : ""}` : null],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <main className="mx-auto max-w-[72rem] px-4 pb-20 pt-8 sm:px-8 lg:pt-12">
      <Link href="/admin/inquiries" className="st-link -mt-2 text-[var(--tq-ink-mute)]"><span aria-hidden="true">←</span> All inquiries</Link>

      {/* Who and when */}
      <header className="mt-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="st-h1 min-w-0 break-words">{inquiry.name}</h1>
          <span className="st-chip" data-tone={TONE[tone].pill || undefined}>{status}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--tq-ink-mute)]">
          Received <time dateTime={inquiry.created_at}>{received}</time>
          <span aria-hidden> · </span>
          <span className="font-medium text-[var(--tq-ink)]">{waited === "Just now" ? "just now" : `${waited} ago`}</span>
        </p>
      </header>

      {/* What to do now */}
      <section aria-labelledby="next-title" className={`mt-8 px-5 py-5 sm:px-6 ${TONE[tone].band}`}>
        <h2 id="next-title" className="st-h2">{headline}</h2>
        <p className="mt-1 text-sm text-[var(--tq-ink-mute)]">{detail}</p>
        {canContact && inquiry.status !== "lost" ? (
          <>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={mailto} className={btnPrimary}>Email {name} ↗</a>
              {digits ? <a href={`sms:+${digits}?&body=${encodeURIComponent(text)}`} className={btnGhost}>Text</a> : null}
              {digits ? <a href={`tel:+${digits}`} className={btnGhost}>Call</a> : null}
              {digits ? <a href={`https://wa.me/${digits}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={btnGhost}>WhatsApp ↗</a> : null}
            </div>
            {!lastContact ? <p className="mt-3 text-[13px] text-[var(--tq-ink-mute)]">Email and text open pre-written. After you reach out, log it under Record activity so the clock stops.</p> : null}
          </>
        ) : null}
      </section>

      {/* The celebration at a glance */}
      <dl className="st-card m-0 mt-6 grid grid-cols-2 gap-px overflow-hidden bg-[var(--tq-surface-2)] md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0 bg-white px-5 py-4">
            <dt className="text-[13px] text-[var(--tq-ink-mute)]">{f.label}</dt>
            <dd className="mt-1 break-words text-base font-medium leading-snug">{f.value}</dd>
            {f.sub ? (
              f.href ? (
                <dd><Link href={f.href} className="mt-1 inline-flex min-h-11 items-center text-[13px] text-[var(--tq-ink-mute)] underline underline-offset-4 hover:text-[var(--tq-ink)]">{f.sub}</Link></dd>
              ) : (
                <dd className="mt-1 text-[13px] text-[var(--tq-ink-mute)]">{f.sub}</dd>
              )
            ) : null}
          </div>
        ))}
      </dl>

      {picked ? (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          {/* Left: what they picked, read top to bottom (package, money, the day, their words). */}
          <section aria-labelledby="request-title" className="st-card px-5 py-6 sm:px-7 sm:py-7">
            <h2 id="request-title" className="st-h2">Their request</h2>
            {picked.intro ? <p className="st-note mt-2 max-w-[38rem]">{picked.intro}</p> : null}

            <div className="mt-6">
              <p className={eyebrow}>Package</p>
              <p className="m-0 mt-1 break-words text-[1.75rem] font-medium leading-tight tracking-[-0.01em]">{picked.packageName}</p>
              <p className="m-0 mt-1 text-base text-[var(--tq-ink-mute)]">
                {[picked.packagePrice, picked.includedHours ? `${picked.includedHours} ${picked.includedHours === "1" ? "hour" : "hours"} included` : null].filter(Boolean).join(" · ")}
              </p>
            </div>

            {picked.total ? (
              <dl className="m-0 mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--tq-radius-sm)] border border-[var(--tq-surface-2)] bg-[var(--tq-surface-2)]">
                {[
                  ["Total", picked.total],
                  [picked.depositPercent ? `Deposit · ${picked.depositPercent}%` : "Deposit", picked.deposit],
                  ["Balance", picked.balance],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 bg-white px-3 py-3 sm:px-4">
                    <dt className="text-[13px] leading-5 text-[var(--tq-ink-mute)]">{label}</dt>
                    <dd className="m-0 mt-0.5 text-lg font-medium tabular-nums sm:text-xl">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <dl className="m-0 mt-6 divide-y divide-[var(--tq-surface-2)] border-y border-[var(--tq-surface-2)]">
              {requestRows.map(([label, value]) => (
                <div key={label} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                  <dt className="text-[15px] leading-6 text-[var(--tq-ink-mute)]">{label}</dt>
                  <dd className="m-0 min-w-0 whitespace-pre-line break-words text-base font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>

            {picked.note ? (
              <div className="mt-6">
                <p className={eyebrow}>Note from the family</p>
                <blockquote className="m-0 mt-2 whitespace-pre-wrap break-words border-l-2 border-[var(--tq-ink)] pl-4 text-[17px] leading-7">{picked.note}</blockquote>
              </div>
            ) : null}
          </section>

          {/* Right: the same request, said back to them on a call, one point at a time. */}
          <section aria-labelledby="script-title" className="st-card bg-[var(--tq-canvas)] px-5 py-6 sm:px-7 sm:py-7">
            <h2 id="script-title" className="st-h2">Say it back</h2>
            <p className="st-note mt-2">
              {scriptLang === "es" ? "For the phone call, in Spanish: they picked Español. Read each line, then wait for a yes." : "For the phone call. Read each line, then wait for a yes."}
            </p>
            {timeCheck ? (
              <p role="note" className="m-0 mt-4 rounded-[var(--tq-radius-sm)] border border-[var(--tq-ink)] bg-white px-4 py-3 text-base leading-6">
                <span className="font-medium">Check on the call: </span>
                {timeCheck}
              </p>
            ) : null}
            <p lang={scriptLang} className="m-0 mt-6 text-[1.375rem] font-medium leading-snug">“{bookends.open}”</p>
            <ol lang={scriptLang} className="m-0 mt-5 grid list-none gap-3 p-0">
              {script.map((step, i) => (
                <li key={step.topic} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 rounded-[var(--tq-radius-sm)] bg-white px-4 py-4">
                  <span aria-hidden="true" className="pt-0.5 text-[13px] tabular-nums leading-6 text-[var(--tq-ink-mute)]">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className={eyebrow}>{step.topic}</p>
                    <p className="m-0 mt-1 break-words text-lg leading-7">{/^(You told us|Nos dijo)/.test(step.say) ? step.say : `“${step.say}”`}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p lang={scriptLang} className="m-0 mt-5 text-[1.375rem] font-medium leading-snug">“{bookends.close}”</p>
          </section>
        </div>
      ) : inquiry.message ? (
        <figure className="st-card m-0 mt-6 px-5 py-5 sm:px-6">
          <figcaption className="st-h2">Their message</figcaption>
          <blockquote className="m-0 mt-3 max-w-[44rem] whitespace-pre-wrap break-words text-[17px] leading-7">{inquiry.message}</blockquote>
        </figure>
      ) : null}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <div>
          <InquiryActivityPanel inquiryId={inquiry.id} activity={activity} canSchedule={canSchedule} />
        </div>

        <aside className="st-card grid gap-8 px-5 py-5 sm:px-6">
          <section aria-labelledby="contact-title">
            <h2 id="contact-title" className="st-h2">Contact</h2>
            <dl className="mt-3 divide-y divide-[var(--tq-surface-2)] border-y border-[var(--tq-surface-2)] text-sm">
              <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[var(--tq-ink-mute)]">Email</dt>
                <dd className="min-w-0 break-all font-medium"><a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a></dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[var(--tq-ink-mute)]">Phone</dt>
                <dd className="font-medium tabular-nums">{inquiry.phone ? (digits ? <a href={`tel:+${digits}`} className="hover:underline">{formatPhone(inquiry.phone)}</a> : inquiry.phone) : "Not given"}</dd>
              </div>
              {inquiry.referral ? (
                <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                  <dt className="text-[var(--tq-ink-mute)]">Heard about us</dt>
                  <dd className="min-w-0 break-words font-medium">{inquiry.referral}</dd>
                </div>
              ) : null}
              <div className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[var(--tq-ink-mute)]">Last contact</dt>
                <dd className="font-medium">{lastContact ? `${dallasDateTime(lastContact.created_at)} (${waitLabel(lastContact.created_at, now)} ago)` : "Not recorded"}</dd>
              </div>
            </dl>
          </section>

          {originPanel ?? (source.length ? (
            <section aria-labelledby="source-title">
              <h2 id="source-title" className="st-h2">Where they came from</h2>
              <dl className="mt-3 divide-y divide-[var(--tq-surface-2)] border-y border-[var(--tq-surface-2)] text-sm">
                {source.map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                    <dt className="text-[var(--tq-ink-mute)]">{label}</dt>
                    <dd className="min-w-0 break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null)}

          <section aria-labelledby="pipeline-title">
            <h2 id="pipeline-title" className="st-h2">Booked or closed?</h2>
            <p className="mt-1 text-sm text-[var(--tq-ink-mute)]">Update when the family books or decides not to.</p>
            <InquiryActions id={inquiry.id} status={inquiry.status} lostReason={inquiry.lost_reason} competitorName={inquiry.competitor_name} />
          </section>
        </aside>
      </div>
    </main>
  );
}
