"use client";

/**
 * BlogPlanCta — "Planning your quince in DFW?" inside every journal article,
 * once after the middle section and once at the end (BlogArticleView).
 *
 * Journal readers are planning moms; this gives them the live price range (from
 * the price book via usePriceBook — never a hardcoded number), the phone as
 * Text / WhatsApp / Call, and the two next pages: full galleries and the date
 * check. Client component only because ContactButtons tracks clicks.
 */
import Link from "next/link";
import { ContactButtons } from "@/components/ContactButtons";
import { usePriceBook } from "@/components/PriceBookProvider";
import { PT } from "@/lib/price-text";
import "./contact.css";

const COPY = {
  en: {
    index: "Planning",
    title: "Planning your quince in DFW?",
    price: (range: string) => `Photo and video packages run ${range}. Text us her date and we'll tell you if it's open.`,
    galleries: "See full galleries",
    galleriesHref: "/portfolio",
    check: "Check my date",
    checkHref: "/check-your-date",
  },
  es: {
    index: "Planeando",
    title: "¿Planeando tu quince en DFW?",
    price: (range: string) => `Los paquetes de foto y video van de ${range}. Mándanos su fecha y te decimos si está libre.`,
    galleries: "Ver galerías completas",
    galleriesHref: "/portfolio",
    check: "Consultar mi fecha",
    checkHref: "/es/consulta",
  },
} as const;

export function BlogPlanCta({ lang, placement }: { lang: "en" | "es"; placement: "mid" | "end" }) {
  const c = COPY[lang];
  const { fill } = usePriceBook();
  const range = fill(lang === "es" ? `${PT.price.floor} a ${PT.price.ceiling}` : `${PT.price.floor}–${PT.price.ceiling}`);
  const headingId = `tq-blog-plan-${placement}`;
  return (
    <aside className="tq-blog-plan" aria-labelledby={headingId} data-placement={placement}>
      <p className="tq-mono tq-blog-plan__index">[{c.index}]</p>
      <p id={headingId} className="tq-display tq-blog-plan__title">
        {c.title}
      </p>
      <p className="tq-blog-plan__price tq-nums">{c.price(range)}</p>
      <ContactButtons lang={lang} placement={`blog-${placement}`} />
      <div className="tq-blog-plan__links">
        <Link href={c.galleriesHref} className="tq-btn tq-btn--lg tq-btn--ghost">
          {c.galleries} <span className="tq-arrow" aria-hidden>↗</span>
        </Link>
        <Link href={c.checkHref} className="tq-btn tq-btn--lg tq-btn--ghost">
          {c.check} <span className="tq-arrow" aria-hidden>↗</span>
        </Link>
      </div>
    </aside>
  );
}
