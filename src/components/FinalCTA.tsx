import Link from "next/link";
import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";

/**
 * Accent CTA band — scarcity-driven, reused across pages. The ONE primary CTA.
 * `headline`/`sub` default to the global scarcity copy but can be overridden
 * per page.
 */
export function FinalCTA({
  headline = site.scarcity.finalBand,
  sub = "Tell me about your celebration and I'll personally reply within 24 hours.",
}: {
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="bg-wine text-cream">
      <div className="mx-auto max-w-4xl px-5 py-section text-center md:px-8 md:py-section-lg">
        <Reveal>
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-cream text-balance sm:text-4xl md:text-5xl">
            {headline}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm text-cream/75">{sub}</p>
          <div className="mt-9 flex justify-center">
            <Link
              href={site.cta.href}
              className="inline-flex items-center justify-center bg-cream px-10 py-4 text-sm tracking-wide text-ink transition-all duration-300 hover:bg-ivory hover:-translate-y-0.5"
            >
              {site.cta.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
