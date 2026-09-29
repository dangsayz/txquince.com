import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { getImagesBySection } from "@/lib/content-db";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";

export const revalidate = 3600;

/**
 * SAVE-THE-DATE landing page — a competitive wedge, not filler.
 *
 * The session every DFW studio sells as a $150–$475 add-on is included FREE in
 * Essential, Signature, and Legacy. This page targets "quinceañera save the date
 * dallas" / "pre-quince photoshoot" and folds in the honest "your own dress,
 * no restrictions" answer to the "dress included" demand. Content-as-code; no
 * fabricated offers (no gown rental — we don't do that).
 */

const STD_FAQS = [
  {
    q: "How much does the Save-the-Date session cost?",
    a: "Nothing extra with Essential, Signature, or Legacy. The Moments collection does not include this session. Most Dallas–Fort Worth studios sell the same session as a $150–$475 add-on. Here it's part of those three collections.",
  },
  {
    q: "Can she wear her own quince dress?",
    a: "Yes — her own dress, no rental and no restrictions. Wear the gown, a casual look, or both. It's her session; we shape it around what she wants to remember.",
  },
  {
    q: "What is a Save-the-Date (pre-quince) photoshoot?",
    a: "A relaxed portrait session before the celebration — used for the invitations, the guest sign-in board, and social, and a no-pressure way to meet your photographer before the day itself.",
  },
  {
    q: "When do we do the session?",
    a: "Usually a few weeks to a few months before the celebration, once your date is reserved. We pick a Dallas–Fort Worth location together — somewhere that means something to your family.",
  },
  {
    q: "Do we have to book the full quinceañera to get it?",
    a: "The Save-the-Date session is included with Essential, Signature, and Legacy. Moments does not include it. Reserve one of the eligible collections and there is nothing extra to add or pay for.",
  },
  {
    q: "Are you insured?",
    a: "Yes — insured and venue-compliant, so your church and reception hall are covered. Many DFW parishes and venues ask for proof of insurance before they'll let a photographer shoot; we have it ready.",
  },
];

export const metadata: Metadata = {
  title: "Quinceañera Save-the-Date Session — Dallas–Fort Worth",
  description:
    "Your quinceañera Save-the-Date photoshoot is included with Essential, Signature, and Legacy — most DFW studios charge $150–$475. A relaxed pre-quince portrait session in her own dress, across Dallas–Fort Worth.",
  alternates: {
    canonical: "/quinceanera-save-the-date",
    languages: {
      "en-US": `${site.url}/quinceanera-save-the-date`,
      "es-MX": `${site.url}/es/save-the-date-quinceanera`,
      "x-default": `${site.url}/quinceanera-save-the-date`,
    },
  },
  openGraph: {
    title: `Quinceañera Save-the-Date Session — Dallas–Fort Worth · ${site.brand}`,
    description:
      "Included with Essential, Signature, and Legacy — others charge $150–$475. A pre-quince portrait session in her own dress, across DFW.",
    url: `${site.url}/quinceanera-save-the-date`,
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

export default async function SaveTheDatePage() {
  const url = `${site.url}/quinceanera-save-the-date`;

  const imgs = await getImagesBySection("save-the-date");
  const fallback = portfolioFallback.find((image) => image.section === "save-the-date");
  const hero = imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? (fallback ? { url: fallback.url, alt: fallback.alt, focus_x: null, focus_y: null } : null);
  const supporting = imgs.filter((image) => image.url !== hero?.url).slice(0, 2);
  const includedPackages = packages.filter((collection) => collection.id !== "moments");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "Quinceañera Save-the-Date Photoshoot",
        serviceType: "Quinceañera Save-the-Date Portrait Session",
        description:
          "A pre-quinceañera portrait session, included with Essential, Signature, and Legacy across Dallas–Fort Worth.",
        provider: { "@type": "Organization", name: site.brand, "@id": `${site.url}/#business` },
        areaServed: { "@type": "City", name: "Dallas–Fort Worth, TX" },
        url,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: STD_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Save-the-Date",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-line bg-white px-5 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
            Save-the-Date · Dallas–Fort Worth
          </p>
          <h1 className="mx-auto mt-5 max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.15] tracking-[-0.03em] text-ink">
            Her Save-the-Date session, included from Essential.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-soft">
            A relaxed portrait session before the big day — for the invitations,
            the guest board, and meeting your photographer first. Most Dallas–Fort
            Worth studios charge $150–$475 for it. It&apos;s included from Essential upward. Moments does not include it.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link href={site.cta.href} className="inline-flex min-h-12 items-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              {site.cta.label}
            </Link>
            <Link href={site.secondaryCta.href} className="inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">
              {site.secondaryCta.label}
            </Link>
            <Link href="/es/save-the-date-quinceanera" hrefLang="es" className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4">
              Ver esta página en español →
            </Link>
          </div>
        </div>
        <div className="relative mx-auto mt-12 aspect-[4/3] max-w-[90rem] overflow-hidden rounded-lg bg-accent-soft sm:aspect-[16/8]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || "Quinceañera Save-the-Date portrait session in Dallas–Fort Worth"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
            />
          ) : null}
        </div>
      </section>

      {/* What it is */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
        <Reveal className="flex flex-col gap-6">
          <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">
            What the Save-the-Date session is.
          </h2>
          <p className="text-base leading-relaxed text-ink-soft">
            It&apos;s a dedicated portrait session a few weeks to a few months before
            the celebration — no court, no schedule to race, just her. We choose a
            location across Dallas–Fort Worth that means something to your family,
            and the images carry the rest of the planning: the invitations, the
            guest sign-in board, the social posts counting down to the day.
          </p>
          <p className="text-base leading-relaxed text-ink-soft">
            It&apos;s also the easiest way to know your photographer before the
            celebration. By the time the misa comes around, we&apos;ve already worked
            together once — so the camera feels familiar and the day runs calmer.
          </p>
        </Reveal>
      </section>

      {supporting.length > 0 ? (
        <section className="mx-auto max-w-[90rem] px-5 pb-16 md:px-10 md:pb-20 lg:px-16" aria-label="Save-the-Date photographs">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {supporting.map((image) => (
              <div key={image.id ?? image.url} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-greige sm:aspect-[3/4]">
                <Image src={image.url} alt={image.alt || "Quinceañera Save-the-Date portrait"} fill sizes="(max-width: 640px) 50vw, 50vw" className="object-cover" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Her own dress — DARK contrast band (the honest answer to "dress included") */}
      <section className="bg-accent-soft">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-10 lg:px-16 md:py-20">
          <Reveal>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
              Her dress, her session
            </p>
            <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">
              No rental. No restrictions.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Some studios cap the Save-the-Date with a borrowed gown or limit which
              dress she can wear. Here she wears her own — the real quince dress, a
              casual look, or both in one session. It&apos;s her milestone; nothing
              about it is a stock package.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Included free vs the add-on — grounded in live competitor pricing */}
      <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <Reveal>
          <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">
            Included, not an add-on.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Across DFW, the Save-the-Date is usually sold separately — a $150 to
            $475 line item on top of the day-of coverage. Essential, Signature, and Legacy
            include it, start to finish. Moments does not.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {includedPackages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 80}
              className={`flex h-full flex-col border p-7 ${
                p.highlight ? "border-ink bg-accent-soft" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                {p.highlight ? (
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
                    Most Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-5 font-display text-[2rem] text-ink">{p.priceLabel}</p>
              <p className="mt-2 text-base text-ink-soft">
                Save-the-Date included
              </p>
              <p className="mt-4 flex-1 text-base leading-7 text-ink-soft">
                {p.teaser}
              </p>
              <CTAButton
                href={`/reserve?collection=${p.id}`}
                variant="ink"
                className="mt-6 min-h-12 w-full text-base"
              >
                Reserve {p.name}
              </CTAButton>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-base">
          <Link
            href="/investment"
            className="text-ink underline underline-offset-2 hover:text-ink-soft"
          >
            See everything included in each collection →
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
        <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">
          Save-the-Date — questions, answered.
        </h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {STD_FAQS.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-display text-xl text-ink">{f.q}</dt>
              <dd className="mt-3 text-base leading-7 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* City links — pass weight to the money pages */}
      <section className="bg-accent-soft">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
          <p className="eyebrow mb-5">Across Dallas–Fort Worth</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quinceanera-photographer/dallas"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Quinceañera photographer in Dallas
            </Link>
            <Link
              href="/quinceanera-photographer/fort-worth"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Quinceañera photographer in Fort Worth
            </Link>
            <Link
              href="/quinceanera-photographer"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              All DFW areas →
            </Link>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
