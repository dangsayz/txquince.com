/**
 * Wordmark — a composed masthead lockup, not a bare brand string.
 * Tracked display caps (TX in wine — the Texas mark), with a hairline-flanked
 * "Photography & Film" sub-line whose ampersand is the one italic flourish.
 * Type-only by design: it scales, prints, and never pixelates.
 */
export function Wordmark({ subline = true }: { subline?: boolean }) {
  return (
    <span className="inline-flex flex-col">
      <span className="font-display text-[1.28rem] leading-none tracking-[0.18em] text-ink md:text-[1.42rem]">
        <span className="text-wine-deep">TX</span> QUINCE
      </span>
      {subline ? (
        <span className="mt-[7px] hidden items-center gap-2.5 sm:inline-flex">
          <span aria-hidden className="h-px w-6 bg-ink/25" />
          <span className="text-[0.5rem] uppercase leading-none tracking-[0.34em] text-ink-faint">
            Photography{" "}
            <span className="font-display text-[0.66rem] normal-case italic leading-none tracking-normal text-wine-deep">
              &amp;
            </span>{" "}
            Film
          </span>
          <span aria-hidden className="h-px w-6 bg-ink/25" />
        </span>
      ) : null}
    </span>
  );
}
