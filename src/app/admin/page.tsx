import Link from "next/link";
import { getDashboardStats, type RangedStats } from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

const RANGES = [7, 14, 30] as const;

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function MetricCard({
  label,
  value,
  helper,
  emphasis,
}: {
  label: string;
  value: string;
  helper?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-line p-5 ${emphasis ? "bg-ink text-cream" : "bg-white"}`}>
      <p className={`text-[0.66rem] uppercase tracking-[0.18em] ${emphasis ? "text-cream/70" : "text-ink-faint"}`}>
        {label}
      </p>
      <p className={`mt-3 font-display text-3xl tabular-nums ${emphasis ? "text-cream" : "text-ink"}`}>{value}</p>
      {helper ? (
        <p className={`mt-1.5 text-xs ${emphasis ? "text-cream/60" : "text-ink-soft"}`}>{helper}</p>
      ) : null}
    </div>
  );
}

function RankedList({ title, items, empty }: { title: string; items: { label: string; count: number }[]; empty: string }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">{title}</p>
      <div className="mt-4 space-y-2.5">
        {items.length === 0 ? (
          <p className="text-sm text-ink-faint">{empty}</p>
        ) : (
          items.map((i) => (
            <div key={i.label} className="relative">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-ink">{i.label}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">{i.count}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-greige">
                <div className="h-full rounded-full bg-wine/60" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InsightPanel({ insights }: { insights: RangedStats["insights"] }) {
  const tone = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    info: "text-ink-soft",
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">What to do next</p>
      <ul className="mt-4 space-y-3">
        {insights.length === 0 ? (
          <li className="text-sm text-ink-faint">Insights appear as data comes in.</li>
        ) : (
          insights.map((ins, i) => (
            <li key={i} className={`flex gap-2.5 text-sm leading-relaxed ${tone[ins.type]}`}>
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              {ins.text}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

const MANAGE = [
  { href: "/admin/bookings", title: "Bookings" },
  { href: "/admin/inquiries", title: "Leads" },
  { href: "/admin/hero", title: "Hero" },
  { href: "/admin/portfolio", title: "Portfolio" },
  { href: "/admin/videos", title: "Videos" },
];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = RANGES.includes(Number(rangeParam) as (typeof RANGES)[number])
    ? (Number(rangeParam) as number)
    : 14;
  const s = await getDashboardStats(range);
  const maxDaily = Math.max(...s.daily.map((d) => d.count), 1);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      {/* header + range */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.28em] text-ink-faint">Business overview</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Studio</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {s.configured
              ? "Live traffic, bookings, and what to do next — last "
              : "Connect Supabase to see live analytics — last "}
            {range} days.
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              className={`rounded-full px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                r === range ? "bg-ink text-cream" : "border border-line text-ink-soft hover:text-ink"
              }`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      {/* money + pipeline */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Booked value" value={money(s.bookedValue)} helper={`${s.paid} paid`} emphasis />
        <MetricCard label="Pipeline" value={money(s.pipelineValue)} helper={`${s.requests} requests · ${s.pendingHolds} holds`} />
        <MetricCard label="Open leads" value={String(s.openLeads)} helper={`${s.totalInquiries} all-time`} />
        <MetricCard label="Inquiry → paid" value={`${s.inquiryToBooked}%`} helper="Conversion" />
      </section>

      {/* traffic */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Views today" value={String(s.today)} helper={`${s.last7} in 7 days`} />
        <MetricCard label="Visitors" value={String(s.uniqueSessions)} helper={`${s.pagesPerSession} pages/session`} />
        <MetricCard label="Bounce rate" value={`${s.bounceRate}%`} helper="Single-page sessions" />
        <MetricCard label="Intent" value={String(s.formStarts + s.ctaClicks + s.shares)} helper={`${s.formStarts} starts · ${s.ctaClicks} CTA · ${s.shares} shares`} />
      </section>

      {/* chart + insights */}
      <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">Visits per day · last {range} days</p>
          <div className="mt-6 flex h-40 items-end gap-1.5 border-b border-line pb-2">
            {s.daily.map((d) => {
              const isToday = d.date === todayKey;
              return (
                <div key={d.date} className="group flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${d.count}`}>
                  <div
                    className={`w-full rounded-t-sm ${isToday ? "bg-ink" : "bg-wine/30 group-hover:bg-wine/55"}`}
                    style={{ height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 6 : 1)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
            <span>{s.daily[0]?.date.slice(5)}</span>
            <span>peak {maxDaily}</span>
            <span>today</span>
          </div>
        </div>
        <InsightPanel insights={s.insights} />
      </section>

      {/* funnel */}
      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">Booking funnel · last {range} days traffic, all-time pipeline</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {s.funnel.map((step, i) => {
            const prev = i > 0 ? s.funnel[i - 1].value : 0;
            const pct = i > 0 && prev > 0 ? Math.round((step.value / prev) * 100) : null;
            return (
              <div key={step.label} className="rounded-xl bg-greige p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">{step.label}</p>
                <p className="mt-2 font-display text-2xl text-ink tabular-nums">{step.value}</p>
                {pct !== null ? <p className="mt-1 text-xs text-ink-soft">{pct}% of prior</p> : <p className="mt-1 text-xs text-ink-faint">top of funnel</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ranked lists */}
      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <RankedList title="Top pages" items={s.topPages} empty="No page views yet" />
        <RankedList title="Referrers" items={s.topReferrers} empty="No referrer data yet" />
        <RankedList title="Campaigns (UTM)" items={s.utmSources} empty="No tagged traffic yet" />
      </section>

      {/* manage */}
      <section className="mt-10">
        <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">Manage</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MANAGE.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-2xl border border-line bg-white p-5 text-center transition-colors hover:border-wine"
            >
              <span className="font-display text-lg text-ink">{m.title}</span>
              <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.16em] text-wine">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      {!s.configured ? (
        <p className="mt-8 text-sm text-ink-faint">Analytics tables are ready; data will populate as visitors browse the live site.</p>
      ) : null}
    </main>
  );
}
