/**
 * Wordmark — a single clean serif masthead string (Vogue-style).
 * "TX" in champagne gold (the Texas mark); the rest warm near-black ink.
 * Type-only by design: it scales, prints, and never pixelates. The
 * "Photography & Film" descriptor lives in the hero/footer — not repeated here.
 */
export function Wordmark() {
  return (
    <span className="font-display text-[1.4rem] leading-none tracking-[0.16em] text-ink md:text-[1.6rem]">
      <span className="text-wine">TX</span> QUINCE
    </span>
  );
}
