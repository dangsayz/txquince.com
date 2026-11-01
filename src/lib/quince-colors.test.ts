import { describe, expect, it } from "vitest";
import { colorsInText, imageColors, matchGallery, normalizeColor, parseColors, type ColorMatchImage } from "./quince-colors";

describe("color vocabulary", () => {
  it("maps English and Spanish spellings to one id", () => {
    expect(normalizeColor("fuchsia")).toBe("fucsia");
    expect(normalizeColor("Fucsia")).toBe("fucsia");
    expect(normalizeColor("hot pink")).toBe("fucsia");
    expect(normalizeColor("rosa palo")).toBe("rosa-palo");
    expect(normalizeColor("Azul Rey")).toBe("azul-rey");
    expect(normalizeColor("champán")).toBe("champagne");
    expect(normalizeColor("dorado")).toBe("dorado");
    expect(normalizeColor("oro rosa")).toBe("oro-rosa");
    expect(normalizeColor("not-a-color")).toBeNull();
  });

  it("parses the ?colors= param from a Facebook reply", () => {
    expect(parseColors("fucsia,blanco,dorado")).toEqual(["fucsia", "blanco", "dorado"]);
    expect(parseColors("pink & gold, PINK")).toEqual(["rosa", "dorado"]);
    expect(parseColors("a,b,fucsia,fucsia")).toEqual(["fucsia"]);
    expect(parseColors("rojo,vino,morado,lila,azul,verde,dorado")).toHaveLength(5);
  });

  it("reads colors from text as whole words only", () => {
    expect(colorsInText("Quinceañera in a fuchsia gown with gold details")).toEqual(["fucsia", "dorado"]);
    expect(colorsInText("Golden hour portrait at the Arboretum")).toEqual([]);
    expect(colorsInText("Black and white portrait")).toEqual([]);
    expect(colorsInText("Vestido rosa palo y dorado")).toEqual(["rosa-palo", "dorado"]);
    expect(colorsInText("Rosalinda at the venue")).toEqual([]);
  });

  it("prefers hand-tagged colors over words", () => {
    expect(imageColors({ colors: ["vino"], alt: "white dress" })).toEqual(["vino"]);
    expect(imageColors({ colors: [], alt: "white dress" })).toEqual(["blanco"]);
    expect(imageColors({ colors: ["bogus"], alt: "navy suit" })).toEqual(["azul-marino"]);
  });
});

type Img = ColorMatchImage & { id: string };
const img = (id: string, p: Partial<Img> = {}): Img => ({ id, alt: "", is_feature: false, sort_order: 0, ...p });

describe("matchGallery", () => {
  const portfolio: Img[] = [
    img("feat-red", { colors: ["rojo"], is_feature: true, sort_order: 1 }),
    img("pink-gold", { colors: ["fucsia", "dorado"], sort_order: 5 }),
    img("pink", { alt: "Fuchsia ballgown in Irving", sort_order: 6 }),
    img("blush", { colors: ["rosa-palo"], sort_order: 7 }),
    img("navy", { colors: ["azul-marino"], is_feature: true, sort_order: 2 }),
    img("plain", { sort_order: 3 }),
  ];

  it("puts the most matching colors first", () => {
    const g = matchGallery(portfolio, ["fucsia", "blanco", "dorado"], { limit: 9, min: 1 });
    expect(g.mode).toBe("match");
    expect(g.images[0].id).toBe("pink-gold");
    expect(g.images.map((i) => i.id).slice(0, 2)).toEqual(["pink-gold", "pink"]);
  });

  it("falls back to nearby colors when nothing matches exactly", () => {
    const g = matchGallery(portfolio, ["rosa"], { limit: 9, min: 1 });
    expect(g.mode).toBe("nearby");
    expect(g.images.map((i) => i.id)).toEqual(expect.arrayContaining(["pink-gold", "pink", "blush"]));
    expect(g.images.map((i) => i.id)).not.toContain("navy");
  });

  it("falls back to best-of (featured first) when nothing matches at all", () => {
    const g = matchGallery(portfolio, ["turquesa"], { limit: 3 });
    expect(g.mode).toBe("best");
    expect(g.matched).toBe(0);
    expect(g.images.map((i) => i.id)).toEqual(["feat-red", "navy", "plain"]);
  });

  it("fills up to the minimum with best-of when only a few match", () => {
    const g = matchGallery(portfolio, ["azul-marino"], { limit: 9, min: 4 });
    expect(g.mode).toBe("match");
    expect(g.matched).toBe(1);
    expect(g.images).toHaveLength(4);
    expect(g.images[0].id).toBe("navy");
    expect(new Set(g.images.map((i) => i.id)).size).toBe(4); // no duplicates
  });

  it("shows best-of when the family picked no colors", () => {
    const g = matchGallery(portfolio, [], { limit: 2 });
    expect(g.mode).toBe("best");
    expect(g.images.map((i) => i.id)).toEqual(["feat-red", "navy"]);
  });

  it("handles an empty portfolio", () => {
    expect(matchGallery([], ["fucsia"])).toEqual({ images: [], mode: "best", matched: 0 });
  });
});
