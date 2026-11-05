import Link from "next/link";
import type { RangedStats } from "@/lib/analytics-db";
import { TrendChart } from "./TrendChart";
import { FunnelFlow } from "./FunnelFlow";
import { RankedTabs } from "./RankedTabs";

export const PULSE_RANGES = [7, 14, 30] as const;

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/**
 * Studio pulse — the site's own analytics on the main dashboard: traffic and
 * leads over time, the booking funnel with its bottleneck, and where it all
 * came from. Data: getDashboardStats (first-party page views + lead events +
 * inquiries, plans and bookings), so no trip to Search Console or GA needed.
 */
export function StudioPulse({ s, basePath, range }: { s: RangedStats; basePath: string; range: number }) {
  const tabs = [
    {
      id: "pages",
      label: "Top pages",
      unit: "Views",
      rows: s.topPages.map((p) => ({ label: p.label, value: p.count })),
      empty: "No page views yet.",
    },
    {
      id: "referrers",
      label: "Referrers",
      unit: "Views",
      rows: s.topReferrers.map((p) => ({ label: p.label, value: p.count })),
      empty: "No referrer data yet.",
    },
    {
      id: "campaigns",
      label: "Campaigns",
      unit: "Views",
      rows: s.utmSources.map((p) => ({ label: p.label, value: p.count })),
      empty: "No tagged links yet. Add ?utm_source= or ?src= to the links you share.",
    },
    {
      id: "sources",
      label: "Lead sources",
      unit: "Leads",
      rows: s.bySource.map((r) => ({ label: r.source, value: r.leads, note: r.bookedValue ? `${money(r.bookedValue)} booked` : undefined })),
      empty: "Leads appear here with the source that brought them.",
    },
  ];

  return (
    <section aria-labelledby="pulse-title" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#62625f]">Studio pulse</p>
          <h2 id="pulse-title" className="mt-1 text-xl font-normal tracking-[-0.03em]">How the site is doing</h2>
        </div>
        <div role="group" aria-label="Period" className="flex rounded-md border border-[#e6e6e4] bg-white p-0.5">
          {PULSE_RANGES.map((r) => (
            <Link
              key={r}
              href={`${basePath}?range=${r}`}
              scroll={false}
              aria-current={r === range ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-12 items-center justify-center rounded-[5px] px-3 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${r === range ? "bg-[#111110] text-white" : "text-[#62625f] hover:text-[#111110]"}`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      {!s.configured ? (
        <p className="mt-4 border border-[#e6e6e4] bg-white px-5 py-6 text-sm text-[#62625f]">Analytics appear here once the database connection is available.</p>
      ) : (
        <div className="mt-4 grid gap-4">
          <TrendChart series={s.series} previous={s.previous} totals={{ visitors: s.uniqueSessions, views: s.rangeViews, leads: s.rangeLeads }} range={range} />
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <FunnelFlow steps={s.flow} bottleneck={s.flowBottleneck} range={range} />
            <RankedTabs title="Where visits and leads come from" tabs={tabs} />
          </div>
          <dl className="grid grid-cols-2 border border-[#e6e6e4] bg-white sm:grid-cols-4">
            {[
              { k: "Booked value", v: money(s.bookedValue), n: `${s.paid} paid all-time` },
              { k: "In the pipeline", v: money(s.pipelineValue), n: `${s.requests} requests · ${s.pendingHolds} holds` },
              { k: "Bounce rate", v: `${s.bounceRate}%`, n: `${s.pagesPerSession} pages per visit` },
              { k: "On the site now", v: String(s.liveNow.length), n: "Active in the last 5 min" },
            ].map((m, i) => (
              <div key={m.k} className={`px-4 py-4 sm:px-5 ${i % 2 === 0 ? "border-r border-[#e6e6e4]" : ""} ${i < 2 ? "border-b border-[#e6e6e4] sm:border-b-0" : ""} ${i === 1 ? "sm:border-r" : ""} ${i === 2 ? "sm:border-r" : ""}`}>
                <dt className="text-xs text-[#62625f]">{m.k}</dt>
                <dd className="mt-1 text-xl font-normal tracking-[-0.03em] tabular-nums text-[#111110]">{m.v}</dd>
                <dd className="text-xs text-[#8a8a86]">{m.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
