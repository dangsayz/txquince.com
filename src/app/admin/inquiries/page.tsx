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
    const aRank = work.findIndex((item) => item.inquiry.id === a.id);
    const bRank = work.findIndex((item) => item.inquiry.id === b.id);
    if (aRank >= 0 && bRank >= 0) return aRank - bRank;
    if (aRank >= 0) return -1;
    if (bRank >= 0) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
  const counts: Record<View, number> = { all: inquiries.length, due: countDue(work), unreplied: work.filter((item) => item.priority === "unreplied").length, open: work.length, won: inquiries.filter((item) => item.status === "won").length, lost: inquiries.filter((item) => item.status === "lost").length };
  return <main className="mx-auto max-w-[92rem] px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
    <p className="text-xs font-medium uppercase tracking-[0.18em] text-wine">Client relationships</p><h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Inquiries</h1><p className="mt-3 max-w-2xl text-base text-ink-soft">Find every family, see who needs a reply, and keep your next step in one place.</p>
    <form action="/admin/inquiries" className="mt-8 flex flex-wrap gap-3"><label htmlFor="inquiry-search" className="sr-only">Search inquiries</label><input id="inquiry-search" name="q" defaultValue={params.q ?? ""} placeholder="Search name, email, venue, or service" className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-ink-faint sm:min-w-80"/><input type="hidden" name="view" value={view}/><button className="min-h-12 rounded-xl bg-ink px-6 text-sm font-medium text-cream hover:bg-wine">Search</button></form>
    <nav aria-label="Inquiry views" className="mt-7 flex gap-2 overflow-x-auto pb-2">{views.map((item) => <Link key={item.id} href={`/admin/inquiries?view=${item.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`} aria-current={view === item.id ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm ${view === item.id ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink-soft hover:text-ink"}`}>{item.label}<span className="ml-2 tabular-nums opacity-70">{counts[item.id]}</span></Link>)}</nav>
    <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white" aria-label="Inquiry results">{filtered.length ? filtered.map((item) => { const next = byId.get(item.id); const label = next?.priority === "overdue" ? "Overdue" : next?.priority === "due_today" ? "Due today" : next?.priority === "unreplied" ? "Needs reply" : next?.priority === "scheduled" ? "Scheduled" : item.status === "won" ? "Won" : item.status === "lost" ? "Lost" : item.unsubscribed_at ? "Unsubscribed" : "Open"; return <Link key={item.id} href={`/admin/inquiries/${item.id}`} className="group flex min-h-28 flex-col gap-3 border-b border-line px-5 py-5 last:border-0 hover:bg-ivory sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl text-ink group-hover:text-wine">{item.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${label === "Overdue" || label === "Due today" ? "bg-amber-100 text-amber-900" : label === "Needs reply" ? "bg-rose-50 text-rose-800" : "bg-greige text-ink-soft"}`}>{label}</span></div><p className="mt-1 text-sm text-ink-soft">{item.event_date ? formatEventDate(item.event_date) : "Date to confirm"}{item.venue ? ` · ${item.venue}` : ""}</p><p className="mt-1 text-sm text-ink-soft">{next?.nextReminder?.due_at ? `Next follow-up ${new Date(next.nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}` : next?.lastContact ? "No next step set" : next ? "No personal contact recorded" : item.email}</p></div><span className="self-end text-sm font-medium text-wine sm:self-auto">Open client ↗</span></Link> }) : <div className="p-10 text-center"><h2 className="font-display text-2xl text-ink">No inquiries in this view.</h2><p className="mt-2 text-sm text-ink-soft">Try another view or search term.</p><Link href="/admin/inquiries" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-wine underline">See all inquiries</Link></div>}</section>
  </main>;
}
