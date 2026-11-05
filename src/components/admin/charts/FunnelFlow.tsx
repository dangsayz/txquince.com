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

const H = 190;
const AMBER = "#ffb547";

function heights(steps: Step[]) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return steps.map((s) => Math.max(Math.sqrt(s.value / max) * (H - 24), s.value > 0 ? 6 : 2));
}

function bandPath(hs: number[], W: number, offset = 0, scale = 1) {
  const n = hs.length;
  const cw = W / n;
  const top = (h: number) => (H - h * scale) / 2 + offset * h;
  const bot = (h: number) => (H + h * scale) / 2 + offset * h;
  let d = `M0,${top(hs[0])}`;
  for (let i = 0; i < n; i++) {
    const flatEnd = i * cw + cw * 0.5;
    d += ` L${flatEnd},${top(hs[i])}`;
    if (i < n - 1) {
      const x1 = (i + 1) * cw;
      const mid = (flatEnd + x1) / 2;
      d += ` C${mid},${top(hs[i])} ${mid},${top(hs[i + 1])} ${x1},${top(hs[i + 1])}`;
    } else d += ` L${W},${top(hs[i])}`;
  }
  d += ` L${W},${bot(hs[n - 1])}`;
  for (let i = n - 1; i >= 0; i--) {
    const flatEnd = i * cw + cw * 0.5;
    if (i < n - 1) {
      const x1 = (i + 1) * cw;
      const mid = (flatEnd + x1) / 2;
      d += ` L${x1},${bot(hs[i + 1])} C${mid},${bot(hs[i + 1])} ${mid},${bot(hs[i])} ${flatEnd},${bot(hs[i])}`;
    }
    d += ` L${i * cw},${bot(hs[i])}`;
  }
  return `${d} Z`;
}

/** A centerline through the band at a relative offset (-0.5..0.5 of its height). */
function flowLine(hs: number[], W: number, k: number) {
  const n = hs.length;
  const cw = W / n;
  const y = (h: number) => H / 2 + k * h;
  let d = `M0,${y(hs[0])}`;
  for (let i = 0; i < n; i++) {
    const flatEnd = i * cw + cw * 0.5;
    d += ` L${flatEnd},${y(hs[i])}`;
    if (i < n - 1) {
      const x1 = (i + 1) * cw;
      const mid = (flatEnd + x1) / 2;
      d += ` C${mid},${y(hs[i])} ${mid},${y(hs[i + 1])} ${x1},${y(hs[i + 1])}`;
    } else d += ` L${W},${y(hs[i])}`;
  }
  return d;
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
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(56,232,255,0.14)] px-4 py-3.5 sm:px-5">
        <h2 id={`funnel-${gid}`} className="hud-label m-0" style={{ color: "#e6f4ff" }}>
          Booking funnel
        </h2>
        <p className="hud-mono m-0 text-[11px] text-[#8fa0b8]">LAST {range}D · % OF STEP BEFORE · HOVER A STEP</p>
      </div>

      {/* Desktop / tablet: the stream */}
      <div className="hidden px-5 pb-5 pt-4 sm:block">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => {
            const pct = pctOf(steps, i);
            const isB = b?.step === i;
            return (
              <HudIntel key={s.label} intel={intel[i]} align={i >= steps.length - 2 ? "right" : "left"}>
                <button type="button" className={`hud-focus block w-full min-w-0 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[rgba(56,232,255,0.05)] ${i ? "border-l border-[rgba(56,232,255,0.12)]" : ""}`}>
                  <span className="hud-label block truncate">{s.label}</span>
                  <span className="hud-value mt-1.5 block" style={isB ? { color: AMBER, textShadow: `0 0 14px ${AMBER}66` } : undefined}>
                    {s.value.toLocaleString("en-US")}
                  </span>
                  <span className="hud-mono mt-1 block text-[11px]" style={{ color: isB ? AMBER : "#8fa0b8" }}>
                    {pct === null ? "SOURCE" : `${pct}%`}
                    {isB ? " · BOTTLENECK" : ""}
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
                <linearGradient id={`band-${gid}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#38e8ff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#8b7bff" stopOpacity="0.7" />
                </linearGradient>
                <clipPath id={`clip-${gid}`}>
                  <path d={bandPath(hs, W)} />
                </clipPath>
                {b ? (
                  <clipPath id={`b-${gid}`}>
                    <rect x={(b.step - 1) * cw + cw * 0.5} y="0" width={cw} height={H} />
                  </clipPath>
                ) : null}
                <filter id={`glow-${gid}`} x="-10%" y="-40%" width="120%" height="180%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
              </defs>
              {/* glow underlay */}
              <path d={bandPath(hs, W)} fill={`url(#band-${gid})`} opacity="0.45" filter={`url(#glow-${gid})`} />
              <path d={bandPath(hs, W)} fill={`url(#band-${gid})`} opacity="0.32" />
              <path d={bandPath(hs, W, 0, 0.55)} fill={`url(#band-${gid})`} opacity="0.35" />
              {b ? (
                <g clipPath={`url(#b-${gid})`} className="hud-bneck">
                  <path d={bandPath(hs, W)} fill={AMBER} opacity="0.55" />
                </g>
              ) : null}
              {/* particles flowing through the stream */}
              <g clipPath={`url(#clip-${gid})`}>
                {[-0.32, -0.16, 0, 0.16, 0.32].map((k, i) => (
                  <path key={k} d={flowLine(hs, W, k)} fill="none" stroke="#e6f4ff" strokeOpacity={i === 2 ? 0.9 : 0.55} strokeWidth={i === 2 ? 2 : 1.4} strokeLinecap="round" className={`hud-flow ${i % 2 ? "hud-flow--slow" : ""}`} />
                ))}
              </g>
              {/* step markers */}
              {steps.map((s, i) => {
                const x = i * cw + cw * 0.25;
                const top = (H - hs[i]) / 2;
                return (
                  <g key={s.label}>
                    <line x1={i * cw} x2={i * cw} y1="0" y2={H} stroke="rgba(56,232,255,0.14)" strokeDasharray="2 4" />
                    <circle cx={x} cy={top} r="3" fill="#05080f" stroke={b?.step === i ? AMBER : "#38e8ff"} strokeWidth="1.5" />
                  </g>
                );
              })}
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
                    <span className="hud-mono shrink-0 text-sm text-[#e6f4ff]">
                      {s.value.toLocaleString("en-US")}
                      {pct !== null ? <span className="ml-2 text-xs" style={{ color: isB ? AMBER : "#8fa0b8" }}>{pct}%</span> : null}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-[rgba(56,232,255,0.08)]">
                    <span
                      className={`block h-full rounded-full ${isB ? "hud-bneck" : ""}`}
                      style={{
                        width: `${Math.max(Math.sqrt(s.value / max) * 100, s.value ? 3 : 0)}%`,
                        background: isB ? AMBER : "linear-gradient(90deg,#38e8ff,#8b7bff)",
                        boxShadow: `0 0 12px ${isB ? AMBER : "#38e8ff"}88`,
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
        <div className="border-t border-[rgba(56,232,255,0.14)] px-4 py-3.5 sm:px-5">
          <p className="hud-label m-0" style={{ color: AMBER }}>
            ⚠ Bottleneck · {steps[b.step - 1].label} → {steps[b.step].label}
          </p>
          <p className="mt-1.5 text-base text-[#e6f4ff]">
            <span className="hud-mono" style={{ color: AMBER }}>{b.rate}%</span> make it through. Healthy is about{" "}
            <span className="hud-mono">{b.baseline}%</span>.
          </p>
          <p className="mt-1 text-sm leading-6 text-[#a9b9cf]">{b.action}</p>
        </div>
      ) : (
        <p className="hud-mono border-t border-[rgba(56,232,255,0.14)] px-4 py-3.5 text-xs text-[#8fa0b8] sm:px-5">
          BOTTLENECK DETECTION STARTS ONCE 10 PEOPLE REACH A STEP.
        </p>
      )}
    </section>
  );
}
