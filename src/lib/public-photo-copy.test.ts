import { describe, expect, it } from "vitest";
import { photosNeedingDescription } from "./public-photo-copy";

const gaps = (photos: { id: string; alt?: string | null; location?: string | null }[]) =>
  Object.fromEntries(photosNeedingDescription(photos));

describe("photosNeedingDescription", () => {
  it("leaves a real description alone", () => {
    expect(gaps([{ id: "a", alt: "Quinceañera in a lavender ballgown on a sweeping stone staircase" }])).toEqual({});
  });

  it("flags empty alt text", () => {
    expect(gaps([{ id: "a", alt: "  " }, { id: "b", alt: null }])).toEqual({ a: "blank", b: "blank" });
  });

  it("flags leftover file names", () => {
    expect(
      gaps([
        { id: "a", alt: "12img liliana quince lilly 857 jpg at country" },
        { id: "b", alt: "4950A5AB 3275 44DF A157 EA715CDE5A50" },
        { id: "c", alt: "IMG_4821" },
      ]),
    ).toEqual({ a: "filename", b: "filename", c: "filename" });
  });

  it("flags the stock line an upload starts with, with or without a place", () => {
    expect(
      gaps([
        { id: "a", alt: "Quinceañera cake" },
        { id: "b", alt: "Quinceañera waltz, el vals at Las Lomas Banquet Hall", location: "Las Lomas Banquet Hall" },
      ]),
    ).toEqual({ a: "stock", b: "stock" });
  });

  it("flags the venue import line", () => {
    expect(gaps([{ id: "a", alt: "Quinceañera celebration at Convention Plaza Ballroom in Irving, Texas" }])).toEqual({ a: "stock" });
  });

  it("flags a line three photos share, but not one two photos share", () => {
    const line = "Quinceañera dancing with her court under string lights";
    expect(gaps([{ id: "a", alt: line }, { id: "b", alt: line }])).toEqual({});
    expect(gaps([{ id: "a", alt: line }, { id: "b", alt: line }, { id: "c", alt: line }])).toEqual({ a: "stock", b: "stock", c: "stock" });
  });

  it("does not flag a real sentence that only starts like a stock line", () => {
    expect(gaps([{ id: "a", alt: "Quinceañera cake with five tiers of pink sugar roses", location: "Irving" }])).toEqual({});
  });
});
