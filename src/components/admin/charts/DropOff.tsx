import type { RangedStats } from "@/lib/analytics-db";

/**
 * DropOff — why visits never reach the work: how many left after one page,
 * and per landing page / source, the share that went on to see work or
 * prices. The worst big row is the page or post to fix first.
 */
type Row = { label: string; sessions: number; reached: number };

function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="min-w-0">
      <p className="hud-label m-0 flex justify-between gap-3 px-1 pb-1.5">
        <span>{title}</span>
        <span>Visits · went on</span>
      </p>
      <ol className="m-0 list-none p-0">
        {rows.map((r) => {
          const pct = r.sessions ? Math.round((r.reached / r.sessions) * 100) : 0;
          const weak = r.sessions >= 10 && pct < 20;
          return (
            <li key={r.label} className="relative isolate flex min-h-10 items-center justify-between gap-3 px-1 text-sm">
              <span aria-hidden className="absolute inset-y-1.5 left-0 -z-10 rounded-[3px] bg-[rgba(255,255,255,0.07)]" style={{ width: `${Math.max(pct, 2)}%` }} />
              <span className="min-w-0 truncate text-[#f5f5f7]">{r.label}</span>
              <span className="hud-mono shrink-0 text-[13px] text-[#e5e5ea]">
                {r.sessions}
                <span className="ml-2 inline-block w-10 text-right" style={{ color: weak ? "#ff9f0a" : "#8e8e93" }}>{pct}%</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function DropOff({ d, visits, range }: { d: RangedStats["dropoff"]; visits: number; range: number }) {
  if (!visits) return null;
  const lostPct = Math.round((d.lost / visits) * 100);
  const onePct = d.lost ? Math.round((d.onePage / d.lost) * 100) : 0;
  const worst = [...d.landings, ...d.sources]
    .filter((r) => r.sessions >= 10)
    .sort((a, b) => a.reached / a.sessions - b.reached / b.sessions || b.sessions - a.sessions)[0];
  return (
    <section aria-labelledby="drop-title" className="hud-card min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(255,255,255,0.14)] px-4 py-3.5 sm:px-5">
        <h2 id="drop-title" className="hud-label m-0" style={{ color: "#f5f5f7" }}>
          Why they drop off
        </h2>
        <p className="hud-mono m-0 text-[11px] text-[#8e8e93]">LAST {range}D · VISITS THAT NEVER SAW WORK OR PRICES</p>
      </div>
      <div className="px-4 pt-3.5 sm:px-5">
        <p className="m-0 text-base leading-7 text-[#f5f5f7]">
          <span className="hud-mono text-[#ff9f0a]">{d.lost.toLocaleString("en-US")}</span> of {visits.toLocaleString("en-US")} visits ({lostPct}%) never saw your work or
          prices. <span className="hud-mono text-[#ff9f0a]">{onePct}%</span> of those opened one page and left.
        </p>
        {worst ? (
          <p className="m-0 mt-1.5 text-[13px] leading-5 text-[#aeaeb2]">
            <span className="hud-mono mr-1.5 text-[11px] text-[#0a84ff]">› FIX FIRST</span>
            {worst.label}: only {Math.round((worst.reached / worst.sessions) * 100)}% of its {worst.sessions} visits went on. Put real photos and one clear button
            (see the work, check your date) in its first screen.
          </p>
        ) : null}
      </div>
      <div className="grid gap-5 px-3 pb-4 pt-4 sm:px-4 md:grid-cols-2">
        <Table title="Landed on" rows={d.landings} />
        <Table title="Came from" rows={d.sources} />
      </div>
      <p className="hud-mono m-0 border-t border-[rgba(255,255,255,0.14)] px-4 py-3 text-[11px] leading-5 text-[#8e8e93] sm:px-5">
        NOW COUNTED AS &quot;SAW WORK&quot;: SCROLLING TO THE HOMEPAGE GALLERIES, FILMS OR PACKAGES, PLUS /BUDGET AND THE PRICE AND PLAN PAGES.
      </p>
    </section>
  );
}
