import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { InquiryActions } from "@/components/admin/InquiryActions";
import { ArrowIcon } from "@/components/admin/StudioIcons";
import type { LeadWorkItem } from "@/lib/admin-workflow";
import type { BookingRow } from "@/lib/clients-db";
import { formatEventDate } from "@/lib/booking";
import { PUBLIC_TIER_IDS, TIER_NAME_EN, usd, type PriceBook } from "@/lib/commission";
import type { RangedStats } from "@/lib/analytics-db";
import type { PulseMove } from "@/lib/pulse-moves";
import type { SocialSheet } from "@/lib/social";
import { StudioPulse } from "@/components/admin/charts/StudioPulse";

const priority: Record<LeadWorkItem["priority"], { label: string; tone: string; dot: string }> = {
  overdue: { label: "Overdue", tone: "text-[var(--tq-status-down)] font-medium", dot: "bg-[var(--tq-status-limited)]" },
  due_today: { label: "Due today", tone: "text-[var(--tq-status-down)] font-medium", dot: "bg-[var(--tq-status-limited)]" },
  unreplied: { label: "Needs reply", tone: "text-[var(--tq-ink)] font-medium", dot: "bg-[var(--tq-ink)]" },
  scheduled: { label: "Scheduled", tone: "text-[var(--tq-ink-mute)]", dot: "bg-[var(--tq-stone)]" },
  keep_warm: { label: "Keep in touch", tone: "text-[var(--tq-ink-mute)]", dot: "bg-[var(--tq-stone)]" },
};

const TZ = "America/Chicago";
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "Sat, Nov 21" — adds the year only when it isn't this year. */
function shortDate(isoDay: string, thisYear: string) {
  const d = new Date(`${isoDay}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", ...(isoDay.slice(0, 4) !== thisYear ? { year: "numeric" } : {}), timeZone: TZ });
}

export type TodayData = {
  work: LeadWorkItem[];
  due: number;
  unreplied: number;
  paid: BookingRow[];
  review: BookingRow[];
  upcoming: BookingRow[];
  book: PriceBook;
  stats: RangedStats;
  range: number;
  moves: PulseMove[];
  social: SocialSheet;
};

/**
 * The studio's "Today" screen. Work first (payment review, the reply queue,
 * the next dates), then how the site is doing, then prices. Data comes from
 * app/admin/page.tsx. Built from Mobbin refs HoneyBook / Gumloop / Shopify
 * home screens (see the PR).
 */
export function TodayView({ work, due, unreplied, paid, review, upcoming, book, stats, range, moves, social }: TodayData) {
  const now = new Date();
  const todayLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TZ });
  const thisYear = now.toLocaleDateString("en-US", { year: "numeric", timeZone: TZ });
  const summary =
    due || unreplied
      ? [due ? `${plural(due, "follow-up")} due` : "", unreplied ? `${plural(unreplied, "family", "families")} waiting on a first reply` : ""].filter(Boolean).join(" · ")
      : work.length
        ? "Nothing due today. Your queue is on schedule."
        : "Your queue is clear.";

  const metrics = [
    { value: due, label: "Follow-ups due", href: "/admin/inquiries?view=due", alert: due > 0 },
    { value: unreplied, label: "Awaiting reply", href: "/admin/inquiries?view=unreplied", alert: unreplied > 0 },
    { value: work.length, label: "Open inquiries", href: "/admin/inquiries", alert: false },
    { value: paid.length, label: "Booked celebrations", href: "/admin/bookings", alert: false },
  ];

  return (
    <main className="mx-auto max-w-[96rem] px-4 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <AutoRefresh seconds={45} />

      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0">
          <h1 className="m-0 text-[clamp(2.25rem,1.8rem+2vw,3.25rem)] font-normal leading-[var(--tq-leading-tight)] tracking-[-0.035em]">Today</h1>
          <p className="m-0 mt-2 text-base text-[var(--tq-ink-mute)]">
            <time dateTime={now.toISOString().slice(0, 10)}>{todayLabel}</time>
            <span aria-hidden="true"> · </span>
            {summary}
          </p>
        </div>
        <Link href="/admin/inquiries" className="st-btn">
          Open inquiries <ArrowIcon />
        </Link>
      </header>

      {review.length > 0 && (
        <Link
          href="/admin/bookings"
          className="st-card mt-6 flex min-h-14 items-center justify-between gap-4 px-5 py-3 transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-surface)] sm:px-6"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--tq-status-limited)]" />
            <span className="min-w-0">
              <strong className="font-semibold">Payment review</strong>
              <span className="text-[var(--tq-ink-mute)]"> · {plural(review.length, "booking")} {review.length === 1 ? "needs" : "need"} your attention</span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium">
            Review <ArrowIcon />
          </span>
        </Link>
      )}

      <div className="st-card mt-6 grid grid-cols-2 gap-px overflow-hidden bg-[var(--tq-surface-2)] lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="group flex min-h-28 flex-col justify-between gap-4 bg-white p-4 transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-canvas)] focus-visible:-outline-offset-2 sm:p-6"
          >
            <span className="text-[15px] leading-5 text-[var(--tq-ink-mute)]">{metric.label}</span>
            <span className="flex items-end justify-between gap-2">
              <span className={`st-num text-[2.25rem] leading-none ${metric.alert ? "text-[var(--tq-status-down)]" : ""}`}>{metric.value}</span>
              <ArrowIcon className="mb-1 text-[var(--tq-stone)] group-hover:text-[var(--tq-ink)]" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.85fr)_minmax(19rem,0.85fr)]">
        <section aria-labelledby="queue-title" className="st-card">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pb-3 pt-5 sm:px-6">
            <h2 id="queue-title" className="m-0 text-[length:var(--tq-text-h3)] font-normal tracking-[var(--tq-tracking-display)]">
              Priority queue {work.length > 0 && <span className="st-num text-[var(--tq-ink-mute)]">{work.length}</span>}
            </h2>
            <Link href="/admin/inquiries" className="st-link">
              All inquiries <ArrowIcon />
            </Link>
          </div>
          {work.length === 0 ? (
            <div className="border-t border-[var(--tq-surface-2)] px-5 py-12 sm:px-6">
              <p className="m-0 text-lg font-medium">Your client queue is clear.</p>
              <p className="m-0 mt-2 text-[15px] text-[var(--tq-ink-mute)]">New inquiries and planned follow-ups will appear here.</p>
            </div>
          ) : (
            <>
              <div aria-hidden="true" className="st-label hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_2.75rem] gap-5 border-t border-[var(--tq-surface-2)] px-6 py-2.5 md:grid">
                <span>Client</span>
                <span>Celebration</span>
                <span>Next step</span>
                <span />
              </div>
              <ul className="m-0 list-none p-0">
                {work.slice(0, 6).map(({ inquiry, priority: p, nextReminder, lastContact }) => (
                  <li
                    key={inquiry.id}
                    className="group relative flex flex-col gap-1 border-t border-[var(--tq-surface-2)] px-5 py-3 pr-16 transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-canvas)] sm:px-6 sm:pr-16 md:grid md:min-h-[4.5rem] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_2.75rem] md:items-center md:gap-5 md:pr-6"
                  >
                    {/* The name's link covers the row; the actions menu sits above it. */}
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="flex min-h-11 min-w-0 flex-col justify-center after:absolute after:inset-0 after:content-['']">
                      <span className="truncate text-[15px] font-semibold group-hover:underline group-hover:underline-offset-4">{inquiry.name}</span>
                      <span className={`mt-0.5 inline-flex items-center gap-1.5 text-[13px] ${priority[p].tone}`}>
                        <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${priority[p].dot}`} />
                        {priority[p].label}
                      </span>
                    </Link>
                    <p className="m-0 min-w-0 truncate text-sm text-[var(--tq-ink-mute)]">
                      {inquiry.event_date ? formatEventDate(inquiry.event_date) : "Date to confirm"}
                      {inquiry.venue ? ` · ${inquiry.venue}` : ""}
                    </p>
                    <p className="m-0 min-w-0 truncate text-sm text-[var(--tq-ink-mute)]">
                      {nextReminder?.due_at
                        ? `Follow up ${new Date(nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ })} · ${nextReminder.note}`
                        : lastContact
                          ? "No next step set"
                          : "No personal contact recorded"}
                    </p>
                    <div className="absolute right-3 top-2 z-10 md:static">
                      <InquiryActions id={inquiry.id} name={inquiry.name} status={(inquiry.status ?? "new") as "new"} />
                    </div>
                  </li>
                ))}
              </ul>
              {work.length > 6 && (
                <div className="border-t border-[var(--tq-surface-2)] px-5 py-2 sm:px-6">
                  <Link href="/admin/inquiries" className="st-link">
                    {plural(work.length - 6, "more inquiry", "more inquiries")} <ArrowIcon />
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="grid min-w-0 gap-6">
          <section aria-labelledby="upcoming-title" className="st-card px-5 pb-3 pt-5 sm:px-6">
            <h2 id="upcoming-title" className="m-0 text-[length:var(--tq-text-h3)] font-normal tracking-[var(--tq-tracking-display)]">Upcoming dates</h2>
            {upcoming.length ? (
              <ul className="m-0 mt-3 list-none p-0">
                {upcoming.slice(0, 4).map((booking) => (
                  <li key={booking.id} className="flex items-baseline justify-between gap-4 border-t border-[var(--tq-surface-2)] py-3">
                    <span className="min-w-0 truncate text-[15px] font-medium">{booking.name}</span>
                    <time dateTime={booking.event_date} className="shrink-0 font-[family-name:var(--tq-font-mono)] text-[13px] text-[var(--tq-ink-mute)]">
                      {shortDate(booking.event_date, thisYear)}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-3 border-t border-[var(--tq-surface-2)] pt-3 text-[15px] text-[var(--tq-ink-mute)]">Paid celebrations will appear here.</p>
            )}
            <div className="border-t border-[var(--tq-surface-2)] pt-1">
              <Link href="/admin/bookings" className="st-link">
                View bookings <ArrowIcon />
              </Link>
            </div>
          </section>
          <section aria-labelledby="insights-title" className="st-card px-5 pb-3 pt-5 sm:px-6">
            <h2 id="insights-title" className="m-0 text-[length:var(--tq-text-h3)] font-normal tracking-[var(--tq-tracking-display)]">Page by page</h2>
            <p className="m-0 mt-2 text-[15px] leading-6 text-[var(--tq-ink-mute)]">Time on each page, where families leave, live visitors, and your change log.</p>
            <Link href={`/admin/insights?range=${range}`} className="st-link">
              Open the full report <ArrowIcon />
            </Link>
          </section>
        </aside>
      </div>

      <div className="mt-14">
        <StudioPulse s={stats} basePath="/admin" range={range} moves={moves} social={social} />
      </div>

      <section aria-labelledby="prices-title" className="st-card mt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-5 pb-5 pt-6 sm:px-6">
          <div className="min-w-0 max-w-[40rem]">
            <h2 id="prices-title" className="m-0 text-[length:var(--tq-text-h3)] font-normal tracking-[var(--tq-tracking-display)]">Your prices</h2>
            <p className="m-0 mt-2 text-base leading-6 text-[var(--tq-ink-mute)]">
              Change them here. When you press Save, the homepage, package cards, comparison table, inquiry form and every page update at once.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/prices" className="st-btn">
              Change prices <ArrowIcon />
            </Link>
            <Link href="/admin/packages" className="st-btn-ghost min-h-[var(--tq-tap-primary)]">
              Change what&apos;s included <ArrowIcon />
            </Link>
          </div>
        </div>
        <dl className="m-0 grid grid-cols-2 gap-px border-y border-[var(--tq-surface-2)] bg-[var(--tq-surface-2)] sm:grid-cols-3 lg:grid-cols-5">
          {PUBLIC_TIER_IDS.map((id) => (
            <div key={id} className="bg-white px-5 py-4 sm:px-6">
              <dt className="text-sm text-[var(--tq-ink-mute)]">{TIER_NAME_EN[id]}</dt>
              <dd className="st-num m-0 mt-1 text-2xl">{usd(book.packages[id].price)}</dd>
              <dd className="m-0 text-sm text-[var(--tq-ink-mute)]">{plural(book.packages[id].hours, "hour")} included</dd>
            </div>
          ))}
          {/* fill the grid's last row so no empty hairline cell shows */}
          <div aria-hidden="true" className="bg-white sm:hidden" />
          <div aria-hidden="true" className="hidden bg-white sm:block lg:hidden" />
        </dl>
        <p className="m-0 px-5 py-3 text-sm text-[var(--tq-ink-mute)] sm:px-6">
          {book.depositPercent}% deposit · the rest due {book.balanceDueDays} days before the event
          {book.updatedAt
            ? ` · last changed ${new Date(book.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TZ })}`
            : " · launch prices"}
        </p>
      </section>
    </main>
  );
}
