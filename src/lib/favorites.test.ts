import { describe, expect, it } from "vitest";
import { FAVORITES_MAX, favoriteGroups, favoritesFromImages, gridSrcSet, sizedSrc, type FavoriteSource } from "./favorites";

const img = (slug: string, p: Partial<FavoriteSource> = {}): FavoriteSource => ({
  slug, url: `/api/img/${slug}?v=1`, width: 800, height: 1200, alt: slug, section: "portraits", is_feature: false, sort_order: 0, ...p,
});

describe("favoritesFromImages", () => {
  it("shows only starred photos, in the owner's order", () => {
    const f = favoritesFromImages([
      img("a", { is_feature: true, sort_order: 3 }),
      img("b"),
      img("c", { is_feature: true, sort_order: 1 }),
    ]);
    expect(f.map((x) => x.id)).toEqual(["c", "a"]);
    expect(f[0].href).toBe("/photos/portraits/c");
  });

  it("falls back to every photo when none are starred", () => {
    expect(favoritesFromImages([img("a", { sort_order: 2 }), img("b", { sort_order: 1 })]).map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("skips photos without dimensions or slug, and films", () => {
    const f = favoritesFromImages([img("a", { width: null }), img("b", { slug: null }), img("c", { section: "films" }), img("d")]);
    expect(f.map((x) => x.id)).toEqual(["d"]);
    expect(f.map((x) => x.id)).toContain("d");
  });

  it("caps at 100", () => {
    const many = Array.from({ length: 140 }, (_, i) => img(`p${i}`, { is_feature: true, sort_order: i }));
    expect(favoritesFromImages(many)).toHaveLength(FAVORITES_MAX);
  });

  it("lists the groups present, in order", () => {
    const f = favoritesFromImages([img("a", { section: "el-vals" }), img("b"), img("c", { section: "getting-ready" })]);
    expect(favoriteGroups(f)).toEqual(["celebration", "portraits", "before"]);
  });
});

describe("image sizes (theft deterrent)", () => {
  it("never asks the grid for more than 828px, nor more than the photo has", () => {
    expect(gridSrcSet({ src: "/api/img/a?v=1", width: 4000 })).not.toMatch(/w=1080|w=1440/);
    expect(gridSrcSet({ src: "/api/img/a?v=1", width: 500 })).not.toMatch(/w=512 |w=640|w=828/);
    expect(sizedSrc("/api/img/a?v=1", 1440)).toBe("/api/img/a?v=1&w=1440");
    expect(sizedSrc("/portfolio/a.webp", 1440)).toBe("/portfolio/a.webp");
  });
});
