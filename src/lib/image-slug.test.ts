import { describe, expect, it } from "vitest";
import { imageSlugBase, looksLikeFilename } from "./image-slug";

describe("image slug", () => {
  it("uses the written alt text", () => {
    expect(imageSlugBase("Quinceañera in a red gown at the Arboretum", "portraits")).toBe(
      "quinceanera-in-a-red-gown-at-the-arboretum",
    );
  });

  it("never builds a slug from an upload filename", () => {
    for (const alt of ["12img kimberly quince 482 jpg at irving", "IMG_2048.JPG", "valarie quince event img 248.jpg", "DSC01234"]) {
      expect(looksLikeFilename(alt)).toBe(true);
      expect(imageSlugBase(alt, "celebration")).toBe("celebration-quinceanera-dfw");
    }
  });

  it("falls back to the section and stays within 64 characters", () => {
    expect(imageSlugBase("", "save-the-date")).toBe("save-the-date-quinceanera-dfw");
    expect(imageSlugBase("a ".repeat(200), "x").length).toBeLessThanOrEqual(64);
  });

  it("keeps ordinary words that only contain a file word", () => {
    expect(looksLikeFilename("Quinceañera imagining her vals")).toBe(false);
  });
});
