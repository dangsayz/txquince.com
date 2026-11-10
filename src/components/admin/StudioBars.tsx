/**
 * StudioBars — the one chart in the Studio: visitors per day as simple bars,
 * the last (today) in ink. Optional `extra` per day (e.g. new families) shows
 * as "+n" under the day. Used on Today (7 days) and Insights (7–30 days).
 */
export type BarDay = { date: string; value: number; extra?: number };

const label = (isoDay: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${isoDay}T12:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

export function StudioBars({ days, unit, extraUnit, todayLast = true }: { days: BarDay[]; unit: [string, string]; extraUnit?: [string, string]; todayLast?: boolean }) {
  const peak = Math.max(1, ...days.map((d) => d.value));
  const many = days.length > 10;
  const every = days.length > 20 ? 7 : 3;
  const word = (n: number, [one, other]: [string, string]) => `${n.toLocaleString("en-US")} ${n === 1 ? one : other}`;
  return (
    <ol className={`st-week m-0 grid list-none p-0 ${many ? "gap-[3px] sm:gap-1.5" : "gap-2 sm:gap-4"}`} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
      {days.map((d, i) => {
        const isLast = todayLast && i === days.length - 1;
        const showLabel = !many || isLast || (days.length - 1 - i) % every === 0;
        return (
          <li key={d.date} className="flex min-w-0 flex-col items-center">
            <span className="sr-only">
              {label(d.date, { weekday: "long", month: "short", day: "numeric" })}: {word(d.value, unit)}
              {d.extra && extraUnit ? `, ${word(d.extra, extraUnit)}` : ""}
            </span>
            {!many && <span aria-hidden="true" className="st-num text-sm">{d.value.toLocaleString("en-US")}</span>}
            <span aria-hidden="true" className={`flex w-full items-end ${many ? "h-24" : "mt-1.5 h-28"}`}>
              <span
                className={`st-bar w-full rounded-t-[var(--tq-radius-xs)] ${isLast ? "bg-[var(--st-blue)]" : "bg-[var(--st-blue-soft)]"}`}
                style={{ height: `${Math.max(3, (d.value / peak) * 100)}%`, animationDelay: `${Math.min(i * 30, 400)}ms` }}
              />
            </span>
            <span aria-hidden="true" className={`mt-2 h-5 whitespace-nowrap text-[13px] ${isLast ? "font-semibold" : "text-[var(--tq-ink-mute)]"}`}>
              {showLabel ? (isLast ? "Today" : many ? label(d.date, { month: "short", day: "numeric" }) : label(d.date, { weekday: "short" })) : ""}
            </span>
            {extraUnit && !many && (
              <span aria-hidden="true" className="h-5 text-[13px] font-medium text-[var(--st-rose)]">{d.extra ? `+${d.extra}` : ""}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
