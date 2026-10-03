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
    <footer className="border-t border-[#d3d2cc] bg-[#f7f6f3] text-[#252522]">
      <div className="mx-auto max-w-[88rem] px-5 pb-28 pt-16 sm:px-8 md:pb-7 lg:px-12 lg:pt-20">
        <div className="grid gap-12 border-b border-[#c6c5c0] pb-14 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.6fr))] lg:gap-10">
          <div>
            <Link href={isSpanish ? "/es" : "/"} className="inline-flex min-h-12 items-center"><Wordmark size="masthead" subline={false} /></Link>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#51514d]">{isSpanish ? "Fotografía y video de quinceañeras en Dallas–Fort Worth." : "Quinceañera photography and film across Dallas–Fort Worth."}</p>
            <Link href={isSpanish ? "/es/consulta" : "/check-your-date"} className="mt-7 inline-flex min-h-12 items-center gap-5 border-b border-[#252522] text-base font-medium">{isSpanish ? "Consulta su fecha" : "Check her date"}<span aria-hidden="true">↗</span></Link>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[#666660]">{isSpanish ? "Explorar" : "Explore"}</h2>
            <ul className="mt-4">{explore.map((item) => <li key={item.href}><Link href={item.href} className="inline-flex min-h-11 items-center text-base hover:underline hover:underline-offset-4">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[#666660]">{isSpanish ? "Estudio" : "Studio"}</h2>
            <ul className="mt-4">{studio.map((item) => <li key={item.href}><Link href={item.href} className="inline-flex min-h-11 items-center text-base hover:underline hover:underline-offset-4">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[#666660]">{isSpanish ? "Conectar" : "Connect"}</h2>
            <ul className="mt-4">
              {site.social.instagram && <li><a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base hover:underline hover:underline-offset-4">Instagram ↗</a></li>}
              {site.social.youtube && <li><a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base hover:underline hover:underline-offset-4">YouTube ↗</a></li>}
              {site.social.facebook && <li><a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base hover:underline hover:underline-offset-4">Facebook ↗</a></li>}
              <li><a href={`mailto:${site.contact.email}`} className="inline-flex min-h-11 items-center break-all text-base hover:underline hover:underline-offset-4">Email ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="grid gap-4 border-b border-[#d3d2cc] py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#666660]">{isSpanish ? "En Dallas–Fort Worth" : "Serving Dallas–Fort Worth"}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">{locations.map((location) => <Link key={location.slug} href={`${isSpanish ? "/es/fotografo-de-quinceaneras" : "/quinceanera-photographer"}/${location.slug}`} className="inline-flex min-h-11 items-center text-sm text-[#51514d] hover:text-[#252522] hover:underline hover:underline-offset-4">{location.city}</Link>)}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-5 text-sm text-[#666660]">
          <p>© {new Date().getFullYear()} {site.brand} · {site.serviceArea}</p>
          <div className="flex items-center gap-5"><Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"} className="inline-flex min-h-11 items-center hover:text-[#252522]">{isSpanish ? "English" : "Español"}</Link><Link href="/admin/login" className="inline-flex min-h-11 items-center hover:text-[#252522]">Studio</Link></div>
        </div>
      </div>
    </footer>
  );
}
