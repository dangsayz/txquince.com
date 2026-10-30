import { afterEach, describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { HREFLANG, OG_LOCALE, languageAlternates } from "@/lib/hreflang";
import { blogPostingJsonLd } from "@/lib/blog-structured-data";
import { blogAuthor } from "@/content/author";
import { getAllPosts } from "@/content/blog";
import { buildCsp } from "@/lib/security-headers";

describe("hreflang", () => {
  it("targets US Spanish, and x-default is the English page", () => {
    expect(HREFLANG).toEqual({ en: "en-US", es: "es-US" });
    expect(OG_LOCALE).toEqual({ en: "en_US", es: "es_US" });
    expect(languageAlternates("/venues", "/es/salones")).toEqual({
      "en-US": "/venues",
      "es-US": "/es/salones",
      "x-default": "/venues",
    });
  });
});

describe("www → apex redirect", () => {
  it("308s www.txquince.com to https://txquince.com, root included", async () => {
    const rules = await nextConfig.redirects!();
    const www = rules.filter((r) => r.has?.some((h) => h.type === "host"));
    expect(www.map((r) => [r.source, r.destination, r.permanent])).toEqual([
      ["/", "https://txquince.com/", true],
      ["/:path+", "https://txquince.com/:path+", true],
    ]);
    const host = www[0].has![0] as { type: "host"; value: string };
    const re = new RegExp(`^${host.value}$`);
    expect(re.test("www.txquince.com")).toBe(true);
    expect(re.test("txquince.com")).toBe(false);
  });
});

describe("city pages: unsupported slugs are a real 404", () => {
  const run = async (path: string) => {
    const { middleware } = await import("@/middleware");
    const { NextRequest } = await import("next/server");
    return middleware(new NextRequest(`https://txquince.com${path}`));
  };
  const rewrite = (res: Response) => res.headers.get("x-middleware-rewrite");

  it("rewrites an unknown city to the unmatched 404 path, EN and ES", async () => {
    for (const p of ["/quinceanera-photographer/houston", "/es/fotografo-de-quinceaneras/houston", "/quinceanera-photographer/%E0%A4%A"]) {
      expect(rewrite(await run(p)), p).toBe("https://txquince.com/_txq-not-found");
    }
  });

  it("lets every real city through untouched", async () => {
    const { locations } = await import("@/content/locations");
    for (const l of locations) {
      expect(rewrite(await run(`/quinceanera-photographer/${l.slug}`))).toBeNull();
      expect(rewrite(await run(`/es/fotografo-de-quinceaneras/${l.slug}`))).toBeNull();
    }
  });
});

describe("BlogPosting author", () => {
  const post = getAllPosts()[0];
  const ld = () =>
    blogPostingJsonLd({
      post,
      url: `https://txquince.com/blog/${post.slug}`,
      lang: "es",
      coverUrl: "https://txquince.com/api/img/x",
      imageUrls: [],
      crumbs: [{ name: "Journal", item: "https://txquince.com/blog" }],
    })["@graph"][0] as Record<string, unknown>;
  const original = blogAuthor.name;
  afterEach(() => {
    blogAuthor.name = original;
  });

  it("falls back to the Organization while no author name is set", () => {
    blogAuthor.name = "";
    expect(ld().author).toMatchObject({ "@type": "Organization", "@id": "https://txquince.com/#business" });
    expect(ld().inLanguage).toBe("es-US");
  });

  it("uses a Person with a profile URL once the owner sets the name", () => {
    blogAuthor.name = "Jane Example";
    expect(ld().author).toEqual({
      "@type": "Person",
      name: "Jane Example",
      url: "https://txquince.com/about",
      worksFor: { "@id": "https://txquince.com/#business" },
    });
  });

  it("dates come from the post, never invented", () => {
    expect(ld().datePublished).toBe(post.publishedAt);
    expect(ld().dateModified).toBe(post.updatedAt ?? post.publishedAt);
  });
});

describe("Cloudflare Web Analytics", () => {
  it("the CSP allows the beacon script and its reporting endpoint", () => {
    const csp = buildCsp();
    expect(csp).toMatch(/script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/cloudflareinsights\.com/);
  });
});
