import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Reserve your date, see the portfolio, and explore collections for cinematic quinceañera photography & film across Dallas–Fort Worth.",
  alternates: { canonical: "/links" },
  robots: { index: false },
};

// Internal route links — tracked automatically by the global Tracker.
const links = [
  { href: "/reserve", label: "Reserve your date" },
  { href: "/portfolio", label: "See the portfolio" },
  { href: "/investment", label: "Collections & pricing" },
  { href: "/check-your-date", label: "Check if your date is open" },
] as const;

const arrow = (
  <span
    aria-hidden
    className="ml-3 text-lg leading-none transition-transform duration-300 group-hover:translate-x-0.5"
  >
    →
  </span>
);

export default function LinksPage() {
  return (
    <main className="bg-cream">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col items-center px-5 py-16 text-center md:py-24">
        {/* Masthead — script flourish, wordmark, tagline (matches the hero) */}
        <span
          className="script text-wine"
          style={{ fontSize: "1.9rem", lineHeight: 1 }}
        >
          Para siempre
        </span>

        <h1
          className="mt-3 font-display text-ink"
          style={{
            fontSize: "clamp(2.6rem,12vw,3.6rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          {site.brand}
        </h1>

        <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
          {site.tagline}
        </p>

        {/* Link pills */}
        <nav className="mt-10 flex w-full flex-col gap-3.5">
          {/* Primary — espresso solid */}
          <Link
            href={links[0].href}
            className="group flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-6 text-base font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3c2a1b]"
          >
            <span>{links[0].label}</span>
            {arrow}
          </Link>

          {/* Secondary internal links — soft ivory pills */}
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-line bg-ivory px-6 text-base font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-wine"
            >
              <span>{l.label}</span>
              {arrow}
            </Link>
          ))}

          {/* Instagram — external */}
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-line bg-ivory px-6 text-base font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-wine"
          >
            <span>Follow on Instagram</span>
            {arrow}
          </a>

          {/* Email — mailto */}
          <a
            href={`mailto:${site.contact.email}`}
            className="group flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-line bg-ivory px-6 text-base font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-wine"
          >
            <span>Email me</span>
            {arrow}
          </a>
        </nav>

        <p className="mt-auto pt-14 text-xs tracking-wide text-ink-faint">
          Dallas–Fort Worth, Texas
        </p>
      </div>
    </main>
  );
}
