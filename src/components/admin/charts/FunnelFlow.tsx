"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Intel } from "@/lib/pulse-intel";
import { HudIntel } from "./HudIntel";

/**
 * FunnelFlow — the booking funnel as one narrowing data stream (after Dub's
 * funnel on Mobbin, in the HUD style). Band height follows each step's count
 * (square-root scale so small later steps stay visible); particles flow
 * through it; the weakest step vs. a healthy rate breathes amber and carries
 * the fix. Every step has an intel card (hover / focus / tap). Drawn at real
 * pixel size; under 640px it becomes glowing stacked bars.
 */
type Step = { label: string; value: number };
type Bottleneck = { step: number; rate: number; baseline: number; action: string } | null;

const H = 150;
const AMBER = "#a14f12"; // bottleneck text (Apple red, 5:1 on white)
/** Fill for the bottleneck band / bar: Apple red (marks only, never text). */
const AMBER_FILL = "#a14f12";

function heights(steps: Step[]) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  // Square-root scale with a floor, so small later steps still read as a band.
  return steps.map((s) => 18 + Math.sqrt(s.value / max) * (H - 18 - 20));
}

/**
 * One smooth edge through every step's center: flat runs out to the card's
 * edges, an S-curve (horizontal tangents) between neighbouring centers, so
 * the band narrows gradually instead of pinching.
 */
function edge(hs: number[], W: number, y: (h: number) => number) {
  const n = hs.length;
  const cw = W / n;
  const cx = (i: number) => i * cw + cw / 2;
  let d = `L0,${y(hs[0])} L${cx(0)},${y(hs[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = cx(i);
    const x1 = cx(i + 1);
    const k = (x1 - x0) * 0.5;
    d += ` C${x0 + k},${y(hs[i])} ${x1 - k},${y(hs[i + 1])} ${x1},${y(hs[i + 1])}`;
  }
  return `${d} L${W},${y(hs[n - 1])}`;
}

function bandPath(hs: number[], W: number, scale = 1) {
  const top = edge(hs, W, (h) => (H - h * scale) / 2);
  const rev = [...hs].reverse();
  const bottom = edge(rev, W, (h) => (H + h * scale) / 2)
    // mirror the reversed edge back onto the x axis
    .replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, yy) => `${W - Number(x)},${yy}`);
  return `M0,${(H - hs[0] * scale) / 2} ${top.slice(1)} ${bottom.replace(/^L/, "L")} Z`;
}

/** A line through the band at a relative offset (-0.5..0.5 of its height). */
function flowLine(hs: number[], W: number, k: number) {
  return `M0,${H / 2 + k * hs[0]} ${edge(hs, W, (h) => H / 2 + k * h).slice(1)}`;
}

const pctOf = (steps: Step[], i: number) =>
  i === 0 ? null : steps[i - 1].value > 0 ? Math.round((steps[i].value / steps[i - 1].value) * 100) : 0;

export function FunnelFlow({
  steps,
  bottleneck,
  range,
  intel,
}: {
  steps: Step[];
  bottleneck: Bottleneck;
  range: number;
  intel: Intel[];
}) {
  const [W, setW] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const gid = useId().replace(/:/g, "");
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!steps.length) return null;
  const hs = heights(steps);
  const cw = W / steps.length;
  const b = bottleneck;
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <section aria-labelledby={`funnel-${gid}`} className="hud-card min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e2ddd5] px-4 py-3.5 sm:px-5">
        <h2 id={`funnel-${gid}`} className="hud-label m-0" style={{ color: "#111110" }}>
          Booking funnel
        </h2>
        <p className="hud-mono m-0 text-[13px] text-[#4d4b48]">Last {range} days · % of the step before · hover a step</p>
      </div>

      {/* Desktop / tablet: the stream */}
      <div className="hidden px-5 pb-5 pt-4 sm:block">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => {
            const pct = pctOf(steps, i);
            const isB = b?.step === i;
            return (
              <HudIntel key={s.label} intel={intel[i]} align={i >= steps.length - 2 ? "right" : "left"}>
                <button type="button" className={`hud-focus block w-full min-w-0 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[rgba(0,0,0,0.05)] ${i ? "border-l border-[#e2ddd5]" : ""}`}>
                  <span className="hud-label block truncate">{s.label}</span>
                  <span className="hud-value mt-1.5 block" style={isB ? { color: AMBER } : undefined}>
                    {s.value.toLocaleString("en-US")}
                  </span>
                  <span className="hud-mono mt-1 block text-[13px]" style={{ color: isB ? AMBER : "#4d4b48" }}>
                    {pct === null ? "Start" : `${pct}%`}
                    {isB ? " · Bottleneck" : ""}
                  </span>
                </button>
              </HudIntel>
            );
          })}
        </div>
        <div ref={box} className="relative mt-3" style={{ height: H }}>
          {W > 0 ? (
            <svg width={W} height={H} className="absolute inset-0 overflow-visible" role="img" aria-label={steps.map((s) => `${s.label} ${s.value}`).join(", ")}>
              <defs>
                {b ? (
                  <>
                    <clipPath id={`b-${gid}`}>
                      <rect x={(b.step - 1) * cw + cw * 0.5} y="0" width={cw} height={H} />
                    </clipPath>
                    <mask id={`m-${gid}`}>
                      <rect x="0" y="0" width={W} height={H} fill="#fff" />
                      <rect x={(b.step - 1) * cw + cw * 0.5} y="0" width={cw} height={H} fill="#000" />
                    </mask>
                  </>
                ) : null}
              </defs>
              {/* One flat band with a hairline edge; the bottleneck stretch is a soft red, not blended. */}
              <g mask={b ? `url(#m-${gid})` : undefined}>
                <path d={bandPath(hs, W)} fill="#111110" fillOpacity="0.1" stroke="#111110" strokeOpacity="0.45" strokeWidth="1" />
              </g>
              {b ? (
                <g clipPath={`url(#b-${gid})`}>
                  <path d={bandPath(hs, W)} fill={AMBER_FILL} fillOpacity="0.1" stroke={AMBER_FILL} strokeOpacity="0.7" strokeWidth="1" />
                </g>
              ) : null}
              {/* a single thin flow line through the middle */}
              <path d={flowLine(hs, W, 0)} fill="none" stroke="#111110" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Phone: stacked bars */}
      <ol className="m-0 list-none space-y-2 px-3 pb-4 pt-3 sm:hidden">
        {steps.map((s, i) => {
          const pct = pctOf(steps, i);
          const isB = b?.step === i;
          return (
            <li key={s.label}>
              <HudIntel intel={intel[i]}>
                <button type="button" className="hud-focus block min-h-11 w-full rounded-md px-1.5 py-1 text-left">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="hud-label min-w-0 truncate">{s.label}</span>
                    <span className="hud-mono shrink-0 text-sm text-[#111110]">
                      {s.value.toLocaleString("en-US")}
                      {pct !== null ? <span className="ml-2 text-xs" style={{ color: isB ? AMBER : "#4d4b48" }}>{pct}%</span> : null}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-[rgba(0,0,0,0.08)]">
                    <span
                      className={`block h-full rounded-full `}
                      style={{
                        width: `${Math.max(Math.sqrt(s.value / max) * 100, s.value ? 3 : 0)}%`,
                        background: isB ? AMBER_FILL : "#111110",
                      }}
                    />
                  </span>
                </button>
              </HudIntel>
            </li>
          );
        })}
      </ol>

      {b ? (
        <div className="border-t border-[#e2ddd5] px-4 py-3.5 sm:px-5">
          <p className="hud-label m-0" style={{ color: AMBER }}>
            Bottleneck · {steps[b.step - 1].label} → {steps[b.step].label}
          </p>
          <p className="mt-1.5 text-base text-[#111110]">
            <span className="hud-mono" style={{ color: AMBER }}>{b.rate}%</span> make it through. Healthy is about{" "}
            <span className="hud-mono">{b.baseline}%</span>.
          </p>
          <p className="mt-1 text-sm leading-6 text-[#4d4b48]">{b.action}</p>
        </div>
      ) : (
        <p className="hud-mono border-t border-[#e2ddd5] px-4 py-3.5 text-xs text-[#4d4b48] sm:px-5">
          Bottleneck detection starts once 10 people reach a step.
        </p>
      )}
    </section>
  );
}
