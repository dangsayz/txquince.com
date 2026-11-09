import "server-only";
import { getAllEsPosts, getAllPosts, type BlogPost } from "@/content/blog";
import { resolveBlogCover } from "@/lib/blog-cover";
import { getBlogImages } from "@/lib/content-db";
import type { Journal, JournalItem } from "./Editorial";

const SHOWN = 4;

/**
 * Each card carries its post's own cover (the same photo the post page opens
 * with), so cards in one category no longer share a single stock photo. Two
 * cards that still land on the same photo: the later one drops it and the card
 * falls back to its category photo.
 */
async function pick(posts: BlogPost[], base: string, lang: "en" | "es"): Promise<JournalItem[]> {
  const top = posts.slice(0, SHOWN);
  const covers = await Promise.all(
    top.map(async (p) => {
      try {
        return await resolveBlogCover(p, await getBlogImages(p.content), lang);
      } catch {
        return null;
      }
    }),
  );
  const seen = new Set<string>();
  return top.map((p, i) => {
    const c = covers[i];
    const fresh = c?.url && !seen.has(c.url);
    if (fresh) seen.add(c.url);
    return {
      href: `${base}/${p.slug}`,
      title: p.title,
      category: p.category,
      readMinutes: p.readMinutes,
      date: p.publishedAt,
      excerpt: p.excerpt,
      ...(fresh && c
        ? { image: { src: c.url, alt: c.alt, focusX: c.focus_x ?? null, focusY: c.focus_y ?? null } }
        : {}),
    };
  });
}

/** The four newest posts per language, for the homepage journal (server-only). */
export async function latestJournal(): Promise<Journal> {
  const [en, es] = await Promise.all([
    pick(getAllPosts(), "/blog", "en"),
    pick(getAllEsPosts(), "/es/blog", "es"),
  ]);
  return { en, es };
}
