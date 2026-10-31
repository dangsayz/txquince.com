"use client";

import { useEffect } from "react";
import { cancelFrame, frame } from "motion/react";
import "lenis/dist/lenis.css";

/**
 * Lenis smooth scrolling for the homepage, driven from Motion's frame loop so
 * the scroll position and every scroll-linked animation update in the same
 * frame (no one-frame lag between the page and the parallax).
 *
 * Off for visitors who prefer reduced motion, and on touch screens: phones
 * keep their native momentum scrolling, which is faster and expected there.
 * Lenis drives the window's own scroll position, so Motion's useScroll,
 * sticky elements and in-page links keep working unchanged. The library is
 * loaded on demand, so phones never download it.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let cancelled = false;
    let cleanup = () => {};
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const frameEl = document.querySelector(".txq") ?? document.documentElement;
      const header = parseFloat(getComputedStyle(frameEl).getPropertyValue("--header-h")) || 0;
      const lenis = new Lenis({
        autoRaf: false,
        lerp: 0.12,
        allowNestedScroll: true,
        anchors: { offset: -header },
      });
      const tick = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
      frame.update(tick, true);

      // A dialog that locks the page (menu, package comparison) also pauses Lenis.
      const lockWatch = new MutationObserver(() => {
        if (document.body.style.overflow === "hidden") lenis.stop();
        else lenis.start();
      });
      lockWatch.observe(document.body, { attributes: true, attributeFilter: ["style"] });

      cleanup = () => {
        lockWatch.disconnect();
        cancelFrame(tick);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);
  return null;
}
