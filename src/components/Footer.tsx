import Link from "next/link";
import { locations } from "@/content/locations";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";

export function Footer({ locale = "en" }: { locale?: "en" | "es" }) {
  const isSpanish = locale === "es";
  const explore = isSpanish
    ? [
        { label: "Portafolio", href: "/portfolio" },
        { label: "Colecciones", href: "/es/paquetes" },
        { label: "Video", href: "/es/videografo-de-quinceaneras" },
        { label: "Guía", href: "/es/blog" },
        { label: "Salones", href: "/es/salones" },
      ]
    : [
        { label: "The work", href: "/portfolio" },
        { label: "Collections", href: "/investment" },
        { label: "Film", href: "/quinceanera-videographer" },
        { label: "The guide", href: "/quinceanera-guide" },
        { label: "Venues", href: "/venues" },
      ];
  const studio = isSpanish
    ? [
        { label: "Nosotros", href: "/about" },
        { label: "Áreas de servicio", href: "/es/fotografo-de-quinceaneras" },
        { label: "Consulta una fecha", href: "/es/consulta" },
        { label: "Privacidad", href: "/privacy" },
      ]
    : [
        { label: "About", href: "/about" },
        { label: "Areas served", href: "/quinceanera-photographer" },
        { label: "Check your date", href: "/check-your-date" },
        { label: "Privacy", href: "/privacy" },
      ];

  return (
    <footer className="bg-[#29251f] text-[#f8f5ed]">
      <div className="mx-auto w-full max-w-[104rem] px-5 pb-8 pt-20 sm:px-8 lg:px-16 lg:pt-28">
        <div className="grid gap-10 border-b border-[#6b604e] pb-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:pb-24">
          <div>
            <p className="text-xs uppercase tracking-[0.17em] text-[#d1b04d]">{isSpanish ? "Para recordar siempre" : "Made to remember"}</p>
            <h2 className="mt-7 max-w-3xl font-display text-[clamp(2.1rem,4.5vw,4.75rem)] font-light leading-[1.2] tracking-[-0.03em]">{isSpanish ? "Que cada momento siga con ella." : "Let every moment stay with her."}</h2>
          </div>
          <Link href={isSpanish ? "/es/consulta" : "/check-your-date"} className="inline-flex min-h-12 items-center justify-between gap-10 border-b border-[#d1b04d] pb-2 text-xs uppercase tracking-[0.12em] whitespace-nowrap hover:text-[#d1b04d]">{isSpanish ? "Consulta su fecha" : "Check her date"}<span aria-hidden="true">↗</span></Link>
        </div>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-8 lg:py-20">
          <div>
            <Link href={isSpanish ? "/es" : "/"} className="inline-flex min-h-12 items-center text-[#f8f5ed]"><Wordmark size="masthead" subline={false} /></Link>
            <p className="mt-5 max-w-sm font-serif text-base leading-7 text-[#ded5c4]">{isSpanish ? "Fotografía y video de quinceañeras en Dallas–Fort Worth." : "Quinceañera photography and film across Dallas–Fort Worth."}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-[#d1b04d]">{isSpanish ? "Explorar" : "Explore"}</h3>
            <ul className="mt-5">{explore.map((item) => <li key={item.href}><Link href={item.href} className="inline-flex min-h-11 items-center text-base text-[#e8e1d4] hover:text-white">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-[#d1b04d]">{isSpanish ? "Estudio" : "Studio"}</h3>
            <ul className="mt-5">{studio.map((item) => <li key={item.href}><Link href={item.href} className="inline-flex min-h-11 items-center text-base text-[#e8e1d4] hover:text-white">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-[#d1b04d]">{isSpanish ? "Conectar" : "Connect"}</h3>
            <ul className="mt-5">
              {site.social.instagram && <li><a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base text-[#e8e1d4] hover:text-white">Instagram ↗</a></li>}
              {site.social.youtube && <li><a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base text-[#e8e1d4] hover:text-white">YouTube ↗</a></li>}
              {site.social.facebook && <li><a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base text-[#e8e1d4] hover:text-white">Facebook ↗</a></li>}
              <li><a href={`mailto:${site.contact.email}`} className="inline-flex min-h-11 items-center break-all text-base text-[#e8e1d4] hover:text-white">Email ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#6b604e] py-6">
          <p className="text-xs uppercase tracking-[0.15em] text-[#d1b04d]">{isSpanish ? "En Dallas–Fort Worth" : "Serving Dallas–Fort Worth"}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">{locations.map((location) => <Link key={location.slug} href={`${isSpanish ? "/es/fotografo-de-quinceaneras" : "/quinceanera-photographer"}/${location.slug}`} className="inline-flex min-h-11 items-center text-sm text-[#e8e1d4] hover:text-white">{location.city}</Link>)}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[#6b604e] pt-5 text-sm text-[#c8bcaa]">
          <p>© {new Date().getFullYear()} {site.brand} · {site.serviceArea}</p>
          <div className="flex items-center gap-5"><Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} className="inline-flex min-h-11 items-center hover:text-white">{isSpanish ? "English" : "Español"}</Link><Link href="/admin/login" className="inline-flex min-h-11 items-center hover:text-white">Studio</Link></div>
        </div>
      </div>
    </footer>
  );
}
