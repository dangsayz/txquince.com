/**
 * Wordmark — a single clean serif masthead string (Vogue-style).
 * "TX" in wine (the Texas mark); the rest espresso. Type-only by design: it
 * scales, prints, and never pixelates. The "Photography & Film" descriptor
 * lives in the hero/footer — it is intentionally NOT repeated here.
 */
export function Wordmark() {
  return (
    <span className="font-display text-[1.4rem] leading-none tracking-[0.16em] text-ink md:text-[1.6rem]">
      <span className="text-wine-deep">TX</span> QUINCE
    </span>
  );
}
