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
  | { type: "cta"; heading: string; body?: string; href: string; label: string }
  // A real portfolio photo, by permanent slug (served via /api/img/{slug}). The
  // post page resolves the slug → dimensions (zero layout shift) + a fallback
  // alt; `alt`/`caption` here override. A missing slug renders nothing — never a
  // placeholder.
  | { type: "image"; slug: string; alt?: string; caption?: string };

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
import whatIsQuince from "./blog/posts/what-is-a-quinceanera";
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
import photoIdeasShotList from "./blog/posts/quinceanera-photo-ideas-shot-list-dfw";
import songs from "./blog/posts/quinceanera-songs-for-every-moment";
import dressColors from "./blog/posts/quinceanera-dress-colors-that-photograph-best";
import themes from "./blog/posts/quinceanera-themes-and-colors";

export const posts: BlogPost[] = [
  costDfw,
  whenToBook,
  questionsToAsk,
  howToChoose,
  photoVsVideo,
  budgetBreakdown,
  paymentPlans,
  planningTimeline,
  whatIsQuince,
  orderOfEvents,
  changingShoes,
  courtVals,
  mass,
  preQuince,
  photoLocations,
  receptionVenues,
  photoIdeasShotList,
  dressColors,
  songs,
  themes,
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
  return relatedFrom(post, getAllPosts(), getPost, n);
}

function relatedFrom(
  post: BlogPost,
  all: BlogPost[],
  lookup: (slug: string) => BlogPost | undefined,
  n: number,
): BlogPost[] {
  const out: BlogPost[] = [];
  for (const slug of post.related ?? []) {
    const p = lookup(slug);
    if (p && p.slug !== post.slug && !out.includes(p)) out.push(p);
  }
  for (const p of all) {
    if (out.length >= n) break;
    if (p.slug !== post.slug && p.category === post.category && !out.includes(p)) out.push(p);
  }
  return out.slice(0, n);
}

// ---- Spanish (es) registry + helpers ----
// World-class native Spanish posts, served at /es/blog/<slug>. Populated as the
// ES posts are written (mirrors the EN registry pattern above).
import esCosto from "./blog/posts/es/cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth";
import esPlanesPago from "./blog/posts/es/planes-de-pago-fotografia-quinceanera-dfw";
import esCuandoReservar from "./blog/posts/es/cuando-reservar-fotografo-quinceanera-dfw";
import esPreguntas from "./blog/posts/es/preguntas-para-tu-fotografo-de-quinceanera";
import esFotoVideo from "./blog/posts/es/foto-o-video-quinceanera";
import esCambioZapatillas from "./blog/posts/es/el-cambio-de-zapatillas-quinceanera";
import esOrden from "./blog/posts/es/que-pasa-en-una-quinceanera-orden";
import esSalones from "./blog/posts/es/salones-para-quinceaneras-dfw";
import esComoElegir from "./blog/posts/es/como-elegir-fotografo-de-quinceanera-dfw";
import esCronograma from "./blog/posts/es/como-planear-una-quinceanera-cronograma";
import esCorteVals from "./blog/posts/es/la-corte-el-vals-y-el-baile-sorpresa";
import esMisa from "./blog/posts/es/la-misa-de-quince-anos-dfw";
import esPreQuince from "./blog/posts/es/sesion-de-fotos-pre-quince-dfw";
import esLugares from "./blog/posts/es/mejores-lugares-para-fotos-de-quinceanera-dfw";
import esPresupuesto from "./blog/posts/es/cuanto-cuesta-una-quinceanera-presupuesto-texas";
import esIdeasFotos from "./blog/posts/es/ideas-de-fotos-de-quinceanera-dfw";
import esCanciones from "./blog/posts/es/canciones-para-quinceanera";
import esColoresVestido from "./blog/posts/es/colores-de-vestido-de-quinceanera-que-fotografian-mejor";
import esThemes from "./blog/posts/es/temas-y-colores-para-quinceanera";

export const esPosts: BlogPost[] = [
  esCosto,
  esCuandoReservar,
  esPreguntas,
  esComoElegir,
  esFotoVideo,
  esPlanesPago,
  esPresupuesto,
  esCronograma,
  esOrden,
  esCambioZapatillas,
  esCorteVals,
  esMisa,
  esPreQuince,
  esLugares,
  esSalones,
  esIdeasFotos,
  esColoresVestido,
  esCanciones,
  esThemes,
];

export function getAllEsPosts(): BlogPost[] {
  return [...esPosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getEsPost(slug: string): BlogPost | undefined {
  return esPosts.find((p) => p.slug === slug);
}

export function relatedEsPosts(post: BlogPost, n = 3): BlogPost[] {
  return relatedFrom(post, getAllEsPosts(), getEsPost, n);
}

/** EN ↔ ES slug pairs, for hreflang alternates linking each translation. */
const EN_ES_PAIRS: { en: string; es: string }[] = [
  { en: "quinceanera-photographer-cost-dallas-fort-worth", es: "cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth" },
  { en: "quinceanera-songs-for-every-moment", es: "canciones-para-quinceanera" },
  { en: "quinceanera-payment-plans-deposits-dfw", es: "planes-de-pago-fotografia-quinceanera-dfw" },
  { en: "when-to-book-quinceanera-photographer-dfw", es: "cuando-reservar-fotografo-quinceanera-dfw" },
  { en: "questions-to-ask-quinceanera-photographer", es: "preguntas-para-tu-fotografo-de-quinceanera" },
  { en: "quinceanera-photo-vs-video", es: "foto-o-video-quinceanera" },
  { en: "changing-of-the-shoes-quinceanera", es: "el-cambio-de-zapatillas-quinceanera" },
  { en: "what-happens-at-a-quinceanera-order-of-events", es: "que-pasa-en-una-quinceanera-orden" },
  { en: "quinceanera-reception-venues-dfw", es: "salones-para-quinceaneras-dfw" },
  { en: "how-to-choose-quinceanera-photographer-dfw", es: "como-elegir-fotografo-de-quinceanera-dfw" },
  { en: "quinceanera-planning-timeline-checklist", es: "como-planear-una-quinceanera-cronograma" },
  { en: "court-vals-surprise-dance-quinceanera", es: "la-corte-el-vals-y-el-baile-sorpresa" },
  { en: "quinceanera-mass-dallas-fort-worth", es: "la-misa-de-quince-anos-dfw" },
  { en: "pre-quince-photo-session-dfw", es: "sesion-de-fotos-pre-quince-dfw" },
  { en: "best-quinceanera-photo-locations-dfw", es: "mejores-lugares-para-fotos-de-quinceanera-dfw" },
  { en: "quinceanera-budget-breakdown-texas", es: "cuanto-cuesta-una-quinceanera-presupuesto-texas" },
  { en: "quinceanera-photo-ideas-shot-list-dfw", es: "ideas-de-fotos-de-quinceanera-dfw" },
  { en: "quinceanera-dress-colors-that-photograph-best", es: "colores-de-vestido-de-quinceanera-que-fotografian-mejor" },
  { en: "quinceanera-themes-and-colors", es: "temas-y-colores-para-quinceanera" },
];

export function esSlugForEn(en: string): string | undefined {
  return EN_ES_PAIRS.find((p) => p.en === en)?.es;
}
export function enSlugForEs(es: string): string | undefined {
  return EN_ES_PAIRS.find((p) => p.es === es)?.en;
}
