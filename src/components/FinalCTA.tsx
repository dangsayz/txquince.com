import Link from "next/link";

export function FinalCTA({
  accent = "The next step",
  headline = "Let's see if her date is still open.",
  sub = "Share the date you're considering. We'll personally reply within 24 hours, with no payment to ask.",
}: {
  accent?: string;
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="border-t border-line bg-[#f4f2ee]" aria-label={accent}>
      <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.26fr)_minmax(0,0.74fr)] lg:gap-12 lg:px-16 lg:py-24">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{accent}</p>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10">
          <div>
            <h2 className="max-w-[24ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight tracking-[-0.03em] text-ink">{headline}</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-ink-soft">{sub}</p>
          </div>
          <Link href="/check-your-date" className="inline-flex min-h-12 w-fit items-center justify-center gap-5 bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-ink-soft">
            Check her date <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
