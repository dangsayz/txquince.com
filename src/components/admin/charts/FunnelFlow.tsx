/**
 * FunnelFlow — the booking funnel as one narrowing stream (after Dub's
 * analytics funnel on Mobbin). Band height follows each step's count (square
 * root scale, so small later steps stay visible), the % under each step is
 * "of the step before", and the worst drop vs. a healthy rate is tinted and
 * called out as the bottleneck with what to do about it.
 *
 * Server component, plain SVG. Under 640px it becomes stacked bars, so
 * nothing overflows at 360px.
 */
type Step = { label: string; value: number };
type Bottleneck = { step: number; rate: number; baseline: number; action: string } | null;

const W = 1000;
const H = 180;
const AMBER = "#bd8730";

function heights(steps: Step[]) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return steps.map((s) => Math.max(Math.sqrt(s.value / max) * (H - 16), s.value > 0 ? 6 : 2));
}

function bandPath(hs: number[]) {
  const n = hs.length;
  const cw = W / n;
  const top = (h: number) => (H - h) / 2;
  let d = `M0,${top(hs[0])}`;
  for (let i = 0; i < n; i++) {
    const x0 = i * cw;
    const flatEnd = x0 + cw * 0.55;
    d += ` L${flatEnd},${top(hs[i])}`;
    if (i < n - 1) {
      const x1 = (i + 1) * cw;
      const mid = (flatEnd + x1) / 2;
      d += ` C${mid},${top(hs[i])} ${mid},${top(hs[i + 1])} ${x1},${top(hs[i + 1])}`;
    } else {
      d += ` L${W},${top(hs[i])}`;
    }
  }
  const bottom = (h: number) => (H + h) / 2;
  d += ` L${W},${bottom(hs[n - 1])}`;
  for (let i = n - 1; i >= 0; i--) {
    const x0 = i * cw;
    const flatEnd = x0 + cw * 0.55;
    if (i < n - 1) {
      const x1 = (i + 1) * cw;
      const mid = (flatEnd + x1) / 2;
      d += ` L${x1},${bottom(hs[i + 1])} C${mid},${bottom(hs[i + 1])} ${mid},${bottom(hs[i])} ${flatEnd},${bottom(hs[i])}`;
    }
    d += ` L${x0},${bottom(hs[i])}`;
  }
  return `${d} Z`;
}

const pctOf = (steps: Step[], i: number) =>
  i === 0 ? null : steps[i - 1].value > 0 ? Math.round((steps[i].value / steps[i - 1].value) * 100) : 0;

export function FunnelFlow({ steps, bottleneck, range }: { steps: Step[]; bottleneck: Bottleneck; range: number }) {
  if (!steps.length) return null;
  const hs = heights(steps);
  const path = bandPath(hs);
  const cw = W / steps.length;
  const b = bottleneck;
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <section aria-labelledby="funnel-title" className="min-w-0 border border-[#e6e6e4] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e6e6e4] px-4 py-4 sm:px-6">
        <h2 id="funnel-title" className="text-base font-medium tracking-[-0.01em] text-[#111110]">
          Booking funnel
        </h2>
        <p className="text-xs text-[#62625f]">Last {range} days · % of the step before</p>
      </div>

      {/* Desktop / tablet: the stream */}
      <div className="hidden px-6 pb-6 pt-5 sm:block">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => {
            const pct = pctOf(steps, i);
            const isB = b?.step === i;
            return (
              <div key={s.label} className={`min-w-0 pr-3 ${i ? "border-l border-[#efefed] pl-4" : ""}`}>
                <p className="truncate text-xs text-[#62625f]">{s.label}</p>
                <p className="mt-1 text-2xl font-normal leading-none tracking-[-0.04em] tabular-nums text-[#111110]">{s.value.toLocaleString("en-US")}</p>
                <p className={`mt-1.5 text-xs tabular-nums ${isB ? "font-medium" : "text-[#8a8a86]"}`} style={isB ? { color: AMBER } : undefined}>
                  {pct === null ? "Start" : `${pct}%`}
                  {isB ? " · bottleneck" : ""}
                </p>
              </div>
            );
          })}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-4 block h-[180px] w-full" role="img" aria-label={steps.map((s) => `${s.label} ${s.value}`).join(", ")}>
          <defs>
            <linearGradient id="funnel-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#111110" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#111110" stopOpacity="0.55" />
            </linearGradient>
            {b ? (
              <clipPath id="funnel-b">
                <rect x={(b.step - 1) * cw + cw * 0.55} y="0" width={cw * 0.45 + cw * 0.55} height={H} />
              </clipPath>
            ) : null}
          </defs>
          <path d={path} fill="url(#funnel-fill)" />
          {b ? <path d={path} fill={AMBER} clipPath="url(#funnel-b)" /> : null}
          {steps.slice(1).map((_, i) => (
            <line key={i} x1={(i + 1) * cw} x2={(i + 1) * cw} y1="0" y2={H} stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      {/* Phone: stacked bars */}
      <ol className="space-y-3 px-4 pb-5 pt-4 sm:hidden">
        {steps.map((s, i) => {
          const pct = pctOf(steps, i);
          const isB = b?.step === i;
          return (
            <li key={s.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-[#111110]">{s.label}</span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-medium text-[#111110]">{s.value.toLocaleString("en-US")}</span>
                  {pct !== null ? (
                    <span className={`ml-2 text-xs ${isB ? "font-medium" : "text-[#8a8a86]"}`} style={isB ? { color: AMBER } : undefined}>
                      {pct}%
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f0f0ee]">
                <div className="h-full rounded-full" style={{ width: `${Math.max(Math.sqrt(s.value / max) * 100, s.value ? 3 : 0)}%`, background: isB ? AMBER : "#111110" }} />
              </div>
            </li>
          );
        })}
      </ol>

      {b ? (
        <div className="border-t border-[#e6e6e4] px-4 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: AMBER }}>
            Bottleneck · {steps[b.step - 1].label} → {steps[b.step].label}
          </p>
          <p className="mt-1.5 text-base text-[#111110]">
            <span className="font-medium tabular-nums">{b.rate}%</span> make it through. A healthy rate is about{" "}
            <span className="tabular-nums">{b.baseline}%</span>.
          </p>
          <p className="mt-1 text-sm leading-6 text-[#4d4d49]">{b.action}</p>
        </div>
      ) : (
        <p className="border-t border-[#e6e6e4] px-4 py-4 text-sm text-[#62625f] sm:px-6">
          The bottleneck appears once at least 10 people reach a step.
        </p>
      )}
    </section>
  );
}
