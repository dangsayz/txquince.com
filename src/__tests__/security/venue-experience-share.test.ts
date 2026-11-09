/**
 * The share page's link-preview card: always a 1200×630 PNG, never an error,
 * and its address changes when the text is saved.
 */
import { writeFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ x: null as null | Record<string, unknown>, fail: false }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/venue-experience-db", () => ({
  getVenueExperience: async () => {
    if (state.fail) throw new Error("db down");
    return state.x;
  },
}));

import { venues } from "@/content/venues";
import { cardPath, excerpt, experienceTitle, sharePath } from "@/lib/venue-experience-share";

const slug = venues.find((v) => v.slug === "vm-ballroom")?.slug ?? venues[0].slug;
const card = async (s: string) => {
  const { GET } = await import("@/app/venues/[slug]/experience/card/route");
  return GET(new Request(`https://txquince.com/venues/${s}/experience/card`), { params: Promise.resolve({ slug: s }) });
};
const png = async (res: Response) => {
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, sig: buf.subarray(1, 4).toString("ascii"), w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

describe("link-preview card", () => {
  it("draws the review as a 1200×630 PNG with a long cache", async () => {
    state.x = { venue_slug: slug, verdict: "great", body_en: "The staff make our job easy. And the food. We love the food here.", body_es: null, updated_at: "2026-11-09T23:26:00.000Z" };
    const res = await card(slug);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    expect(res.headers.get("cache-control")).toContain("immutable");
    const { buf, sig, w, h } = await png(res);
    expect([sig, w, h]).toEqual(["PNG", 1200, 630]);
    if (process.env.OG_OUT) writeFileSync(process.env.OG_OUT, buf);
  });

  it("falls back to the standard card: nothing written, or an unknown venue", async () => {
    state.x = null;
    for (const s of [slug, "no-such-venue"]) {
      const res = await card(s);
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).not.toContain("immutable");
      expect((await png(res)).sig).toBe("PNG");
    }
  });
});

describe("share text and addresses", () => {
  it("cuts previews at a whole word", () => {
    expect(excerpt("Short text.", 150)).toBe("Short text.");
    const cut = excerpt("word ".repeat(60), 50);
    expect(cut.length).toBeLessThanOrEqual(50);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut).not.toMatch(/\s…$/);
  });

  it("gives the card a new address after each save", () => {
    expect(sharePath("vm-ballroom")).toBe("/venues/vm-ballroom/experience");
    const a = cardPath("vm-ballroom", { updated_at: "2026-11-09T23:26:00.000Z" });
    const b = cardPath("vm-ballroom", { updated_at: "2026-11-10T08:00:00.000Z" });
    expect(a).toBe("/venues/vm-ballroom/experience/card?v=20261109232600");
    expect(a).not.toBe(b);
    expect(experienceTitle("VM Ballroom")).toBe("Our experience at VM Ballroom and its staff");
  });
});
