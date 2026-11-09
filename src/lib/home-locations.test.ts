import { describe, expect, it } from "vitest";
import { homeLocations } from "./home-locations";
import { getAllPosts } from "@/content/blog";
import { ALBUMS } from "@/content/albums";

describe("homeLocations", () => {
  const list = homeLocations([], getAllPosts(), "/blog");

  it("lists every venue that has an album, linking to its venue page", () => {
    const withAlbum = new Set(ALBUMS.map((a) => a.venueSlug).filter(Boolean));
    for (const slug of withAlbum) expect(list.some((g) => g.href === `/venues/${slug}`)).toBe(true);
  });

  it("adds named places without a venue page once each, linked to their blog story", () => {
    const places = list.filter((g) => g.key.startsWith("place:"));
    expect(places.length).toBeGreaterThan(0);
    expect(new Set(places.map((p) => p.title)).size).toBe(places.length);
    for (const p of places) expect(p.href).toMatch(/^\/blog\/[a-z0-9-]+$/);
  });

  it("never shows an album whose place is unconfirmed", () => {
    expect(list.some((g) => !g.title)).toBe(false);
  });
});
