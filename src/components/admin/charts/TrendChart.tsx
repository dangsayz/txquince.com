"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CellField } from "./CellField";
import { HudIntel } from "./HudIntel";
import type { Intel } from "@/lib/pulse-intel";

/**
 * TrendChart — metric tabs over one live line chart, styled as a HUD.
 * Tabs show the period total and the change vs. the previous period; the
 * selected tab drives the chart. The line draws itself in (again on every
 * tab switch), the last point pulses as "live", and hover/touch shows a
 * crosshair readout. A cell field flickers behind it. Plain SVG drawn at
 * real pixel size (crisp glow); all motion stops under reduced motion.
 */
export type TrendPoint = { date: string; views: number; visitors: number; unique: number; leads: number };
type MetricKey = "visitors" | "unique" | "views" | "leads";

const METRICS: { key: MetricKey; label: string; short?: string }[] = [
  { key: "visitors", label: "Visits" },
  { key: "unique", label: "Unique visitors", short: "Unique" },
  { key: "views", label: "Page views" },
  { key: "leads", label: "Leads" },
];

const H = 240;
const PAD_TOP = 18;
const PAD_BOTTOM = 8;

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
    const hh = a * a + b * b;
    if (hh > 9) {
      const t = 3 / Math.sqrt(hh);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h3 = dx[i] / 3;
    d += ` C${pts[i][0] + h3},${pts[i][1] + m[i] * h3} ${pts[i + 1][0] - h3},${pts[i + 1][1] - m[i + 1] * h3} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0 && now === 0) return <span className="hud-mono text-xs text-[#8fa0b8]">±0</span>;
  if (before === 0) return <span className="hud-mono hud-up text-xs">NEW</span>;
  const pct = Math.round(((now - before) / before) * 100);
  return (
    <span className={`hud-mono text-xs ${pct >= 0 ? "hud-up" : "hud-down"}`}>
      {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

export function TrendChart({
  series,
  previous,
  totals: given,
  range,
  intel,
}: {
  series: TrendPoint[];
  previous: Record<MetricKey, number>;
  /** Period totals from the server (the same window the funnel uses). */
  totals?: Record<MetricKey, number>;
  range: number;
  /** Hover intel per metric tab. */
  intel?: Partial<Record<MetricKey, Intel>>;
}) {
  const [metric, setMetric] = useState<MetricKey>("visitors");
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const gid = useId().replace(/:/g, "");

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totals = useMemo(
    () =>
      given ?? {
        visitors: series.reduce((s, p) => s + p.visitors, 0),
        unique: series.reduce((s, p) => s + p.unique, 0),
        views: series.reduce((s, p) => s + p.views, 0),
        leads: series.reduce((s, p) => s + p.leads, 0),
      },
    [series, given],
  );
  const values = series.map((p) => p[metric]);
  const peak = Math.max(...values, 0);
  const max = niceMax(peak);
  const W = Math.max(width, 1);
  const step = series.length > 1 ? W / (series.length - 1) : W;
  const yOf = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM);
  const pts: [number, number][] = values.map((v, i) => [i * step, yOf(v)]);
  const line = monotonePath(pts);
  const area = pts.length ? `${line} L${W},${H} L0,${H} Z` : "";
  const label = METRICS.find((m) => m.key === metric)!.label;
  const empty = values.every((v) => v === 0);
  const lastVal = values[values.length - 1] ?? 0;

  function pick(clientX: number) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || series.length === 0) return;
    const x = Math.min(Math.max(clientX - box.left, 0), box.width);
    setHover(Math.round((x / box.width) * (series.length - 1)));
  }

  const hp = hover !== null ? pts[hover] : null;
  const hd = hover !== null ? series[hover] : null;

  return (
    <div className="hud-card">
      <div role="tablist" aria-label="Metric" className="grid grid-cols-2 border-b border-[rgba(56,232,255,0.14)] lg:grid-cols-4">
        {METRICS.map((m, i) => {
          const tab = (
            <button role="tab" type="button" aria-selected={m.key === metric} onClick={() => setMetric(m.key)} className="hud-tab hud-focus h-full w-full">
              <span className="hud-label flex items-center gap-1.5 whitespace-nowrap">
                {m.short ? (
                  <>
                    <span className="sm:hidden">{m.short}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </>
                ) : (
                  m.label
                )}
                {intel?.[m.key] ? <span aria-hidden className="hud-info">i</span> : null}
              </span>
              <span className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="hud-value">{totals[m.key].toLocaleString("en-US")}</span>
                <Delta now={totals[m.key]} before={previous[m.key]} />
              </span>
            </button>
          );
          const edge = `${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""} border-[rgba(56,232,255,0.14)]`;
          const it = intel?.[m.key];
          return it ? (
            <HudIntel key={m.key} intel={it} align={i % 2 || i === 3 ? "right" : "left"} className={edge}>
              {tab}
            </HudIntel>
          ) : (
            <div key={m.key} className={`relative ${edge}`}>{tab}</div>
          );
        })}
      </div>

      <div className="relative px-3 pb-3 pt-4 sm:px-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[10px]">
          <CellField intensity={peak ? lastVal / peak : 0.2} />
        </div>
        <p className="sr-only">
          {label}: {totals[metric]} in the last {range} days, versus {previous[metric]} in the {range} days before.
        </p>
        <div className="relative flex gap-3">
          <div aria-hidden className="hud-mono flex flex-col justify-between text-right text-[11px] text-[#8fa0b8]" style={{ height: H, paddingTop: PAD_TOP - 6, paddingBottom: PAD_BOTTOM - 4 }}>
            <span>{max}</span>
            <span>{max / 2}</span>
            <span>0</span>
          </div>
          <div
            ref={boxRef}
            className="relative min-w-0 flex-1 touch-pan-y"
            style={{ height: H }}
            onPointerMove={(e) => pick(e.clientX)}
            onPointerDown={(e) => pick(e.clientX)}
            onPointerLeave={() => setHover(null)}
          >
            {width > 0 ? (
              <svg width={W} height={H} className="absolute inset-0 overflow-visible" aria-hidden>
                <defs>
                  <linearGradient id={`stroke-${gid}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#8b7bff" />
                    <stop offset="100%" stopColor="#38e8ff" />
                  </linearGradient>
                  <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38e8ff" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#38e8ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[yOf(max), yOf(max / 2), yOf(0)].map((y) => (
                  <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="rgba(56,232,255,0.12)" strokeDasharray="3 5" />
                ))}
                {!empty ? <path key={`a-${metric}-${range}`} className="hud-fade" d={area} fill={`url(#fill-${gid})`} /> : null}
                <path
                  key={`l-${metric}-${range}-${W}`}
                  className={empty ? "" : "hud-line hud-draw"}
                  pathLength={1}
                  d={line}
                  fill="none"
                  stroke={empty ? "rgba(143,160,184,0.4)" : `url(#stroke-${gid})`}
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {!empty && pts.length ? (
                  <g>
                    <circle className="hud-live" cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#38e8ff" />
                    <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="#05080f" stroke="#38e8ff" strokeWidth="2" />
                  </g>
                ) : null}
                {hp ? (
                  <g>
                    <line x1={hp[0]} x2={hp[0]} y1="0" y2={H} stroke="rgba(56,232,255,0.55)" strokeDasharray="2 4" />
                    <line x1="0" x2={W} y1={hp[1]} y2={hp[1]} stroke="rgba(56,232,255,0.25)" strokeDasharray="2 4" />
                    <circle cx={hp[0]} cy={hp[1]} r="9" fill="none" stroke="rgba(56,232,255,0.6)" />
                    <circle cx={hp[0]} cy={hp[1]} r="3.5" fill="#38e8ff" />
                  </g>
                ) : null}
              </svg>
            ) : null}
            {hp && hd ? (
              <span className="hud-tip" style={{ left: hp[0], transform: `translateX(${hp[0] > W * 0.7 ? "calc(-100% - 14px)" : "14px"})` }}>
                <span className="block text-[#8fa0b8]">{fmtDay(hd.date).toUpperCase()}</span>
                <span className="text-[#e6f4ff]">
                  <span className="text-[#38e8ff]">{hd[metric].toLocaleString("en-US")}</span> {label.toLowerCase()}
                </span>
              </span>
            ) : null}
            {empty ? (
              <p className="hud-mono absolute inset-0 grid place-items-center text-sm text-[#8fa0b8]">NO {label.toUpperCase()} YET IN THIS PERIOD</p>
            ) : null}
          </div>
        </div>
        {series.length ? (
          <div aria-hidden className="hud-mono relative ml-9 mt-2 flex justify-between text-[11px] text-[#8fa0b8]">
            <span>{fmtDay(series[0].date).toUpperCase()}</span>
            <span>{fmtDay(series[Math.floor((series.length - 1) / 2)].date).toUpperCase()}</span>
            <span className="text-[#38e8ff]">● LIVE</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
