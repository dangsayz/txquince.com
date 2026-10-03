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
  const isHome = pathname === "/" || pathname === "/es";
  const items = isSpanish ? spanish : english;
  const dateHref = isSpanish ? "/es/consulta" : "/check-your-date";
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

  const navLink = (item: { href: string; label: string }) => (
    <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="site-nav-link">
      {item.label}
    </Link>
  );

  return (
    <header className={`site-nav ${isHome ? "site-nav--home" : ""} ${open ? "site-nav--open" : ""}`}>
      <nav aria-label={isSpanish ? "Navegación principal" : "Main navigation"} className="site-nav-inner">
        <div className="site-nav-group site-nav-group--left">{items.slice(0, 3).map(navLink)}</div>
        <Link href={isSpanish ? "/es" : "/"} aria-label={isSpanish ? "TX Quince, inicio" : "TX Quince, home"} className="site-nav-brand"><Wordmark subline={false} /></Link>
        <div className="site-nav-group site-nav-group--right">
          {items.slice(3).map(navLink)}
          <Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} className="site-nav-link site-nav-language">{isSpanish ? "EN" : "ES"}</Link>
          <Link href={dateHref} className="site-nav-inquire">{isSpanish ? "Consultar fecha" : "Check a date"} <span aria-hidden="true">↗</span></Link>
        </div>
        <button type="button" className="site-nav-menu-button" onClick={() => setOpenPath((value) => value === pathname ? null : pathname)} aria-expanded={open} aria-controls="site-mobile-navigation" aria-label={open ? (isSpanish ? "Cerrar menú" : "Close menu") : (isSpanish ? "Abrir menú" : "Open menu")}>
          <span className="site-nav-menu-lines" aria-hidden="true"><span /><span /></span>
          <span>{open ? (isSpanish ? "Cerrar" : "Close") : (isSpanish ? "Menú" : "Menu")}</span>
        </button>
      </nav>
      <div id="site-mobile-navigation" className="site-nav-panel" hidden={!open}>
        <p className="site-nav-panel-label">{isSpanish ? "Descubre TX Quince" : "Discover TX Quince"}</p>
        {items.map((item, index) => (
          <Link key={item.href} href={item.href} onClick={() => setOpenPath(null)} className="site-nav-panel-link"><span>{item.label}</span><span>0{index + 1}</span></Link>
        ))}
        <div className="site-nav-panel-bottom">
          <Link href={dateHref} onClick={() => setOpenPath(null)} className="site-nav-panel-cta">{isSpanish ? "Consulta su fecha" : "Check her date"}<span aria-hidden="true">↗</span></Link>
          <Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} onClick={() => setOpenPath(null)} className="site-nav-panel-language">{isSpanish ? "English" : "Español"}</Link>
        </div>
      </div>
    </header>
  );
}
