import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

/**
 * Closing CTA — light, editorial, scarcity-driven. A script accent over a serif
 * line and a single outlined pill (the ONE primary CTA). Reused across pages.
 */
export function FinalCTA({
  accent = "A few dates remain",
  headline = site.scarcity.finalBand,
  sub = "Tell me about your celebration and I'll personally reply within 24 hours.",
}: {
  accent?: string;
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="bg-dark">
      <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <span className="text-[0.66rem] uppercase tracking-[0.24em] text-wine">
            {accent}
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl display-2 text-cream text-balance">
            {headline}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/70">
            {sub}
          </p>
          <div className="mt-10 flex justify-center">
            <CTAButton href={site.cta.href} variant="onDark">
              {site.cta.label}
            </CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
