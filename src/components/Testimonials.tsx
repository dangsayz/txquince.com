import { releasedTestimonials } from "@/content/testimonials";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { Figure } from "@/components/Figure";

/**
 * Social proof on the conversion pages — 56% of buyers want reviews BEFORE they
 * inquire (booking-funnel research). CONSENT LAW (LAW 5): only release-cleared
 * testimonials ever render; if none are cleared yet, the whole section returns
 * null (no empty state, never a fabricated quote). The moment a real testimonial
 * is set `released: true` in src/content/testimonials.ts, it appears here.
 */
export function Testimonials({
  eyebrow = "In their words",
  heading = "Families who trusted me with their day.",
  limit = 3,
  className = "",
}: {
  eyebrow?: string;
  heading?: string;
  limit?: number;
  className?: string;
}) {
  const items = releasedTestimonials().slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className={className}>
      <SectionHeading eyebrow={eyebrow} align="center" className="mx-auto max-w-2xl">
        {heading}
      </SectionHeading>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={i} delay={i * 90} className="flex flex-col">
            {t.photoKey ? (
              <Figure
                imageKey={t.photoKey}
                alt={t.photoAlt ?? `${t.daughterName}'s quinceañera`}
                ratio="landscape"
                sizes="(max-width: 768px) 100vw, 33vw"
                className="mb-6"
              />
            ) : null}
            <Stars className="mb-4" />
            <blockquote className="font-display text-xl leading-snug text-ink">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <p className="mt-5 text-sm text-ink-soft">
              {t.momName} · {t.daughterName}&apos;s quinceañera
              {t.location ? ` · ${t.location}` : ""}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
