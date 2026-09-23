"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";

const inquiry = { href: "/check-your-date", label: "Check her date" };

export function Nav() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-[76px] max-w-[90rem] items-center justify-between gap-3 px-5 md:px-10 lg:px-16">
        <Link href="/" aria-label={`${site.brand} — home`} className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-1 lg:flex xl:gap-3">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`inline-flex min-h-11 items-center whitespace-nowrap px-2.5 text-sm transition-colors hover:text-ink ${pathname === item.href ? "font-semibold text-ink" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href={inquiry.href} className="ml-2 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/85">
            {inquiry.label} <span aria-hidden className="ml-2">→</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href={inquiry.href} className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-ink px-4 text-[clamp(0.8rem,3.3vw,0.9rem)] font-semibold text-white sm:px-5">
            Check date
          </Link>
          <button
            type="button"
            onClick={() => setOpenPath((value) => value === pathname ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] text-ink"
          >
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-navigation" className="border-t border-line bg-white lg:hidden">
          <div className="mx-auto flex max-w-[90rem] flex-col px-5 py-3 md:px-10">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpenPath(null)} className="inline-flex min-h-12 items-center border-b border-line text-base text-ink">
                {item.label}
              </Link>
            ))}
            <Link href="/reserve" onClick={() => setOpenPath(null)} className="inline-flex min-h-12 items-center text-base text-ink-soft">
              Ready to reserve? <span aria-hidden className="ml-2">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
