import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { buildLeadWork, countDue } from "@/lib/admin-workflow";
import { getBookings, getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { formatEventDate } from "@/lib/booking";

export const dynamic = "force-dynamic";

const priorityLabel = {
  overdue: "Overdue follow-up",
  due_today: "Follow up today",
  unreplied: "Needs your reply",
  scheduled: "Follow-up scheduled",
  keep_warm: "Keep in touch",
};

export default async function AdminHome() {
  const [inquiries, activity, bookings] = await Promise.all([getInquiries(), getInquiryActivity(), getBookings()]);
  const work = buildLeadWork(inquiries, activity);
  const due = countDue(work);
  const unreplied = work.filter((item) => item.priority === "unreplied").length;
  const paid = bookings.filter((booking) => booking.status === "paid");
  const review = bookings.filter((booking) => booking.status === "payment_review");
  const upcoming = paid.filter((booking) => booking.event_date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <main className="mx-auto max-w-[92rem] px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <AutoRefresh seconds={45} />
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-wine">Your studio today</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">Stay close to every family.</h1>
          <p className="mt-3 max-w-2xl text-base text-ink-soft">Start with the people waiting on you. Open a client to record a conversation or plan the next touchpoint.</p>
        </div>
        <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-cream hover:bg-wine">Open inquiries <span aria-hidden className="ml-3">↗</span></Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { value: due, label: "Follow-ups due", href: "/admin/inquiries?view=due", tone: true },
          { value: unreplied, label: "Awaiting your reply", href: "/admin/inquiries?view=unreplied" },
          { value: work.length, label: "Open inquiries", href: "/admin/inquiries" },
          { value: paid.length, label: "Booked celebrations", href: "/admin/bookings" },
        ].map((metric) => <Link key={metric.label} href={metric.href} className={`flex min-h-32 flex-col justify-between rounded-2xl border p-5 transition-colors hover:border-wine/40 ${metric.tone ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink"}`}><span className={`text-xs font-medium uppercase tracking-[0.12em] ${metric.tone ? "text-cream/75" : "text-ink-soft"}`}>{metric.label}</span><span className="font-display text-4xl tabular-nums">{metric.value}</span></Link>)}
      </div>
      {review.length > 0 && <Link href="/admin/bookings" className="mt-6 flex min-h-14 items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm text-amber-950"><span>{review.length} booking{review.length === 1 ? " needs" : "s need"} payment review</span><span aria-hidden>↗</span></Link>}
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(19rem,0.85fr)]">
        <section className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 py-6 sm:px-7"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-wine">Client work</p><h2 className="mt-1 font-display text-3xl text-ink">Who needs attention</h2></div><Link href="/admin/inquiries" className="inline-flex min-h-11 items-center text-sm font-medium text-wine hover:underline">View all inquiries →</Link></div>
          {work.length === 0 ? <div className="px-7 py-14"><p className="font-display text-2xl text-ink">Your client queue is clear.</p><p className="mt-2 text-base text-ink-soft">New inquiries and planned follow-ups will appear here.</p></div> : <div>{work.slice(0, 6).map(({ inquiry, priority, nextReminder, lastContact }) => <Link key={inquiry.id} href={`/admin/inquiries/${inquiry.id}`} className="group flex min-h-28 flex-col justify-between gap-3 border-b border-line px-5 py-5 last:border-0 hover:bg-ivory sm:flex-row sm:items-center sm:px-7"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h3 className="font-display text-2xl text-ink group-hover:text-wine">{inquiry.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priority === "overdue" || priority === "due_today" ? "bg-amber-100 text-amber-900" : priority === "unreplied" ? "bg-rose-50 text-rose-800" : "bg-greige text-ink-soft"}`}>{priorityLabel[priority]}</span></div><p className="mt-1 text-sm text-ink-soft">{inquiry.event_date ? formatEventDate(inquiry.event_date) : "Date to confirm"}{inquiry.venue ? ` · ${inquiry.venue}` : ""}</p><p className="mt-1 text-sm text-ink-soft">{nextReminder?.due_at ? `Next: ${new Date(nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })} · ${nextReminder.note}` : lastContact ? "No next step set" : "No personal contact recorded"}</p></div><span aria-hidden className="self-end text-xl text-wine sm:self-auto">↗</span></Link>)}</div>}
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6"><p className="text-xs font-medium uppercase tracking-[0.14em] text-wine">On the calendar</p><h2 className="mt-1 font-display text-3xl text-ink">Upcoming dates</h2>{upcoming.length ? <div className="mt-5 space-y-4">{upcoming.slice(0, 4).map((booking) => <div key={booking.id} className="border-t border-line pt-4"><p className="font-medium text-ink">{booking.name}</p><p className="mt-1 text-sm text-ink-soft">{formatEventDate(booking.event_date)}</p></div>)}</div> : <p className="mt-5 text-sm text-ink-soft">Paid celebrations will appear here.</p>}<Link href="/admin/bookings" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-wine hover:underline">View bookings →</Link></section>
          <section className="rounded-2xl border border-line bg-ivory p-6"><p className="text-xs font-medium uppercase tracking-[0.14em] text-wine">Studio pulse</p><h2 className="mt-1 font-display text-3xl text-ink">See what is working</h2><p className="mt-3 text-sm leading-relaxed text-ink-soft">Traffic, sources, and conversion trends live in one place, away from your client queue.</p><Link href="/admin/insights" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-wine hover:underline">Open insights →</Link></section>
        </aside>
      </div>
    </main>
  );
}
