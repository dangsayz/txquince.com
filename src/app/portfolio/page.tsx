import type { Metadata } from "next";
import { gallerySections } from "@/content/gallery";
import { site } from "@/content/site";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Quinceañera galleries across Dallas–Fort Worth — save-the-date, la misa, portraits, the celebration, and films.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · TX Quince",
    description:
      "Quinceañera galleries across Dallas–Fort Worth — church, portraits, the celebration, and films.",
    url: `${site.url}/portfolio`,
  },
};

export default function PortfolioPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-section md:px-8 md:pt-section-lg">
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-5">Portfolio</p>
          <h1 className="font-display text-4xl leading-[1.06] text-ink text-balance md:text-6xl">
            The day, kept exactly as it felt.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            A selection from quinceañeras across Dallas–Fort Worth — from the quiet
            of la misa to the last dance of the night.
          </p>
        </Reveal>
      </section>

      {gallerySections.map((section) => (
        <section
          key={section.id}
          className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg"
        >
          <Reveal className="mb-10 max-w-2xl md:mb-12">
            <p className="eyebrow mb-4">{section.eyebrow}</p>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              {section.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {section.intro}
            </p>
          </Reveal>
          <PortfolioGallery images={section.images} />
        </section>
      ))}

      <FinalCTA />
    </>
  );
}
