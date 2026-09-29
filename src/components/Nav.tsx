"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";
import { Drawer } from "@/components/ui";

function Search({ mobile = false, onSubmit }: { mobile?: boolean; onSubmit?: () => void }) {
  const [suggesting, setSuggesting] = useState(false);
  const suggestions = [
    { label: "Portraits", query: "portraits" },
    { label: "Celebration", query: "celebration" },
    { label: "Fort Worth", query: "Fort Worth" },
  ];
  return (
    <form action="/portfolio" method="get" role="search" onSubmit={onSubmit} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggesting(false); }} onKeyDown={(event) => { if (event.key === "Escape") setSuggesting(false); }} className="relative w-full">
      <div className="relative">
        <label htmlFor={mobile ? "mobile-portfolio-search" : "desktop-portfolio-search"} className="sr-only">
          Search the portfolio
        </label>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint">
          <circle cx="10.8" cy="10.8" r="6.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="m15.5 15.5 4.3 4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          id={mobile ? "mobile-portfolio-search" : "desktop-portfolio-search"}
          name="q"
          type="search"
          onFocus={() => setSuggesting(true)}
          placeholder="Search quince moments"
          className="h-11 w-full rounded-lg border border-line bg-ivory pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-wine focus:bg-white focus:outline-none"
        />
      </div>
      {(mobile || suggesting) && (
        <div aria-label="Suggested portfolio searches" className={mobile ? "mt-4" : "absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-line bg-white p-4 shadow-xl"}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Explore moments</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <Link key={item.label} href={`/portfolio?q=${encodeURIComponent(item.query)}`} onMouseDown={(event) => event.preventDefault()} onClick={() => { setSuggesting(false); onSubmit?.(); }} className="inline-flex min-h-11 items-center rounded-full border border-line px-3 text-xs font-medium text-ink hover:border-wine hover:text-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">{item.label}</Link>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, [open]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
      <nav aria-label="Primary" className={`mx-auto flex max-w-[96rem] items-center gap-4 px-4 transition-[height] duration-200 motion-reduce:transition-none sm:px-6 lg:gap-6 lg:px-8 ${scrolled ? "h-[60px]" : "h-[72px]"}`}>
        <Link href="/" aria-label={`${site.brand} home`} className="shrink-0">
          <Wordmark subline={false} />
        </Link>
        <div className="mx-auto hidden w-full max-w-[420px] min-w-0 md:block">
          <Search />
        </div>
        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`text-[13px] font-medium transition-colors hover:text-wine ${pathname === item.href ? "text-wine" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/saved" aria-current={pathname === "/saved" ? "page" : undefined} className={`text-[13px] font-medium transition-colors hover:text-wine ${pathname === "/saved" ? "text-wine" : "text-ink-soft"}`}>Saved</Link>
        </div>
        <Link href={site.cta.href} className="ml-auto hidden shrink-0 items-center justify-center rounded-lg bg-wine px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-wine-deep md:inline-flex lg:ml-0">
          {site.cta.label}
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:bg-ivory md:ml-0 lg:hidden"
        >
          {open ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5"><path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          )}
        </button>
      </nav>
      <Drawer open={open} onClose={() => { setOpen(false); menuButtonRef.current?.focus(); }} title="Explore TX Quince">
          <div className="mb-4"><Search mobile onSubmit={() => setOpen(false)} /></div>
            <div className="grid gap-1">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-ivory"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/saved" aria-current={pathname === "/saved" ? "page" : undefined} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-ivory">Saved photos</Link>
              <Link href={site.secondaryCta.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-ivory">
                {site.secondaryCta.label}
              </Link>
              <Link href={site.cta.href} onClick={() => setOpen(false)} className="rounded-lg bg-wine px-3 py-3 text-sm font-semibold text-white hover:bg-wine-deep">
                {site.cta.label}
              </Link>
            </div>
      </Drawer>
    </header>
  );
}
