import Link from "next/link";
import { getDashboardStats, getConversionChanges } from "@/lib/analytics-db";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { requireAdminPage } from "@/lib/require-admin";
import { getPulseMoves } from "@/lib/pulse-moves";
import { getSocialSheet, summarize, PLATFORM_LABEL } from "@/lib/social";
import { stepIntel, todayFocus } from "@/lib/pulse-intel";
import { StudioPage, StudioSection } from "@/components/admin/StudioPage";
import { StudioBars } from "@/components/admin/StudioBars";
import { IdeasBoard } from "@/components/admin/IdeasBoard";

export const dynamic = "force-dynamic";

const PULSE_RANGES = [7, 14, 30] as const;

const num = (n: number) => n.toLocaleString("en-US");
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const pageName = (p: string) => (p === "/" ? "Homepage" : p === "/es" ? "Spanish homepage" : p);

/** "+12% vs the 14 days before" — or nothing when there is no earlier number. */
function versus(now: number, before: number, range: number) {
  if (!before) return `Last ${range} days`;
  const pct = Math.round(((now - before) / before) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs the ${range} days before`;
}

/**
 * Insights — how the site did, where families come from, where they stop,
 * and ideas to try. Replaces the old 15-panel report: the live list and
 * payment alert live on Today; the HUD, briefing, drop-off and flywheel
 * panels are folded into "Path to booking" and the Ideas board.
 */
export default async function AdminInsights({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdminPage("/admin/insights"); // server-side gate; middleware is not enough
  const { range: rangeParam } = await searchParams;
  const range = (PULSE_RANGES as readonly number[]).includes(Number(rangeParam)) ? Number(rangeParam) : 14;
  const [s, changes, moves, social] = await Promise.all([getDashboardStats(range), getConversionChanges(), getPulseMoves(), getSocialSheet()]);

  // The one suggestion: the bottleneck's next untried move (same logic as before).
  const running = moves.filter((m) => m.status === "active");
  const tried = new Set(moves.map((m) => `${m.metric}|${m.title}`));
  const b = s.flowBottleneck;
  const step = b ? stepIntel(s, b.step) : null;
  const nextTodo = b && step ? step.todo.find((t) => !tried.has(`${step.metric}|${t.slice(0, 200)}`)) : undefined;
  const started = b ? running.find((m) => m.metric === `step:${b.step}`) : undefined;
  const focus = todayFocus(s, started ? { title: started.title, metric: started.metric } : b && nextTodo ? { title: nextTodo, metric: `step:${b.step}` } : null);
  const focusDay = focus.move ? running.find((m) => m.title === focus.move!.title.slice(0, 200) && m.metric === focus.move!.metric)?.days ?? null : null;
  const ideas = changes.filter((c) => !c.area?.startsWith("pulse:") && c.status === "active");
  const suggestions = [...s.insights.filter((i) => i.type !== "info" && !/payment/i.test(i.text)).map((i) => i.text), ...s.flywheel.filter((f) => !f.done).map((f) => `${f.label}: ${f.detail}`)]
    .filter((t) => !ideas.some((c) => c.title === t.slice(0, 200)))
    .slice(0, 4);

  const sources = s.bySource.filter((r) => r.visits || r.leads || r.bookedValue).slice(0, 8);
  const pages = s.engagement.slice(0, 8);
  const socialRows = social.configured && social.ok ? summarize(social.rows, range).filter((r) => r.followers !== null || r.reach || r.views || r.linkClicks) : [];

  return (
    <StudioPage
      title="Insights"
      intro="How the site is doing, where families come from, and ideas to try next."
      actions={
        s.configured ? (
          <nav aria-label="Period" className="flex gap-2">
            {PULSE_RANGES.map((r) => (
              <Link key={r} href={`/admin/insights?range=${r}`} scroll={false} aria-current={r === range ? "page" : undefined} className="st-filter">
                {r} days
              </Link>
            ))}
          </nav>
        ) : null
      }
    >
      <AutoRefresh seconds={60} />
      {!s.configured ? (
        <div className="st-card st-empty"><p className="st-note">Numbers appear here once the database connection is available.</p></div>
      ) : (
        <>
          <section aria-labelledby="numbers-title" className="st-card">
            <div className="px-5 pt-5 sm:px-6">
              <h2 id="numbers-title" className="st-h2">Last {range} days</h2>
            </div>
            <dl className="m-0 mt-4 grid grid-cols-2 gap-px border-y border-[var(--tq-surface-2)] bg-[var(--tq-surface-2)] lg:grid-cols-4">
              {[
                { label: "Visits", value: num(s.uniqueSessions), note: versus(s.uniqueSessions, s.previous.visitors, range) },
                { label: "New families", value: num(s.rangeLeads), note: versus(s.rangeLeads, s.previous.leads, range) },
                { label: "Bookings", value: num(s.rangeBooked), note: versus(s.rangeBooked, s.previous.booked, range) },
                { label: "Left after one page", value: `${s.bounceRate}%`, note: `${s.pagesPerSession} ${s.pagesPerSession === 1 ? "page" : "pages"} per visit` },
              ].map((m) => (
                <div key={m.label} className="flex min-w-0 flex-col bg-white px-5 py-4 sm:px-6">
                  <dt className="text-[15px] text-[var(--tq-ink-mute)]">{m.label}</dt>
                  <dd className="st-num m-0 mt-2 text-[2.25rem] leading-none">{m.value}</dd>
                  <dd className="m-0 mt-2 text-sm text-[var(--tq-ink-mute)]">{m.note}</dd>
                </div>
              ))}
            </dl>
            <div className="px-5 pb-5 pt-5 sm:px-6">
              <h3 className="m-0 mb-4 text-[15px] font-medium">Visits per day</h3>
              <StudioBars days={s.series.map((d) => ({ date: d.date, value: d.visitors, extra: d.leads }))} unit={["visit", "visits"]} extraUnit={["new family", "new families"]} />
            </div>
          </section>

          <IdeasBoard focus={focus} focusDay={focusDay} moves={moves} ideas={ideas} suggestions={suggestions} />

          {s.flow.length ? (
            <StudioSection
              title="Path to booking"
              intro={b ? `The weakest step is marked. ${b.action}` : "Each step shows how many went on from the step before."}
              flush
            >
              <ol className="m-0 grid list-none grid-cols-2 gap-px border-t border-[var(--tq-surface-2)] bg-[var(--tq-surface-2)] p-0 sm:grid-cols-5">
                {s.flow.map((f, i) => {
                  const prev = i ? s.flow[i - 1].value : 0;
                  const pct = i === 0 ? null : prev ? Math.round((f.value / prev) * 100) : 0;
                  const weak = b?.step === i;
                  return (
                    <li key={f.label} className={`min-w-0 px-5 py-4 ${weak ? "bg-[var(--st-tint-warn)]" : "bg-white"}`}>
                      <p className="m-0 text-[15px] text-[var(--tq-ink-mute)]">{f.label}</p>
                      <p className="st-num m-0 mt-2 text-[1.75rem] leading-none">{num(f.value)}</p>
                      <p className={`m-0 mt-2 text-sm ${weak ? "font-medium text-[var(--tq-status-down)]" : "text-[var(--tq-ink-mute)]"}`}>
                        {pct === null ? "Start" : `${pct}% went on`}{weak ? " · weakest" : ""}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </StudioSection>
          ) : null}

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <StudioSection title="Where families come from" intro="Tag links you share with ?src= (for example ?src=instagram) so each post is counted." flush>
              {sources.length ? (
                <div className="overflow-x-auto border-t border-[var(--tq-surface-2)]">
                  <table className="st-table text-[15px]">
                    <thead><tr><th scope="col">Source</th><th scope="col" className="text-right">Visits</th><th scope="col" className="text-right">Families</th><th scope="col" className="text-right">Booked</th></tr></thead>
                    <tbody>
                      {sources.map((r) => (
                        <tr key={r.source}>
                          <th scope="row" className="font-medium">{r.source === "gbp" ? "Google Business" : r.source === "whatsapp" ? "WhatsApp" : r.source}</th>
                          <td className="st-num text-right">{r.visits ? num(r.visits) : "—"}</td>
                          <td className="st-num text-right">{r.leads + r.chats ? num(r.leads + r.chats) : "—"}</td>
                          <td className="st-num text-right">{r.bookedValue ? money(r.bookedValue) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="st-note px-5 pb-5 sm:px-6">No visits in this period yet.</p>}
            </StudioSection>

            <StudioSection title="Top pages" intro="A high “left here” on a price or booking page is the leak to fix." flush>
              {pages.length ? (
                <div className="overflow-x-auto border-t border-[var(--tq-surface-2)]">
                  <table className="st-table text-[15px]">
                    <thead><tr><th scope="col">Page</th><th scope="col" className="text-right">Views</th><th scope="col" className="text-right">Left here</th></tr></thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.path}>
                          <th scope="row" className="max-w-[14rem] truncate font-medium">{pageName(p.path)}</th>
                          <td className="st-num text-right">{num(p.views)}</td>
                          <td className={`st-num text-right ${p.exitRate >= 70 ? "font-medium text-[var(--tq-status-down)]" : ""}`}>{p.exitRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="st-note px-5 pb-5 sm:px-6">No page views in this period yet.</p>}
            </StudioSection>
          </div>

          {socialRows.length ? (
            <StudioSection title="Social" intro="Followers and reach from Grokbot's sheet. Site visits and families are counted by the site." flush>
              <div className="overflow-x-auto border-t border-[var(--tq-surface-2)]">
                <table className="st-table text-[15px]">
                  <thead><tr><th scope="col">Platform</th><th scope="col" className="text-right">Followers</th><th scope="col" className="text-right">Reach</th><th scope="col" className="text-right">Link clicks</th><th scope="col" className="text-right">Site visits</th><th scope="col" className="text-right">Families</th></tr></thead>
                  <tbody>
                    {socialRows.map((r) => (
                      <tr key={r.platform}>
                        <th scope="row" className="font-medium">{PLATFORM_LABEL[r.platform]}</th>
                        <td className="st-num text-right">{r.followers !== null ? num(r.followers) : "—"}{r.followersChange ? <span className="text-[13px] text-[var(--tq-ink-mute)]"> ({r.followersChange > 0 ? "+" : ""}{r.followersChange})</span> : null}</td>
                        <td className="st-num text-right">{r.reach || r.views ? num(r.reach || r.views) : "—"}</td>
                        <td className="st-num text-right">{r.linkClicks ? num(r.linkClicks) : "—"}</td>
                        <td className="st-num text-right">{num(s.byPlatform[r.platform].visits)}</td>
                        <td className="st-num text-right">{num(s.byPlatform[r.platform].leads)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StudioSection>
          ) : null}
        </>
      )}
    </StudioPage>
  );
}
