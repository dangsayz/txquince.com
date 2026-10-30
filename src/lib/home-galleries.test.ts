import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { galleriesFromImages, MIN_GALLERY_PHOTOS, type GalleryImageInput } from "@/lib/home-galleries";
import { COPY } from "@/components/txq/copy";
import * as data from "@/components/txq/data";
import { homeCities } from "@/content/home-places";
import { locations } from "@/content/locations";

const img = (slug: string, over: Partial<GalleryImageInput> = {}): GalleryImageInput => ({
  url: `/api/img/${slug}?v=1`,
  alt: "Quinceañera portrait",
  section: "portraits",
  is_feature: false,
  width: 1467,
  height: 2200,
  location: null,
  city: null,
  title: null,
  ...over,
});

const shoot = (prefix: string, n: number, over: Partial<GalleryImageInput>) =>
  Array.from({ length: n }, (_, i) => img(`${prefix}-${i + 1}`, over));

describe("homepage galleries come only from real portfolio rows", () => {
  it("groups photos into one card per stored venue, linking to its full gallery", () => {
    const rows = [
      ...shoot("convention-plaza-ballroom-clarissa", 7, {
        section: "celebration",
        location: "Convention Plaza Ballroom in Irving",
        city: "irving",
        width: 2200,
        height: 1467,
      }),
      ...shoot("mandalay-canal-walk-zapata", 8, { location: "Mandalay Canal Walk at Las Colinas, Irving", city: "irving" }),
      ...shoot("fort-worth-stockyards", 8, { location: "Fort Worth Stockyards", city: "fort-worth" }),
    ];
    const g = galleriesFromImages(rows);
    expect(g.map((x) => [x.title, x.city, x.href, x.count])).toEqual([
      ["Convention Plaza Ballroom", "Irving", "/venues/convention-plaza-ballroom", 7],
      ["Mandalay Canal Walk", "Irving", "/venues/mandalay-canal-walk", 8],
      ["Fort Worth Stockyards", "Fort Worth", "/venues/fort-worth-stockyards", 8],
    ]);
    expect(g[0].cover.src).toBe("/api/img/convention-plaza-ballroom-clarissa-1?v=1");
  });

  it("never shows a photo without a stored place, and never a filename as a title", () => {
    const rows = [
      ...shoot("12img-kimberly-quince", 5, { section: "celebration", title: "12img kimberly quince 482 jpg at irving" }),
      ...shoot("odd", 5, { location: "12img liliana quince lilly 857 jpg" }),
    ];
    expect(galleriesFromImages(rows)).toEqual([]);
  });

  it("needs a real set of photos to call it a gallery", () => {
    const rows = shoot("las-lomas-banquet-hall-valarie", MIN_GALLERY_PHOTOS - 1, { location: "Las Lomas Banquet Hall in Irving" });
    expect(galleriesFromImages(rows)).toEqual([]);
  });

  it("uses an unregistered stored place verbatim and links to the portfolio search", () => {
    const rows = shoot("white-rock", 4, { location: "White Rock Lake", city: "dallas" });
    const [g] = galleriesFromImages(rows);
    expect(g.title).toBe("White Rock Lake");
    expect(g.city).toBe("Dallas");
    expect(g.href).toBe("/portfolio?q=White%20Rock%20Lake");
  });

  it("prefers a featured portrait frame for the 4:5 cover", () => {
    const rows = [
      img("a", { location: "Fort Worth Stockyards", width: 2200, height: 1467, is_feature: true }),
      img("b", { location: "Fort Worth Stockyards" }),
      img("c", { location: "Fort Worth Stockyards", is_feature: true, focus_x: 0.3, focus_y: 0.6 }),
    ];
    const [g] = galleriesFromImages(rows);
    expect(g.cover.src).toBe("/api/img/c?v=1");
    expect(g.cover.focus).toBe("30% 60%");
  });
});

describe("the placeholder clients are gone for good", () => {
  it("data.ts exports no hand-written works", () => {
    expect("WORKS" in data).toBe(false);
    expect("workById" in data).toBe(false);
  });

  it("the homepage copy claims no invented clients or places", () => {
    for (const lang of ["en", "es"] as const) {
      // (The service-area line naming the cities we travel to is not a client claim.)
      const { frameA, frameB } = COPY[lang].hero;
      const text = JSON.stringify({ frameA, frameB, archive: COPY[lang].archive });
      expect(text).not.toMatch(/Ten real|Diez quincea|San Antonio|Houston|Limestone|Gilded Salon|Salón Dorado/);
    }
    const src = readFileSync(join(process.cwd(), "src/components/txq/data.ts"), "utf8");
    expect(src).not.toMatch(/Sofía M\.|Ximena R\.|Familia Torres|launch placeholders/);
  });

  it("the H1 is the search phrase, in each language", () => {
    expect(COPY.en.hero.h1).toBe("Quinceañera Photographer & Videographer in Dallas–Fort Worth");
    expect(COPY.es.hero.h1).toBe("Fotógrafo y Videógrafo de Quinceañeras en Dallas–Fort Worth");
  });
});

describe("Where we work", () => {
  it("links every city page, Dallas first", () => {
    const cities = homeCities();
    expect(cities.map((c) => c.slug).sort()).toEqual(locations.map((l) => l.slug).sort());
    expect(cities[0].slug).toBe("dallas");
  });

  it("uses the Spanish routes in Spanish", () => {
    expect(COPY.es.places.cityBase).toBe("/es/fotografo-de-quinceaneras");
    expect(COPY.es.places.services.map((s) => s.href)).toEqual([
      "/es/videografo-de-quinceaneras",
      "/es/sesion-de-fotos-quinceanera",
      "/about",
    ]);
    for (const s of [...COPY.en.places.services, ...COPY.es.places.services]) {
      const route = s.href.replace(/^\//, "");
      // English routes live in the (en) route group; Spanish ones under es/.
      const dir = route.startsWith("es/") ? join("src/app", route) : join("src/app/(en)", route);
      expect(readFileSync(join(process.cwd(), dir, "page.tsx"), "utf8").length).toBeGreaterThan(0);
    }
  });
});
