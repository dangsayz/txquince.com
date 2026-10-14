import { site } from "@/content/site";
import type { BlogPost } from "@/content/blog";

/** Search results show ~60–65 characters of a title. */
const TITLE_BUDGET = 65;

/**
 * The <title> for a post. The root layout's template appends " · TX Quince";
 * when that would push a long headline past what search results show, the
 * brand is dropped (Google already shows the site name above the result).
 */
export function postMetaTitle(post: BlogPost): string | { absolute: string } {
  const t = post.metaTitle ?? post.title;
  return `${t} · ${site.brand}`.length <= TITLE_BUDGET ? t : { absolute: t };
}

/**
 * BlogPosting + BreadcrumbList (+ FAQPage when the post has FAQs) for one
 * journal post — shared by /blog/[slug] and /es/blog/[slug] so EN and ES carry
 * identical, complete Article markup (Google Search: headline, image, dates,
 * author, publisher + logo, inLanguage, mainEntityOfPage).
 */
export function blogPostingJsonLd({
  post,
  url,
  lang,
  coverUrl,
  imageUrls,
  crumbs,
}: {
  post: BlogPost;
  url: string;
  lang: "en" | "es";
  /** Absolute cover (hero) URL — always present, so every post has an image. */
  coverUrl: string;
  /** Absolute inline image URLs. */
  imageUrls: string[];
  /** Home + journal crumbs (the post itself is appended). */
  crumbs: { name: string; item: string }[];
}) {
  const inLanguage = lang === "es" ? "es-MX" : "en-US";
  const org = {
    "@type": "Organization",
    "@id": `${site.url}/#business`,
    name: site.brand,
    url: site.url,
    logo: { "@type": "ImageObject", url: `${site.url}/apple-icon`, width: 180, height: 180 },
  };
  const images = Array.from(new Set([coverUrl, ...imageUrls]));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage,
        author: org,
        publisher: org,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        articleSection: post.category,
        image: images,
        isPartOf: {
          "@type": "Blog",
          "@id": `${crumbs[crumbs.length - 1]?.item ?? `${site.url}/blog`}#blog`,
          name: crumbs[crumbs.length - 1]?.name ?? "Journal",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [...crumbs, { name: post.title, item: url }].map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.item,
        })),
      },
      ...(post.faqs && post.faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              inLanguage,
              mainEntity: post.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") },
              })),
            },
          ]
        : []),
    ],
  };
}

/** Blog (with its posts) + BreadcrumbList for the /blog and /es/blog indexes. */
export function blogIndexJsonLd({
  url,
  name,
  description,
  lang,
  posts,
  crumbs,
}: {
  url: string;
  name: string;
  description: string;
  lang: "en" | "es";
  posts: BlogPost[];
  /** Home crumb(s); the index itself is appended. */
  crumbs: { name: string; item: string }[];
}) {
  const inLanguage = lang === "es" ? "es-MX" : "en-US";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        url,
        name,
        description,
        inLanguage,
        publisher: { "@type": "Organization", "@id": `${site.url}/#business`, name: site.brand, url: site.url },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          "@id": `${url}/${p.slug}#article`,
          headline: p.title,
          url: `${url}/${p.slug}`,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt ?? p.publishedAt,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [...crumbs, { name, item: url }].map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.item,
        })),
      },
    ],
  };
}
