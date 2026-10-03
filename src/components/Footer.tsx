import Image from "next/image";
import Link from "next/link";
import { locations } from "@/content/locations";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";

export function Footer({ locale = "en" }: { locale?: "en" | "es" }) {
  const isSpanish = locale === "es";
  const inquiryHref = isSpanish ? "/es/consulta" : "/check-your-date";
  const work = isSpanish
    ? [
        { label: "Portafolio", href: "/portfolio" },
        { label: "Colecciones", href: "/es/paquetes" },
        { label: "Video", href: "/es/videografo-de-quinceaneras" },
        { label: "La guía", href: "/es/blog" },
        { label: "Salones", href: "/es/salones" },
      ]
    : [
        { label: "Portfolio", href: "/portfolio" },
        { label: "Collections", href: "/investment" },
        { label: "Film", href: "/quinceanera-videographer" },
        { label: "The guide", href: "/quinceanera-guide" },
        { label: "Venues", href: "/venues" },
      ];
  const studio = isSpanish
    ? [
        { label: "Nosotros", href: "/about" },
        { label: "Áreas de servicio", href: "/es/fotografo-de-quinceaneras" },
        { label: "Consulta una fecha", href: inquiryHref },
        { label: "Privacidad", href: "/privacy" },
      ]
    : [
        { label: "About", href: "/about" },
        { label: "Areas served", href: "/quinceanera-photographer" },
        { label: "Check your date", href: inquiryHref },
        { label: "Privacy", href: "/privacy" },
      ];

  return (
    <footer className="site-footer">
      <div className="site-footer-invitation">
        <Image
          src="/portfolio/lilac-arch.webp"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="site-footer-image"
        />
        <div className="site-footer-shade" aria-hidden="true" />
        <div className="site-footer-invitation-inner">
          <p className="site-footer-kicker">{isSpanish ? "El siguiente capítulo" : "The next chapter"}</p>
          <h2>{isSpanish ? "Hablemos de su día." : "Let's talk about her day."}</h2>
          <Link href={inquiryHref} className="site-footer-action">
            {isSpanish ? "Consulta su fecha" : "Check her date"} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="site-footer-base">
        <div className="site-footer-columns">
          <div className="site-footer-brand">
            <Link href={isSpanish ? "/es" : "/"} aria-label={isSpanish ? "TX Quince, inicio" : "TX Quince, home"}>
              <Wordmark size="masthead" subline={false} />
            </Link>
            <p>{isSpanish ? "Fotografía y video de quinceañeras en Dallas–Fort Worth." : "Quinceañera photography and film in Dallas–Fort Worth."}</p>
          </div>
          <div>
            <h3>{isSpanish ? "Explorar" : "Explore"}</h3>
            <ul>{work.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h3>{isSpanish ? "Estudio" : "Studio"}</h3>
            <ul>{studio.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h3>{isSpanish ? "Conectar" : "Connect"}</h3>
            <ul>
              {site.social.instagram && <li><a href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a></li>}
              {site.social.youtube && <li><a href={site.social.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a></li>}
              {site.social.facebook && <li><a href={site.social.facebook} target="_blank" rel="noopener noreferrer">Facebook ↗</a></li>}
              <li><a href={`mailto:${site.contact.email}`}>{isSpanish ? "Correo" : "Email"} ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="site-footer-locations">
          <p>{isSpanish ? "En Dallas–Fort Worth" : "Serving Dallas–Fort Worth"}</p>
          <div>{locations.map((location) => <Link key={location.slug} href={`${isSpanish ? "/es/fotografo-de-quinceaneras" : "/quinceanera-photographer"}/${location.slug}`}>{location.city}</Link>)}</div>
        </div>
        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} {site.brand} · {site.serviceArea}</p>
          <div><Link href={isSpanish ? "/" : "/es"} hrefLang={isSpanish ? "en" : "es"}>{isSpanish ? "English" : "Español"}</Link><Link href="/admin/login">Studio</Link></div>
        </div>
      </div>
    </footer>
  );
}
