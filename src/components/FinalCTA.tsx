import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

/**
 * Closing CTA — light, editorial, scarcity-driven. A script accent over a serif
 * line and a single outlined pill (the ONE primary CTA). Reused across pages.
 */
export function FinalCTA({
  accent = "The next step",
  headline = "Let's see if her date is still open.",
  sub = "Share the date you're considering. We'll personally reply within 24 hours, with no payment to ask.",
}: {
  accent?: string;
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="bg-dark">
      <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <span className="text-sm font-medium text-wine-tint">
            {accent}
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-serif text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] text-cream text-balance">
            {headline}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-7 text-cream/80">
            {sub}
          </p>
          <div className="mt-10 flex justify-center">
            <CTAButton href="/check-your-date" variant="onDark" className="min-h-12 px-7 text-base font-semibold">
              Check her date
            </CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
