/**
 * /quinceanera-guide — the ANSWER HUB (topical pillar).
 *
 * Every common quinceañera question, answered in the first breath (AEO /
 * featured-snippet style), grouped by intent, each block funneling to the
 * collections, and each linking to the deep blog spoke. FAQPage + Speakable
 * schema. This is the center of the wheel: homepage/nav → hub → 20+ blog spokes
 * → city/venue pages → packages.
 *
 * Answers use REAL TX Quince facts (collections $1,800–$5,500, Signature pairs
 * photo + film, save-the-date included) — that specificity is what keeps it from
 * reading generic/AI.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EditOverlay } from "@/components/EditMode";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { getPageHero, getPortfolioImages, type PortfolioImage } from "@/lib/content-db";
import { FinalCTA } from "@/components/FinalCTA";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Quinceañera Guide: Every Question, Answered",
  description:
    "Straight answers to the most-asked quinceañera questions — cost, planning timeline, photo vs. film, la misa, el vals, and more — from a Dallas–Fort Worth quinceañera photographer. Collections from $1,800.",
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
    cta: { label: "See how we cover the full day", href: "/portfolio" },
  },
  {
    id: "cost",
    eyebrow: "The money questions",
    title: "Cost & booking",
    intro: "What photography costs, when to lock it in, and how to pay.",
    qas: [
      {
        q: "How much does a quinceañera photographer cost in Dallas–Fort Worth?",
        a: "In DFW, professional quinceañera photography generally runs about $1,800–$5,500. Our collections start at $1,800 (Moments — one artist, five focused hours) and reach $5,500 (Legacy — photo, film, drone, and a premium album). What you pay tracks coverage hours and whether you want photo, film, or both.",
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
        q: "Do you offer payment plans, and what's the deposit?",
        a: "Yes. A deposit reserves your date and the balance is due before the celebration — you can split it into manageable payments along the way. The deposit holds your date exclusively, so no one else can book it.",
        href: "/blog/quinceanera-payment-plans-deposits-dfw",
        hrefLabel: "How deposits & plans work",
      },
      {
        q: "How much of my budget should go to photography?",
        a: "Plan on 10–20% of your total quince budget for photography and film. It's the one thing that outlives the day — the flowers wilt and the food is gone, but the photos and the film are what your family keeps. Our collections span $1,800–$5,500 to fit different budgets.",
        href: "/blog/quinceanera-budget-breakdown-texas",
        hrefLabel: "Where the money goes",
      },
    ],
    cta: { label: "See collections & pricing", href: "/investment" },
  },
  {
    id: "photo-film",
    eyebrow: "Photo & film",
    title: "Choosing your photographer",
    intro: "Photo vs. film, how to choose well, and what to ask before booking.",
    qas: [
      {
        q: "Photo or video for a quinceañera — which do I need?",
        a: "If you can, both — they do different jobs. Photographs are what you frame and pass down; film is her voice, the music, and the room in motion. Our Signature collection ($3,900) pairs two storytellers so you get both across the full day. On a tighter budget, choose the one she'll relive most.",
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
        a: "It's a relaxed portrait session weeks or months before the celebration — for her invitations, social posts, and a calm first look at her in a gown before the big day. It's complimentary with Essential, Signature, and Legacy; families choosing Moments can add a session separately.",
        href: "/quinceanera-save-the-date",
        hrefLabel: "About the save-the-date session",
      },
    ],
    cta: { label: "Reserve your date", href: "/reserve" },
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

      <header className="relative isolate min-h-[38rem] overflow-hidden bg-ink text-white sm:min-h-[46rem]" aria-labelledby="guide-title">
        <Image
          src={hero?.url ?? "/portfolio/hero.webp"}
          alt={hero ? publicPhotoCopy(hero, altPhraseFor(hero.section)).alt : "Quinceañera portrait in Dallas–Fort Worth"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: `${(hero?.focus_x ?? 0.5) * 100}% ${(hero?.focus_y ?? 0.5) * 100}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-[90rem] flex-col justify-between px-5 pb-10 pt-8 sm:min-h-[46rem] sm:px-10 sm:pb-14 lg:px-16">
          <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em]">
            <span>TX Quince / Journal 01</span>
            <span>Dallas–Fort Worth</span>
          </div>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">The quinceañera guide</p>
            <h1 id="guide-title" className="mt-4 max-w-[18ch] font-display text-[clamp(2.25rem,4.5vw,4.25rem)] font-normal leading-[1.06] tracking-[-0.035em]">Plan the day. Keep the feeling.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">Clear answers on timing, traditions, photography, film, and the investment.</p>
            <a href="#guide-topics" className="mt-8 inline-flex min-h-12 items-center gap-4 border-b border-white pb-1 text-sm font-medium">Explore the guide <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        {hero ? <EditOverlay image={{ id: hero.id, slug: hero.slug, alt: hero.alt, fx: hero.focus_x, fy: hero.focus_y }} /> : null}
      </header>

      <nav id="guide-topics" aria-label="Guide topics" className="scroll-mt-24 border-b border-line bg-white">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-12 sm:px-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16 lg:px-16 lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Contents</p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-normal leading-tight">Everything before, during, and after the day.</h2>
          </div>
          <ol className="border-t border-line">
            {BUCKETS.map((bucket, index) => (
              <li key={bucket.id}>
                <a href={`#${bucket.id}`} className="group grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-4 border-b border-line py-3 text-base text-ink hover:text-ink-soft sm:min-h-20 sm:text-lg">
                  <span className="text-xs text-ink-faint">0{index + 1}</span>
                  <span>{bucket.title}</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">↗</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {BUCKETS.map((bucket, index) => {
        const image = bucketImg[bucket.id];
        return (
          <section key={bucket.id} id={bucket.id} className={`scroll-mt-24 ${index % 2 === 0 ? "bg-[#f4f2ee]" : "bg-white"}`} aria-labelledby={`${bucket.id}-title`}>
            <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-28">
              <div className="grid gap-8 border-t border-ink/20 pt-6 lg:grid-cols-[minmax(0,0.25fr)_minmax(0,0.75fr)] lg:gap-14">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">0{index + 1} / {bucket.eyebrow}</p>
                <div>
                  <h2 id={`${bucket.id}-title`} className="font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-[1.12] tracking-[-0.03em] text-ink">{bucket.title}</h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">{bucket.intro}</p>
                </div>
              </div>

              <div className={`mt-10 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:items-start lg:gap-16 ${index % 2 === 1 ? "lg:[&>figure]:order-2" : ""}`}>
                <figure className="relative min-h-[23rem] overflow-hidden bg-greige sm:min-h-[36rem] lg:sticky lg:top-24 lg:min-h-[43rem]">
                  <Image
                    src={image?.url ?? fallbackImages[bucket.id].src}
                    alt={image ? publicPhotoCopy(image, altPhraseFor(image.section)).alt : fallbackImages[bucket.id].alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 42vw"
                    className="object-cover"
                    style={{ objectPosition: `${(image?.focus_x ?? 0.5) * 100}% ${(image?.focus_y ?? 0.5) * 100}%` }}
                  />
                </figure>
                <div className="border-t border-line">
                  {bucket.qas.map((qa, qaIndex) => (
                    <article key={qa.q} className="grid gap-3 border-b border-line py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5 sm:py-9">
                      <span className="text-xs text-ink-faint">{String(qaIndex + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="max-w-[30ch] font-display text-[clamp(1.125rem,1.8vw,1.5rem)] font-normal leading-snug text-ink">{qa.q}</h3>
                        <p className="guide-answer mt-4 max-w-prose text-base leading-7 text-ink-soft">{qa.a}</p>
                        {qa.href && <Link href={qa.href} className="mt-4 inline-flex min-h-11 items-center gap-3 border-b border-ink text-sm font-medium text-ink">{qa.hrefLabel ?? "Read more"}<span aria-hidden="true">↗</span></Link>}
                      </div>
                    </article>
                  ))}
                  <Link href={bucket.cta.href} className="mt-7 inline-flex min-h-12 items-center gap-4 bg-ink px-6 text-sm font-medium text-white hover:bg-ink-soft">{bucket.cta.label}<span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="bg-ink text-white" aria-labelledby="guide-collections-title">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:gap-20 lg:px-16 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/65">Four collections</p>
            <h2 id="guide-collections-title" className="mt-4 max-w-[20ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight">Coverage for the day you have in mind.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/75">Published prices begin at {packages[0].priceLabel}. Your date and collection are confirmed before a deposit is due.</p>
            <Link href="/investment" className="mt-8 inline-flex min-h-12 items-center gap-4 border-b border-white pb-1 text-sm font-medium">Compare collections <span aria-hidden="true">↗</span></Link>
          </div>
          <ol className="border-t border-white/30">
            {packages.map((collection, index) => (
              <li key={collection.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-white/30 py-5 sm:gap-6">
                <span className="text-xs text-white/55">0{index + 1}</span>
                <Link href={`/reserve?collection=${collection.id}`} className="min-h-11 text-lg hover:underline">{collection.name}</Link>
                <span className="text-base text-white/85">{collection.priceLabel}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
