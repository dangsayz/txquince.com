"use client";

import { useEffect } from "react";
import "./no-upscale.css";

/**
 * NoUpscale — the site-wide "never stretch a photo past its real pixels" rule.
 *
 * Mounted ONCE in the global SiteShell. It watches every <img> inside `.txq`
 * (initial scan + MutationObserver for new/changed images + capture-phase load
 * events + a debounced resize) and, when a photo is displayed larger than 1:1
 * (rendered CSS px > the file's real px), constrains it so it never is:
 *
 *  · normal-flow image → the <img> gets max-width = its natural width (centered)
 *  · fill / absolutely-positioned image in an image-only frame → the FRAME is
 *    capped at min(naturalW, naturalH × frame ratio) wide and naturalH tall, and
 *    centered in its slot (so object-fit: cover can never scale above 1)
 *  · absolutely-positioned image in a frame that also holds text → the <img>
 *    itself is capped and centered inside the frame (the frame never moves)
 *
 * Every constrained element is marked `data-no-upscale="img|frame"` plus
 * `data-no-upscale-natural="WxH"` — audit in DevTools with
 * `document.querySelectorAll('[data-no-upscale]')`. Styling lives in
 * no-upscale.css (the values arrive as --tq-nu-w / --tq-nu-h).
 *
 * What it leaves alone: images that are already sharp (nothing is written, so
 * no layout shift), SVG/icons, tiny decorative images (< 48px), hidden images,
 * anything under [data-allow-upscale], and srcset images where the browser
 * simply picked a smaller candidate while a larger one exists (that is a
 * device-pixel choice, not a small source). With a srcset, `naturalWidth` is
 * density-corrected, so the real file size is read from a cached probe of
 * `currentSrc`.
 *
 * This is the safety net. The root fix is serving big-enough sources with
 * honest `sizes` (e.g. src/lib/blog-cover.ts for blog heroes).
 */

const MIN_PX = 48; // icons / decorative specks are ignored
const TOLERANCE = 1.01; // sub-pixel rounding is not "upscaling"

type Size = { w: number; h: number };
type Candidate = { url: string; value: number; unit: "w" | "x" };

const probes = new Map<string, Promise<Size | null>>();

function isVector(img: HTMLImageElement): boolean {
  const src = img.currentSrc || img.src || "";
  return /^data:image\/svg/i.test(src) || /\.svg(?:[?#]|$)/i.test(src);
}

function usesResponsiveSource(img: HTMLImageElement): boolean {
  return Boolean(img.srcset) || img.parentElement?.tagName === "PICTURE";
}

/** The file's REAL pixel size (srcset makes naturalWidth density-corrected). */
function fileSize(img: HTMLImageElement): Promise<Size | null> {
  if (!usesResponsiveSource(img)) {
    return Promise.resolve(img.naturalWidth ? { w: img.naturalWidth, h: img.naturalHeight } : null);
  }
  const src = img.currentSrc || img.src;
  if (!src) return Promise.resolve(null);
  let p = probes.get(src);
  if (!p) {
    p = new Promise<Size | null>((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(probe.naturalWidth ? { w: probe.naturalWidth, h: probe.naturalHeight } : null);
      probe.onerror = () => resolve(null);
      probe.src = src; // same URL → served from the browser cache
    });
    probes.set(src, p);
  }
  return p;
}

function parseSrcset(srcset: string): Candidate[] {
  return srcset
    .split(/,\s+/)
    .map((part) => part.trim().split(/\s+/))
    .filter((bits) => bits[0])
    .map(([url, desc = "1x"]) => {
      const unit = desc.endsWith("w") ? "w" : "x";
      return { url, value: parseFloat(desc) || 1, unit } as Candidate;
    });
}

/**
 * True when the displayed file is genuinely the biggest there is: no srcset,
 * the largest candidate, or the server returned fewer pixels than requested
 * (e.g. /api/img scale-down of a small original).
 */
function isLargestAvailable(img: HTMLImageElement, file: Size): boolean {
  if (!img.srcset) return true;
  const list = parseSrcset(img.srcset);
  const cur = list.find((c) => {
    try {
      return new URL(c.url, document.baseURI).href === img.currentSrc;
    } catch {
      return false;
    }
  });
  if (!cur) return true;
  const max = Math.max(...list.filter((c) => c.unit === cur.unit).map((c) => c.value));
  if (cur.value >= max) return true;
  let requested = cur.unit === "w" ? cur.value : 0;
  if (!requested) {
    try {
      requested = Number(new URL(cur.url, document.baseURI).searchParams.get("w")) || 0;
    } catch {
      requested = 0;
    }
  }
  return requested > 0 && file.w < requested * 0.98;
}

/** How many CSS px each image px is drawn at (object-fit aware). */
function drawScale(img: HTMLImageElement, file: Size): number {
  const bw = img.clientWidth;
  const bh = img.clientHeight;
  if (bw < MIN_PX || bh < MIN_PX) return 0;
  const sx = bw / file.w;
  const sy = bh / file.h;
  switch (getComputedStyle(img).objectFit) {
    case "contain":
      return Math.min(sx, sy);
    case "none":
      return 1;
    case "scale-down":
      return Math.min(1, sx, sy);
    default: // fill, cover
      return Math.max(sx, sy);
  }
}

function parseRatio(value: string): number | null {
  const m = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/.exec(value);
  if (!m) return null;
  const r = parseFloat(m[1]) / parseFloat(m[2]);
  return Number.isFinite(r) && r > 0 ? r : null;
}

/** A positioned frame whose only job is to hold this photo (no real text). */
function isImageOnlyFrame(frame: HTMLElement | null, root: HTMLElement): frame is HTMLElement {
  if (!frame || frame === root || !root.contains(frame)) return false;
  if (frame.matches("main, section, header, footer, article, body")) return false;
  if (frame.querySelectorAll("img, video, iframe").length !== 1) return false;
  return (frame.textContent ?? "").trim().length <= 40; // a "[02 / Featured]" tag is fine
}

const targets = new WeakMap<HTMLImageElement, HTMLElement>();

function clear(el: HTMLElement) {
  if (!el.dataset.noUpscale) return;
  delete el.dataset.noUpscale;
  delete el.dataset.noUpscaleNatural;
  delete el.dataset.noUpscalePos;
  el.style.removeProperty("--tq-nu-w");
  el.style.removeProperty("--tq-nu-h");
}

async function check(img: HTMLImageElement, root: HTMLElement) {
  if (!img.isConnected || !img.complete || !img.naturalWidth) return;
  if (isVector(img) || img.closest("[data-allow-upscale]")) return;
  const file = await fileSize(img);
  if (!file || file.w < MIN_PX || file.h < MIN_PX || !img.isConnected) return;

  // Everything below is synchronous: clear → measure → (re)apply happens in one
  // task, so a re-check never paints an un-capped frame.
  const prev = targets.get(img);
  if (prev) clear(prev);
  targets.delete(img);

  const scale = drawScale(img, file);
  if (scale <= TOLERANCE) return; // already sharp → untouched (no layout shift)
  if (!isLargestAvailable(img, file)) return; // browser chose a smaller candidate

  const cs = getComputedStyle(img);
  const absolute = cs.position === "absolute";
  if (cs.position === "fixed") return; // overlays/lightboxes manage themselves

  let target: HTMLElement = img;
  let kind: "img" | "frame" = "img";
  if (absolute && isImageOnlyFrame(img.parentElement, root)) {
    target = img.parentElement;
    kind = "frame";
  }

  const box = target.getBoundingClientRect();
  const ratio =
    parseRatio(getComputedStyle(target).aspectRatio) ?? (box.height > 0 ? box.width / box.height : file.w / file.h);
  // object-fit: cover draws at max(W/natW, H/natH): keep W ≤ natW and H ≤ natH.
  const maxW = Math.max(MIN_PX, Math.floor(Math.min(file.w, file.h * ratio)));

  target.dataset.noUpscale = kind;
  target.dataset.noUpscaleNatural = `${file.w}x${file.h}`;
  if (kind === "img" && absolute) target.dataset.noUpscalePos = "abs";
  target.style.setProperty("--tq-nu-w", `${maxW}px`);
  target.style.setProperty("--tq-nu-h", `${file.h}px`);
  targets.set(img, target);
}

export function NoUpscale() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".txq");
    if (!root) return;

    const run = (img: HTMLImageElement) => void check(img, root);
    const scanAll = () => root.querySelectorAll("img").forEach(run);

    const onLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement && root.contains(e.target)) run(e.target);
    };
    root.addEventListener("load", onLoad, true); // load doesn't bubble; capture does

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.target instanceof HTMLImageElement) run(r.target);
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) run(n);
          else if (n instanceof HTMLElement) n.querySelectorAll("img").forEach(run);
        });
      }
    });
    // Only src/srcset/sizes — our own style/data-* writes never re-trigger it.
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "srcset", "sizes"] });

    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(scanAll, 150);
    };
    window.addEventListener("resize", onResize);

    const raf = requestAnimationFrame(scanAll);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("load", onLoad, true);
      mo.disconnect();
    };
  }, []);

  return null;
}
