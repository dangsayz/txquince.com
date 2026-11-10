import { describe, expect, it } from "vitest";
import { CLIP_FOR_IMAGE_SLOT, CLIP_PLACE, clampFocus, clipFocus, clipName, homeClip, clipUrl, HOME_CLIP_SLOTS, isHomeClipSlot, isMp4 } from "./home-clip-shared";
import { isSlotId } from "./image-slots";

const bytes = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

describe("home clips", () => {
  it("keeps the focus a whole percent, centred by default", () => {
    expect(clampFocus(15.4)).toBe(15);
    expect(clampFocus(-3)).toBe(0);
    expect(clampFocus(250)).toBe(100);
    expect(clampFocus("left")).toBe(50);
    expect(clipFocus({ name: "a.mp4", size: 1, updatedAt: "" })).toBe("50% 50%");
    expect(clipFocus({ name: "a.mp4", size: 1, updatedAt: "", focusX: 0 })).toBe("0% 50%");
  });

  it("hands the page the wide file, the tall cut when there is one, and the focus", () => {
    expect(homeClip(undefined)).toBeNull();
    expect(homeClip({ name: "a.mp4", size: 1, updatedAt: "", focusX: 20 })).toEqual({ mp4: "/api/photos/film/a.mp4", focus: "20% 50%" });
    expect(homeClip({ name: "a.mp4", size: 1, updatedAt: "", phone: { name: "a-phone.mp4", size: 1 } })).toEqual({
      mp4: "/api/photos/film/a.mp4",
      mp4Mobile: "/api/photos/film/a-phone.mp4",
      focus: "50% 50%",
    });
  });

  it("accepts an MP4 container and nothing else", () => {
    expect(isMp4(bytes("\0\0\0\x20ftypisom\0\0\x02\0"))).toBe(true);
    expect(isMp4(bytes("<!doctype html><html>"))).toBe(false);
    expect(isMp4(bytes("\x1aE\xdf\xa3webmwebmwebm"))).toBe(false);
    expect(isMp4(bytes("ftyp"))).toBe(false);
  });

  it("names every upload so the film route will serve it", () => {
    const name = clipName("feature", 1_800_000_000_000);
    expect(name).toMatch(/^[a-z0-9][a-z0-9-]{0,80}\.mp4$/);
    expect(clipName("feature", 1_800_000_000_001)).not.toBe(name);
    expect(clipUrl(name)).toBe(`/api/photos/film/${name}`);
    const phone = clipName("feature", 1_800_000_000_000, "phone");
    expect(phone).toMatch(/^[a-z0-9][a-z0-9-]{0,80}\.mp4$/);
    expect(phone).not.toBe(name);
  });

  it("knows its slots", () => {
    expect(isHomeClipSlot("feature")).toBe(true);
    expect(isHomeClipSlot("hero")).toBe(true);
    expect(isHomeClipSlot("band")).toBe(false);
    expect(isHomeClipSlot(null)).toBe(false);
  });

  it("offers video on real image slots, one per loop", () => {
    for (const id of Object.keys(CLIP_FOR_IMAGE_SLOT)) expect(isSlotId(id), id).toBe(true);
    expect(Object.values(CLIP_FOR_IMAGE_SLOT).sort()).toEqual([...HOME_CLIP_SLOTS].sort());
    for (const s of HOME_CLIP_SLOTS) expect(CLIP_PLACE[s]).toBeTruthy();
  });
});
