"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Intel } from "@/lib/pulse-intel";

/**
 * HudIntel — hover / focus / tap any number for its intel card:
 *   immediately: WHAT it is + a READ of what it says right now;
 *   stay ~1s:    NEXT MOVES types itself in (what to do about it), each
 *                with "Try this": logs the move with today's number as its
 *                baseline, and the Moves log judges it from then on.
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
  const router = useRouter();
  const [saving, setSaving] = useState<number | null>(null);
  const [started, setStarted] = useState<number[]>([]);

  async function tryMove(i: number, title: string) {
    if (!intel.metric) return;
    setSaving(i);
    const res = await fetch("/api/admin/changes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.slice(0, 200), area: `pulse:${intel.metric}`, target_metric: intel.metric, reason: intel.read.slice(0, 2000) }),
    }).catch(() => null);
    setSaving(null);
    if (res?.ok) {
      setStarted((s) => [...s, i]);
      router.refresh();
    }
  }

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
  // Leaving towards the card crosses a small gap: wait a beat before closing.
  const hideSoon = () => {
    clear();
    timers.current.push(window.setTimeout(hide, 180));
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

  const toneColor = intel.tone === "good" ? "#248a3d" : intel.tone === "warn" ? "#d70015" : "#0071e3";
  const showDeep = open && (deep || intel.trying?.some((d) => d !== null));

  return (
    <div
      className={`hud-raise relative ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
      onFocus={() => !open && show()}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && hide()}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".hud-intel")) return;
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
        className={`hud-intel absolute z-30 ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"} w-[min(340px,calc(100vw-40px))] ${align === "right" ? "right-0" : "left-0"} ${open ? "" : "sr-only"}`}
      >
        <div className="hud-intel__head">
          <span className="hud-intel__dot" style={{ background: toneColor, boxShadow: `0 0 10px ${toneColor}` }} />
          <span>{intel.title}</span>
          <span className="hud-intel__tag">Intel</span>
        </div>
        <p className="hud-intel__k">What it is</p>
        <p className="hud-intel__p">{intel.what}</p>
        <p className="hud-intel__k">Right now</p>
        <p className="hud-intel__p" style={{ color: "#1d1d1f" }}>{intel.read}</p>
        {showDeep && intel.todo.length ? (
          <div className="hud-intel__moves">
            <p className="hud-intel__k" style={{ color: toneColor }}>Next moves</p>
            <ol>
              {intel.todo.map((t, i) => (
                <li key={t} className="hud-type" style={{ animationDelay: `${i * 180}ms` }}>
                  <span className="hud-mono" style={{ color: toneColor }}>{String(i + 1).padStart(2, "0")}</span> {t}
                  {intel.metric ? (
                    <span className="mt-1.5 block">
                      {intel.trying?.[i] != null || started.includes(i) ? (
                        <span className="hud-mono hud-move-on">
                          ● Trying{intel.trying?.[i] != null ? ` · day ${intel.trying[i]}` : " · day 1"}
                        </span>
                      ) : (
                        <button type="button" className="hud-move-btn hud-focus" disabled={saving === i} onClick={() => tryMove(i, t)}>
                          {saving === i ? "Saving…" : "Try this →"}
                        </button>
                      )}
                    </span>
                  ) : null}
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
