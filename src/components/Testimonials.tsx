import { releasedTestimonials } from "@/content/testimonials";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { Figure } from "@/components/Figure";
import "@/components/txq/pages/pages.css";

/**
 * Social proof on the conversion pages. CONSENT LAW (LAW 5): only
 * release-cleared testimonials ever render; if none are cleared yet, the whole
 * section returns null (no empty state, never a fabricated quote).
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
      <SectionHeading eyebrow={eyebrow}>{heading}</SectionHeading>
      <ul className="tq-pg-quotes">
        {items.map((t, i) => (
          <Reveal as="li" key={i} delay={i * 90}>
            {t.photoKey ? (
              <Figure
                imageKey={t.photoKey}
                alt={t.photoAlt ?? `${t.daughterName}'s quinceañera`}
                ratio="landscape"
                sizes="(max-width: 960px) 100vw, 33vw"
              />
            ) : null}
            <span className="tq-mono tq-muted">[{String(i + 1).padStart(2, "0")}]</span>
            <Stars />
            <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
            <p className="tq-mono tq-muted" style={{ margin: 0 }}>
              {t.momName} · {t.daughterName}&apos;s quinceañera
              {t.location ? ` · ${t.location}` : ""}
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
