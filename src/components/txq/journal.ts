import { getAllEsPosts, getAllPosts, type BlogPost } from "@/content/blog";
import type { Journal } from "./Editorial";

const pick = (posts: BlogPost[], base: string) =>
  posts.slice(0, 4).map((p) => ({
    href: `${base}/${p.slug}`,
    title: p.title,
    category: p.category,
    readMinutes: p.readMinutes,
    date: p.publishedAt,
    excerpt: p.excerpt,
  }));

/** The four newest posts per language, for the homepage journal (server-only). */
export function latestJournal(): Journal {
  return { en: pick(getAllPosts(), "/blog"), es: pick(getAllEsPosts(), "/es/blog") };
}
