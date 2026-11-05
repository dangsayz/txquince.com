"use client";

import { useId, useMemo, useRef, useState } from "react";

/**
 * TrendChart — metric tabs over one line chart (after Profound / Squarespace
 * analytics on Mobbin). Each tab shows the period total and its change vs.
 * the previous period of the same length; the selected tab drives the chart.
 * Plain SVG, no chart library, no entrance animation: hover (or touch) shows
 * the exact day.
 */
export type TrendPoint = { date: string; views: number; visitors: number; leads: number };
type MetricKey = "visitors" | "views" | "leads";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "visitors", label: "Visitors" },
  { key: "views", label: "Page views" },
  { key: "leads", label: "Leads" },
];

const W = 1000;
const H = 220;
const PAD_TOP = 12;

function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= n) ?? 10 * pow;
  return step * 4;
}

/** Monotone cubic path (no overshoot below zero or above peaks). */
function monotonePath(pts: [number, number][]) {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0][0]},${pts[0][1]}`;
  const dx = pts.slice(1).map((p, i) => p[0] - pts[i][0]);
  const slope = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / dx[i]);
  const m = pts.map((_, i) => (i === 0 ? slope[0] : i === n - 1 ? slope[n - 2] : slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${pts[i][0] + h},${pts[i][1] + m[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - m[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0 && now === 0) return <span className="text-xs text-[#8a8a86]">no change</span>;
  if (before === 0) return <span className="text-xs font-medium text-[#2f6b45]">new</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-medium tabular-nums ${up ? "text-[#2f6b45]" : "text-[#a3473f]"}`}>
      {up ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

export function TrendChart({
  series,
  previous,
  totals: given,
  range,
}: {
  series: TrendPoint[];
  previous: { views: number; visitors: number; leads: number };
  /** Period totals from the server (the same window the funnel uses). */
  totals?: { views: number; visitors: number; leads: number };
  range: number;
}) {
  const [metric, setMetric] = useState<MetricKey>("visitors");
  const [hover, setHover] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const gid = useId().replace(/:/g, "");

  const totals = useMemo(
    () => given ?? ({
      visitors: series.reduce((s, p) => s + p.visitors, 0),
      views: series.reduce((s, p) => s + p.views, 0),
      leads: series.reduce((s, p) => s + p.leads, 0),
    }),
    [series, given],
  );
  const values = series.map((p) => p[metric]);
  const max = niceMax(Math.max(...values, 0));
  const step = series.length > 1 ? W / (series.length - 1) : W;
  const pts: [number, number][] = values.map((v, i) => [i * step, PAD_TOP + (1 - v / max) * (H - PAD_TOP)]);
  const line = monotonePath(pts);
  const area = pts.length ? `${line} L${W},${H} L0,${H} Z` : "";
  const label = METRICS.find((m) => m.key === metric)!.label;
  const empty = values.every((v) => v === 0);

  function pick(clientX: number) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || series.length === 0) return;
    const x = Math.min(Math.max(clientX - box.left, 0), box.width);
    setHover(Math.round((x / box.width) * (series.length - 1)));
  }

  const h = hover !== null ? series[hover] : null;
  const hx = hover !== null && series.length > 1 ? (hover / (series.length - 1)) * 100 : 0;
  const hy = hover !== null ? (pts[hover][1] / H) * 100 : 0;

  return (
    <div className="min-w-0 border border-[#e6e6e4] bg-white">
      <div role="tablist" aria-label="Metric" className="grid grid-cols-3 border-b border-[#e6e6e4]">
        {METRICS.map((m, i) => {
          const on = m.key === metric;
          return (
            <button
              key={m.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setMetric(m.key)}
              className={`relative min-h-[5.5rem] px-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black sm:px-6 ${i < 2 ? "border-r border-[#e6e6e4]" : ""} ${on ? "bg-white" : "bg-[#fafaf9] hover:bg-white"}`}
            >
              {on ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111110]" /> : null}
              <span className="block text-xs text-[#62625f]">{m.label}</span>
              <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-normal leading-none tracking-[-0.04em] tabular-nums text-[#111110]">
                  {totals[m.key].toLocaleString("en-US")}
                </span>
                <Delta now={totals[m.key]} before={previous[m.key]} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-4 pt-5 sm:px-6">
        <p className="sr-only">
          {label}: {totals[metric]} in the last {range} days, versus {previous[metric]} in the {range} days before.
        </p>
        <div className="flex gap-3">
          <div aria-hidden className="flex h-[220px] flex-col justify-between pb-0 pt-1.5 text-right text-[11px] tabular-nums text-[#8a8a86]">
            <span>{max}</span>
            <span>{max / 2}</span>
            <span>0</span>
          </div>
          <div
            ref={boxRef}
            className="relative h-[220px] min-w-0 flex-1 touch-pan-y"
            onPointerMove={(e) => pick(e.clientX)}
            onPointerDown={(e) => pick(e.clientX)}
            onPointerLeave={() => setHover(null)}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111110" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#111110" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[PAD_TOP, PAD_TOP + (H - PAD_TOP) / 2, H].map((y) => (
                <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#ececea" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              {!empty ? <path d={area} fill={`url(#fill-${gid})`} /> : null}
              <path d={line} fill="none" stroke={empty ? "#d8d8d5" : "#111110"} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            {h ? (
              <>
                <span aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-[#c9c9c6]" style={{ left: `${hx}%` }} />
                <span
                  aria-hidden
                  className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#111110] shadow"
                  style={{ left: `${hx}%`, top: `${hy}%` }}
                />
                <span
                  className="pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-md border border-[#e6e6e4] bg-white px-2.5 py-1.5 text-xs shadow-sm"
                  style={{ left: `${hx}%`, transform: `translateX(${hx > 70 ? "-105%" : "8px"})` }}
                >
                  <span className="block text-[#62625f]">{fmtDay(h.date)}</span>
                  <span className="font-medium tabular-nums text-[#111110]">
                    {h[metric].toLocaleString("en-US")} {label.toLowerCase()}
                  </span>
                </span>
              </>
            ) : null}
            {empty ? (
              <p className="absolute inset-0 grid place-items-center text-sm text-[#8a8a86]">No {label.toLowerCase()} yet in this period.</p>
            ) : null}
          </div>
        </div>
        {series.length ? (
          <div aria-hidden className="ml-9 mt-2 flex justify-between text-[11px] tabular-nums text-[#8a8a86]">
            <span>{fmtDay(series[0].date)}</span>
            <span>{fmtDay(series[Math.floor((series.length - 1) / 2)].date)}</span>
            <span>Today</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
