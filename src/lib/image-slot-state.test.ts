import { describe, expect, it } from "vitest";
import {
  applyReplace,
  applyUndo,
  EMPTY_VALUE,
  HISTORY_LIMIT,
  parseSlotValue,
  renditionWidths,
  RENDITION_WIDTHS,
  UndoError,
  type Version,
} from "@/lib/image-slot-state";
import { resolveSlotImage, brandedSrcSet } from "@/lib/image-slot-resolve";
import { getSlot } from "@/lib/image-slots";

export function version(id: string, w = 3000, h = 2000): Version {
  return {
    id,
    key: `slots/home.hero.a/${id}`,
    w,
    h,
    widths: renditionWidths(w),
    alt: { en: "A quinceañera", es: "Una quinceañera" },
    focal: { x: 0.4, y: 0.3 },
    uploadedAt: "2026-10-14T12:00:00.000Z",
    uploadedBy: "owner@example.com",
  };
}

describe("rendition widths never upscale", () => {
  it("caps every target at the original width", () => {
    for (let w = 1; w <= 5000; w += 7) {
      const widths = renditionWidths(w);
      expect(widths.length).toBeGreaterThan(0);
      for (const x of widths) expect(x).toBeLessThanOrEqual(w);
      expect(Math.max(...widths)).toBe(Math.min(w, 2400));
      expect([...widths].sort((a, b) => a - b)).toEqual(widths);
    }
  });

  it("matches the documented examples", () => {
    expect(renditionWidths(4000)).toEqual([...RENDITION_WIDTHS]);
    expect(renditionWidths(1200)).toEqual([480, 960, 1200]);
    expect(renditionWidths(300)).toEqual([300]);
    expect(renditionWidths(0)).toEqual([]);
  });

  it("never lists a branded srcset width beyond the photo", () => {
    const set = brandedSrcSet("/api/img/x", 1000)!;
    expect(set).toContain("640w");
    expect(set).toContain("828w");
    expect(set).not.toContain("1080w");
  });
});

describe("replace and undo", () => {
  it("replace then undo restores the previous version, then the original", () => {
    const a = version("aaaaaaaa-1");
    const b = version("bbbbbbbb-2");
    let v = applyReplace(EMPTY_VALUE, a);
    v = applyReplace(v, b);
    expect(v.current?.id).toBe(b.id);
    v = applyUndo(v);
    expect(v.current?.id).toBe(a.id);
    v = applyUndo(v);
    expect(v.current).toBeNull();
    expect(() => applyUndo(v)).toThrow(UndoError);
    // Any earlier version can be brought back, and the original too.
    v = applyUndo(v, { versionId: b.id });
    expect(v.current?.id).toBe(b.id);
    v = applyUndo(v, { versionId: "original" });
    expect(v.current).toBeNull();
    expect(v.history.map((x) => x.id)).toEqual([b.id, a.id]);
  });

  it("keeps only the last ten versions", () => {
    let v = EMPTY_VALUE;
    for (let i = 0; i < 14; i++) v = applyReplace(v, version(`v${String(i).padStart(7, "0")}`));
    expect(v.history).toHaveLength(HISTORY_LIMIT);
    expect(v.history[0].id).toBe("v0000013");
  });

  it("reads a malformed stored value as the original", () => {
    expect(parseSlotValue({ current: { nope: 1 } }).current).toBeNull();
    expect(parseSlotValue(null)).toEqual({ current: null, history: [] });
  });
});

describe("resolve", () => {
  const def = getSlot("home.hero.a")!;

  it("prefers the override, with srcset from stored widths and the focal point", () => {
    const r = resolveSlotImage(def, version("aaaaaaaa-1", 1200, 800), { src: "/api/img/x" });
    expect(r.overridden).toBe(true);
    expect(r.srcSet).toBe(
      "/api/photos/media/slots/home.hero.a/aaaaaaaa-1-480.webp 480w, /api/photos/media/slots/home.hero.a/aaaaaaaa-1-960.webp 960w, /api/photos/media/slots/home.hero.a/aaaaaaaa-1-1200.webp 1200w",
    );
    expect(r.width).toBe(1200);
    expect(r.objectPosition).toBe("40% 30%");
    expect(r.alt.es).toBe("Una quinceañera");
  });

  it("falls back to the page's photo, then the default", () => {
    expect(resolveSlotImage(def, null, { src: "/api/img/p", alt: "x" }).src).toBe("/api/img/p");
    const d = resolveSlotImage(def, null);
    expect(d.src).toBe(def.defaultSrc);
    expect(d.overridden).toBe(false);
  });
});
