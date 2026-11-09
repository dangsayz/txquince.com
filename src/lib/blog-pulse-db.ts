import "server-only";
import { getAllEsPosts, getAllPosts } from "@/content/blog";
import { loadBehaviorRows } from "@/lib/analytics-db";
import { summarizeBlog, type BlogPulse } from "@/lib/blog-pulse";
import { commentPostPath } from "@/lib/comments";
import { countCommentsByPost } from "@/lib/comments-db";
import { isDbConfigured } from "@/lib/db";

export type BlogPulseData = BlogPulse & { configured: boolean; days: number };

/** Blog reads, read time and comments for the admin home, last `days` days. */
export async function getBlogPulse(days = 14): Promise<BlogPulseData> {
  const titles = new Map<string, string>([
    ...getAllPosts().map((p) => [`/blog/${p.slug}`, p.title] as const),
    ...getAllEsPosts().map((p) => [`/es/blog/${p.slug}`, p.title] as const),
  ]);
  if (!isDbConfigured()) return { ...summarizeBlog([], [], titles), configured: false, days };
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const [rows, counts] = await Promise.all([
    loadBehaviorRows(days).catch(() => ({ views: [], events: [] })),
    countCommentsByPost(since),
  ]);
  const comments = counts.map((c) => ({ path: commentPostPath(c), total: c.total, pending: c.pending, recent: c.recent }));
  return { ...summarizeBlog(rows.views, rows.events, titles, comments), configured: true, days };
}
