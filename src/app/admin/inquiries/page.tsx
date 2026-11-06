import Link from "next/link";
import { StudioPage } from "@/components/admin/StudioPage";
import { InquiryActions } from "@/components/admin/InquiryActions";
import { getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { buildLeadWork, countDue } from "@/lib/admin-workflow";
import { formatEventDate } from "@/lib/booking";
import { requireAdminPage } from "@/lib/require-admin";
import { summarizeAttribution } from "@/lib/attribution";
import { dallasDateTime, hoursSince, waitLabel } from "@/lib/inquiry-time";

export const dynamic = "force-dynamic";

type View = "all" | "due" | "unreplied" | "open" | "won" | "lost";
const views: { id: View; label: string }[] = [
  { id: "all", label: "All" }, { id: "due", label: "Follow-ups due" }, { id: "unreplied", label: "Awaiting reply" },
  { id: "open", label: "Open" }, { id: "won", label: "Won" }, { id: "lost", label: "Lost" },
];

export default async function AdminInquiries({ searchParams }: { searchParams: Promise<{ view?: string; q?: string }> }) {
  await requireAdminPage("/admin/inquiries"); // server-side gate; middleware is not enough
  const [inquiries, activity, params] = await Promise.all([getInquiries(), getInquiryActivity(), searchParams]);
  const now = new Date();
  /** "3 h ago", red once a family has waited a day without a reply. */
  const receivedAgo = (item: (typeof inquiries)[number]) => {
    const w = waitLabel(item.created_at, now);
    return w === "Just now" ? "Just now" : `${w} ago`;
  };
  const waitingLong = (item: (typeof inquiries)[number]) => byId.get(item.id)?.priority === "unreplied" && hoursSince(item.created_at, now) >= 24;
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
    return !query || [item.name, item.email, item.venue, item.services, originLine(item)].some((value) => value?.toLowerCase().includes(query));
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

  /** "Instagram · sent from /budget" (shown as "via …") — one line on where the lead came from. */
  function originLine(item: (typeof inquiries)[number]) {
    const o = summarizeAttribution(item.attribution);
    if (!o) return null;
    return o.sentFrom ? `${o.source} · sent from ${o.sentFrom}` : o.source;
  }

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

  function tone(label: string) {
    if (label === "Overdue" || label === "Due today" || label === "Needs reply") return "urgent";
    if (label === "Won") return "good";
    return undefined;
  }

  return (
    <StudioPage
      title="Inquiries"
      intro={`Every family who reached out. ${counts.unreplied ? `${counts.unreplied} waiting on a first reply.` : "No one is waiting on a first reply."}`}
    >
      <div className="grid gap-4">
        <nav aria-label="Inquiry views" className="st-tabs">
          {views.map((item) => (
            <Link
              key={item.id}
              href={`/admin/inquiries?view=${item.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              className="st-tab"
            >
              {item.label}<span className="st-count">{counts[item.id]}</span>
            </Link>
          ))}
        </nav>
        <form action="/admin/inquiries" role="search" className="grid w-full max-w-xl grid-cols-[minmax(0,1fr)_auto] gap-2">
          <label htmlFor="inquiry-search" className="sr-only">Search inquiries</label>
          <input id="inquiry-search" name="q" defaultValue={params.q ?? ""} placeholder="Search name, email, venue or source" className="st-input w-full" />
          <input type="hidden" name="view" value={view} />
          <button type="submit" className="st-btn-ghost">Search</button>
        </form>
      </div>

      <section aria-label="Inquiry results" className="st-card overflow-hidden">
        {filtered.length ? <>
          <div className="hidden md:block">
            <table className="st-table table-fixed">
              <thead><tr>
                <th scope="col" className="w-[27%]">Family</th>
                <th scope="col" className="w-[14%]">Received</th>
                <th scope="col" className="w-[21%]">Celebration</th>
                <th scope="col" className="w-[18%]">Next step</th>
                <th scope="col" className="w-[13%]">Status</th>
                <th scope="col" className="w-[7%]"><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {filtered.map((item) => {
                  const next = byId.get(item.id);
                  const label = statusLabel(item);
                  const nextStep = next?.nextReminder?.due_at
                    ? `Follow up ${new Date(next.nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}`
                    : next?.lastContact ? "No next step set" : next ? "No personal contact recorded" : item.email;
                  return <tr key={item.id}>
                    <th scope="row" className="text-[15px] font-semibold">
                      <Link href={`/admin/inquiries/${item.id}`} className="-my-2.5 block truncate py-2.5 hover:underline hover:underline-offset-4">{item.name}</Link>
                      <span className="mt-1 block truncate text-xs font-normal text-[var(--tq-ink-mute)]">{item.email}</span>
                      {originLine(item) && <span className="mt-1 block truncate text-xs font-normal text-[var(--tq-ink-mute)]">via {originLine(item)}</span>}
                    </th>
                    <td className="text-sm">
                      <time dateTime={item.created_at} title={dallasDateTime(item.created_at)} className={`block truncate font-medium ${waitingLong(item) ? "text-[var(--tq-status-down)]" : "text-[var(--tq-ink)]"}`}>{receivedAgo(item)}</time>
                      <span className="mt-1 block truncate text-xs text-[var(--tq-ink-mute)]">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}</span>
                    </td>
                    <td className="text-sm">
                      <span className="block truncate">{item.event_date ? formatEventDate(item.event_date) : "Date to confirm"}</span>
                      {item.venue && <span className="mt-1 block truncate text-xs text-[var(--tq-ink-mute)]">{item.venue}</span>}
                    </td>
                    <td className="text-sm text-[var(--tq-ink-mute)]"><span className="block truncate">{nextStep}</span></td>
                    <td><span className="st-chip" data-tone={tone(label)}>{label}</span></td>
                    <td className="!py-2 text-right"><InquiryActions id={item.id} name={item.name} status={(item.status ?? "new") as "new"} /></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <ul className="m-0 list-none divide-y divide-[var(--tq-surface-2)] p-0 md:hidden">
            {filtered.map((item) => {
              const next = byId.get(item.id);
              const label = statusLabel(item);
              return <li key={item.id} className="relative">
                <div className="absolute right-3 top-3 z-10"><InquiryActions id={item.id} name={item.name} status={(item.status ?? "new") as "new"} /></div>
                <Link href={`/admin/inquiries/${item.id}`} className="block px-5 py-5 pr-16 focus-visible:-outline-offset-2">
                  <span className="flex items-start justify-between gap-3"><span className="min-w-0 break-words text-base font-medium">{item.name}</span></span>
                  <span className="mt-1 block break-all text-xs text-[var(--tq-ink-mute)]">{item.email}</span>
                  {originLine(item) && <span className="mt-1 block break-words text-xs text-[var(--tq-ink-mute)]">via {originLine(item)}</span>}
                  <span className={`mt-2 block text-xs font-medium ${waitingLong(item) ? "text-[var(--tq-status-down)]" : "text-[var(--tq-ink-mute)]"}`}>Received {receivedAgo(item)} · {dallasDateTime(item.created_at)}</span>
                  <span className="mt-2 block text-sm text-[var(--tq-ink-mute)]">{item.event_date ? formatEventDate(item.event_date) : "Date to confirm"}{item.venue ? ` · ${item.venue}` : ""}</span>
                  <span className="mt-2 block text-xs text-[var(--tq-ink-mute)]">{next?.nextReminder?.due_at
                    ? `Follow up ${new Date(next.nextReminder.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}`
                    : next?.lastContact ? "No next step set" : next ? "No personal contact recorded" : item.email}</span>
                  <span className="st-chip mt-3" data-tone={tone(label)}>{label}</span>
                </Link>
              </li>;
            })}
          </ul>
        </> : <div className="st-empty">
          <p className="m-0 text-lg font-medium">No families in this view.</p>
          <p className="st-note mt-1">Try another view or search.</p>
          <Link href="/admin/inquiries" className="st-link">See all inquiries</Link>
        </div>}
      </section>
    </StudioPage>
  );
}
