import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SLOTS, SLOT_ID_RE, getSlot, isSlotId, slotGroups, blogCoverSlotId } from "@/lib/image-slots";
import { posts, esPosts } from "@/content/blog";
import { locations } from "@/content/locations";

const PUBLIC = join(process.cwd(), "public");

describe("image slot registry", () => {
  it("has unique ids", () => {
    const ids = SLOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses well-formed ids that are also safe R2 key segments", () => {
    for (const s of SLOTS) expect(s.id, s.id).toMatch(SLOT_ID_RE);
  });

  it("points every default at a real file in public/ or a valid URL", () => {
    for (const s of SLOTS) {
      if (/^https?:\/\//.test(s.defaultSrc)) {
        expect(() => new URL(s.defaultSrc), s.id).not.toThrow();
      } else {
        expect(s.defaultSrc.startsWith("/"), s.id).toBe(true);
        expect(existsSync(join(PUBLIC, s.defaultSrc)), `${s.id}: ${s.defaultSrc}`).toBe(true);
      }
    }
  });

  it("records a label, both alt texts, crops, sizes and revalidation paths", () => {
    for (const s of SLOTS) {
      expect(s.label.length, s.id).toBeGreaterThan(5);
      expect(s.defaultAlt.en.trim().length, s.id).toBeGreaterThan(2);
      expect(s.defaultAlt.es.trim().length, s.id).toBeGreaterThan(2);
      expect(s.crops.phone, s.id).toMatch(/^\d+ \/ \d+$/);
      expect(s.crops.desktop, s.id).toMatch(/^\d+ \/ \d+$/);
      expect(s.sizes.length, s.id).toBeGreaterThan(0);
      expect(s.paths.length, s.id).toBeGreaterThan(0);
      for (const p of s.paths) expect(p.startsWith("/"), `${s.id}: ${p}`).toBe(true);
    }
  });

  it("covers the homepage, every city, every blog story and the share card", () => {
    expect(isSlotId("home.hero.a")).toBe(true);
    expect(isSlotId("home.hero.b")).toBe(true);
    // The homepage gallery is real portfolio data, never hand-placed slots.
    expect(SLOTS.some((s) => s.id.startsWith("home.archive."))).toBe(false);
    for (const l of locations) {
      expect(isSlotId(`city.${l.slug}.hero`)).toBe(true);
      expect(isSlotId(`city.${l.slug}.card`)).toBe(true);
    }
    for (const p of posts) expect(isSlotId(blogCoverSlotId(p.slug, "en"))).toBe(true);
    for (const p of esPosts) expect(isSlotId(blogCoverSlotId(p.slug, "es"))).toBe(true);
    expect(getSlot("og.default")?.format).toBe("jpeg");
    expect(isSlotId("nope.slot")).toBe(false);
  });

  it("groups slots without losing any", () => {
    expect(slotGroups().reduce((n, g) => n + g.slots.length, 0)).toBe(SLOTS.length);
  });
});
