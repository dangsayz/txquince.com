import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { buildLeadWork, countDue } from "@/lib/admin-workflow";
import { getBookings, getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { formatEventDate } from "@/lib/booking";

export const dynamic = "force-dynamic";

const priorityLabel = {
  overdue: "Overdue",
  due_today: "Due today",
  unreplied: "Needs reply",
  scheduled: "Scheduled",
  keep_warm: "Keep in touch",
};

export default async function AdminHome() {
  const [inquiries, activity, bookings] = await Promise.all([getInquiries(), getInquiryActivity(), getBookings()]);
  const work = buildLeadWork(inquiries, activity);
  const due = countDue(work);
  const unreplied = work.filter((item) => item.priority === "unreplied").length;
  const paid = bookings.filter((booking) => booking.status === "paid");
  const review = bookings.filter((booking) => booking.status === "payment_review");
  const upcoming = paid
    .filter((booking) => booking.event_date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const metrics = [
    { value: due, label: "Follow-ups due", href: "/admin/inquiries?view=due" },
    { value: unreplied, label: "Awaiting reply", href: "/admin/inquiries?view=unreplied" },
    { value: work.length, label: "Open inquiries", href: "/admin/inquiries" },
    { value: paid.length, label: "Booked celebrations", href: "/admin/bookings" },
  ];

  return (
    <main className="mx-auto max-w-[96rem] px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
      <AutoRefresh seconds={45} />
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#e6e6e4] pb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#62625f]">Workspace / Overview</p>
          <h1 className="mt-4 text-[clamp(2rem,3vw,2.7rem)] font-normal leading-tight tracking-[-0.05em] text-[#242424]">Today</h1>
          <p className="mt-2 text-sm leading-6 text-[#62625f]">Your next conversations, dates, and booking activity.</p>
        </div>
        <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center gap-3 bg-[#242424] px-5 text-sm font-medium text-white transition-colors hover:bg-[#444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
          Open inquiries <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 border border-[#e6e6e4] bg-white lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Link key={metric.label} href={metric.href} className={`group flex min-h-32 flex-col justify-between p-5 transition-colors hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black sm:p-6 ${index < 2 ? "border-b border-[#e6e6e4] lg:border-b-0" : ""} ${index % 2 === 0 ? "border-r border-[#e6e6e4]" : ""} ${index === 1 ? "lg:border-r lg:border-[#e6e6e4]" : ""}`}>
            <span className="text-sm text-[#62625f]">{metric.label}</span>
            <span className="flex items-end justify-between text-[2rem] font-normal leading-none tabular-nums tracking-[-0.06em] text-[#242424]">
              {metric.value}<span aria-hidden="true" className="text-base text-[#aaa9a5] group-hover:text-[#242424]">↗</span>
            </span>
          </Link>
        ))}
      </div>

      {review.length > 0 && (
        <Link href="/admin/bookings" className="mt-6 flex min-h-14 items-center justify-between gap-4 border-l-[3px] border-[#bd8730] bg-[#f7f4ec] px-5 py-3 text-sm text-[#493920] transition-colors hover:bg-[#f2eddf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
          <span><strong className="font-semibold">Payment review</strong> · {review.length} booking{review.length === 1 ? " needs" : "s need"} your attention</span>
          <span aria-hidden="true">↗</span>
        </Link>
      )}

      <div className="mt-10 grid items-start gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.8fr)]">
        <section aria-labelledby="queue-title" className="min-w-0 border border-[#e6e6e4] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e6e4] px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Client work</p>
              <h2 id="queue-title" className="mt-1 text-xl font-normal tracking-[-0.03em]">Priority queue</h2>
            </div>
            <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[#353535] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">All inquiries <span aria-hidden="true">↗</span></Link>
          </div>
          {work.length === 0 ? (
            <div className="px-6 py-14">
              <p className="text-lg font-medium">Your client queue is clear.</p>
              <p className="mt-2 text-sm text-[#62625f]">New inquiries and planned follow-ups will appear here.</p>
            </div>
          ) : (
            <>
              <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto] gap-5 border-b border-[#e6e6e4] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#62625f] md:grid">
                <span>Client</span><span>Celebration</span><span>Next step</span><span className="w-4" />
              </div>
              <div>
                {work.slice(0, 6).map(({ inquiry, priority, nextReminder, lastContact }) => (
                  <Link key={inquiry.id} href={`/admin/inquiries/${inquiry.id}`} className="group flex flex-col gap-2 border-b border-[#e6e6e4] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black sm:px-6 md:grid md:min-h-20 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-center md:gap-5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#252525] group-hover:underline">{inquiry.name}</p>
                      <span className={`mt-1 inline-flex items-center gap-1.5 text-xs ${priority === "overdue" || priority === "due_today" ? "text-[#9b6918]" : priority === "unreplied" ? "text-[#8d4f4f]" : "text-[#72726e]"}`}>
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${priority === "overdue" || priority === "due_today" ? "bg-[#bd8730]" : priority === "unreplied" ? "bg-[#a36363]" : "bg-[#aaa9a5]"}`} />
                        {priorityLabel[priority]}
                      </span>
                    </div>
                    <p className="min-w-0 truncate text-sm text-[#62625f]">{inquiry.event_date ? formatEventDate(inquiry.event_date) : "Date to confirm"}{inquiry.venue ? ` · ${inquiry.venue}` : ""}</p>
                    <p className="min-w-0 truncate text-sm text-[#62625f]">{nextReminder?.due_at ? `Follow up ${new Date(nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })} · ${nextReminder.note}` : lastContact ? "No next step set" : "No personal contact recorded"}</p>
                    <span aria-hidden="true" className="hidden text-base text-[#aaa9a5] group-hover:text-[#242424] md:block">↗</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="min-w-0 space-y-8">
          <section aria-labelledby="upcoming-title" className="border border-[#e6e6e4] bg-white px-5 py-5 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">On the calendar</p>
            <h2 id="upcoming-title" className="mt-1 text-xl font-normal tracking-[-0.03em]">Upcoming dates</h2>
            {upcoming.length ? (
              <div className="mt-5 border-t border-[#e6e6e4]">
                {upcoming.slice(0, 4).map((booking) => (
                  <div key={booking.id} className="border-b border-[#e6e6e4] py-4 text-sm">
                    <p className="truncate font-medium">{booking.name}</p>
                    <p className="mt-1 text-xs text-[#62625f]">{formatEventDate(booking.event_date)}</p>
                  </div>
                ))}
              </div>
            ) : <p className="mt-5 border-t border-[#e6e6e4] pt-4 text-sm text-[#62625f]">Paid celebrations will appear here.</p>}
            <Link href="/admin/bookings" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">View bookings <span aria-hidden="true">↗</span></Link>
          </section>
          <section aria-labelledby="insights-title" className="border-t border-[#e6e6e4] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Studio pulse</p>
            <h2 id="insights-title" className="mt-1 text-xl font-normal tracking-[-0.03em]">What is working</h2>
            <p className="mt-3 text-sm leading-6 text-[#62625f]">See traffic, sources, and conversion trends alongside your client work.</p>
            <Link href="/admin/insights" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Open insights <span aria-hidden="true">↗</span></Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
