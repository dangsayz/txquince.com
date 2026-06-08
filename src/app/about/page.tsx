import type { Metadata } from "next";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { Figure } from "@/components/Figure";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Reliable, bilingual quinceañera photography & film in Dallas–Fort Worth — built around the families other vendors let down.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · TX Quince",
    description:
      "Reliable, bilingual quinceañera photography & film in Dallas–Fort Worth.",
    url: `${site.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-section md:grid-cols-[1fr_1fr] md:gap-16 md:px-8 md:pt-section-lg">
        <Reveal className="md:order-2">
          <Figure
            imageKey={about.portraitKey}
            alt={about.portraitAlt}
            ratio="portrait"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Reveal>
        <div className="flex flex-col justify-center md:order-1">
          <Reveal>
            <p className="eyebrow mb-5">{about.eyebrow}</p>
            <h1 className="display-2 text-ink text-balance">{about.heading}</h1>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
        <div className="measure mx-auto flex flex-col gap-6 text-[1.05rem] leading-relaxed text-ink-soft md:text-lg">
          {about.story.map((p, i) => (
            <Reveal key={i} delay={i * 60} as="p">
              {p}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Culture + approach */}
      <section className="bg-greige">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-section md:grid-cols-2 md:gap-16 md:px-8 md:py-section-lg">
          <Reveal>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              {about.culture.heading}
            </h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-ink-soft">
              {about.culture.body}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              {about.approach.heading}
            </h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-ink-soft">
              {about.approach.body}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-3xl px-5 py-section text-center md:px-8 md:py-section-lg">
        <Reveal>
          <p className="font-display text-2xl leading-snug text-ink text-balance md:text-3xl">
            {about.closing}
          </p>
        </Reveal>
      </section>

      <FinalCTA />
    </>
  );
}
