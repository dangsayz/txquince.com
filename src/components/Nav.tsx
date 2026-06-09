"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * Editorial nav — serif wordmark left; tiny-caps tracked links right; the CTA
 * is a wine caps link, not a pill. Hairline below; generous height. Mobile
 * collapses to a hamburger + caps sheet (Esc closes).
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the sheet on Escape (and whenever the route changes).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-5 md:px-8 md:py-6">
        {/* Wordmark — left, like a masthead */}
        <Link
          href="/"
          className="font-display text-[1.45rem] tracking-tight text-ink md:text-[1.6rem]"
          aria-label={`${site.brand} — home`}
        >
          {site.brand}
        </Link>

        {/* Right — tracked caps links + wine CTA */}
        <div className="hidden items-baseline gap-9 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[0.66rem] uppercase tracking-[0.22em] transition-colors hover:text-ink ${
                pathname === item.href
                  ? "text-ink underline decoration-wine underline-offset-[6px]"
                  : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={site.cta.href}
            className="text-[0.66rem] uppercase tracking-[0.22em] text-wine-deep underline decoration-wine-deep/40 underline-offset-[6px] transition-colors hover:text-wine hover:decoration-wine"
          >
            {site.cta.label}
          </Link>
        </div>

        {/* Mobile hamburger — right */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
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
      </nav>

      {/* Mobile sheet — caps, hairlines, one wine CTA row */}
      {open ? (
        <div className="border-t border-ink/10 bg-cream md:hidden">
          <div className="mx-auto flex max-w-[90rem] flex-col px-5 py-3">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/[0.07] py-4 text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={site.cta.href}
              onClick={() => setOpen(false)}
              className="py-4 text-[0.72rem] uppercase tracking-[0.22em] text-wine-deep"
            >
              {site.cta.label} →
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
