import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

export function FinalCTA({
  accent = "Start the conversation",
  headline = "Her day deserves to be remembered in full.",
  sub = "Tell us about your celebration. We'll personally confirm availability before any payment.",
}: {
  accent?: string;
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="border-t border-line bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <span className="tag">{accent}</span>
          <h2 className="mx-auto mt-5 max-w-2xl display-2 text-ink text-balance">
            {headline}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-soft">
            {sub}
          </p>
          <div className="mt-10 flex justify-center">
            <CTAButton href={site.cta.href} variant="primary">
              {site.cta.label}
            </CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
