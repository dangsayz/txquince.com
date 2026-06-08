"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { CTAButton } from "@/components/CTAButton";

/**
 * Minimal nav: logo · Portfolio · Investment · About · [Check Your Date].
 * Phone-first: links collapse into a simple sheet on mobile. The accent CTA
 * stays visible at all sizes (single primary CTA, site-wide).
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-cream/90 backdrop-blur-md"
          : "border-transparent bg-cream/70 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink md:text-2xl"
          aria-label={`${site.brand} — home`}
        >
          {site.brand}
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-9 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm tracking-wide transition-colors hover:text-ink ${
                pathname === item.href ? "text-ink" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <CTAButton href={site.cta.href} className="px-6 py-3 text-[0.8rem]">
            {site.cta.label}
          </CTAButton>
        </div>

        {/* Mobile: CTA + menu toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <CTAButton href={site.cta.href} className="px-5 py-2.5 text-[0.78rem]">
            {site.cta.label}
          </CTAButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center text-ink"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="flex flex-col gap-[5px]">
              <span
                className={`block h-px w-6 bg-ink transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span className={`block h-px w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span
                className={`block h-px w-6 bg-ink transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {open ? (
        <div className="border-t border-line bg-cream md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 py-2">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-4 text-base text-ink-soft last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
