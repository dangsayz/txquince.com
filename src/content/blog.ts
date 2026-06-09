/**
 * Blog content model (content-as-code, matching the site's hybrid: stable
 * authored content lives in version control, not a CMS). Posts are structured
 * block arrays so we control internal-linking, CTA placement, and schema.
 *
 * Each post is its own file in ./blog/posts/<slug>.ts (default export). This
 * registry imports them; the rest of the app uses the helpers below. Posts
 * import only the BlogPost TYPE from here (erased at runtime → no import cycle).
 *
 * Inline links inside paragraph/list/quote/callout text use a tiny markdown-ish
 * syntax `[label](/href)` — parsed by BlogContent so posts weave contextual
 * internal links (LAW 5) into prose.
 */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "callout"; text: string }
  | { type: "cta"; heading: string; body?: string; href: string; label: string };

export type BlogFaq = { q: string; a: string };

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle?: string;
  description: string;
  category: BlogCategory;
  excerpt: string;
  publishedAt: string; // ISO (YYYY-MM-DD)
  updatedAt?: string;
  readMinutes: number;
  lead: string;
  content: BlogBlock[];
  faqs?: BlogFaq[];
  related?: string[]; // slugs
  lang?: "en" | "es";
};

export const BLOG_CATEGORIES = [
  "Cost & Budget",
  "Planning",
  "Traditions",
  "Photography & Film",
  "Locations",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Stable URL anchor for an h2 (table of contents). */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

// ---- Registry: one import per post file ----
import costDfw from "./blog/posts/quinceanera-photographer-cost-dallas-fort-worth";
import budgetBreakdown from "./blog/posts/quinceanera-budget-breakdown-texas";
import paymentPlans from "./blog/posts/quinceanera-payment-plans-deposits-dfw";
import planningTimeline from "./blog/posts/quinceanera-planning-timeline-checklist";
import whenToBook from "./blog/posts/when-to-book-quinceanera-photographer-dfw";
import orderOfEvents from "./blog/posts/what-happens-at-a-quinceanera-order-of-events";
import changingShoes from "./blog/posts/changing-of-the-shoes-quinceanera";
import courtVals from "./blog/posts/court-vals-surprise-dance-quinceanera";
import mass from "./blog/posts/quinceanera-mass-dallas-fort-worth";
import howToChoose from "./blog/posts/how-to-choose-quinceanera-photographer-dfw";
import questionsToAsk from "./blog/posts/questions-to-ask-quinceanera-photographer";
import photoVsVideo from "./blog/posts/quinceanera-photo-vs-video";
import preQuince from "./blog/posts/pre-quince-photo-session-dfw";
import photoLocations from "./blog/posts/best-quinceanera-photo-locations-dfw";
import receptionVenues from "./blog/posts/quinceanera-reception-venues-dfw";

export const posts: BlogPost[] = [
  costDfw,
  whenToBook,
  questionsToAsk,
  howToChoose,
  photoVsVideo,
  budgetBreakdown,
  paymentPlans,
  planningTimeline,
  orderOfEvents,
  changingShoes,
  courtVals,
  mass,
  preQuince,
  photoLocations,
  receptionVenues,
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

/** Up to `n` related posts: explicit `related` slugs first, then same-category. */
export function relatedPosts(post: BlogPost, n = 3): BlogPost[] {
  const out: BlogPost[] = [];
  for (const slug of post.related ?? []) {
    const p = getPost(slug);
    if (p && p.slug !== post.slug && !out.includes(p)) out.push(p);
  }
  for (const p of getAllPosts()) {
    if (out.length >= n) break;
    if (p.slug !== post.slug && p.category === post.category && !out.includes(p)) out.push(p);
  }
  return out.slice(0, n);
}
