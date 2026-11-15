import { describe, expect, it } from "vitest";
import type { BlogPost } from "@/content/blog";
import { getAllEsPosts, getAllPosts } from "@/content/blog";
import { blogImageEntries } from "./blog-image-sitemap";

const post = (slug: string, content: BlogPost["content"]): BlogPost =>
  ({ slug, title: "t", description: "d", category: "Locations", excerpt: "e", publishedAt: "2026-11-14", readMinutes: 1, lead: "l", content }) as BlogPost;

const lookup = (slug: string) =>
  ({ a: { src: "/blog/photos/a.webp" }, b: { src: "/api/img/album-x-001" } } as Record<string, { src: string }>)[slug];

describe("blogImageEntries", () => {
  it("lists each post's image blocks under the post URL, EN and ES", () => {
    const en = [post("one", [{ type: "image", slug: "a" }, { type: "p", text: "x" }, { type: "image", slug: "b" }, { type: "image", slug: "a" }])];
    const es = [post("uno", [{ type: "image", slug: "a" }])];
    expect(blogImageEntries("https://s.com", en, es, lookup)).toEqual([
      { loc: "https://s.com/blog/one", images: ["https://s.com/blog/photos/a.webp", "https://s.com/api/img/album-x-001"] },
      { loc: "https://s.com/es/blog/uno", images: ["https://s.com/blog/photos/a.webp"] },
    ]);
  });

  it("skips unknown slugs, galleries and posts with no photos", () => {
    const en = [post("none", [{ type: "image", slug: "missing" }, { type: "gallery", album: "a" }])];
    expect(blogImageEntries("https://s.com", en, [], lookup)).toEqual([]);
  });

  it("includes the Oasis Ballroom phone photos on both language posts", () => {
    const entries = blogImageEntries("https://txquince.com", getAllPosts(), getAllEsPosts());
    for (const loc of ["https://txquince.com/blog/quinceanera-at-the-oasis-ballroom-irving", "https://txquince.com/es/blog/quinceanera-en-the-oasis-ballroom-irving"]) {
      const e = entries.find((x) => x.loc === loc);
      expect(e?.images.length).toBeGreaterThanOrEqual(7);
      expect(e?.images).toContain("https://txquince.com/blog/photos/oasis-ballroom-irving-dance-floor-chandelier-stage.webp");
    }
  });
});
