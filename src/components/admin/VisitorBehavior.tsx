import { fmtSeconds, type BehaviorSummary, type PageBehavior } from "@/lib/page-behavior";

/**
 * "What visitors do" — admin home. One row per busy page: visits, typical time
 * on page, how far people scroll (a bar, 0–100%), how many visits end there,
 * and the most-tapped things. The leakiest page is called out first.
 * Refs (Mobbin): Searchable sources table (rank + bar per row), Mintlify
 * analytics "Top pages" table. Data: getPageBehavior (lib/analytics-db.ts).
 */
const pct = (x: number) => `${Math.round(x * 100)}%`;

function Depth({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[var(--tq-ink-mute)]">—</span>;
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden="true" className="vb-track">
        <span style={{ width: `${value}%` }} />
      </span>
      <span className="st-num w-10 text-right">{value}%</span>
    </span>
  );
}

function Leak({ p }: { p: PageBehavior }) {
  const where = p.avgDepth !== null ? ` Most get ${p.avgDepth}% of the way down${p.medianSeconds !== null ? ` in about ${fmtSeconds(p.medianSeconds)}` : ""}.` : "";
  const tap = p.topClicks[0] ? ` The most-tapped thing there is “${p.topClicks[0].label}”.` : "";
  return (
    <div className="vb-leak">
      <p className="m-0 text-[15px] text-[var(--tq-ink-mute)]">Where families leave most</p>
      <p className="m-0 mt-1 text-[length:var(--tq-text-lg)] leading-snug">
        <a href={p.path} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-[var(--tq-surface-2)] underline-offset-4 hover:decoration-[var(--tq-ink)]">
          {p.label}
        </a>
        : {pct(p.exitRate)} of its {p.visits.toLocaleString("en-US")} visits end there.{where}
        {tap}
      </p>
    </div>
  );
}

export function VisitorBehavior({ data }: { data: BehaviorSummary & { configured: boolean; days: number } }) {
  if (!data.configured) return null;
  const { pages, leak, measuredTotal, days } = data;
  return (
    <section aria-labelledby="vb-title" className="st-card mt-6 overflow-hidden">
      <div className="px-5 pt-5 sm:px-6">
        <h2 id="vb-title" className="st-h2">What visitors do</h2>
        <p className="st-note mt-1">
          Last {days} days, busiest pages first. Time counts only while someone is on the page and active.
          {measuredTotal < 30 ? " Time and scroll started counting on Nov 9, so they fill in over the next days." : ""}
        </p>
      </div>
      {!pages.length ? (
        <p className="m-0 px-5 pb-6 pt-3 text-[15px] text-[var(--tq-ink-mute)] sm:px-6">Visits show up here as families browse the site.</p>
      ) : (
        <>
          {leak ? <Leak p={leak} /> : null}
          <div className="vb-head" aria-hidden="true">
            <span>Page</span>
            <span className="text-right">Visits</span>
            <span className="text-right">Time on page</span>
            <span>Scrolled</span>
            <span className="text-right">Leave here</span>
            <span>Most tapped</span>
          </div>
          <ol className="m-0 list-none p-0">
            {pages.map((p) => (
              <li key={p.path} className="vb-row" data-leak={leak?.path === p.path || undefined}>
                <a href={p.path} target="_blank" rel="noopener noreferrer" className="vb-page">
                  {p.label}
                </a>
                <dl className="vb-stats">
                  <div>
                    <dt>Visits</dt>
                    <dd className="st-num">{p.visits.toLocaleString("en-US")}</dd>
                  </div>
                  <div>
                    <dt>Time on page</dt>
                    <dd className="st-num">{p.medianSeconds === null ? "—" : fmtSeconds(p.medianSeconds)}</dd>
                  </div>
                  <div className="vb-depth">
                    <dt>Scrolled</dt>
                    <dd>
                      <Depth value={p.avgDepth} />
                    </dd>
                  </div>
                  <div>
                    <dt>Leave here</dt>
                    <dd className="st-num">{pct(p.exitRate)}</dd>
                  </div>
                  <div className="vb-taps">
                    <dt>Most tapped</dt>
                    <dd>{p.topClicks.length ? p.topClicks.map((c) => `${c.label} (${c.count})`).join(" · ") : <span className="text-[var(--tq-ink-mute)]">—</span>}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
