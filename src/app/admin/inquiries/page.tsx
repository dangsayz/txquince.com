import Link from "next/link";
import { getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { buildLeadWork, countDue } from "@/lib/admin-workflow";
import { formatEventDate } from "@/lib/booking";

export const dynamic = "force-dynamic";

type View = "all" | "due" | "unreplied" | "open" | "won" | "lost";
const views: { id: View; label: string }[] = [
  { id: "all", label: "All" }, { id: "due", label: "Follow-ups due" }, { id: "unreplied", label: "Awaiting reply" },
  { id: "open", label: "Open" }, { id: "won", label: "Won" }, { id: "lost", label: "Lost" },
];

export default async function AdminInquiries({ searchParams }: { searchParams: Promise<{ view?: string; q?: string }> }) {
  const [inquiries, activity, params] = await Promise.all([getInquiries(), getInquiryActivity(), searchParams]);
  const work = buildLeadWork(inquiries, activity);
  const byId = new Map(work.map((item) => [item.inquiry.id, item]));
  const rankById = new Map(work.map((item, index) => [item.inquiry.id, index]));
  const view: View = views.some((item) => item.id === params.view) ? params.view as View : "all";
  const query = (params.q ?? "").trim().toLowerCase();
  const filtered = inquiries.filter((item) => {
    const priority = byId.get(item.id)?.priority;
    if (view === "due" && priority !== "overdue" && priority !== "due_today") return false;
    if (view === "unreplied" && priority !== "unreplied") return false;
    if (view === "open" && (item.status !== "new" || item.unsubscribed_at)) return false;
    if (view === "won" && item.status !== "won") return false;
    if (view === "lost" && item.status !== "lost") return false;
    return !query || [item.name, item.email, item.venue, item.services].some((value) => value?.toLowerCase().includes(query));
  }).sort((a, b) => {
    const aRank = rankById.get(a.id);
    const bRank = rankById.get(b.id);
    if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
    if (aRank !== undefined) return -1;
    if (bRank !== undefined) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
  const counts: Record<View, number> = {
    all: inquiries.length,
    due: countDue(work),
    unreplied: work.filter((item) => item.priority === "unreplied").length,
    open: work.length,
    won: inquiries.filter((item) => item.status === "won").length,
    lost: inquiries.filter((item) => item.status === "lost").length,
  };

  function statusLabel(item: (typeof inquiries)[number]) {
    const priority = byId.get(item.id)?.priority;
    if (priority === "overdue") return "Overdue";
    if (priority === "due_today") return "Due today";
    if (priority === "unreplied") return "Needs reply";
    if (priority === "scheduled") return "Scheduled";
    if (item.status === "won") return "Won";
    if (item.status === "lost") return "Lost";
    if (item.unsubscribed_at) return "Unsubscribed";
    return "Open";
  }

  function statusClass(label: string) {
    if (label === "Overdue" || label === "Due today") return "bg-[#fdf1dd] text-[#76520f]";
    if (label === "Needs reply") return "bg-[#f8e8e7] text-[#8f4039]";
    if (label === "Won") return "bg-[#e9f1e9] text-[#365c43]";
    return "bg-[#f0f0ee] text-[#555550]";
  }

  return (
    <main className="mx-auto max-w-[86rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:px-12 lg:pt-11">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e5e5e3] pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Client work / Inquiries</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal leading-tight tracking-[-0.035em]">Inquiries</h1>
        </div>
        <p className="text-sm text-[#676762]">{inquiries.length} {inquiries.length === 1 ? "family" : "families"} in your studio</p>
      </div>

      <nav aria-label="Inquiry views" className="mt-7 flex gap-6 overflow-x-auto border-b border-[#e5e5e3]">
        {views.map((item) => (
          <Link
            key={item.id}
            href={`/admin/inquiries?view=${item.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            aria-current={view === item.id ? "page" : undefined}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] ${view === item.id ? "border-[#252525] font-semibold text-[#252525]" : "border-transparent text-[#696965] hover:text-[#252525]"}`}
          >
            {item.label}<span className="tabular-nums text-xs font-normal text-[#62625f]">{counts[item.id]}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <p className="text-sm text-[#696965]">Showing <span className="font-medium tabular-nums text-[#252525]">{filtered.length}</span> {filtered.length === 1 ? "inquiry" : "inquiries"}</p>
        <form action="/admin/inquiries" className="flex w-full max-w-md items-stretch gap-2 sm:w-auto sm:flex-1">
          <label htmlFor="inquiry-search" className="sr-only">Search inquiries</label>
          <input id="inquiry-search" name="q" defaultValue={params.q ?? ""} placeholder="Search name, email, venue, or service"
            className="min-h-11 min-w-0 flex-1 rounded-sm border border-[#dcdcd9] bg-white px-3.5 text-sm text-[#252525] placeholder:text-[#62625f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]" />
          <input type="hidden" name="view" value={view} />
          <button type="submit" className="min-h-11 rounded-sm bg-[#242424] px-4 text-sm font-medium text-white transition-colors hover:bg-[#444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">Search</button>
        </form>
      </div>

      <section aria-label="Inquiry results" className="border-y border-[#e5e5e3] bg-white">
        {filtered.length ? <>
          <div className="hidden md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead><tr className="border-b border-[#e5e5e3] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">
                <th scope="col" className="w-[30%] px-5 py-4 font-semibold">Client</th>
                <th scope="col" className="w-[24%] px-4 py-4 font-semibold">Celebration</th>
                <th scope="col" className="w-[26%] px-4 py-4 font-semibold">Next step</th>
                <th scope="col" className="w-[14%] px-4 py-4 font-semibold">Status</th>
                <th scope="col" className="w-[6%] px-2 py-4"><span className="sr-only">Open</span></th>
              </tr></thead>
              <tbody>
                {filtered.map((item) => {
                  const next = byId.get(item.id);
                  const label = statusLabel(item);
                  const nextStep = next?.nextReminder?.due_at
                    ? `Follow up ${new Date(next.nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}`
                    : next?.lastContact ? "No next step set" : next ? "No personal contact recorded" : item.email;
                  return <tr key={item.id} className="border-b border-[#ededeb] last:border-0 hover:bg-[#f8f8f7]">
                    <th scope="row" className="px-5 py-5 text-sm font-medium">
                      <Link href={`/admin/inquiries/${item.id}`} className="block truncate text-[#252525] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">{item.name}</Link>
                      <span className="mt-1 block truncate text-xs font-normal text-[#696965]">{item.email}</span>
                    </th>
                    <td className="px-4 py-5 align-top text-sm text-[#4d4d49]">
                      <span className="block truncate">{item.event_date ? formatEventDate(item.event_date) : "Date to confirm"}</span>
                      {item.venue && <span className="mt-1 block truncate text-xs text-[#696965]">{item.venue}</span>}
                    </td>
                    <td className="px-4 py-5 align-top text-sm text-[#575753]"><span className="block truncate">{nextStep}</span></td>
                    <td className="px-4 py-5 align-top"><span className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(label)}`}>{label}</span></td>
                    <td className="px-2 py-3 text-right align-top"><Link href={`/admin/inquiries/${item.id}`} aria-label={`Open ${item.name}`} className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#555] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">↗</Link></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-[#ededeb] md:hidden">
            {filtered.map((item) => {
              const next = byId.get(item.id);
              const label = statusLabel(item);
              return <li key={item.id}>
                <Link href={`/admin/inquiries/${item.id}`} className="block px-1 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">
                  <span className="flex items-start justify-between gap-3"><span className="min-w-0 break-words text-base font-medium">{item.name}</span><span aria-hidden="true" className="text-[#777]">↗</span></span>
                  <span className="mt-1 block break-all text-xs text-[#62625f]">{item.email}</span>
                  <span className="mt-2 block text-sm text-[#62625e]">{item.event_date ? formatEventDate(item.event_date) : "Date to confirm"}{item.venue ? ` · ${item.venue}` : ""}</span>
                  <span className="mt-2 block text-xs text-[#696965]">{next?.nextReminder?.due_at
                    ? `Follow up ${new Date(next.nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}`
                    : next?.lastContact ? "No next step set" : next ? "No personal contact recorded" : item.email}</span>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(label)}`}>{label}</span>
                </Link>
              </li>;
            })}
          </ul>
        </> : <div className="px-5 py-16 text-center">
          <h2 className="text-lg font-medium tracking-[-0.02em]">No inquiries in this view</h2>
          <p className="mt-2 text-sm text-[#73736f]">Try another view or search term.</p>
          <Link href="/admin/inquiries" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]">See all inquiries</Link>
        </div>}
      </section>
    </main>
  );
}
