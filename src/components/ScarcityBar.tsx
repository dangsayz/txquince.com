import { site } from "@/content/site";

/**
 * Top availability line — scarcity everywhere (CONVERSION MECHANICS LAW), but
 * styled like an editorial dateline, not a banner. A soft ivory ground (no loud
 * slab), refined mixed-case copy, and a single living detail: a gently pulsing
 * wine dot that reads as a real-time "a few dates left" signal. Wine appears
 * only as an accent. Copy is driven from content/site.ts.
 */
export function ScarcityBar() {
  return (
    <div className="border-b border-line/70 bg-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-4 py-2.5 text-center">
        {/* Live availability indicator — the one "alive" detail. */}
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wine/50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-wine" />
        </span>
        <p className="text-[0.78rem] leading-none text-ink-soft">
          Booked through{" "}
          <span className="font-medium text-ink">{site.scarcity.bookedThrough}</span>
          <span className="mx-2 text-line" aria-hidden>
            ·
          </span>
          now reserving a few{" "}
          <span className="font-medium text-ink">{site.scarcity.reservingYear}</span>{" "}
          dates
        </p>
      </div>
    </div>
  );
}
