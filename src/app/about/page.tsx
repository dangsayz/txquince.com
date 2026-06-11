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
      {/* Spread — portrait right, statement pinned low-left, museum air above. */}
      <section className="mx-auto grid max-w-[90rem] gap-10 px-5 pt-16 md:grid-cols-12 md:gap-8 md:px-10 lg:px-16 md:pt-24">
        <Reveal className="md:order-2 md:col-span-6 md:col-start-7">
          <Figure
            imageKey={about.portraitKey}
            alt={about.portraitAlt}
            ratio="portrait"
            sizes="(max-width: 768px) 100vw, 46vw"
          />
        </Reveal>
        <div className="flex flex-col justify-end pb-2 md:order-1 md:col-span-5 md:pb-10">
          <Reveal>
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
              {about.eyebrow}
            </p>
            <h1
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(2.4rem,5vw,4.4rem)", lineHeight: 1, letterSpacing: "-0.024em" }}
            >
              {about.heading}
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Story — narrow measure, offset right like a magazine column. */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 lg:px-16 md:py-36">
        <div className="grid md:grid-cols-12">
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint md:col-span-3">
            The story
          </p>
          <div className="mt-8 flex max-w-prose flex-col gap-6 text-[1.02rem] leading-relaxed text-ink-soft md:col-span-7 md:col-start-5 md:mt-0">
            {about.story.map((p, i) => (
              <Reveal key={i} delay={i * 60} as="p">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Culture + approach — white band, hairline-separated columns. */}
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto grid max-w-[90rem] gap-14 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 lg:px-16 md:py-28">
          <Reveal>
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">La cultura</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">
              {about.culture.heading}
            </h2>
            <p className="mt-5 max-w-prose text-[0.98rem] leading-relaxed text-ink-soft">
              {about.culture.body}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">The approach</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">
              {about.approach.heading}
            </h2>
            <p className="mt-5 max-w-prose text-[0.98rem] leading-relaxed text-ink-soft">
              {about.approach.body}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing — one italic line, left, large. */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 lg:px-16 md:py-36">
        <Reveal>
          <p
            className="max-w-3xl font-display italic leading-snug text-ink"
            style={{ fontSize: "clamp(1.7rem,3.4vw,2.8rem)" }}
          >
            {about.closing}
          </p>
        </Reveal>
      </section>

      <FinalCTA />
    </>
  );
}
