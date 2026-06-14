/**
 * Wordmark — the logotype, set in a high-contrast Didone (Bodoni Moda) rather
 * than the body Garamond, so it reads as a fashion masthead: thin hairlines,
 * dramatic stroke contrast, refined caps. Single ink tone, no rule, no accent.
 * Type-only: it scales, prints, never pixelates.
 */
export function Wordmark({ subline = true }: { subline?: boolean }) {
  return (
    <span className="inline-flex flex-col items-start">
      <span
        className="text-[1.5rem] leading-none tracking-[0.22em] text-ink md:text-[1.7rem]"
        style={{ fontFamily: "var(--font-logo)", fontWeight: 400 }}
      >
        TX&nbsp;QUINCE
      </span>
      {subline ? (
        <span className="mt-2.5 hidden text-[0.46rem] uppercase leading-none tracking-[0.44em] text-ink-faint sm:block">
          Photography&nbsp;&amp;&nbsp;Film
        </span>
      ) : null}
    </span>
  );
}
