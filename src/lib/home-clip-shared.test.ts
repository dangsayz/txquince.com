import { describe, expect, it } from "vitest";
import { clipName, clipUrl, isHomeClipSlot, isMp4 } from "./home-clip-shared";

const bytes = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

describe("home clips", () => {
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
  });

  it("knows its slots", () => {
    expect(isHomeClipSlot("feature")).toBe(true);
    expect(isHomeClipSlot("hero")).toBe(true);
    expect(isHomeClipSlot("band")).toBe(false);
    expect(isHomeClipSlot(null)).toBe(false);
  });
});
