import Link from "next/link";
import type { RangedStats } from "@/lib/analytics-db";
import { briefing, metricIntel, stepIntel } from "@/lib/pulse-intel";
import { TrendChart } from "./TrendChart";
import { FunnelFlow } from "./FunnelFlow";
import { RankedTabs } from "./RankedTabs";
import { Briefing } from "./Briefing";
import { HudIntel } from "./HudIntel";
import "./hud.css";

export const PULSE_RANGES = [7, 14, 30] as const;

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/**
 * Studio pulse — the site's own analytics as a heads-up display: a typed
 * briefing computed from the numbers, traffic and leads over time, the
 * booking funnel with its bottleneck, and where it all came from. Hover,
 * focus or tap any number for what it is, what it says right now, and (stay
 * a second) what to do next. Data: getDashboardStats (first-party).
 */
export function StudioPulse({ s, basePath, range }: { s: RangedStats; basePath: string; range: number }) {
  const intel = metricIntel(s);
  const tabs = [
    {
      id: "pages",
      label: "Top pages",
      unit: "Views",
      rows: s.topPages.map((p) => ({ label: p.label, value: p.count })),
      empty: "No page views yet.",
      tip: "Your top pages are your shop window. Make sure each one ends with 'Get my free plan' or 'Check your date'.",
    },
    {
      id: "referrers",
      label: "Referrers",
      unit: "Views",
      rows: s.topReferrers.map((p) => ({ label: p.label, value: p.count })),
      empty: "No referrer data yet.",
      tip: "Double down where traffic already comes from: post there again this week.",
    },
    {
      id: "campaigns",
      label: "Campaigns",
      unit: "Views",
      rows: s.utmSources.map((p) => ({ label: p.label, value: p.count })),
      empty: "No tagged links yet. Add ?src= to the links you share (e.g. ?src=fb-group-irving).",
      tip: "Tag every link you post with ?src= so you know exactly which post worked.",
    },
    {
      id: "sources",
      label: "Lead sources",
      unit: "Leads",
      rows: s.bySource.map((r) => ({ label: r.source, value: r.leads, note: r.bookedValue ? `${money(r.bookedValue)} booked` : undefined })),
      empty: "Leads appear here with the source that brought them.",
      tip: "The source with the most booked value is where your next hour of posting should go.",
    },
  ];

  const stats = [
    { k: "booked" as const, label: "Booked value", v: money(s.bookedValue), n: `${s.paid} paid all-time`, c: "#3dffa8" },
    { k: "pipeline" as const, label: "In the pipeline", v: money(s.pipelineValue), n: `${s.requests} requests · ${s.pendingHolds} holds`, c: "#ffb547" },
    { k: "bounce" as const, label: "Bounce rate", v: `${s.bounceRate}%`, n: `${s.pagesPerSession} pages per visit`, c: s.bounceRate > 60 ? "#ff6b8b" : "#38e8ff" },
    { k: "live" as const, label: "On the site now", v: String(s.liveNow.length), n: "Active in the last 5 min", c: "#38e8ff" },
  ];

  return (
    <section aria-labelledby="pulse-title" className="hud mt-10">
      <span aria-hidden className="hud-grid-bg" />
      <span aria-hidden className="hud-scan" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="hud-label m-0" style={{ color: "#38e8ff" }}>TXQ // Studio pulse</p>
          <h2 id="pulse-title" className="mt-1 text-xl font-normal tracking-[-0.02em] text-[#e6f4ff] sm:text-2xl">How the site is doing</h2>
        </div>
        <nav aria-label="Period" className="hud-seg">
          {PULSE_RANGES.map((r) => (
            <Link key={r} href={`${basePath}?range=${r}`} scroll={false} aria-current={r === range ? "page" : undefined} className="hud-focus">
              {r}D
            </Link>
          ))}
        </nav>
      </div>

      {!s.configured ? (
        <p className="hud-card mt-4 px-5 py-6 text-sm text-[#8fa0b8]">Analytics appear here once the database connection is available.</p>
      ) : (
        <div className="mt-4 grid gap-4">
          <Briefing lines={briefing(s)} />
          <TrendChart
            series={s.series}
            previous={s.previous}
            totals={{ visitors: s.uniqueSessions, unique: s.uniqueVisitors, views: s.rangeViews, leads: s.rangeLeads }}
            range={range}
            intel={{ visitors: intel.visits, unique: intel.unique, views: intel.views, leads: intel.leads }}
          />
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <FunnelFlow steps={s.flow} bottleneck={s.flowBottleneck} range={range} intel={s.flow.map((_, i) => stepIntel(s, i))} />
            <RankedTabs title="Where visits and leads come from" tabs={tabs} />
          </div>
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {stats.map((m, i) => (
              <HudIntel key={m.k} intel={intel[m.k]} side="top" align={i % 2 ? "right" : "left"}>
                <button type="button" className="hud-card hud-focus hud-stat block w-full px-4 py-3.5 text-left transition-colors hover:border-[rgba(56,232,255,0.35)]">
                  <span className="hud-label flex items-center gap-1.5 whitespace-nowrap">
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.c, boxShadow: `0 0 8px ${m.c}` }} />
                    <span className="truncate">{m.label}</span>
                  </span>
                  <span className="hud-value mt-2 block text-[#e6f4ff]">{m.v}</span>
                  <span className="hud-mono mt-1.5 block truncate text-[11px] text-[#8fa0b8]">{m.n}</span>
                </button>
              </HudIntel>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
