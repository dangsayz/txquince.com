/**
 * Wordmark — "Stacked Flag" brand mark (Vogue/editorial Didone).
 *
 * A large Didone "TX" monogram over a hairline-tracked gold label. Type-only,
 * so it scales, prints, and never pixelates. The same mark serves the nav
 * (small) and the footer/hero (large) via the `size` prop. This is also the
 * social-avatar / favicon lockup — one mark everywhere.
 */
export function Wordmark({
  size = "nav",
  tone = "light",
}: {
  size?: "nav" | "masthead";
  /** "dark" renders the monogram in cream for placement on a dark surface. */
  tone?: "light" | "dark";
}) {
  const tx =
    size === "masthead"
      ? "text-5xl md:text-6xl"
      : "text-[1.75rem] md:text-[1.95rem]";
  const label =
    size === "masthead"
      ? "text-[0.7rem] tracking-[0.5em] indent-[0.5em] mt-2.5"
      : "text-[0.5rem] tracking-[0.44em] indent-[0.44em] mt-1.5";

  return (
    <span className="inline-flex flex-col items-center leading-[0.84]">
      <span className={`font-didone font-normal ${tone === "dark" ? "text-cream" : "text-ink"} ${tx}`}>TX</span>
      <span className={`font-body font-medium uppercase text-wine ${label}`}>
        Quince · DFW
      </span>
    </span>
  );
}
