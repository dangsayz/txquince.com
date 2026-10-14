/**
 * /quinceanera-guide — the ANSWER HUB (topical pillar).
 *
 * Every common quinceañera question, answered in the first breath (AEO /
 * featured-snippet style), grouped by intent, each block funneling to the
 * collections, and each linking to the deep blog spoke. FAQPage + Speakable
 * schema. This is the center of the wheel: homepage/nav → hub → 20+ blog spokes
 * → city/venue pages → packages.
 *
 * Answers use REAL TX Quince facts (commissions from the price book in src/lib/commission.ts,
 * the portrait session, photo + film) — that specificity is what keeps it from
 * reading generic/AI.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EditOverlay } from "@/components/EditMode";
import { site } from "@/content/site";
import { commissions, commissionsFromLabel, commissionLinks, retainerPercentLabel } from "@/content/commissions";
import { TIER_PRICE_USD, usd } from "@/lib/commission";
import { getPageHero, getPortfolioImages, type PortfolioImage } from "@/lib/content-db";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { FinalCTA } from "@/components/FinalCTA";
import "@/components/txq/pages/pages.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Quinceañera Guide: Every Question, Answered",
  description:
    `Straight answers to the most-asked quinceañera questions — cost, planning timeline, photo vs. film, la misa, el vals, and more — from a Dallas–Fort Worth quinceañera photographer. Commissions from ${commissionsFromLabel}.`,
  keywords:
    "quinceañera guide, quinceañera questions, quinceañera planning, quinceañera photographer cost, how much does a quinceañera photographer cost, quinceañera timeline, quinceañera FAQ Dallas Fort Worth",
  alternates: { canonical: "/quinceanera-guide" },
  openGraph: {
    title: `The Quinceañera Guide · ${site.brand}`,
    description:
      "The most-asked quinceañera questions, answered straight — cost, timeline, photo vs. film, the traditions — by a DFW quinceañera photographer.",
    url: `${site.url}/quinceanera-guide`,
  },
};

type QA = { q: string; a: string; href?: string; hrefLabel?: string };
type Bucket = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  qas: QA[];
  cta: { label: string; href: string };
};

const BUCKETS: Bucket[] = [
  {
    id: "planning",
    eyebrow: "Start here",
    title: "Planning the day",
    intro: "What a quinceañera is, how the day flows, and when to start.",
    qas: [
      {
        q: "What is a quinceañera?",
        a: "A quinceañera celebrates a girl's 15th birthday — a coming-of-age tradition in Latino culture marking her step from childhood into young womanhood. Most begin with a misa (mass) to give thanks, then a reception with family, her court, el vals, and dancing late into the night.",
        href: "/blog/what-is-a-quinceanera",
        hrefLabel: "What a quince really means",
      },
      {
        q: "What happens at a quinceañera, and in what order?",
        a: "The day usually runs: getting ready, la misa at the church, family and court portraits, the grand entrance, el vals (the waltz), the father–daughter dance, the surprise dance, dinner and toasts, the changing of the shoes and last-doll moments, cake, then open dancing. We cover all of it, start to finish.",
        href: "/blog/what-happens-at-a-quinceanera-order-of-events",
        hrefLabel: "The full order of events",
      },
      {
        q: "How far in advance should I start planning a quinceañera?",
        a: "Start 12–18 months out. Book the big three — venue, photographer, and DJ — 9–12 months ahead, since the best DFW dates go first. Order the dress 8–10 months out to allow for alterations, and send invitations 2–3 months before the day.",
        href: "/blog/quinceanera-planning-timeline-checklist",
        hrefLabel: "The month-by-month timeline",
      },
      {
        q: "How much does a whole quinceañera cost in Texas?",
        a: "Most DFW quinces land between roughly $10,000 and $25,000 all-in, depending on guest count and venue — the venue and catering are usually the biggest line items, with photography typically 10–20% of the budget. We break the real Texas numbers down category by category.",
        href: "/blog/quinceanera-budget-breakdown-texas",
        hrefLabel: "The full Texas budget breakdown",
      },
    ],
    cta: { label: "See full-day coverage", href: "/portfolio" },
  },
  {
    id: "cost",
    eyebrow: "The money questions",
    title: "Cost & booking",
    intro: "What photography costs, when to lock it in, and how to pay.",
    qas: [
      {
        q: "How much does a quinceañera photographer cost in Dallas–Fort Worth?",
        a: `Most DFW quinceañera studios publish packages between about $1,500 and $6,000. TX Quince publishes every price: a Portrait Study is ${usd(TIER_PRICE_USD.study)}, photo and film together start at ${usd(TIER_PRICE_USD.cinema)}, The Full Production is ${usd(TIER_PRICE_USD.production)}, and the multi-day archive is ${usd(TIER_PRICE_USD.archive)}. What you pay tracks coverage hours, crew, and the heirloom pieces you keep.`,
        href: "/blog/quinceanera-photographer-cost-dallas-fort-worth",
        hrefLabel: "What drives the price",
      },
      {
        q: "When should I book my quinceañera photographer?",
        a: "Nine to twelve months out. Spring and fall Saturdays book first, and we take a limited number of quinces each month so every girl gets the whole day — not a rushed two-hour window. If your date is close, check it before anything else.",
        href: "/blog/when-to-book-quinceanera-photographer-dfw",
        hrefLabel: "Why timing matters",
      },
      {
        q: "How does the retainer work?",
        a: `A retainer of ${retainerPercentLabel} of your commission reserves your date exclusively and is applied in full; the balance is due 30 days before the celebration. Pay it online at secure checkout, or request a consultation first and we hold the date for 7 days.`,
        href: "/blog/quinceanera-payment-plans-deposits-dfw",
        hrefLabel: "How deposits & plans work",
      },
      {
        q: "How much of my budget should go to photography?",
        a: "Plan on roughly 8–15% of your total quince budget for photography and film. It's the one thing that outlives the day — the flowers wilt and the food is gone, but the photos and the film are what your family keeps.",
        href: "/blog/quinceanera-budget-breakdown-texas",
        hrefLabel: "Where the money goes",
      },
    ],
    cta: { label: "See commissions & pricing", href: commissionLinks.en.compare },
  },
  {
    id: "photo-film",
    eyebrow: "Photo & film",
    title: "Choosing your photographer",
    intro: "Photo vs. film, how to choose well, and what to ask before booking.",
    qas: [
      {
        q: "Photo or video for a quinceañera — which do I need?",
        a: `If you can, both — they do different jobs. Photographs are what you frame and pass down; film is her voice, the music, and the room in motion. From Cinema & Stills (${usd(TIER_PRICE_USD.cinema)}) upward, a stills director and a motion director cover the full day together.`,
        href: "/blog/quinceanera-photo-vs-video",
        hrefLabel: "Photo vs. film, honestly",
      },
      {
        q: "How do I choose the right quinceañera photographer?",
        a: "Pick someone who shoots quinces specifically, shows full galleries (not just highlights), delivers on time, and has a backup plan. Most of all, choose someone your daughter is comfortable around — they'll be beside her all day, and that comfort shows up in the photos.",
        href: "/blog/how-to-choose-quinceanera-photographer-dfw",
        hrefLabel: "How to choose well",
      },
      {
        q: "What questions should I ask a quinceañera photographer before booking?",
        a: "Ask how long they've shot quinceañeras, exactly what each collection includes, how soon you'll see your gallery, whether they have a backup if they're sick, and to see one full quince start to finish. Straight answers to all five are a good sign.",
        href: "/blog/questions-to-ask-quinceanera-photographer",
        hrefLabel: "The full list of questions",
      },
      {
        q: "Where are the best places to take quinceañera photos in DFW?",
        a: "It depends on her theme — gardens and the Dallas Arboretum for soft and romantic, the Fort Worth Stockyards or downtown for bold and editorial, or the reception venue itself dressed for the night. We scout the spot that fits her gown and her vibe.",
        href: "/blog/best-quinceanera-photo-locations-dfw",
        hrefLabel: "Our favorite DFW spots",
      },
      {
        q: "Which dress colors photograph best?",
        a: "Almost any color photographs beautifully in the right light, but rich jewel tones, blush, and classic white tend to pop most against DFW backdrops. We plan locations and lighting around her gown so the color reads true — not washed out or color-cast.",
        href: "/blog/quinceanera-dress-colors-that-photograph-best",
        hrefLabel: "Dress colors on camera",
      },
    ],
    cta: { label: "See the portfolio", href: "/portfolio" },
  },
  {
    id: "celebration",
    eyebrow: "The traditions",
    title: "The celebration",
    intro: "La misa, el vals, the ceremonies, the music — what each moment means.",
    qas: [
      {
        q: "What is la misa (the quinceañera mass)?",
        a: "La misa is the church service at the heart of the day — the quinceañera gives thanks, often receives a blessing, and may present flowers to la Virgen. It's solemn and meaningful, and we photograph it quietly and respectfully, the way the church expects.",
        href: "/blog/quinceanera-mass-dallas-fort-worth",
        hrefLabel: "Inside the misa",
      },
      {
        q: "What are el vals, the court, and the surprise dance?",
        a: "El vals is the formal waltz the quinceañera performs with her court of damas and chambelanes, often after months of rehearsal. The surprise dance is the fun, choreographed number that follows — usually to today's music. Both are highlights we capture in full.",
        href: "/blog/court-vals-surprise-dance-quinceanera",
        hrefLabel: "Court, vals & surprise dance",
      },
      {
        q: "What is the changing of the shoes?",
        a: "The changing of the shoes is the moment her father (or a loved one) replaces her flats with her first pair of heels — a symbol of stepping into womanhood. It's quiet and emotional, and one of the most photographed traditions of the night.",
        href: "/blog/changing-of-the-shoes-quinceanera",
        hrefLabel: "The shoe ceremony",
      },
      {
        q: "What songs do I need for a quinceañera?",
        a: "You'll want music for the entrance, el vals, the father–daughter dance, the surprise dance, and the toast. Choose songs that mean something to your family — tradition matters more than trend. We've gathered ideas for every moment of the day.",
        href: "/blog/quinceanera-songs-for-every-moment",
        hrefLabel: "Song ideas by moment",
      },
      {
        q: "How do I choose a quinceañera theme and colors?",
        a: "Start with one or two colors she loves, then build the décor, dress accents, and invitations around them. Themes range from classic and royal to garden, charro, or modern. Lock the palette early — it shapes everything from the flowers to the photo locations we pick.",
        href: "/blog/quinceanera-themes-and-colors",
        hrefLabel: "Themes & color ideas",
      },
      {
        q: "What's a pre-quince or save-the-date session?",
        a: `It's an editorial portrait session weeks or months before the celebration — for her invitations, the welcome board, and a calm first look at her in the gown. Book it on its own as the Portrait Study (${usd(TIER_PRICE_USD.study)}), or receive it inside The Full Production and the Multi-Day Archive.`,
        href: "/quinceanera-photoshoot",
        hrefLabel: "About the pre-quince photoshoot",
      },
    ],
    cta: { label: "Check your date", href: commissionLinks.en.book },
  },
];

const fallbackImages: Record<string, { src: string; alt: string }> = {
  planning: { src: "/portfolio/save-date.webp", alt: "Quinceañera save-the-date portrait" },
  cost: { src: "/portfolio/reception.webp", alt: "Quinceañera portrait in a pink gown" },
  "photo-film": { src: "/portfolio/lilac-arch.webp", alt: "Quinceañera portrait in a lilac gown" },
  celebration: { src: "/portfolio/kimberly-reception.webp", alt: "Quinceañera celebration and dance" },
};

export default async function QuinceaneraGuidePage() {
  const url = `${site.url}/quinceanera-guide`;
  const allQas = BUCKETS.flatMap((b) => b.qas);

  // Break up the text with REAL work — the same portfolio photos the blog uses.
  // Pick one image per section by theme, no repeats; gracefully render text-only
  // if the gallery is empty.
  // Only images with stored dimensions (zero layout shift).
  const pool = (await getPortfolioImages()).filter((i) => i.slug && i.width && i.height);
  const featured = pool.filter((i) => i.is_feature);
  const used = new Set<string>();

  const byTheme = (src: PortfolioImage[], prefs: string[]): PortfolioImage | undefined => {
    for (const sec of prefs) {
      const m = src.find((i) => i.section === sec && !used.has(i.id));
      if (m) return m;
    }
    return undefined;
  };
  // Section images (rendered at natural height) — prefer featured, by theme.
  function pick(prefs: string[]): PortfolioImage | null {
    const m =
      byTheme(featured, prefs) ||
      byTheme(pool, prefs) ||
      featured.find((i) => !used.has(i.id)) ||
      pool.find((i) => !used.has(i.id));
    if (m) used.add(m.id);
    return m ?? null;
  }
  // Hero is a WIDE crop, so it must be a landscape frame or it reads empty.
  // If the gallery has no good landscape, skip the hero — the section images
  // already carry the visuals.
  const isLandscape = (i: PortfolioImage) => (i.width ?? 0) >= (i.height ?? 0) * 1.1;
  const landFeatured = featured.filter(isLandscape);
  const landPool = pool.filter(isLandscape);
  function pickHero(prefs: string[]): PortfolioImage | null {
    const m =
      byTheme(landFeatured, prefs) ||
      byTheme(landPool, prefs) ||
      landFeatured.find((i) => !used.has(i.id)) ||
      landPool.find((i) => !used.has(i.id));
    if (m) used.add(m.id);
    return m ?? null;
  }
  // Theme-specific FIRST (the ideal granular category), then graceful fallbacks
  // to whatever's populated today — so each image auto-sharpens as more photos
  // are tagged into the exact categories in /admin/portfolio.
  // Operator-chosen hero (set in /admin/hero → Page heroes) wins; otherwise fall
  // back to the automatic landscape pick. Mark it used so the section images
  // below never repeat the hero frame.
  const hero =
    (await getPageHero("guide")) ??
    pickHero([
      "grand-entrance", "el-vals", "celebration", "portraits", "save-the-date", "church",
    ]);
  if (hero) used.add(hero.id);
  const bucketImg: Record<string, PortfolioImage | null> = {
    // Before the day → getting ready / first look / details, then save-the-date.
    planning: pick(["getting-ready", "first-look", "the-details", "save-the-date", "portraits"]),
    // The investment / what you keep → the details, the crowning, then portraits.
    cost: pick(["the-details", "crowning", "venue-decor", "portraits", "celebration"]),
    // The work itself → portraits of her and the court.
    "photo-film": pick(["portraits", "family-portraits", "with-escort", "save-the-date"]),
    // The traditions → el vals, the dances, the changing of the shoes, the party.
    celebration: pick([
      "el-vals", "father-daughter", "surprise-dance", "grand-entrance", "changing-of-shoes", "celebration", "church",
    ]),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        name: "The Quinceañera Guide",
        mainEntity: allQas.map((qa) => ({
          "@type": "Question",
          name: qa.q,
          acceptedAnswer: { "@type": "Answer", text: qa.a },
        })),
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: "The Quinceañera Guide: Every Question, Answered",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".guide-answer"],
        },
        isPartOf: { "@type": "WebSite", name: site.brand, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Quinceañera Guide", item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }}
      />

      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="guide-title">
          <p className="tq-pg-mast__index tq-mono">[The quinceañera guide / Dallas–Fort Worth]</p>
          <div className="tq-pg-mast__body">
            <h1 id="guide-title" className="tq-display tq-pg-mast__title">
              The guide <em>— every quinceañera question, answered.</em>
            </h1>
            <p className="tq-pg-mast__dek">
              Clear answers on timing, traditions, photography, film, and the investment — the moments, decisions, and traditions that make it hers.
            </p>
            <div className="tq-pg-actions">
              <a href="#guide-topics" className="tq-btn tq-btn--lg tq-btn--ghost">
                Explore the guide <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </header>
        {hero ? (
          <figure className="tq-pg-plate">
            <Image
              src={hero.url}
              alt={publicPhotoCopy(hero, altPhraseFor(hero.section)).alt}
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: `${(hero.focus_x ?? 0.5) * 100}% ${(hero.focus_y ?? 0.5) * 100}%` }}
            />
            <EditOverlay image={{ id: hero.id, slug: hero.slug, alt: hero.alt, fx: hero.focus_x, fy: hero.focus_y }} />
            <figcaption>
              <span className="tq-tag tq-tag--bl tq-mono">[The details of the day]</span>
            </figcaption>
          </figure>
        ) : null}
      </div>

      <nav id="guide-topics" className="tq-section" aria-labelledby="guide-topics-title">
        <div className="tq-wrap">
          <div className="tq-pg-row">
            <p className="tq-pg-row__index tq-mono">[Contents]</p>
            <div className="tq-pg-row__body">
              <h2 id="guide-topics-title" className="tq-display tq-pg-row__title">
                Everything before, during, and after the day.
              </h2>
              <ol className="tq-pg-index">
                {BUCKETS.map((bucket, index) => (
                  <li key={bucket.id}>
                    <a href={`#${bucket.id}`} className="tq-pg-index__row">
                      <span className="tq-mono tq-muted">{String(index + 1).padStart(2, "0")}</span>
                      <span className="tq-pg-index__label">{bucket.title}</span>
                      <span className="tq-mono tq-pg-index__end">
                        {bucket.qas.length} Q <span aria-hidden>↓</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </nav>

      {BUCKETS.map((bucket, index) => {
        const image = bucketImg[bucket.id];
        return (
          <section key={bucket.id} id={bucket.id} className="tq-section" aria-labelledby={`${bucket.id}-title`}>
            <div className="tq-wrap">
              <header className="tq-head">
                <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
                  [{String(index + 1).padStart(2, "0")} / {bucket.eyebrow}]
                </p>
                <h2 id={`${bucket.id}-title`} className="tq-display tq-head__title">
                  {bucket.title}
                </h2>
                <p className="tq-head__dek">{bucket.intro}</p>
              </header>
              <div className={`tq-pg-duo ${index % 2 === 1 ? "tq-pg-duo--flip" : ""}`} style={{ paddingTop: 0 }}>
                <figure className="tq-pg-duo__media" style={{ margin: 0 }}>
                  <div className="tq-pg-figure">
                    <Image
                      src={image?.url ?? fallbackImages[bucket.id].src}
                      alt={image ? publicPhotoCopy(image, altPhraseFor(image.section)).alt : fallbackImages[bucket.id].alt}
                      fill
                      sizes="(max-width: 959px) 100vw, 40vw"
                      style={{ objectPosition: `${(image?.focus_x ?? 0.5) * 100}% ${(image?.focus_y ?? 0.5) * 100}%` }}
                    />
                  </div>
                  <figcaption className="tq-pg-figcap tq-mono">[Plate {String(index + 1).padStart(2, "0")} — {bucket.title}]</figcaption>
                </figure>
                <div className="tq-pg-duo__text" style={{ display: "grid", gap: 32 }}>
                  <ol className="tq-pg-qa">
                    {bucket.qas.map((qa, qaIndex) => (
                      <li key={qa.q}>
                        <span className="tq-mono tq-muted">{String(qaIndex + 1).padStart(2, "0")}</span>
                        <article className="tq-pg-qa__body">
                          <h3>{qa.q}</h3>
                          <p className="guide-answer">{qa.a}</p>
                          {qa.href && (
                            <Link href={qa.href} className="tq-pg-link">
                              <span>{qa.hrefLabel ?? "Read more"}</span>
                              <span className="tq-arrow" aria-hidden>↗</span>
                            </Link>
                          )}
                        </article>
                      </li>
                    ))}
                  </ol>
                  <div className="tq-pg-actions">
                    <Link href={bucket.cta.href} className="tq-btn tq-btn--lg">
                      {bucket.cta.label} <span className="tq-arrow" aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="tq-section" aria-labelledby="guide-collections-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [Four commissions]
            </p>
            <h2 id="guide-collections-title" className="tq-display tq-head__title">
              Coverage for the day you have in mind.
            </h2>
            <p className="tq-head__dek">
              Published prices begin at {commissionsFromLabel}. A {retainerPercentLabel} retainer holds your date and is applied in full.
            </p>
          </header>
          <div className="tq-pg-row" style={{ paddingTop: 0 }}>
            <div className="tq-pg-row__body">
              <ol className="tq-pg-index">
                {commissions.map((c) => (
                  <li key={c.id}>
                    <Link href={commissionLinks.en.compare} className="tq-pg-index__row">
                      <span className="tq-mono tq-muted">{c.numeral}</span>
                      <span className="tq-pg-index__label">{c.name.en}</span>
                      <span className="tq-mono tq-nums" style={{ whiteSpace: "nowrap" }}>{c.priceLabel}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="tq-pg-actions">
                <Link href={commissionLinks.en.compare} className="tq-btn tq-btn--lg tq-btn--ghost">
                  Compare commissions <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA href={commissionLinks.en.book} />
    </>
  );
}
