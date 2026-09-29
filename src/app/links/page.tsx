import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Reserve your date, see the portfolio, and explore collections for cinematic quinceañera photography & film across Dallas–Fort Worth.",
  alternates: { canonical: "/links" },
  robots: { index: false },
};

const links = [
  { href: "/reserve", label: "Reserve your date" },
  { href: "/portfolio", label: "See the portfolio" },
  { href: "/investment", label: "Collections & pricing" },
  { href: "/check-your-date", label: "Check if your date is open" },
] as const;

export default function LinksPage() {
  return (
    <section className="bg-ivory px-5 py-12 sm:px-6 md:py-20">
      <div className="mx-auto max-w-lg rounded-xl border border-line bg-white px-5 py-10 text-center shadow-[0_12px_40px_-32px_rgba(33,29,31,.28)] sm:px-10">
        <Badge>Para siempre</Badge>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-none text-ink">{site.brand}</h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-ink-soft">{site.tagline}</p>
        <nav aria-label="Quick links" className="mt-9 grid gap-3">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors ${index === 0 ? "border-wine bg-wine text-white hover:border-wine-deep hover:bg-wine-deep" : "border-line bg-white text-ink hover:border-wine hover:text-wine"}`}>
              {link.label}<span aria-hidden="true">↗</span>
            </Link>
          ))}
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between rounded-lg border border-line px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:border-wine hover:text-wine">Follow on Instagram<span aria-hidden="true">↗</span></a>
          <a href={`mailto:${site.contact.email}`} className="flex min-h-12 items-center justify-between rounded-lg border border-line px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:border-wine hover:text-wine">Email me<span aria-hidden="true">↗</span></a>
        </nav>
        <p className="mt-9 text-xs text-ink-faint">Dallas–Fort Worth, Texas</p>
      </div>
    </section>
  );
}
