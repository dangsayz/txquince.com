/**
 * What a visitor receives from <SlotImage>: the <img> and nothing else — no
 * Replace button, no editor code, no admin endpoints in the markup.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let rows: { key: string; value: unknown }[] = [];
let failing = false;
vi.mock("@/lib/supabase-server", () => ({
  isSupabaseConfigured: () => true,
  getServiceSupabase: () => ({
    from: () => ({
      select: () => ({
        like: async () => (failing ? { data: null, error: { message: "down" } } : { data: rows, error: null }),
      }),
    }),
  }),
}));
vi.mock("@/lib/r2-portfolio", () => ({ getPortfolioBucket: async () => null }));

const { SlotImage } = await import("@/components/SlotImage");

const override = {
  current: {
    id: "abcdefgh-1",
    key: "slots/home.hero.a/abcdefgh-1",
    w: 1200,
    h: 800,
    widths: [480, 960, 1200],
    alt: { en: "Quinceañera on the stairs", es: "Quinceañera en la escalera" },
    focal: { x: 0.25, y: 0.75 },
    uploadedAt: "2026-10-14T12:00:00.000Z",
    uploadedBy: "owner@example.com",
  },
  history: [],
};

async function render(props: Parameters<typeof SlotImage>[0]) {
  return renderToString(await SlotImage(props));
}

beforeEach(() => {
  rows = [];
  failing = false;
});

describe("SlotImage for a visitor", () => {
  it("renders only the image: no admin markup, no editor", async () => {
    rows = [{ key: "image:home.hero.a", value: override }];
    const html = await render({ slot: "home.hero.a", lang: "es", fill: true });
    expect(html.match(/<img /g)).toHaveLength(1);
    expect(html).not.toMatch(/Replace|Reemplazar|role="button"|SlotEditor|\/api\/admin|dialog/i);
    expect(html).toContain('alt="Quinceañera en la escalera"');
    expect(html).toContain("object-position:25% 75%");
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('loading="eager"');
    // srcset lists only the stored widths, none wider than the 1200px original.
    const srcSet = html.match(/<img [^>]*srcSet="([^"]+)"/)![1];
    const widths = [...srcSet.matchAll(/ (\d+)w/g)].map((m) => Number(m[1]));
    expect(widths).toEqual([480, 960, 1200]);
    // The LCP photo is also preloaded with the same responsive set.
    expect(html).toMatch(/<link rel="preload" as="image"[^>]*imageSrcSet=/i);
  });

  it("reserves the size when not filling a frame (no layout shift)", async () => {
    const html = await render({ slot: "about.portrait", lang: "en" });
    expect(html).toMatch(/width="720"/);
    expect(html).toMatch(/height="1080"/);
    expect(html).toContain('loading="lazy"');
  });

  it("shows the page's own photo, then the default, when the database is down", async () => {
    failing = true;
    expect(await render({ slot: "vendors.hero", lang: "en", fill: true, fallback: { src: "/api/img/a-photo", alt: "Own" } })).toContain('src="/api/img/a-photo');
    expect(await render({ slot: "links.hero", lang: "en", fill: true })).toContain('src="/portfolio/red-garden.webp"');
  });

  it("keeps the editor out of the visitor bundle (loaded only by import())", () => {
    const dir = join(process.cwd(), "src/components");
    const island = readFileSync(join(dir, "slots/SlotAdminControl.tsx"), "utf8");
    expect(island).not.toMatch(/^import[^;]*SlotEditor/m);
    expect(island).toMatch(/import\("\.\/SlotEditor"\)/);
    for (const f of ["SlotImage.tsx", "slots/SlotPicture.tsx", "slots/SlotProvider.tsx"]) {
      expect(readFileSync(join(dir, f), "utf8"), f).not.toMatch(/SlotEditor|encode-renditions/);
    }
  });
});
