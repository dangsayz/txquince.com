"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";

const inquiry = { href: "/check-your-date", label: "Check her date" };
const spanishNav = [
  { href: "/portfolio", label: "Portafolio" },
  { href: "/es/paquetes", label: "Paquetes" },
  { href: "/es/salones", label: "Salones" },
  { href: "/es/videografo-de-quinceaneras", label: "Video" },
  { href: "/es/blog", label: "Guía" },
];

export function Nav() {
  const pathname = usePathname();
  const isSpanish = pathname === "/es" || pathname.startsWith("/es/");
  const navItems = isSpanish ? spanishNav : site.nav;
  const action = isSpanish ? { href: "/es/consulta", label: "Consulta su fecha" } : inquiry;
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
      <nav aria-label="Main navigation" className="mx-auto flex min-h-[68px] max-w-[90rem] items-center justify-between gap-2 px-4 sm:px-5 md:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-5 lg:px-12">
        <Link href={isSpanish ? "/es" : "/"} aria-label={`${site.brand} — ${isSpanish ? "inicio" : "home"}`} className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap lg:justify-self-start">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-1 lg:flex lg:justify-self-center xl:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`inline-flex min-h-11 items-center whitespace-nowrap px-2 text-sm transition-colors hover:text-ink ${pathname === item.href ? "font-semibold text-ink" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center justify-self-end gap-2 lg:flex">
          <Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-soft hover:text-ink">
            {isSpanish ? "EN" : "ES"}
          </Link>
          <Link href={action.href} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong xl:px-5">
            {action.label} <span aria-hidden className="ml-2">→</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href={action.href} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-ink px-3 text-[clamp(0.8rem,3.3vw,0.9rem)] font-medium text-white transition-colors hover:bg-accent-strong sm:px-5">
            {isSpanish ? "Consultar fecha" : "Check date"}
          </Link>
          <button
            type="button"
            onClick={() => setOpenPath((value) => value === pathname ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? (isSpanish ? "Cerrar menú" : "Close menu") : (isSpanish ? "Abrir menú" : "Open menu")}
            className="inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-md text-ink"
          >
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-line bg-white lg:hidden">
          <div className="mx-auto flex max-w-[90rem] flex-col px-5 py-3 md:px-10">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpenPath(null)} className="inline-flex min-h-12 items-center border-b border-line text-base text-ink">
                {item.label}
              </Link>
            ))}
            <Link href={isSpanish ? "/es/consulta" : "/reserve"} onClick={() => setOpenPath(null)} className="inline-flex min-h-12 items-center text-base text-ink-soft">
              {isSpanish ? "¿Lista para reservar?" : "Ready to reserve?"} <span aria-hidden className="ml-2">→</span>
            </Link>
            <Link href={isSpanish ? "/" : "/es"} onClick={() => setOpenPath(null)} className="inline-flex min-h-12 items-center text-base text-ink-soft" hrefLang={isSpanish ? "en" : "es"}>
              {isSpanish ? "English" : "Español"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
