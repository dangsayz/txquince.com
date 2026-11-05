"use client";

import { useEffect, useState } from "react";

/**
 * Briefing — the panel's opening status read, typed out line by line like a
 * console (instantly under reduced motion). Lines come from pulse-intel's
 * briefing(), computed from the live numbers.
 */
export function Briefing({ lines }: { lines: string[] }) {
  const full = lines.join("\n");
  const [shown, setShown] = useState(0);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = reduce ? full.length : 0;
    const t = window.setInterval(() => {
      i += 2;
      setShown(Math.min(i, full.length));
      if (i >= full.length) window.clearInterval(t);
    }, reduce ? 0 : 18);
    return () => window.clearInterval(t);
  }, [full]);

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Chicago" }));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  const typed = full.slice(0, shown).split("\n");
  return (
    <div className="hud-card hud-brief px-4 py-3.5 sm:px-5">
      <div className="hud-label flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="hud-brief__pulse" aria-hidden />
        <span style={{ color: "#0a84ff" }}>Pulse</span>
        <span>System online</span>
        <span className="ml-auto tabular-nums">{clock} CT</span>
      </div>
      <p className="sr-only">{lines.join(" ")}</p>
      <div aria-hidden className="hud-mono mt-2.5 space-y-1 text-[13px] leading-6 text-[#ffffff] sm:text-sm">
        {typed.map((l, i) => (
          <p key={i} className="m-0">
            <span className="text-[#0a84ff]">›</span> {l}
            {i === typed.length - 1 && shown < full.length ? <span className="hud-caret" /> : null}
          </p>
        ))}
      </div>
    </div>
  );
}
