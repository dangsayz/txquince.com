import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { SocialProofStrip } from "@/components/SocialProofStrip";

/**
 * SAVE-THE-DATE landing page — a competitive wedge, not filler.
 *
 * The session every DFW studio sells as a $150–$475 add-on is included FREE in
 * every TX Quince collection. This page targets "quinceañera save the date
 * dallas" / "pre-quince photoshoot" and folds in the honest "your own dress,
 * no restrictions" answer to the "dress included" demand. Content-as-code; no
 * fabricated offers (no gown rental — we don't do that).
 */

const STD_FAQS = [
  {
    q: "How much does the Save-the-Date session cost?",
    a: "Nothing extra — it's included free in every collection: Essential, Signature, and Legacy. Most Dallas–Fort Worth studios sell the same session as a $150–$475 add-on. Here it's part of the booking.",
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
    a: "The Save-the-Date session is included with any collection. Reserve your date and it's already part of what you booked — there's nothing else to add or pay for.",
  },
  {
    q: "Are you insured?",
    a: "Yes — insured and venue-compliant, so your church and reception hall are covered. Many DFW parishes and venues ask for proof of insurance before they'll let a photographer shoot; we have it ready.",
  },
];

export const metadata: Metadata = {
  title: "Quinceañera Save-the-Date Session — Dallas–Fort Worth",
  description:
    "Your quinceañera Save-the-Date photoshoot is included free in every TX Quince collection — most DFW studios charge $150–$475. A relaxed pre-quince portrait session in her own dress, across Dallas–Fort Worth.",
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
      "Included free in every collection — others charge $150–$475. A pre-quince portrait session in her own dress, across DFW.",
    url: `${site.url}/quinceanera-save-the-date`,
  },
};

export default function SaveTheDatePage() {
  const url = `${site.url}/quinceanera-save-the-date`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "Quinceañera Save-the-Date Photoshoot",
        serviceType: "Quinceañera Save-the-Date Portrait Session",
        description:
          "A pre-quinceañera portrait session, included free in every TX Quince collection across Dallas–Fort Worth.",
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

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-section text-center md:px-10 lg:px-16 md:pt-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">Save-the-Date · Dallas–Fort Worth</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            Her Save-the-Date session, included.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            A relaxed portrait session before the big day — for the invitations,
            the guest board, and meeting your photographer first. Most Dallas–Fort
            Worth studios charge {/* market range from live competitor pricing */}
            $150–$475 for it. Here it&apos;s in every collection, free.
          </p>
          <p className="mt-4 text-sm">
            <Link
              href="/es/save-the-date-quinceanera"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
              hrefLang="es"
            >
              Ver esta página en español →
            </Link>
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <CTAButton href={site.cta.href} variant="primary">
              {site.cta.label}
            </CTAButton>
            <CTAButton href={site.secondaryCta.href} variant="text">
              {site.secondaryCta.label}
            </CTAButton>
          </div>
          <SocialProofStrip className="mt-10" />
        </Reveal>
      </section>

      {/* What it is */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="flex flex-col gap-6">
          <h2 className="display-2 text-ink text-balance">
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

      {/* Her own dress — the honest answer to "dress included" */}
      <section className="bg-greige">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="eyebrow mb-5">Her dress, her session</p>
            <h2 className="display-2 text-ink text-balance">
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
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <h2 className="display-2 text-ink text-balance">
            Included, not an add-on.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Across DFW, the Save-the-Date is usually sold separately — a $150 to
            $475 line item on top of the day-of coverage. Every TX Quince collection
            already includes it, start to finish.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {packages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 80}
              className={`flex h-full flex-col border p-7 ${
                p.highlight ? "border-wine bg-ivory" : "border-line bg-ivory"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                {p.highlight ? (
                  <span className="bg-wine px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-cream">
                    Most Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-5 font-display text-4xl text-ink">{p.priceLabel}</p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-wine-deep">
                Save-the-Date included
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                {p.teaser}
              </p>
              <CTAButton
                href={`/reserve?collection=${p.id}`}
                variant="ink"
                className="mt-6 w-full"
              >
                Reserve {p.name}
              </CTAButton>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm">
          <Link
            href="/investment"
            className="text-wine underline underline-offset-2 hover:text-wine-deep"
          >
            See everything included in each collection →
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <h2 className="display-2 text-ink">
          Save-the-Date — questions, answered.
        </h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {STD_FAQS.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-display text-xl text-ink">{f.q}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* City links — pass weight to the money pages */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Across Dallas–Fort Worth</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quinceanera-photographer/dallas"
              className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
            >
              Quinceañera photographer in Dallas
            </Link>
            <Link
              href="/quinceanera-photographer/fort-worth"
              className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
            >
              Quinceañera photographer in Fort Worth
            </Link>
            <Link
              href="/quinceanera-photographer"
              className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
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
