"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Intel } from "@/lib/pulse-intel";

/**
 * HudIntel — hover / focus / tap any number for its intel card:
 *   immediately: WHAT it is + a READ of what it says right now;
 *   stay ~1s:    NEXT MOVES types itself in (what to do about it).
 * Touch: tap toggles. Escape or leaving closes. The card is a real
 * aria-describedby description, so screen readers get the same text.
 */
export function HudIntel({
  intel,
  children,
  align = "left",
  side = "bottom",
  className = "",
}: {
  intel: Intel;
  children: ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [deep, setDeep] = useState(false);
  const timers = useRef<number[]>([]);
  const id = useId();

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const show = () => {
    clear();
    timers.current.push(window.setTimeout(() => setOpen(true), 120));
    timers.current.push(window.setTimeout(() => setDeep(true), 1100));
  };
  const hide = () => {
    clear();
    setOpen(false);
    setDeep(false);
  };
  useEffect(() => clear, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setOpen(false);
      setDeep(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toneColor = intel.tone === "good" ? "#3dffa8" : intel.tone === "warn" ? "#ffb547" : "#38e8ff";

  return (
    <div
      className={`hud-raise relative ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onFocus={show}
      onBlur={hide}
      onClick={(e) => {
        if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
        if (open) hide();
        else {
          setOpen(true);
          timers.current.push(window.setTimeout(() => setDeep(true), 700));
        }
      }}
      aria-describedby={id}
    >
      {children}
      <div
        id={id}
        role="tooltip"
        className={`hud-intel absolute z-30 ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"} w-[min(340px,calc(100vw-40px))] ${align === "right" ? "right-0" : "left-0"} ${open ? "" : "sr-only"}`}
      >
        <div className="hud-intel__head">
          <span className="hud-intel__dot" style={{ background: toneColor, boxShadow: `0 0 10px ${toneColor}` }} />
          <span>{intel.title}</span>
          <span className="hud-intel__tag">INTEL</span>
        </div>
        <p className="hud-intel__k">What it is</p>
        <p className="hud-intel__p">{intel.what}</p>
        <p className="hud-intel__k">Right now</p>
        <p className="hud-intel__p" style={{ color: "#e6f4ff" }}>{intel.read}</p>
        {deep && intel.todo.length ? (
          <div className="hud-intel__moves">
            <p className="hud-intel__k" style={{ color: toneColor }}>Next moves</p>
            <ol>
              {intel.todo.map((t, i) => (
                <li key={t} className="hud-type" style={{ animationDelay: `${i * 180}ms` }}>
                  <span className="hud-mono" style={{ color: toneColor }}>{String(i + 1).padStart(2, "0")}</span> {t}
                </li>
              ))}
            </ol>
          </div>
        ) : open && intel.todo.length ? (
          <p className="hud-intel__hint">Hold on this number for what to do next…</p>
        ) : null}
      </div>
    </div>
  );
}
