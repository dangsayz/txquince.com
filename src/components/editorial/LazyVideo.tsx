"use client";

import { useEffect, useRef, useState } from "react";
import type { Clip } from "./media";

type Picked = { mp4: string; webm?: string };

/** Run after the browser is idle (or soon after, where requestIdleCallback is missing). */
function whenIdle(fn: () => void) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2000 });
  else setTimeout(fn, 200);
}

/**
 * A muted, looping background clip layered over its poster still.
 *
 * - Nothing is downloaded until the clip is near the viewport; `eager` (the
 *   hero) waits for the page's load event instead, so the poster image stays
 *   the largest paint and the video never competes with it.
 * - Plays only while on screen; paused the rest of the time.
 * - Visitors who prefer reduced motion, or have Data Saver on, keep the still.
 * - Phones (under 768px) get the smaller encode when there is one.
 * - If the browser refuses to autoplay (iPhone Low Power Mode), the poster
 *   simply stays: the clip only fades in once it is actually playing.
 */
export function LazyVideo({ clip, eager = false, className }: { clip: Clip | null; eager?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<Picked | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!clip || !v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const small = window.matchMedia("(max-width: 767px)").matches;
    const pick: Picked = {
      mp4: (small && clip.mp4Mobile) || clip.mp4,
      webm: (small && clip.webmMobile) || clip.webm,
    };
    // iOS only autoplays inline video that is muted as a property, not just an attribute.
    v.muted = true;
    v.defaultMuted = true;

    let loaded = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!loaded) {
            loaded = true;
            setSrc(pick);
          } else {
            v.play().catch(() => undefined);
          }
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    const begin = () => io.observe(v);
    if (!eager) begin();
    else if (document.readyState === "complete") whenIdle(begin);
    else window.addEventListener("load", () => whenIdle(begin), { once: true });
    return () => io.disconnect();
  }, [clip, eager]);

  useEffect(() => {
    const v = ref.current;
    if (!src || !v) return;
    v.load();
    v.play().catch(() => undefined);
  }, [src]);

  if (!clip) return null;
  return (
    <video
      ref={ref}
      className={className}
      data-playing={playing || undefined}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    >
      {src?.webm && <source src={src.webm} type="video/webm" />}
      {src && <source src={src.mp4} type="video/mp4" />}
    </video>
  );
}
