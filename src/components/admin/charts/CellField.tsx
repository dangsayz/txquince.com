"use client";

import { useEffect, useRef } from "react";

/**
 * CellField — a quiet grid of cells behind the chart; a few light up in cyan
 * and fade, like a live data matrix. Canvas, ~24 fps, paused when off screen
 * or the tab is hidden; a static grid under prefers-reduced-motion.
 * `intensity` (0..1) scales how many cells ignite: the chart passes the
 * share of today's traffic vs. the period's peak, so a busy day looks busier.
 */
export function CellField({ intensity = 0.5 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CELL = 18;
    let w = 0, h = 0, cols = 0, rows = 0;
    let heat = new Float32Array(0);
    let raf = 0, last = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      const r = canvas!.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL);
      heat = new Float32Array(cols * rows);
      draw();
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = heat[y * cols + x];
          ctx!.fillStyle = v > 0.02 ? `rgba(56,232,255,${0.05 + v * 0.35})` : "rgba(56,232,255,0.035)";
          ctx!.fillRect(x * CELL + 1, y * CELL + 1, CELL - 3, CELL - 3);
        }
      }
    }

    function tick(t: number) {
      raf = requestAnimationFrame(tick);
      if (!visible || t - last < 42) return;
      last = t;
      for (let i = 0; i < heat.length; i++) heat[i] *= 0.9;
      const sparks = 1 + Math.round(intensity * 4);
      for (let s = 0; s < sparks; s++) if (Math.random() < 0.6) heat[Math.floor(Math.random() * heat.length)] = 1;
      draw();
    }

    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && !document.hidden));
    io.observe(canvas);
    const onVis = () => (visible = !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(120%_100%_at_50%_100%,#000_35%,transparent_85%)]"
    />
  );
}
