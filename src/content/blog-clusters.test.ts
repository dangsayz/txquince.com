import { describe, expect, it } from "vitest";
import { BLOG_CLUSTERS, seriesFor } from "./blog-clusters";
import { getPost } from "./blog";

describe("blog clusters", () => {
  it("only lists posts that exist", () => {
    for (const c of BLOG_CLUSTERS) for (const slug of [c.pillar, ...c.spokes]) expect(getPost(slug), slug).toBeDefined();
  });

  it("puts each post in one series only", () => {
    const all = BLOG_CLUSTERS.flatMap((c) => [c.pillar, ...c.spokes]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("builds the series with the pillar first and a next link that wraps", () => {
    const s = seriesFor("hire-quinceanera-vendors-without-getting-burned-texas", "en")!;
    expect(s.position).toBe(1);
    expect(s.items[0].pillar).toBe(true);
    expect(s.next?.slug).toBe("questions-to-ask-quinceanera-photographer");
    const last = seriesFor(s.items.at(-1)!.slug, "en")!;
    expect(last.next?.slug).toBe(s.items[0].slug);
  });

  it("works in Spanish through the EN↔ES pairs", () => {
    const s = seriesFor("como-contratar-proveedores-de-quinceanera-sin-que-le-estafen", "es")!;
    expect(s.title).toBe("Proteja su dinero");
    expect(s.items.every((i) => i.href.startsWith("/es/blog/"))).toBe(true);
  });

  it("returns null for posts outside any series", () => {
    expect(seriesFor("not-a-post", "en")).toBeNull();
  });
});
