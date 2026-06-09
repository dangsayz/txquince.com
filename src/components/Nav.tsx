"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * Claura-style nav: left links · centered serif wordmark · espresso pill CTA.
 * Static within the framed page (the frame's overflow-hidden rules out sticky).
 * Phone-first: links collapse to a sheet behind a hamburger.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-4 md:px-8">
        {/* Left — desktop links / mobile hamburger */}
        <div className="flex items-center justify-start">
          <div className="hidden items-center gap-7 md:flex">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[0.82rem] font-medium transition-colors hover:text-wine ${
                  pathname === item.href ? "text-ink" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
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
        </div>

        {/* Center — wordmark */}
        <Link
          href="/"
          className="justify-self-center font-display text-2xl tracking-tight text-ink md:text-[1.7rem]"
          aria-label={`${site.brand} — home`}
        >
          {site.brand}
        </Link>

        {/* Right — espresso pill CTA */}
        <div className="flex items-center justify-end">
          <Link
            href={site.cta.href}
            className="btn-espresso px-4 py-2.5 text-[0.8rem] sm:px-5 sm:text-[0.85rem]"
          >
            {site.cta.label}
          </Link>
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
