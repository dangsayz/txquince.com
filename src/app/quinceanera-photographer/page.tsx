import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { SocialProofStrip } from "@/components/SocialProofStrip";

export const metadata: Metadata = {
  title: "Quinceañera Photographer — Dallas–Fort Worth",
  description:
    "Cinematic quinceañera photography & film across Dallas–Fort Worth — Grand Prairie, Irving, Garland, Dallas, Fort Worth, Arlington, Mansfield, and Farmers Branch. Fixed-price collections from $1,800.",
  alternates: { canonical: "/quinceanera-photographer" },
  openGraph: {
    title: `Quinceañera Photographer — Dallas–Fort Worth · ${site.brand}`,
    description:
      "Quinceañera photography & film across the DFW metroplex. Fixed-price collections from $1,800.",
    url: `${site.url}/quinceanera-photographer`,
  },
};

export default function LocationsHub() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pt-section text-center md:px-10 lg:px-16 md:pt-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">Areas Served</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            Quinceañera photography across Dallas–Fort Worth.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            One photographer, one celebration a day, the whole metroplex. Find
            your city below — la misa, portraits, el vals, and the reception,
            documented start to finish.
          </p>
          <div className="mt-9 flex justify-center">
            <CTAButton href={site.cta.href} variant="primary">
              {site.cta.label}
            </CTAButton>
          </div>
          <SocialProofStrip className="mt-10" />
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <div className="grid gap-5 sm:grid-cols-2">
          {locations.map((l, i) => (
            <Reveal key={l.slug} delay={i * 60}>
              <Link
                href={`/quinceanera-photographer/${l.slug}`}
                className="group block h-full border border-line bg-ivory p-7 transition-colors hover:border-wine"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl text-ink">{l.city}</h2>
                  <span className="text-[0.66rem] uppercase tracking-[0.16em] text-ink-faint">
                    {l.tier === "premium" ? "Premium" : "TX"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {l.lead}
                </p>
                <span className="mt-5 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-wine">
                  Quinceañera photographer in {l.city} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
