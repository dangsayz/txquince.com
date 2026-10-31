/**
 * blog-clusters.ts — the journal's topic clusters ("series").
 *
 * Each cluster answers one worry families actually have (see
 * docs/CONTENT-CLUSTERS.md for the research behind each one). A cluster has a
 * PILLAR (the complete guide) and SPOKES (one question each). Every post in a
 * cluster shows the whole series with "read next", so a reader can keep going
 * down the rabbit hole and every page links to its siblings and its pillar.
 *
 * Posts are listed by their ENGLISH slug; the Spanish series is derived from
 * the EN↔ES pairs in blog.ts (a post with no Spanish twin is simply skipped).
 * To add a post to a series: add its slug here. To start a new series: add a
 * cluster (and write the pillar first).
 */
import { enSlugForEs, esSlugForEn, getEsPost, getPost, type BlogPost } from "@/content/blog";

type L = { en: string; es: string };

export type BlogCluster = {
  id: string;
  /** Series name shown on every post in it. */
  title: L;
  /** The worry this series answers, in the family's words. */
  worry: L;
  /** EN slug of the complete guide. */
  pillar: string;
  /** EN slugs, in reading order. */
  spokes: string[];
};

export const BLOG_CLUSTERS: BlogCluster[] = [
  {
    id: "protect-your-money",
    title: { en: "Protect your money", es: "Proteja su dinero" },
    worry: {
      en: "“What if we pay and never get what we paid for?”",
      es: "“¿Y si pagamos y nunca nos entregan lo que pagamos?”",
    },
    pillar: "hire-quinceanera-vendors-without-getting-burned-texas",
    spokes: [
      "how-long-to-get-quinceanera-photos-video-back",
      "questions-to-ask-quinceanera-photographer",
      "quinceanera-payment-plans-deposits-dfw",
    ],
  },
  {
    id: "photo-and-video",
    title: { en: "Choosing photo & video", es: "Cómo elegir foto y video" },
    worry: {
      en: "“How do we pick the right photographer without regretting it?”",
      es: "“¿Cómo elegimos al fotógrafo correcto sin arrepentirnos?”",
    },
    pillar: "how-to-choose-quinceanera-photographer-dfw",
    spokes: [
      "quinceanera-photographer-cost-dallas-fort-worth",
      "when-to-book-quinceanera-photographer-dfw",
      "quinceanera-photo-vs-video",
      "pre-quince-photo-session-dfw",
      "quinceanera-dress-colors-that-photograph-best",
      "quinceanera-photo-ideas-shot-list-dfw",
      "best-quinceanera-photo-locations-dfw",
    ],
  },
  {
    id: "budget-and-planning",
    title: { en: "Budget & planning", es: "Presupuesto y planeación" },
    worry: {
      en: "“How much is this really going to cost, and where do we start?”",
      es: "“¿Cuánto nos va a costar de verdad y por dónde empezamos?”",
    },
    pillar: "quinceanera-budget-breakdown-texas",
    spokes: [
      "quinceanera-planning-timeline-checklist",
      "quinceanera-reception-venues-dfw",
      "quinceanera-at-vm-ballroom-balch-springs",
      "quinceanera-themes-and-colors",
    ],
  },
  {
    id: "the-day",
    title: { en: "The day itself", es: "El gran día" },
    worry: {
      en: "“What happens when, and what can't we forget?”",
      es: "“¿Qué pasa y a qué hora, y qué no se nos puede olvidar?”",
    },
    pillar: "what-happens-at-a-quinceanera-order-of-events",
    spokes: [
      "what-is-a-quinceanera",
      "quinceanera-mass-dallas-fort-worth",
      "court-vals-surprise-dance-quinceanera",
      "changing-of-the-shoes-quinceanera",
      "quinceanera-songs-for-every-moment",
    ],
  },
];

export type SeriesItem = { slug: string; title: string; href: string; current: boolean; pillar: boolean };

export type Series = {
  id: string;
  title: string;
  worry: string;
  items: SeriesItem[];
  /** 1-based position of the current post. */
  position: number;
  /** The next post to read (wraps to the pillar at the end). */
  next: SeriesItem | null;
};

/** The series a post belongs to, in its language, or null. */
export function seriesFor(slug: string, lang: "en" | "es"): Series | null {
  const enSlug = lang === "es" ? enSlugForEs(slug) : slug;
  if (!enSlug) return null;
  const cluster = BLOG_CLUSTERS.find((c) => c.pillar === enSlug || c.spokes.includes(enSlug));
  if (!cluster) return null;

  const items: SeriesItem[] = [];
  for (const en of [cluster.pillar, ...cluster.spokes]) {
    const localSlug = lang === "es" ? esSlugForEn(en) : en;
    const post: BlogPost | undefined = localSlug ? (lang === "es" ? getEsPost(localSlug) : getPost(localSlug)) : undefined;
    if (!post || !localSlug) continue;
    items.push({
      slug: localSlug,
      title: post.title,
      href: `${lang === "es" ? "/es" : ""}/blog/${localSlug}`,
      current: localSlug === slug,
      pillar: en === cluster.pillar,
    });
  }
  const at = items.findIndex((i) => i.current);
  if (at < 0 || items.length < 2) return null;
  return {
    id: cluster.id,
    title: cluster.title[lang],
    worry: cluster.worry[lang],
    items,
    position: at + 1,
    next: items[(at + 1) % items.length] ?? null,
  };
}
