"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";

const english = [
  { href: "/portfolio", label: "The work" },
  { href: "/investment", label: "Collections" },
  { href: "/quinceanera-guide", label: "The guide" },
  { href: "/quinceanera-photographer", label: "Areas served" },
  { href: "/about", label: "About" },
];

const spanish = [
  { href: "/portfolio", label: "Portafolio" },
  { href: "/es/paquetes", label: "Colecciones" },
  { href: "/es/blog", label: "La guía" },
  { href: "/es/fotografo-de-quinceaneras", label: "Áreas" },
  { href: "/about", label: "Nosotros" },
];

export function Nav() {
  const pathname = usePathname();
  const isSpanish = pathname === "/es" || pathname.startsWith("/es/");
  const items = isSpanish ? spanish : english;
  const action = isSpanish ? { href: "/es/consulta", label: "Consulta su fecha", compact: "Consultar fecha" } : { href: "/check-your-date", label: "Check her date", compact: "Check date" };
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
    <header className="sticky top-0 z-40 border-b border-[#deddd9] bg-[#f7f6f3]/95 backdrop-blur-md">
      <nav aria-label={isSpanish ? "Navegación principal" : "Main navigation"} className="mx-auto grid min-h-[72px] max-w-[96rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6 lg:px-12">
        <Link href={isSpanish ? "/es" : "/"} aria-label={isSpanish ? "TX Quince, inicio" : "TX Quince, home"} className="inline-flex min-h-12 w-fit items-center whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 lg:justify-self-start">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-1 lg:flex xl:gap-3">
          {items.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={`inline-flex min-h-12 items-center whitespace-nowrap px-2 text-sm font-normal transition-colors hover:text-[#111] ${pathname === item.href ? "text-[#111] underline underline-offset-[0.45rem]" : "text-[#575752]"}`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center justify-self-end gap-4 lg:flex">
          <Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} className="inline-flex min-h-12 items-center px-2 text-sm text-[#575752] hover:text-[#111]">{isSpanish ? "EN" : "ES"}</Link>
          <Link href={action.href} className="inline-flex min-h-12 items-center justify-center gap-5 whitespace-nowrap bg-[#252522] px-5 text-sm font-medium text-white hover:bg-[#42423d]">{action.label}<span aria-hidden="true">↗</span></Link>
        </div>

        <div className="flex items-center justify-self-end gap-2 lg:hidden">
          <Link href={action.href} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap bg-[#252522] px-3 text-[clamp(0.8rem,3.3vw,0.9rem)] font-medium text-white hover:bg-[#42423d] sm:px-5">{action.compact}</Link>
          <button type="button" onClick={() => setOpenPath((value) => value === pathname ? null : pathname)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? (isSpanish ? "Cerrar menú" : "Close menu") : (isSpanish ? "Abrir menú" : "Open menu")} className="inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] text-[#252522]">
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-[#deddd9] bg-[#f7f6f3] lg:hidden">
          <div className="mx-auto flex max-w-[90rem] flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-6 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.14em] text-[#62625c]">{isSpanish ? "Explorar TX Quince" : "Explore TX Quince"}</p>
            {items.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpenPath(null)} className="flex min-h-[4.25rem] items-center justify-between gap-4 border-t border-[#cac9c4] text-xl font-normal tracking-[-0.03em] text-[#252522]"><span>{item.label}</span><span className="text-xs text-[#666660]">0{index + 1}</span></Link>)}
            <Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} onClick={() => setOpenPath(null)} className="mt-4 inline-flex min-h-12 items-center text-base text-[#252522]">{isSpanish ? "English" : "Español"} ↗</Link>
          </div>
        </div>
      )}
    </header>
  );
}
