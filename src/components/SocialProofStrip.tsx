import { site } from "@/content/site";

export function SocialProofStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8 ${className}`}
    >
      <span className="text-sm font-medium tracking-wide text-ink">{site.serviceArea}</span>
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <span className="text-sm text-ink-soft">Photography &amp; film</span>
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <span className="text-sm text-ink-soft">English &amp; Spanish</span>
    </div>
  );
}
