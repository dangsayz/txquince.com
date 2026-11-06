import Link from "next/link";
import type { RangedStats } from "@/lib/analytics-db";
import { briefing, metricIntel, stepIntel, todayFocus, type Intel } from "@/lib/pulse-intel";
import { TodayFocus } from "./TodayFocus";
import { SocialPanel } from "./SocialPanel";
import { summarize, type SocialSheet } from "@/lib/social";
import type { PulseMove } from "@/lib/pulse-moves";
import { DropOff } from "./DropOff";
import { MovesLog } from "./MovesLog";
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
export function StudioPulse({
  s,
  basePath,
  range,
  moves,
  social,
  phoneSummary,
}: {
  s: RangedStats;
  basePath: string;
  range: number;
  moves?: PulseMove[];
  social?: SocialSheet;
  /** On phones (<768px) show only Do this today + four totals and link here for the rest. */
  phoneSummary?: { href: string };
}) {
  const running = (moves ?? []).filter((m) => m.status === "active");
  // Mark moves already being tried, so the card shows "TRYING · DAY n".
  const track = (it: Intel): Intel => ({
    ...it,
    trying: it.todo.map((t) => running.find((m) => m.title === t.slice(0, 200) && m.metric === it.metric)?.days ?? null),
  });
  const raw = metricIntel(s);
  const intel = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, track(v)])) as typeof raw;
  const steps = s.flow.map((_, i) => track(stepIntel(s, i)));
  const b = s.flowBottleneck;
  const tried = new Set((moves ?? []).map((m) => `${m.metric}|${m.title}`));
  const nextTodo = b ? steps[b.step].todo.find((t) => !tried.has(`${steps[b.step].metric}|${t.slice(0, 200)}`)) : undefined;
  const nextUp = b && nextTodo ? { title: nextTodo, metric: `step:${b.step}` } : null;
  // Today's focus stays put once started (it then reads "Tracking · day n").
  const startedFocus = b ? running.find((m) => m.metric === `step:${b.step}`) : undefined;
  const focus = todayFocus(s, startedFocus ? { title: startedFocus.title, metric: startedFocus.metric } : nextUp);
  const focusDay = focus.move ? running.find((m) => m.title === focus.move!.title.slice(0, 200) && m.metric === focus.move!.metric)?.days ?? null : null;
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
      empty: "No tagged links yet. Add ?src= to the links you share outside the site (e.g. ?src=instagram).",
      tip: "Tag every link you post with ?src= so you know exactly which post worked.",
    },
    {
      id: "sources",
      label: "Lead sources",
      unit: "Leads & chats",
      rows: s.bySource
        .filter((r) => r.leads || r.chats || r.bookedValue)
        .map((r) => ({
          label: r.source === "gbp" ? "Google Business" : r.source === "whatsapp" ? "WhatsApp" : r.source,
          value: r.leads + r.chats,
          note: [r.chats ? `${r.chats} WhatsApp chat${r.chats === 1 ? "" : "s"}` : "", r.bookedValue ? `${money(r.bookedValue)} booked` : ""].filter(Boolean).join(" · ") || undefined,
        })),
      empty: "Leads appear here with the source that brought them.",
      tip: "The source with the most booked value is where your next hour of posting should go.",
    },
  ];

  const stats = [
    { k: "booked" as const, label: "Booked value", v: money(s.bookedValue), n: `${s.paid} paid all-time`, c: "#2e6f40" },
    { k: "pipeline" as const, label: "In the pipeline", v: money(s.pipelineValue), n: `${s.requests} requests · ${s.pendingHolds} holds`, c: "#111110" },
    { k: "bounce" as const, label: "Bounce rate", v: `${s.bounceRate}%`, n: `${s.pagesPerSession} pages per visit`, c: s.bounceRate > 60 ? "#a14f12" : "#111110" },
    { k: "live" as const, label: "On the site now", v: String(s.liveNow.length), n: "Active in the last 5 min", c: "#111110" },
  ];

  return (
    <section aria-labelledby="pulse-title" className="hud">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id="pulse-title" className="m-0 text-[length:var(--tq-text-h3)] font-normal tracking-[var(--tq-tracking-display)] text-[#111110]">How the site is doing</h2>
          <p className="m-0 mt-1 text-sm text-[#4d4b48]">Visits, leads and what to fix next, from your own site numbers.</p>
        </div>
        {s.configured ? <nav aria-label="Period" className="hud-seg">
          {PULSE_RANGES.map((r) => (
            <Link key={r} href={`${basePath}?range=${r}`} scroll={false} aria-current={r === range ? "page" : undefined} className="hud-focus">
              {r}d
            </Link>
          ))}
        </nav> : null}
      </div>

      {!s.configured ? (
        <p className="hud-card mt-4 px-5 py-6 text-sm text-[#4d4b48]">Analytics appear here once the database connection is available.</p>
      ) : (
        <div className="mt-4 grid gap-4">
          <TodayFocus focus={focus} trying={focusDay} />
          {phoneSummary ? (
            <div className="grid gap-4 md:hidden">
              <dl className="hud-card m-0 grid grid-cols-2 gap-px overflow-hidden bg-[#e2ddd5]">
                {[
                  { label: "Visits", v: s.uniqueSessions.toLocaleString("en-US"), n: `last ${range} days` },
                  { label: "Leads", v: s.rangeLeads.toLocaleString("en-US"), n: `last ${range} days` },
                  { label: "Booked value", v: money(s.bookedValue), n: `${s.paid} paid all-time` },
                  { label: "In the pipeline", v: money(s.pipelineValue), n: `${s.requests} requests · ${s.pendingHolds} holds` },
                ].map((t) => (
                  <div key={t.label} className="min-w-0 bg-white px-4 py-3.5">
                    <dt className="hud-label truncate">{t.label}</dt>
                    <dd className="hud-value m-0 mt-2 text-[#111110]">{t.v}</dd>
                    <dd className="hud-mono m-0 mt-1.5 text-[13px] leading-5 text-[#4d4b48]">{t.n}</dd>
                  </div>
                ))}
              </dl>
              <Link href={phoneSummary.href} className="st-btn-ghost w-full">
                See all numbers
              </Link>
            </div>
          ) : null}
          <div className={phoneSummary ? "hidden md:contents" : "contents"}>
          <Briefing lines={briefing(s)} />
          <TrendChart
            series={s.series}
            previous={s.previous}
            totals={{ visitors: s.uniqueSessions, unique: s.uniqueVisitors, views: s.rangeViews, leads: s.rangeLeads }}
            range={range}
            intel={{ visitors: intel.visits, unique: intel.unique, views: intel.views, leads: intel.leads }}
          />
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <FunnelFlow steps={s.flow} bottleneck={s.flowBottleneck} range={range} intel={steps} />
            <RankedTabs title="Where visits and leads come from" tabs={tabs} />
          </div>
          {moves ? (
            <div className="grid items-start gap-4 xl:grid-cols-2">
              <DropOff d={s.dropoff} visits={s.uniqueSessions} range={range} />
              <MovesLog moves={moves} nextUp={null} />
            </div>
          ) : null}
          {social ? (
            <SocialPanel
              summary={summarize(social.rows, range)}
              site={s.byPlatform}
              range={range}
              status={{ configured: social.configured, ok: social.ok, lastDate: social.rows.reduce<string | null>((m, r) => (!m || r.date > m ? r.date : m), null) }}
            />
          ) : null}
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {stats.map((m, i) => (
              <HudIntel key={m.k} intel={intel[m.k]} side="top" align={i % 2 ? "right" : "left"}>
                <button type="button" className="hud-card hud-focus hud-stat block w-full px-4 py-3.5 text-left transition-colors hover:border-[#8c877f]">
                  <span className="hud-label flex items-center gap-1.5 whitespace-nowrap">
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.c }} />
                    <span className="truncate">{m.label}</span>
                  </span>
                  <span className="hud-value mt-2 block text-[#111110]">{m.v}</span>
                  <span className="hud-mono mt-1.5 block truncate text-[13px] text-[#4d4b48]">{m.n}</span>
                </button>
              </HudIntel>
            ))}
          </div>
          </div>
        </div>
      )}
    </section>
  );
}
