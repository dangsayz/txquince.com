"use client";

import { useEffect, type RefObject } from "react";
import "lenis/dist/lenis.css";

/** Run after the browser is idle (or soon after, where requestIdleCallback is missing). */
function whenIdle(fn: () => void) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 150);
}

/**
 * The homepage's scroll scenes: GSAP + ScrollTrigger, with Lenis smoothing the
 * wheel on desktop (lerp 0.125, synced to GSAP's ticker so the scroll position
 * and every scrubbed tween move in the same frame).
 *
 * Elements opt in with data attributes (no class coupling):
 *   data-ed="hero" / "hero-frame" / "hero-media" / "hero-copy"
 *                      the frame shrinks 1 → 0.8 as the hero leaves; the media drifts inside it
 *   data-ed="drift"    a text block rises 56px as it passes (desktop)
 *   data-ed="parallax" a photo drifts inside its frame
 *   data-ed="lines"    children marked data-line brighten one after another
 *   data-ed="band"     the black band opens from an inset like a curtain
 *   data-ed="depth"    a collage plate drifts at its own depth (data-depth 0–1)
 *   data-ed="feature-bg" the black-and-white plate behind the featured package
 *   data-ed="rise"     a heading rises in once, if it starts below the fold
 *
 * The libraries are fetched on the visitor's first scroll, touch, key or mouse
 * move (every scene is scroll-driven, so nothing is lost by waiting), which
 * keeps them entirely out of the first load. Nothing is hidden before they
 * arrive: every scene only moves things from where the page already drew them. Visitors who ask
 * for reduced motion get the still page; phones keep native scrolling.
 */
export function useScenes(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup = () => {};

    const start = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // Smooth wheel scrolling on mouse/trackpad devices only.
      let lenis: { raf(t: number): void; destroy(): void; on(e: "scroll", f: () => void): void; stop(): void; start(): void } | null = null;
      let tick: ((t: number) => void) | null = null;
      if (window.matchMedia("(pointer: fine)").matches) {
        const { default: Lenis } = await import("lenis");
        if (cancelled) return;
        const frameEl = document.querySelector(".txq") ?? document.documentElement;
        const header = parseFloat(getComputedStyle(frameEl).getPropertyValue("--header-h")) || 0;
        lenis = new Lenis({ autoRaf: false, lerp: 0.125, allowNestedScroll: true, anchors: { offset: -header } });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // Hero: the media drifts down inside the frame; past 40% the frame
        // shrinks to 0.8, leaving white margins; the words lift away first.
        const hero = root.querySelector('[data-ed="hero"]');
        if (hero) {
          gsap.fromTo('[data-ed="hero-media"]', { yPercent: 0 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.15 } });
          gsap.fromTo(
            '[data-ed="hero-frame"]',
            { scale: 1 },
            { scale: 0.8, ease: "none", transformOrigin: "50% 50%", scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: 0.15 } },
          );
          gsap.fromTo('[data-ed="hero-copy"]', { yPercent: 0, opacity: 1 }, { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "45% top", scrub: 0.15 } });
        }

        mm.add("(min-width: 1024px)", () => {
          q('[data-ed="drift"]').forEach((el) =>
            gsap.fromTo(el, { y: 0 }, { y: -56, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom top", scrub: 0.35 } }),
          );
        });

        q('[data-ed="parallax"]').forEach((el) =>
          gsap.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }),
        );

        q('[data-ed="lines"]').forEach((block) =>
          gsap.fromTo(block.querySelectorAll("[data-line]"), { opacity: 0.25 }, { opacity: 1, ease: "none", stagger: 0.35, scrollTrigger: { trigger: block, start: "top 96%", end: "top 50%", scrub: true } }),
        );

        q('[data-ed="band"]').forEach((band) =>
          gsap.fromTo(band, { clipPath: "inset(7% 5% 0% 5%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: band, start: "top bottom", end: "top 20%", scrub: 0.3 } }),
        );

        mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)" }, (c) => {
          const narrow = !!c.conditions?.narrow;
          q('[data-ed="depth"]').forEach((el) => {
            const d = Number(el.dataset.depth ?? 0.5);
            const dist = narrow ? 48 + d * 62 : 140 + d * 180;
            gsap.fromTo(el, { y: dist * 0.45 }, { y: -dist, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.55, invalidateOnRefresh: true } });
          });
        });

        q('[data-ed="feature-bg"]').forEach((el) =>
          gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.closest('[data-ed="feature"]'), start: "top bottom", end: "bottom top", scrub: true } }),
        );

        q('[data-ed="rise"]').forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) return;
          gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
      }, root);

      // A dialog that locks the page (menu, package comparison) also pauses Lenis.
      const lockWatch = new MutationObserver(() => {
        if (!lenis) return;
        if (document.body.style.overflow === "hidden") lenis.stop();
        else lenis.start();
      });
      lockWatch.observe(document.body, { attributes: true, attributeFilter: ["style"] });

      // The booking panel and the questions change height as families use
      // them; re-measure every trigger after the page settles.
      let t = 0;
      const ro = new ResizeObserver(() => {
        clearTimeout(t);
        t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      ro.observe(root);

      cleanup = () => {
        clearTimeout(t);
        ro.disconnect();
        lockWatch.disconnect();
        ctx.revert();
        if (tick) gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    };

    const EVENTS = ["scroll", "wheel", "touchstart", "pointerdown", "pointermove", "keydown"] as const;
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      EVENTS.forEach((ev) => window.removeEventListener(ev, go));
      whenIdle(() => void start());
    };
    // Already scrolled (a reload mid-page, or an in-page link): start now.
    if (window.scrollY > 0) go();
    else EVENTS.forEach((ev) => window.addEventListener(ev, go, { passive: true, once: true }));
    return () => {
      cancelled = true;
      EVENTS.forEach((ev) => window.removeEventListener(ev, go));
      cleanup();
    };
  }, [rootRef]);
}
