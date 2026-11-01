import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { listPlans } from "@/lib/plan-db";
import { formatPlanDate, planPath, PLAN_STATUSES, type PlanRecord, type PlanStatus } from "@/lib/plan";
import { colorById, colorLabel } from "@/lib/quince-colors";
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

const sourceOf = (p: PlanRecord) => p.source ?? p.attribution?.source ?? "direct";
const created = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

function Colors({ plan }: { plan: PlanRecord }) {
  if (!plan.colors.length) return <span className="text-[#696965]">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {plan.colors.map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e5e5e3] px-2 py-0.5 text-xs">
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
      <span className="block truncate font-medium text-[#252525]">{plan.name}</span>
      {plan.phone ? <a href={`sms:${plan.phone}`} className="block truncate text-xs text-[#4d4d49] underline">{plan.phone}</a> : null}
      {plan.email ? <a href={`mailto:${plan.email}`} className="block truncate text-xs text-[#4d4d49] underline">{plan.email}</a> : null}
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

  return (
    <main className="mx-auto max-w-[86rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:px-12 lg:pt-11">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e5e5e3] pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Client work / Quince plans</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal leading-tight tracking-[-0.035em]">Plans</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/availability" className="inline-flex min-h-11 items-center rounded-sm border border-[#dcdcd9] px-4 text-sm font-medium hover:border-[#252525]">Date availability</Link>
          <Link href="/plan?src=fb-group" target="_blank" className="inline-flex min-h-11 items-center rounded-sm bg-[#242424] px-4 text-sm font-medium text-white hover:bg-[#444]">Open the intake ↗</Link>
        </div>
      </div>

      {loadError ? <p role="alert" className="mt-6 rounded-sm border border-[#f0c9c5] bg-[#f8e8e7] px-4 py-3 text-sm text-[#8f4039]">{loadError}</p> : null}

      <section aria-labelledby="by-source" className="mt-7">
        <h2 id="by-source" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">By source</h2>
        {sources.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {sources.map(([name, s]) => (
              <li key={name}>
                <Link href={qs({ src: src === name ? null : name })} aria-current={src === name ? "true" : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 text-sm ${src === name ? "border-[#252525] bg-[#252525] text-white" : "border-[#dcdcd9] hover:border-[#252525]"}`}>
                  <span className="font-medium">{name}</span>
                  <span className="tabular-nums">{s.plans} plans · {s.booked} booked{s.plans ? ` (${Math.round((s.booked / s.plans) * 100)}%)` : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-[#696965]">No plans yet. Share <code>txquince.com/plan?src=fb-group</code> in a group reply.</p>}
      </section>

      <nav aria-label="Plan views" className="mt-7 flex gap-6 overflow-x-auto border-b border-[#e5e5e3]">
        {VIEWS.map((v) => (
          <Link key={v.id} href={qs({ view: v.id })} aria-current={view === v.id ? "page" : undefined}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-1 text-sm ${view === v.id ? "border-[#252525] font-semibold" : "border-transparent text-[#696965] hover:text-[#252525]"}`}>
            {v.label}<span className="tabular-nums text-xs font-normal text-[#62625f]">{counts[v.id]}</span>
          </Link>
        ))}
      </nav>

      <p className="py-5 text-sm text-[#696965]">Showing <span className="font-medium tabular-nums text-[#252525]">{shown.length}</span> {shown.length === 1 ? "plan" : "plans"}{src ? <> from <strong>{src}</strong></> : null}</p>

      {shown.length ? (
        <section aria-label="Plans" className="border-y border-[#e5e5e3] bg-white">
          <div className="hidden lg:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead><tr className="border-b border-[#e5e5e3] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">
                <th scope="col" className="w-[19%] px-5 py-4">Family</th>
                <th scope="col" className="w-[17%] px-3 py-4">Date</th>
                <th scope="col" className="w-[11%] px-3 py-4">City</th>
                <th scope="col" className="w-[19%] px-3 py-4">Colors</th>
                <th scope="col" className="w-[11%] px-3 py-4">Source</th>
                <th scope="col" className="w-[14%] px-3 py-4">Status</th>
                <th scope="col" className="w-[9%] px-3 py-4"><span className="sr-only">Plan page</span></th>
              </tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className="border-b border-[#ededeb] align-top last:border-0">
                    <th scope="row" className="px-5 py-4 font-normal"><Contact plan={p} /><span className="mt-1 block text-xs text-[#696965]">{created(p.created_at)} · {p.language === "es" ? "ES" : "EN"}</span></th>
                    <td className="px-3 py-4">{formatPlanDate(p.event_date, "en")}{p.theme ? <span className="mt-1 block truncate text-xs text-[#696965]">{p.theme}</span> : null}</td>
                    <td className="truncate px-3 py-4">{p.city}</td>
                    <td className="px-3 py-4"><Colors plan={p} /></td>
                    <td className="truncate px-3 py-4"><Link href={qs({ src: sourceOf(p) })} className="underline">{sourceOf(p)}</Link></td>
                    <td className="px-3 py-3"><PlanStatusSelect id={p.id} status={p.status} family={p.name} /></td>
                    <td className="px-3 py-3"><a href={planPath(p.slug, p.language)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline">Plan ↗</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-[#ededeb] lg:hidden">
            {shown.map((p) => (
              <li key={p.id} className="grid gap-3 px-4 py-5 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><Contact plan={p} /></div>
                  <PlanStatusSelect id={p.id} status={p.status} family={p.name} />
                </div>
                <p>{formatPlanDate(p.event_date, "en")} · {p.city}</p>
                <Colors plan={p} />
                <p className="flex flex-wrap items-center gap-x-4 text-xs text-[#696965]">
                  <span>{created(p.created_at)} · {p.language === "es" ? "ES" : "EN"} · {sourceOf(p)}</span>
                  <a href={planPath(p.slug, p.language)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm text-[#252525] underline">Plan ↗</a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : !loadError ? <p className="border-y border-[#e5e5e3] py-10 text-center text-sm text-[#696965]">No plans in this view.</p> : null}
      <p className="mt-6 text-xs text-[#696965]">Statuses: {PLAN_STATUSES.join(" · ")}. A paid “Hold my date” deposit marks the plan Booked automatically.</p>
    </main>
  );
}
