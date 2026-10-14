import Link from "next/link";
import "@/components/txq/pages/pages.css";

/**
 * FinalCTA — the closing band on sub pages: mono index, one display line, and
 * the primary action into the homepage intake (EN /#intake, ES /es#intake).
 */
export function FinalCTA({
  accent = "The next step",
  headline = "Let's see if her date is still open.",
  sub = "Share the date you're considering. We'll personally reply within 24 hours, with no payment to ask.",
  href = "/#intake",
  label = "Check her date",
  id,
}: {
  accent?: string;
  headline?: string;
  sub?: string;
  /** Primary action target. Defaults to the homepage intake. */
  href?: string;
  /** Primary action label. */
  label?: string;
  /** Optional id for the heading (defaults to a stable one). */
  id?: string;
}) {
  const titleId = id ?? "tq-pg-cta-title";
  return (
    <section className="tq-section" aria-labelledby={titleId}>
      <div className="tq-wrap">
        <div className="tq-pg-cta">
          <p className="tq-mono" style={{ margin: 0 }}>
            [{accent}]
          </p>
          <div className="tq-pg-cta__main">
            <h2 id={titleId} className="tq-display tq-pg-cta__title">
              {headline}
            </h2>
            <p className="tq-pg-cta__dek">{sub}</p>
          </div>
          <div className="tq-pg-cta__act">
            <Link href={href} className="tq-btn tq-btn--lg">
              {label} <span className="tq-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
