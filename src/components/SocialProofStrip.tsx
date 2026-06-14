import { site } from "@/content/site";
import { Stars } from "@/components/Stars";

/**
 * Honest aggregate social proof (LAW 5: aggregate only — no individual minor
 * quotes here). Families served + average rating + service area. Reused on the
 * conversion pages (/reserve, /investment) because 56% of buyers want proof
 * BEFORE they commit (booking-funnel research). Values live in site.proof.
 */
export function SocialProofStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8 ${className}`}
    >
      <span className="text-sm font-medium tracking-wide text-ink">
        {site.proof.familiesLine}
      </span>
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <span className="flex items-center gap-2">
        <Stars />
        <span className="text-sm text-ink-soft">{site.proof.rating} average</span>
      </span>
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <span className="text-sm text-ink-soft">{site.serviceArea}</span>
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <span className="text-sm text-ink-soft">{site.proof.insuredLine}</span>
    </div>
  );
}
