import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { StudioBars } from "@/components/admin/StudioBars";
import { ArrowIcon } from "@/components/admin/StudioIcons";
import type { LeadWorkItem } from "@/lib/admin-workflow";
import type { BookingRow } from "@/lib/clients-db";
import type { DayPulse } from "@/lib/day-pulse";
import type { BehaviorSummary } from "@/lib/page-behavior";
import { VisitorBehavior } from "@/components/admin/VisitorBehavior";
import { BlogPanel, Empty, PanelHead, ReviewsPanel, SupportPanel } from "@/components/admin/TodayPanels";
import type { BlogPulseData } from "@/lib/blog-pulse-db";
import { needsOwner, type ReviewRecord } from "@/lib/review";
import type { OpenTicket } from "@/lib/support-db";

const TZ = "America/Chicago";
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const num = (n: number) => n.toLocaleString("en-US");

/** "Sat, Nov 21" from a YYYY-MM-DD day (noon UTC keeps the calendar day). */
function dayLabel(isoDay: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${isoDay}T12:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

function daysAway(isoDay: string, today: string) {
  const d = Math.round((Date.parse(`${isoDay}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
  return d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`;
}

const reason: Record<"overdue" | "due_today" | "unreplied", string> = {
  overdue: "Follow-up is late",
  due_today: "Follow up today",
  unreplied: "Waiting on your first reply",
};

export type TodayData = {
  pulse: DayPulse;
  /** This network is one of the owner's (home wifi), so nobody on it is counted. */
  networkExcluded?: boolean;
  work: LeadWorkItem[];
  review: BookingRow[];
  upcoming: BookingRow[];
  behavior?: BehaviorSummary & { configured: boolean; days: number };
  /** Journal comments waiting for approval. */
  comments?: number;
  /** Open support tickets, the longest wait first. */
  tickets?: OpenTicket[];
  /** Every review row; the panel shows the ones that wait for a decision. */
  reviews?: ReviewRecord[];
  blog?: BlogPulseData;
};

/**
 * The studio home. It answers three questions, in this order:
 *   1. How is the site doing today? (visitors, new families, the last 7 days)
 *   2. What needs me? (payments to check, families waiting, follow-ups due)
 *   3. What is coming up? (the next booked celebrations)
 *   4. Who is waiting? (support messages, reviews to approve) and how the
 *      blog is doing (components/admin/TodayPanels.tsx)
 * Everything deeper (sources, funnel, page by page) lives on /admin/insights.
 * Refs (Mobbin): Square "Today vs Yesterday" traffic, Mintlify 7-day visitor
 * bars, HoneyBook greeting + short lists. Data comes from app/admin/page.tsx.
 */
export function TodayView({ pulse, networkExcluded = false, work, review, upcoming, behavior, comments = 0, tickets = [], reviews = [], blog }: TodayData) {
  const now = new Date();
  const hour = Number(now.toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ })) % 24;
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TZ });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);

  const needs = work.filter((w): w is LeadWorkItem & { priority: keyof typeof reason } => w.priority in reason);
  const shown = needs.slice(0, 5);
  const todo = review.length + needs.length + (comments > 0 ? 1 : 0);
  const waitingReviews = reviews
    .filter(needsOwner)
    .sort((a, b) => (a.edit?.submitted_at ?? a.submitted_at ?? a.created_at).localeCompare(b.edit?.submitted_at ?? b.submitted_at ?? b.created_at));
  const allTodo = todo + tickets.length + waitingReviews.length;

  const summary = [
    !pulse.configured ? "" : pulse.visitorsToday ? `${plural(pulse.visitorsToday, "person", "people")} visited the site today` : "no one has visited the site yet today",
    pulse.configured && pulse.newFamiliesToday ? `${plural(pulse.newFamiliesToday, "new family", "new families")} reached out` : "",
    allTodo ? `${plural(allTodo, "thing")} ${allTodo === 1 ? "needs" : "need"} you` : "nothing needs you right now",
  ].filter(Boolean);
  const joined = summary.length > 1 ? `${summary.slice(0, -1).join(", ")} and ${summary.at(-1)}` : summary[0];
  const sentence = `${joined}.`;


  /* 3. Coming up */
  const comingUp = (
        <section aria-labelledby="upcoming-title" className="st-card h-full">
          <PanelHead id="upcoming-title" title="Coming up" count={upcoming.length} href="/admin/bookings" link="All bookings" hue="green" />
          {upcoming.length ? (
            <ul className="m-0 list-none p-0">
              {upcoming.slice(0, 4).map((b) => (
                <li key={b.id} className="flex items-baseline justify-between gap-4 border-t border-[var(--tq-surface-2)] px-5 py-3 sm:px-6">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold">{b.name}</span>
                    <time dateTime={b.event_date} className="text-sm text-[var(--tq-ink-mute)]">
                      {dayLabel(b.event_date, { weekday: "short", month: "short", day: "numeric" })}
                    </time>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-sm text-[var(--tq-ink-mute)]">{daysAway(b.event_date, today)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-t border-[var(--tq-surface-2)] px-5 py-5 sm:px-6">
              <p className="m-0 text-[17px] font-medium leading-7">No booked dates yet.</p>
              <p className="m-0 mt-0.5 text-[15px] text-[var(--tq-ink-mute)]">Booked celebrations show up here.</p>
            </div>
          )}
        </section>
  );
  // Nothing waits anywhere: the three "waiting" cards fold into one line.
  const quiet = todo === 0 && tickets.length === 0 && waitingReviews.length === 0;

  return (
    <main className="mx-auto max-w-[72rem] px-4 pb-20 pt-8 sm:px-8 lg:pt-12">
      <AutoRefresh seconds={45} />

      <header className="max-w-[44rem]">
        <p className="m-0 text-[15px] text-[var(--tq-ink-mute)]">
          <time dateTime={today}>{todayLabel}</time>
        </p>
        <h1 className="st-h1 mt-1">{greeting}</h1>
        <p className="m-0 mt-3 text-[length:var(--tq-text-lg)] leading-[1.45]">{sentence.charAt(0).toUpperCase() + sentence.slice(1)}</p>
      </header>

      {/* 1. The site today */}
      <section aria-labelledby="site-title" className="st-card mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5 sm:px-6">
          <h2 id="site-title" className="st-h2">Your site today</h2>
          <Link href="/admin/insights" className="st-link">
            Full report <ArrowIcon />
          </Link>
        </div>

        {!pulse.configured ? (
          <p className="m-0 px-5 pb-6 pt-2 text-[15px] text-[var(--tq-ink-mute)] sm:px-6">Visitor numbers appear here once the database connection is available.</p>
        ) : (
          <>
            <dl className="m-0 mt-3 grid grid-cols-2 gap-px border-y border-[var(--tq-surface-2)] bg-[var(--tq-surface-2)] lg:grid-cols-4">
              {[
                { hue: "blue", label: "Visitors", value: pulse.visitorsToday, href: "/admin/insights", open: "Open the full report", note: `Yesterday by now: ${num(pulse.visitorsYesterdaySoFar)}` },
                {
                  hue: "rose",
                  label: "New families",
                  value: pulse.newFamiliesToday,
                  href: "/admin/inquiries",
                  open: "Open inquiries",
                  note: (
                    <>
                      <Link href="/admin/inquiries" className="st-textlink">Inquiries</Link> and <Link href="/admin/plans" className="st-textlink">free plans</Link>
                    </>
                  ),
                },
                { hue: "green", label: "On the site now", value: pulse.liveNow, href: null, open: "", note: "In the last 5 minutes" },
                { hue: "slate", label: "Pages viewed", value: pulse.viewsToday, href: "/admin/insights", open: "Open the full report", note: pulse.visitorsToday ? `${(pulse.viewsToday / pulse.visitorsToday).toFixed(1)} per visitor` : "Since midnight" },
              ].map((m) => (
                <div key={m.label} className="flex min-w-0 flex-col bg-white px-5 py-4 sm:px-6">
                  <dt className="st-key text-[15px] text-[var(--tq-ink-mute)]" data-hue={m.hue}>{m.label}</dt>
                  <dd className="st-num m-0 mt-1 text-[2.25rem] leading-none">
                    {m.href ? (
                      <Link href={m.href} className="st-statlink" aria-label={`${num(m.value)} ${m.label.toLowerCase()}. ${m.open}`}>
                        {num(m.value)}
                        <ArrowIcon size={18} />
                      </Link>
                    ) : (
                      <span className="st-statlink">{num(m.value)}</span>
                    )}
                  </dd>
                  <dd className="m-0 mt-1 text-sm text-[var(--tq-ink-mute)]">{m.note}</dd>
                </div>
              ))}
            </dl>

            <div className="px-5 pb-5 pt-5 sm:px-6">
              <h3 className="m-0 text-[15px] font-medium">Visitors, last 7 days</h3>
              <div className="mt-4">
                <StudioBars days={pulse.week.map((d) => ({ date: d.date, value: d.visitors, extra: d.families }))} unit={["visitor", "visitors"]} extraUnit={["new family", "new families"]} />
              </div>
              <p className="m-0 mt-1 text-sm text-[var(--tq-ink-mute)]">
                <span className="font-medium text-[var(--st-rose)]">+n</span> under a day = new families who reached out that day.
              </p>
              <p className="m-0 mt-1 text-sm text-[var(--tq-ink-mute)]">
                Real visitors only. {networkExcluded ? "Your own visits, everyone on this network and test robots" : "Your own visits and test robots"} are not counted.
              </p>
            </div>
          </>
        )}
      </section>

      {behavior ? <VisitorBehavior data={behavior} /> : null}

      {quiet ? (
        <>
          <section aria-labelledby="clear-title" className="st-card mt-6 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <h2 id="clear-title" className="m-0 flex items-center gap-3 text-[17px] font-medium">
                <span aria-hidden="true" className="st-clear">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                </span>
                All clear. Nothing needs you.
              </h2>
              <nav aria-label="Where new things show up" className="flex flex-wrap items-center gap-x-6">
                <Link href="/admin/inquiries" className="st-link">Inquiries <ArrowIcon /></Link>
                <Link href="/admin/support" className="st-link">Support <ArrowIcon /></Link>
                <Link href="/admin/reviews" className="st-link">Reviews <ArrowIcon /></Link>
                {upcoming.length === 0 ? <Link href="/admin/bookings" className="st-link">Bookings <ArrowIcon /></Link> : null}
              </nav>
            </div>
          </section>
          {upcoming.length ? <div className="mt-6">{comingUp}</div> : null}
        </>
      ) : (
        <>
      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        {/* 2. What needs you */}
        <section aria-labelledby="needs-title" className="st-card h-full">
          <PanelHead id="needs-title" title="Needs you" count={todo} href="/admin/inquiries" link="All inquiries" hue="amber" />
          {todo === 0 ? (
            <Empty title="You're all caught up." note="New families and planned follow-ups show up here." />
          ) : (
            <ul className="m-0 list-none p-0">
              {review.map((b) => (
                <Row key={b.id} href="/admin/bookings" name={b.name} why="Paid, but the date needs your check" urgent detail={dayLabel(b.event_date, { month: "short", day: "numeric", year: "numeric" })} />
              ))}
              {comments > 0 ? (
                <Row href="/admin/comments" name={plural(comments, "new comment")} why="On the Journal, waiting for your approval" detail="Comments" />
              ) : null}
              {shown.map(({ inquiry, priority }) => (
                <Row
                  key={inquiry.id}
                  href={`/admin/inquiries/${inquiry.id}`}
                  name={inquiry.name}
                  why={reason[priority]}
                  urgent={priority !== "unreplied"}
                  detail={inquiry.event_date ? dayLabel(inquiry.event_date, { month: "short", day: "numeric", year: "numeric" }) : "Date to confirm"}
                />
              ))}
              {needs.length > shown.length && (
                <li className="border-t border-[var(--tq-surface-2)] px-5 py-1 sm:px-6">
                  <Link href="/admin/inquiries" className="st-link">
                    {plural(needs.length - shown.length, "more family", "more families")} <ArrowIcon />
                  </Link>
                </li>
              )}
            </ul>
          )}
        </section>

        {comingUp}
      </div>

      {/* 4. Who is waiting, and how the blog is doing */}
      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        <SupportPanel tickets={tickets} now={now} />
        <ReviewsPanel
          waiting={waitingReviews}
          live={reviews.filter((r) => r.status === "approved").length}
          unused={reviews.filter((r) => r.status === "invited").length}
          now={now}
        />
      </div>
        </>
      )}
      {blog ? <BlogPanel data={blog} /> : null}

      <nav aria-label="Shortcuts" className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/packages" className="st-btn-ghost">Change packages and prices</Link>
        <Link href="/admin/portfolio" className="st-btn-ghost">Add photos</Link>
      </nav>
    </main>
  );
}

function Row({ href, name, why, detail, urgent }: { href: string; name: string; why: string; detail: string; urgent?: boolean }) {
  return (
    <li className="border-t border-[var(--tq-surface-2)]">
      <Link
        href={href}
        className="group flex min-h-16 items-center justify-between gap-4 px-5 py-3 transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-canvas)] focus-visible:-outline-offset-2 sm:px-6"
      >
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold group-hover:underline group-hover:underline-offset-4">{name}</span>
          <span className={`mt-0.5 flex items-center gap-1.5 text-sm ${urgent ? "font-medium text-[var(--tq-status-down)]" : "text-[var(--tq-ink-mute)]"}`}>
            {urgent && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tq-status-limited)]" />}
            {why}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3 text-sm text-[var(--tq-ink-mute)]">
          <span className="hidden whitespace-nowrap sm:inline">{detail}</span>
          <ArrowIcon className="group-hover:text-[var(--tq-ink)]" />
        </span>
      </Link>
    </li>
  );
}
