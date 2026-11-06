import { sourceKey } from "@/lib/src-tag";
import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { listPlans } from "@/lib/plan-db";
import { formatPlanDate, planPath, type PlanRecord, type PlanStatus } from "@/lib/plan";
import { colorById, colorLabel } from "@/lib/quince-colors";
import { StudioPage } from "@/components/admin/StudioPage";
import { PlanStatusSelect } from "@/components/admin/PlanStatusSelect";

export const dynamic = "force-dynamic";

type View = "all" | PlanStatus;
const VIEWS: { id: View; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "replied", label: "Replied" },
  { id: "booked", label: "Booked" },
  { id: "lost", label: "Lost" },
];

const sourceOf = (p: PlanRecord) => p.source ?? sourceKey(p.attribution);
const created = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

function Colors({ plan }: { plan: PlanRecord }) {
  if (!plan.colors.length) return <span className="text-[var(--tq-ink-mute)]">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {plan.colors.map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--tq-surface-2)] px-2 py-0.5 text-xs">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border border-[#bbb]" style={{ background: colorById(c).hex }} />
          {colorLabel(c, "en")}
        </span>
      ))}
    </span>
  );
}

function Contact({ plan }: { plan: PlanRecord }) {
  return (
    <>
      <span className="block truncate font-medium text-[var(--tq-ink)]">{plan.name}</span>
      {plan.phone ? <a href={`sms:${plan.phone}`} className="block truncate leading-[2.75rem] text-[13px] text-[var(--tq-ink-mute)] underline underline-offset-4">{plan.phone}</a> : null}
      {plan.email ? <a href={`mailto:${plan.email}`} className="block truncate leading-[2.75rem] text-[13px] text-[var(--tq-ink-mute)] underline underline-offset-4">{plan.email}</a> : null}
    </>
  );
}

export default async function AdminPlans({ searchParams }: { searchParams: Promise<{ view?: string; src?: string }> }) {
  await requireAdminPage("/admin/plans");
  const params = await searchParams;
  let plans: PlanRecord[] = [];
  let loadError: string | null = null;
  try {
    plans = await listPlans();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load plans.";
  }

  const view: View = VIEWS.some((v) => v.id === params.view) ? (params.view as View) : "all";
  const src = params.src && /^[a-z0-9_-]{1,40}$/.test(params.src) ? params.src : null;
  const shown = plans.filter((p) => (view === "all" || p.status === view) && (!src || sourceOf(p) === src));
  const counts = Object.fromEntries(VIEWS.map((v) => [v.id, v.id === "all" ? plans.length : plans.filter((p) => p.status === v.id).length])) as Record<View, number>;

  // Which group / post produced plans and bookings.
  const bySource = new Map<string, { plans: number; booked: number; lost: number }>();
  for (const p of plans) {
    const s = bySource.get(sourceOf(p)) ?? { plans: 0, booked: 0, lost: 0 };
    s.plans += 1;
    if (p.status === "booked") s.booked += 1;
    if (p.status === "lost") s.lost += 1;
    bySource.set(sourceOf(p), s);
  }
  const sources = [...bySource.entries()].sort((a, b) => b[1].booked - a[1].booked || b[1].plans - a[1].plans);
  const qs = (next: { view?: View; src?: string | null }) => {
    const v = next.view ?? view;
    const s = next.src === undefined ? src : next.src;
    const q = new URLSearchParams();
    if (v !== "all") q.set("view", v);
    if (s) q.set("src", s);
    const str = q.toString();
    return `/admin/plans${str ? `?${str}` : ""}`;
  };

  const newCount = counts.new;
  return (
    <StudioPage
      title="Plans"
      intro={`Families who made a free quince plan. ${newCount ? `${newCount} new, not replied to yet.` : "Everyone has a reply."}`}
      actions={<>
        <Link href="/admin/availability" className="st-btn-ghost">Date availability</Link>
        <a href="/plan?src=facebook" target="_blank" rel="noreferrer" className="st-btn">Open the plan form <span aria-hidden="true">↗</span></a>
      </>}
    >
      {loadError ? <p role="alert" className="st-card m-0 px-5 py-4 text-[15px] text-[var(--tq-status-down)]">{loadError}</p> : null}

      <div className="grid gap-4">
        <nav aria-label="Plan views" className="st-tabs">
          {VIEWS.map((v) => (
            <Link key={v.id} href={qs({ view: v.id })} aria-current={view === v.id ? "page" : undefined} className="st-tab">
              {v.label}<span className="st-count">{counts[v.id]}</span>
            </Link>
          ))}
        </nav>
        {sources.length > 1 || src ? (
          <div className="flex flex-wrap items-center gap-2" aria-label="Filter by where the plan came from" role="group">
            <span className="mr-1 text-[15px] text-[var(--tq-ink-mute)]">From</span>
            {sources.map(([name, st]) => (
              <Link key={name} href={qs({ src: src === name ? null : name })} aria-current={src === name ? "true" : undefined} className="st-filter">
                {name} <span className="st-count">{st.plans} · {st.booked} booked</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {shown.length ? (
        <section aria-label="Plans" className="st-card overflow-hidden">
          <div className="hidden lg:block">
            <table className="st-table table-fixed text-sm">
              <thead><tr>
                <th scope="col" className="w-[24%]">Family</th>
                <th scope="col" className="w-[20%]">Date</th>
                <th scope="col" className="w-[22%]">Colors</th>
                <th scope="col" className="w-[11%]">From</th>
                <th scope="col" className="w-[14%]">Status</th>
                <th scope="col" className="w-[9%]"><span className="sr-only">Plan page</span></th>
              </tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" className="font-normal"><Contact plan={p} /><span className="mt-1 block text-xs text-[var(--tq-ink-mute)]">{created(p.created_at)} · {p.language === "es" ? "ES" : "EN"}</span></th>
                    <td>{formatPlanDate(p.event_date, "en")}<span className="mt-1 block truncate text-[13px] text-[var(--tq-ink-mute)]">{[p.city, p.theme].filter(Boolean).join(" · ")}</span></td>
                    <td><Colors plan={p} /></td>
                    <td className="truncate"><Link href={qs({ src: sourceOf(p) })} className="st-link">{sourceOf(p)}</Link></td>
                    <td className="!py-2"><PlanStatusSelect id={p.id} status={p.status} family={p.name} /></td>
                    <td className="!py-2"><a href={planPath(p.slug, p.language)} target="_blank" rel="noreferrer" className="st-link">Plan <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="m-0 list-none divide-y divide-[var(--tq-surface-2)] p-0 lg:hidden">
            {shown.map((p) => (
              <li key={p.id} className="grid gap-3 px-5 py-5 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><Contact plan={p} /></div>
                  <PlanStatusSelect id={p.id} status={p.status} family={p.name} />
                </div>
                <p>{formatPlanDate(p.event_date, "en")} · {p.city}</p>
                <Colors plan={p} />
                <p className="flex flex-wrap items-center gap-x-4 text-xs text-[var(--tq-ink-mute)]">
                  <span>{created(p.created_at)} · {p.language === "es" ? "ES" : "EN"} · {sourceOf(p)}</span>
                  <a href={planPath(p.slug, p.language)} target="_blank" rel="noreferrer" className="st-link">Plan <span aria-hidden="true">↗</span></a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : !loadError ? <div className="st-card st-empty"><p className="m-0 text-lg font-medium">No plans in this view.</p><p className="st-note mt-1">Share txquince.com/plan?src=facebook in a group reply to get new ones.</p></div> : null}
      <p className="st-note">A paid “Hold my date” deposit marks the plan Booked on its own.</p>
    </StudioPage>
  );
}
