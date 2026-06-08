import { site } from "@/content/site";

/**
 * Sticky thin top bar — scarcity everywhere (CONVERSION MECHANICS LAW).
 * Copy is driven from content/site.ts so the operator edits it as he books.
 */
export function ScarcityBar() {
  return (
    <div className="bg-wine text-cream">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[0.72rem] tracking-[0.12em] uppercase">
        {site.scarcity.barText}
      </p>
    </div>
  );
}
