import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { BlogBlock, BlogCategory, BlogFaq, BlogPost } from "@/content/blog";
import { slugifyHeading } from "@/content/blog";
import "@/components/txq/pages/blog.css";

/**
 * The journal (blog) in the homepage's editorial system: Inter display type,
 * Geist Mono index labels, exposed 1px hairline grid, alabaster canvas, zero
 * radius, no shadows. Every view here renders inside the global SiteShell's
 * <main>, so there is no page-level header, nav or footer.
 *
 * - BlogContent: the structured post body (one 62–68ch reading column).
 * - BlogIndexView: the /blog and /es/blog index.
 * - BlogArticleView: a single post (EN or ES).
 *
 * Inline `[label](/href)` in prose becomes a link: internal hrefs use next/link
 * (contextual internal linking, LAW 5), external hrefs open safely in a new tab.
 */

export type BlogLang = "en" | "es";

/** A resolved photo for an `image` block — built by the post page from the slug. */
export type BlogImage = {
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
  caption?: string | null;
};

/** A photo for a list tile / featured slot (portfolio image or static fallback). */
export type BlogThumb = {
  url: string;
  alt: string;
  focus_x?: number | null;
  focus_y?: number | null;
};

// ---------------------------------------------------------------------------
// Copy + helpers
// ---------------------------------------------------------------------------

const CATEGORY_KEY: Record<BlogCategory, string> = {
  "Cost & Budget": "cost",
  Planning: "planning",
  Traditions: "traditions",
  "Photography & Film": "film",
  Locations: "locations",
};

const CATEGORY_ES: Record<BlogCategory, string> = {
  "Cost & Budget": "Costo y presupuesto",
  Planning: "Planeación",
  Traditions: "Tradiciones",
  "Photography & Film": "Foto y video",
  Locations: "Lugares",
};

const CATEGORY_ORDER: BlogCategory[] = ["Cost & Budget", "Planning", "Traditions", "Photography & Film", "Locations"];

/** English display labels where the stored category key reads too technical. */
const CATEGORY_EN: Partial<Record<BlogCategory, string>> = {
  "Photography & Film": "Photos & Video",
};

export function categoryLabel(category: BlogCategory, lang: BlogLang): string {
  return lang === "es" ? CATEGORY_ES[category] : (CATEGORY_EN[category] ?? category);
}

const COPY = {
  en: {
    base: "/blog",
    home: "/",
    intake: "/#intake",
    journal: "Journal",
    homeLabel: "Home",
    crumbs: "Breadcrumb",
    read: (n: number) => `${n} min read`,
    readShort: (n: number) => `${n} min`,
    locale: "en-US",
    featured: "Featured",
    readStory: "Read the story",
    all: "All",
    allTitle: "Every guide",
    allDek: (n: number) => `${n} guides on costs, timelines, traditions, photos and video.`,
    filterLabel: "Filter guides by topic",
    tocLabel: "In this guide",
    topic: "Topic",
    published: "Published",
    updated: "Updated",
    reading: "Reading",
    fig: "Fig.",
    faqTitle: "Frequently asked questions",
    relatedIndex: "Keep reading",
    relatedTitle: "More from the journal",
    closeIndex: "Your date",
    closeTitle: ["Her day, in photos", "and video."],
    closeDek: "Share the date and venue. We write back personally, within one day, in English or Spanish.",
    closeCta: "Inquire Date",
    closeSecondary: "All guides",
    fallbackAlt: "Quinceañera portrait in Dallas–Fort Worth",
  },
  es: {
    base: "/es/blog",
    home: "/es",
    intake: "/es#intake",
    journal: "Diario",
    homeLabel: "Inicio",
    crumbs: "Ruta",
    read: (n: number) => `${n} min de lectura`,
    readShort: (n: number) => `${n} min`,
    locale: "es-MX",
    featured: "Destacado",
    readStory: "Leer la guía",
    all: "Todas",
    allTitle: "Todas las guías",
    allDek: (n: number) => `${n} guías sobre costos, fechas, tradiciones, foto y video.`,
    filterLabel: "Filtrar guías por tema",
    tocLabel: "En esta guía",
    topic: "Tema",
    published: "Publicado",
    updated: "Actualizado",
    reading: "Lectura",
    fig: "Fig.",
    faqTitle: "Preguntas frecuentes",
    relatedIndex: "Sigue leyendo",
    relatedTitle: "Más del diario",
    closeIndex: "Su fecha",
    closeTitle: ["Su día, en fotos", "y en video."],
    closeDek: "Comparta la fecha y el salón. Le respondemos en persona, en un día, en español o en inglés.",
    closeCta: "Consultar fecha",
    closeSecondary: "Todas las guías",
    fallbackAlt: "Fotografía de quinceañera en Dallas–Fort Worth",
  },
} as const;

const pad = (n: number) => String(n).padStart(2, "0");

function formatDate(iso: string, lang: BlogLang): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(COPY[lang].locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.35) * 100)}%`;
}

/** Static /portfolio fallbacks bypass the /api/img loader. */
const isStatic = (url: string) => !url.startsWith("/api/img/") && !url.startsWith("http");

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  let i = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (href.startsWith("/")) {
      nodes.push(
        <Link key={i++} href={href} className="tq-blog-link">
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a key={i++} href={href} target="_blank" rel="noopener noreferrer" className="tq-blog-link">
          {label}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ---------------------------------------------------------------------------
// Post body
// ---------------------------------------------------------------------------

export function BlogContent({
  blocks,
  images,
  skipSlug,
  lang = "en",
}: {
  blocks: BlogBlock[];
  images?: Record<string, BlogImage>;
  /** Image slug already shown as the cover — skipped once so it never repeats. */
  skipSlug?: string;
  lang?: BlogLang;
}) {
  // Precompute running numbers (h2 index, figure number) and which image block
  // is the cover, so rendering stays a pure map.
  const skipAt = skipSlug ? blocks.findIndex((b) => b.type === "image" && b.slug === skipSlug) : -1;
  const numbers = blocks.reduce<{ h2: number[]; fig: number[]; h: number; f: number }>(
    (acc, b, i) => {
      if (b.type === "h2") acc.h += 1;
      if (b.type === "image" && i !== skipAt && images?.[b.slug]?.url) acc.f += 1;
      acc.h2.push(acc.h);
      acc.fig.push(acc.f);
      return acc;
    },
    { h2: [], fig: [], h: 0, f: skipAt >= 0 ? 1 : 0 },
  );
  return (
    <div className="tq-blog-flow">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={slugifyHeading(b.text)} className="tq-display tq-blog-flow__h2">
                <span className="tq-mono tq-muted" aria-hidden>
                  [{pad(numbers.h2[i])}]
                </span>
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="tq-display tq-blog-flow__h3">
                {b.text}
              </h3>
            );
          case "p":
            return <p key={i}>{renderInline(b.text)}</p>;
          case "ul":
            return (
              <ul key={i} className="tq-blog-flow__ul">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="tq-blog-flow__ol">
                {b.items.map((it, j) => (
                  <li key={j}>
                    <span className="tq-mono tq-muted tq-nums" aria-hidden>
                      {pad(j + 1)}
                    </span>
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={i} className="tq-display tq-blog-flow__quote">
                {renderInline(b.text)}
              </blockquote>
            );
          case "callout":
            return (
              <aside key={i} className="tq-blog-flow__callout">
                {renderInline(b.text)}
              </aside>
            );
          case "image": {
            if (i === skipAt) return null; // already shown as the cover
            const img = images?.[b.slug];
            if (!img?.url) return null; // missing photo → render nothing, never a placeholder
            const caption = b.caption ?? img.caption ?? null;
            const w = img.width ?? 1600;
            const h = img.height ?? 1067;
            return (
              <figure key={i} className="tq-blog-fig">
                <div className="tq-blog-fig__media" style={{ aspectRatio: `${w} / ${h}` }}>
                  <Image
                    src={img.url}
                    alt={b.alt || img.alt || COPY[lang].fallbackAlt}
                    width={w}
                    height={h}
                    sizes="(max-width: 959px) calc(100vw - 48px), 720px"
                    unoptimized={isStatic(img.url)}
                  />
                </div>
                {caption ? (
                  <figcaption className="tq-blog-cap">
                    <span className="tq-mono tq-muted">
                      {COPY[lang].fig} {pad(numbers.fig[i])}
                    </span>
                    <span>{caption}</span>
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case "cta":
            return (
              <div key={i} className="tq-blog-flow__cta">
                <p className="tq-display tq-blog-flow__cta-title">{b.heading}</p>
                {b.body ? <p className="tq-blog-flow__cta-body">{b.body}</p> : null}
                <Link href={b.href} className="tq-btn tq-btn--lg">
                  {b.label} <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

type RowProps = {
  post: BlogPost;
  n: number;
  lang: BlogLang;
  thumb?: BlogThumb | null;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
};

function PostRow({ post, n, lang, thumb, featured, headingLevel = "h3" }: RowProps) {
  const c = COPY[lang];
  const cat = categoryLabel(post.category, lang);
  const Heading = headingLevel;
  return (
    <li
      className={`tq-blog-row${thumb === undefined ? " tq-blog-row--plain" : ""}`}
      data-cat={CATEGORY_KEY[post.category]}
      data-featured={featured ? "true" : undefined}
    >
      <span className="tq-blog-row__n tq-mono tq-muted tq-nums" aria-hidden>
        {pad(n)}
      </span>
      <div className="tq-blog-row__main">
        <p className="tq-blog-row__meta tq-mono tq-muted tq-blog-meta">
          <span>{cat}</span>
          <span aria-hidden>·</span>
          <span>{c.readShort(post.readMinutes)}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
        </p>
        <Heading className="tq-display tq-blog-row__title">
          <Link href={`${c.base}/${post.slug}`} className="tq-blog-stretch">
            <span>{post.title}</span>
          </Link>
        </Heading>
        <p className="tq-blog-row__excerpt">{post.excerpt}</p>
      </div>
      <span className="tq-blog-row__cat tq-mono">{cat}</span>
      <span className="tq-blog-row__date tq-mono tq-muted tq-nums">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
        <span>{c.read(post.readMinutes)}</span>
      </span>
      {thumb !== undefined ? (
        <span className="tq-blog-row__thumb" aria-hidden>
          {thumb?.url ? (
            <Image
              src={thumb.url}
              alt=""
              fill
              sizes="(max-width: 959px) 96px, 120px"
              unoptimized={isStatic(thumb.url)}
              style={{ objectPosition: focal(thumb.focus_x, thumb.focus_y) }}
            />
          ) : null}
        </span>
      ) : null}
    </li>
  );
}

function SectionHead({
  index,
  title,
  id,
  dek,
}: {
  index: string;
  title: ReactNode;
  id: string;
  dek?: ReactNode;
}) {
  return (
    <header className="tq-head tq-blog-head">
      <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
        [{index}]
      </p>
      <h2 id={id} className="tq-display tq-head__title">
        {title}
      </h2>
      {dek ? <p className="tq-head__dek">{dek}</p> : null}
    </header>
  );
}

/** Closing booking CTA — every journal page ends on the intake. */
function Closing({ lang }: { lang: BlogLang }) {
  const c = COPY[lang];
  return (
    <section className="tq-section" aria-labelledby="tq-blog-close-title">
      <div className="tq-wrap">
        <div className="tq-blog-close">
          <p className="tq-mono tq-muted tq-blog-close__index">[{c.closeIndex}]</p>
          <h2 id="tq-blog-close-title" className="tq-display tq-blog-close__title">
            {c.closeTitle[0]} <em>{c.closeTitle[1]}</em>
          </h2>
          <p className="tq-blog-close__dek">{c.closeDek}</p>
          <div className="tq-blog-close__actions">
            <Link href={c.intake} className="tq-btn tq-btn--lg">
              {c.closeCta} <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
            <Link href={c.base} className="tq-btn tq-btn--lg tq-btn--ghost">
              {c.closeSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

export function BlogIndexView({
  lang,
  title,
  dek,
  aside,
  posts,
  featuredImage,
  thumbs,
}: {
  lang: BlogLang;
  title: ReactNode;
  dek: string;
  /** Optional link under the dek (e.g. the planning guide). */
  aside?: { href: string; label: string };
  /** All posts, newest first. The first is featured. */
  posts: BlogPost[];
  featuredImage?: BlogThumb | null;
  thumbs: Map<string, BlogThumb | null>;
}) {
  const c = COPY[lang];
  const featured = posts[0];
  const categories = CATEGORY_ORDER.filter((cat) => posts.some((p) => p.category === cat));

  return (
    <div className="tq-blog">
      <div className="tq-wrap">
        <header className="tq-head tq-blog-hero">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [01 / {c.journal}]
          </p>
          <h1 className="tq-display tq-head__title">{title}</h1>
          <div className="tq-head__dek tq-blog-hero__dek">
            <p>{dek}</p>
            {aside ? (
              <Link href={aside.href} className="tq-blog-textlink">
                <span>{aside.label}</span> <span className="tq-arrow" aria-hidden>↗</span>
              </Link>
            ) : null}
          </div>
        </header>
      </div>

      {featured ? (
        <section className="tq-section" aria-labelledby="tq-blog-featured">
          <div className="tq-wrap">
            <article className="tq-blog-feature">
              <div className="tq-blog-feature__media">
                <Image
                  src={featuredImage?.url ?? "/portfolio/save-date.webp"}
                  alt={featuredImage?.alt || c.fallbackAlt}
                  fill
                  priority
                  sizes="(max-width: 959px) calc(100vw - 48px), 58vw"
                  unoptimized={isStatic(featuredImage?.url ?? "/portfolio/save-date.webp")}
                  style={{ objectPosition: focal(featuredImage?.focus_x, featuredImage?.focus_y) }}
                />
                <span className="tq-tag tq-tag--tl tq-mono">[02 / {c.featured}]</span>
              </div>
              <div className="tq-blog-feature__body">
                <p className="tq-mono tq-muted tq-blog-meta">
                  <span>{categoryLabel(featured.category, lang)}</span>
                  <span aria-hidden>·</span>
                  <span>{c.read(featured.readMinutes)}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt, lang)}</time>
                </p>
                <h2 id="tq-blog-featured" className="tq-display tq-blog-feature__title">
                  <Link href={`${c.base}/${featured.slug}`} className="tq-blog-stretch">
                    {featured.title}
                  </Link>
                </h2>
                <p className="tq-blog-feature__excerpt">{featured.excerpt}</p>
                <span className="tq-btn tq-btn--ghost tq-blog-feature__cta" aria-hidden>
                  {c.readStory} <span className="tq-arrow">↗</span>
                </span>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="tq-section" aria-labelledby="tq-blog-all">
        <div className="tq-wrap">
          <SectionHead index={`03 / ${c.allTitle}`} id="tq-blog-all" title={c.allTitle} dek={c.allDek(posts.length)} />
          <div className="tq-blog-index">
            {categories.length > 1 ? (
              <fieldset className="tq-toolbar tq-blog-toolbar">
                <legend className="tq-sr">{c.filterLabel}</legend>
                <div className="tq-filters">
                  <label className="tq-pill">
                    <input type="radio" name="tq-blog-topic" value="all" defaultChecked />
                    {c.all}
                  </label>
                  {categories.map((cat) => (
                    <label key={cat} className="tq-pill">
                      <input type="radio" name="tq-blog-topic" value={CATEGORY_KEY[cat]} />
                      {categoryLabel(cat, lang)}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <ol className="tq-blog-list">
              {posts.map((post, i) => (
                <PostRow
                  key={post.slug}
                  post={post}
                  n={i + 1}
                  lang={lang}
                  featured={i === 0}
                  thumb={thumbs.get(post.slug) ?? null}
                />
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Closing lang={lang} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

export function BlogArticleView({
  lang,
  post,
  images,
  related,
}: {
  lang: BlogLang;
  post: BlogPost;
  images: Record<string, BlogImage>;
  related: BlogPost[];
}) {
  const c = COPY[lang];
  const toc = post.content.filter((b): b is { type: "h2"; text: string } => b.type === "h2");
  // Cover = the first image block that resolved, in reading order (deterministic).
  const coverBlock = post.content.find(
    (b): b is Extract<BlogBlock, { type: "image" }> => b.type === "image" && Boolean(images[b.slug]?.url),
  );
  const cover = coverBlock ? images[coverBlock.slug] : undefined;
  const coverUrl = cover?.url ?? "/portfolio/save-date.webp";
  const coverAlt = coverBlock?.alt || cover?.alt || c.fallbackAlt;
  const coverCaption = coverBlock?.caption ?? cover?.caption ?? null;
  const faqs: BlogFaq[] = post.faqs ?? [];

  const tocList = (
    <ol className="tq-blog-toc__list">
      {toc.map((h, idx) => (
        <li key={h.text}>
          <a href={`#${slugifyHeading(h.text)}`}>
            <span className="tq-mono tq-muted tq-nums" aria-hidden>
              {pad(idx + 1)}
            </span>
            <span>{h.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="tq-blog">
      <article aria-labelledby="tq-blog-title">
        <div className="tq-wrap">
          <header className="tq-blog-post__head">
            <nav aria-label={c.crumbs} className="tq-blog-crumbs tq-mono">
              <ol>
                <li>
                  <Link href={c.home}>{c.homeLabel}</Link>
                </li>
                <li>
                  <Link href={c.base}>{c.journal}</Link>
                </li>
              </ol>
            </nav>
            <div className="tq-blog-post__grid">
              <div className="tq-blog-post__titles">
                <h1 id="tq-blog-title" className="tq-display tq-blog-post__title">
                  {post.title}
                </h1>
                <p className="tq-blog-post__lead">{post.lead}</p>
              </div>
              <dl className="tq-blog-post__meta tq-mono">
                <div>
                  <dt className="tq-muted">{c.topic}</dt>
                  <dd>{categoryLabel(post.category, lang)}</dd>
                </div>
                <div>
                  <dt className="tq-muted">{c.published}</dt>
                  <dd>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
                  </dd>
                </div>
                {post.updatedAt && post.updatedAt !== post.publishedAt ? (
                  <div>
                    <dt className="tq-muted">{c.updated}</dt>
                    <dd>
                      <time dateTime={post.updatedAt}>{formatDate(post.updatedAt, lang)}</time>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="tq-muted">{c.reading}</dt>
                  <dd>{c.read(post.readMinutes)}</dd>
                </div>
              </dl>
            </div>
          </header>

          <figure className="tq-blog-cover">
            <div className="tq-blog-cover__media">
              <Image
                src={coverUrl}
                alt={coverAlt}
                fill
                priority
                sizes="(max-width: 959px) calc(100vw - 48px), calc(100vw - 96px)"
                unoptimized={isStatic(coverUrl)}
              />
            </div>
            {coverCaption ? (
              <figcaption className="tq-blog-cap">
                <span className="tq-mono tq-muted">{c.fig} 01</span>
                <span>{coverCaption}</span>
              </figcaption>
            ) : null}
          </figure>

          <div className="tq-blog-body">
            {toc.length >= 3 ? (
              <aside className="tq-blog-rail">
                <details className="tq-blog-toc tq-blog-toc--m">
                  <summary>
                    <span className="tq-mono">{c.tocLabel}</span>
                    <span className="tq-mono tq-muted tq-nums">{pad(toc.length)}</span>
                    <span className="tq-faq__icon" aria-hidden />
                  </summary>
                  <nav aria-label={c.tocLabel}>{tocList}</nav>
                </details>
                <nav aria-label={c.tocLabel} className="tq-blog-toc tq-blog-toc--d">
                  <p className="tq-mono tq-muted">{c.tocLabel}</p>
                  {tocList}
                </nav>
              </aside>
            ) : null}
            <div className="tq-blog-prose">
              <BlogContent blocks={post.content} images={images} skipSlug={coverBlock?.slug} lang={lang} />
            </div>
          </div>

          {faqs.length ? (
            <section className="tq-section" aria-labelledby="tq-blog-faq">
              <SectionHead index="FAQ" id="tq-blog-faq" title={c.faqTitle} />
              <div className="tq-faq">
                {faqs.map((f, i) => (
                  <details key={f.q} className="tq-faq__item" open={i === 0}>
                    <summary>
                      <span className="tq-mono tq-muted">{pad(i + 1)}</span>
                      <h3 className="tq-faq__q">{f.q}</h3>
                      <span className="tq-faq__icon" aria-hidden />
                    </summary>
                    <p>{renderInline(f.a)}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>

      {related.length ? (
        <section className="tq-section" aria-labelledby="tq-blog-related">
          <div className="tq-wrap">
            <SectionHead index={c.relatedIndex} id="tq-blog-related" title={c.relatedTitle} />
            <ol className="tq-blog-list tq-blog-list--related">
              {related.map((r, i) => (
                <PostRow key={r.slug} post={r} n={i + 1} lang={lang} />
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <Closing lang={lang} />
    </div>
  );
}
