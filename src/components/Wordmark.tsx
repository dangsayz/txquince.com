/**
 * Wordmark — an editorial logotype, fashion-masthead minimal.
 *
 * One thin, wide-tracked serif line (Cormorant 300) in a single ink tone — no
 * colour accent, no rules, no flourish. An optional hairline-quiet subline sits
 * far below in tiny tracked caps. Type-only: it scales, prints, never pixelates.
 */
export function Wordmark({ subline = true }: { subline?: boolean }) {
  return (
    <span className="inline-flex flex-col items-start">
      <span className="font-display text-[1.4rem] font-light leading-none tracking-[0.34em] text-ink md:text-[1.6rem]">
        TX&nbsp;QUINCE
      </span>
      {subline ? (
        <span className="mt-2.5 hidden text-[0.46rem] uppercase leading-none tracking-[0.46em] text-ink-faint sm:block">
          Photography&nbsp;&amp;&nbsp;Film
        </span>
      ) : null}
    </span>
  );
}
