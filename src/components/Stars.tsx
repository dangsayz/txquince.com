import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";

/** Five-star rating mark in the ink tone. Decorative glyphs, labeled for a11y. */
export function Stars({
  count = site.proof.stars,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <span className={`tq-pg-stars ${className}`} role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1"
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
