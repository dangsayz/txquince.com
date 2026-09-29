import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

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
    <section className="border-t border-line bg-ivory">
      <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <span className="text-sm font-medium text-ink-soft">
            {accent}
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">
            {headline}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-ink-soft">
            {sub}
          </p>
          <div className="mt-8 flex justify-center">
            <CTAButton href="/check-your-date" className="min-h-12 rounded-md px-7 text-base font-medium">
              Check her date
            </CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
