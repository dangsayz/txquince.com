/**
 * The signature on every content photo the image route serves: a small
 * wordmark in the bottom-right corner, baked into the file, so a saved copy
 * or a screenshot carries the studio's name. Approved look: "A / Signature".
 *
 *   · sized from the photo, not the screen: the type is 2.5% of a portrait's
 *     width (a landscape gets the same visual weight, not a bigger mark)
 *   · never on small files (under 640px wide it would be unreadable noise)
 *   · never on page-top banners (hero / cover slugs): those carry headlines
 */
import { WATERMARK_PNG_BASE64 } from "@/lib/watermark-png";

/** The PNG: 550px wide, drawn with 60px type and 36px of shadow padding. */
const MARK_PNG_WIDTH = 550;
const MARK_TYPE_PX = 60;
const MARK_PAD_PX = 36;

export const MARK_MIN_WIDTH = 640;
export const MARK_OPACITY = 0.86;
/** Type height as a share of a 2:3 portrait's width. */
const TYPE_SHARE = 0.025;
/** Gap between the letters and the photo's edge, same share basis. */
const INSET_SHARE = 0.04;

export type MarkPlan = { width: number; inset: number };

/**
 * Where and how big the mark goes on an output of outW x outH pixels, or null
 * for no mark. Without a height the photo is treated as a mild landscape.
 */
export function markPlan(outW: number, outH?: number | null): MarkPlan | null {
  if (!Number.isFinite(outW) || outW < MARK_MIN_WIDTH) return null;
  // "Portrait-equivalent width": equal area, 2:3 shape. sqrt(2/3) = 0.8165.
  const ref = outH && outH > 0 ? Math.sqrt(outW * outH) * 0.8165 : outW * 0.85;
  const type = ref * TYPE_SHARE;
  const scale = type / MARK_TYPE_PX;
  return {
    width: Math.round(MARK_PNG_WIDTH * scale),
    // The PNG carries its own padding; take it off so the letters sit at INSET_SHARE.
    inset: Math.max(0, Math.round(ref * INSET_SHARE - MARK_PAD_PX * scale)),
  };
}

/** Banner slugs stay clean: the homepage hero and page covers sit under headlines. */
export function slugTakesMark(slug: string): boolean {
  return slug !== "hero" && !slug.startsWith("cover-");
}

/** Output size of a "scale-down to width" of a natural w x h photo. */
export function scaledSize(width: number, naturalW?: number | null, naturalH?: number | null): { w: number; h: number | null } {
  if (!naturalW || !naturalH) return { w: width, h: null };
  const w = Math.min(width, naturalW);
  return { w, h: Math.round((naturalH * w) / naturalW) };
}

let bytes: Uint8Array | null = null;
/** A fresh stream of the mark PNG (the Images binding consumes its input). */
export function markStream(): ReadableStream<Uint8Array> {
  if (!bytes) bytes = Uint8Array.from(atob(WATERMARK_PNG_BASE64), (c) => c.charCodeAt(0));
  const copy = bytes;
  return new ReadableStream({
    start(controller) {
      controller.enqueue(copy);
      controller.close();
    },
  });
}
