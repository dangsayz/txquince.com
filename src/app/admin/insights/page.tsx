import Link from "next/link";
import { getDashboardStats, getConversionChanges, type RangedStats } from "@/lib/analytics-db";
import { ChangeLog } from "@/components/admin/ChangeLog";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

function mins(s: number) {
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

export const dynamic = "force-dynamic";

const RANGES = [7, 14, 30] as const;

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="min-w-0 border-b border-line px-5 py-6 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-3 text-[clamp(1.6rem,2.5vw,2rem)] font-medium tracking-[-0.04em] tabular-nums text-ink">{value}</p>
      {helper ? <p className="mt-1 text-xs text-ink-faint">{helper}</p> : null}
    </div>
  );
}

function RankedList({ title, items, empty }: { title: string; items: { label: string; count: number }[]; empty: string }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="min-w-0 border border-line bg-white p-5">
      <p className="text-sm font-medium text-ink">{title}</p>
      <div className="mt-4 space-y-2.5">
        {items.length === 0 ? (
          <p className="text-base text-ink-faint">{empty}</p>
        ) : (
          items.map((i) => (
            <div key={i.label} className="relative">
              <div className="flex items-center justify-between gap-3 text-base">
                <span className="min-w-0 truncate text-ink">{i.label}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">{i.count}</span>
              </div>
              <div className="mt-1 h-0.5 overflow-hidden bg-greige">
                <div className="h-full bg-ink/70" style={{ width: `${(i.count / max) * 100}%` }} />
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
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-medium text-ink">What to do next</p>
      <ul className="mt-4 space-y-3">
        {insights.length === 0 ? (
          <li className="text-base text-ink-faint">Insights appear as data comes in.</li>
        ) : (
          insights.map((ins, i) => (
            <li key={i} className={`flex gap-2.5 text-base leading-relaxed ${tone[ins.type]}`}>
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              {ins.text}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = RANGES.includes(Number(rangeParam) as (typeof RANGES)[number])
    ? (Number(rangeParam) as number)
    : 14;
  const [s, changes] = await Promise.all([getDashboardStats(range), getConversionChanges()]);
  const maxDaily = Math.max(...s.daily.map((d) => d.count), 1);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-[90rem] px-5 pb-20 pt-8 md:px-10 md:pt-12 lg:px-16">
      <AutoRefresh seconds={30} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">Studio / Business</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-ink">Insights</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {s.configured
              ? `Live traffic, bookings, and what to do next — last ${range} days.`
              : "Live analytics will appear when the data connection is available."}
          </p>
        </div>
        <div role="group" aria-label="Analytics period" className="flex flex-wrap gap-0 border-b border-line">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/insights?range=${r}`}
              aria-current={r === range ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border-b-2 px-4 py-1.5 text-sm font-medium transition-colors ${
                r === range ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      {/* payment-review alert — money collected but NOT auto-confirmed. Must never
          be silently missed: a family paid and may be owed their date or a refund. */}
      {s.paymentReview > 0 ? (
        <Link
          href="/admin/bookings"
          className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-amber-400 bg-amber-50 p-5 transition-colors hover:border-amber-600"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Needs review</p>
            <p className="mt-1 text-base text-ink">
              {s.paymentReview} payment{s.paymentReview === 1 ? "" : "s"} collected but not auto-confirmed
              {s.paymentReviewValue ? ` · ${money(s.paymentReviewValue)} held` : ""} — verify the date or refund.
            </p>
          </div>
          <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-amber-700">Open →</span>
        </Link>
      ) : null}

      {s.bottleneck ? (
        <section className="mt-6 rounded-lg border border-line bg-ivory p-5">
          <div className="flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">
              Fix this first — your weakest funnel edge
            </p>
          </div>
          <p className="mt-3 font-display text-xl text-ink">
            {s.bottleneck.edge}:{" "}
            <span className="text-accent-strong">{s.bottleneck.rate}%</span>
            <span className="ml-1.5 text-base text-ink-faint">healthy ≈ {s.bottleneck.baseline}%</span>
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">{s.bottleneck.action}</p>
        </section>
      ) : null}

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
            On the site right now
          </p>
          <span className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span aria-hidden className={`h-2 w-2 rounded-full ${s.liveNow.length ? "bg-emerald-500" : "bg-line"}`} />
            {s.liveNow.length} visitor{s.liveNow.length === 1 ? "" : "s"}
          </span>
        </div>
        {s.liveNow.length ? (
          <ul className="mt-3 divide-y divide-line">
            {s.liveNow.map((v, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 py-2 text-base">
                <span className="truncate text-ink">{v.path === "/" ? "Homepage" : v.path}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">
                  {v.pages} pg · {mins(v.seconds)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-base text-ink-faint">Quiet right now — refreshes every 30s.</p>
        )}
      </section>

      <section aria-label="Booking metrics" className="mt-8 grid overflow-hidden border border-line bg-white sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Booked value" value={money(s.bookedValue)} helper={`${s.paid} paid`} />
        <MetricCard label="Pipeline" value={money(s.pipelineValue)} helper={`${s.requests} requests · ${s.pendingHolds} holds`} />
        <MetricCard label="Open leads" value={String(s.openLeads)} helper={`${s.totalInquiries} all-time`} />
        <MetricCard label="Inquiry → paid" value={`${s.inquiryToBooked}%`} helper="Conversion" />
      </section>

      <section aria-label="Traffic metrics" className="mt-4 grid overflow-hidden border border-line bg-white sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Views today" value={String(s.today)} helper={`${s.last7} in 7 days`} />
        <MetricCard label="Visitors" value={String(s.uniqueSessions)} helper={`${s.pagesPerSession} pages/session`} />
        <MetricCard label="Bounce rate" value={`${s.bounceRate}%`} helper="Single-page sessions" />
        <MetricCard label="Intent" value={String(s.formStarts + s.ctaClicks + s.shares + s.dateChecks)} helper={`${s.dateChecks} date checks · ${s.formStarts} starts · ${s.ctaClicks} CTA · ${s.shares} shares`} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Visits per day · last {range} days</p>
          <div className="mt-6 flex h-40 items-end gap-1.5 border-b border-line pb-2">
            {s.daily.map((d) => {
              const isToday = d.date === todayKey;
              return (
                <div key={d.date} className="group flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${d.count}`}>
                  <div
                    className={`w-full rounded-t-sm ${isToday ? "bg-ink" : "bg-ink/25 group-hover:bg-ink/45"}`}
                    style={{ height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 6 : 1)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs uppercase tracking-[0.14em] text-ink-faint">
            <span>{s.daily[0]?.date.slice(5)}</span>
            <span>peak {maxDaily}</span>
            <span>today</span>
          </div>
        </div>
        <InsightPanel insights={s.insights} />
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Booking funnel · last {range} days traffic, all-time pipeline</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {s.funnel.map((step, i) => {
            const prev = i > 0 ? s.funnel[i - 1].value : 0;
            const pct = i > 0 && prev > 0 ? Math.round((step.value / prev) * 100) : null;
            return (
              <div key={step.label} className="rounded-md border border-line bg-ivory p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">{step.label}</p>
                <p className="mt-2 font-display text-2xl text-ink tabular-nums">{step.value}</p>
                {pct !== null ? <p className="mt-1 text-xs text-ink-soft">{pct}% of prior</p> : <p className="mt-1 text-xs text-ink-faint">top of funnel</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          Page behavior · time on page &amp; exits
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-base">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 text-right font-medium">Views</th>
                <th className="pb-2 text-right font-medium">Avg time</th>
                <th className="pb-2 text-right font-medium">Exit %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {s.engagement.map((p) => (
                <tr key={p.path}>
                  <td className="max-w-[14rem] truncate py-2 text-ink">
                    {p.path === "/" ? "Homepage" : p.path}
                  </td>
                  <td className="py-2 text-right tabular-nums text-ink-soft">{p.views}</td>
                  <td className="py-2 text-right tabular-nums text-ink-soft">
                    {p.avgSeconds ? mins(p.avgSeconds) : "—"}
                  </td>
                  <td className={`py-2 text-right tabular-nums ${p.exitRate >= 70 ? "font-medium text-accent-strong" : "text-ink-soft"}`}>
                    {p.exitRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          High exit % on a money page (investment, reserve) = the leak to fix. High exit on
          blog posts is normal.
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          This week&apos;s flywheel · computed from live data
        </p>
        <ul className="mt-4 space-y-3">
          {s.flywheel.map((f) => (
            <li key={f.label} className="flex gap-3">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm ${
                  f.done ? "bg-emerald-600 text-white" : "border border-accent text-accent"
                }`}
              >
                {f.done ? "✓" : "!"}
              </span>
              <span className="text-base leading-snug">
                <span className={f.done ? "text-ink-soft line-through decoration-ink/30" : "font-medium text-ink"}>
                  {f.label}
                </span>
                <span className="block text-xs text-ink-faint">{f.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <RankedList title="Top pages" items={s.topPages} empty="No page views yet" />
        <RankedList title="Referrers" items={s.topReferrers} empty="No referrer data yet" />
        <RankedList title="Campaigns (UTM)" items={s.utmSources} empty="No tagged traffic yet" />
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          Revenue &amp; leads by source
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Where each booking &amp; lead first came from (tag your links with{" "}
          <code className="text-ink">?utm_source=</code> to sharpen this).
        </p>
        {s.bySource.length === 0 ? (
          <p className="mt-4 text-base text-ink-faint">
            No attributed leads or bookings yet — they&apos;ll appear here as inquiries and date
            requests come in.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 text-right font-medium">Leads</th>
                  <th className="pb-2 text-right font-medium">Requests</th>
                  <th className="pb-2 text-right font-medium">Booked&nbsp;$</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {s.bySource.map((r) => (
                  <tr key={r.source}>
                    <td className="py-2 capitalize text-ink">{r.source}</td>
                    <td className="py-2 text-right tabular-nums text-ink-soft">{r.leads}</td>
                    <td className="py-2 text-right tabular-nums text-ink-soft">{r.requests}</td>
                    <td className="py-2 text-right tabular-nums font-medium text-ink">
                      {r.bookedValue ? money(r.bookedValue) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-4">
        <ChangeLog initial={changes} />
      </section>

      {!s.configured ? (
        <p className="mt-8 text-base text-ink-faint">Analytics tables are ready; data will populate as visitors browse the live site.</p>
      ) : null}
    </main>
  );
}
