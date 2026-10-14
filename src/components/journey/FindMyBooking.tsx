import Link from "next/link";
import { MagicLinkForm } from "./MagicLinkForm";
import "@/components/txq/pages/pages.css";
import "./journey.css";

const T = {
  en: {
    index: "Your booking",
    title: "Find your booking",
    dek: "Lost the link to your private booking page? Type the email you booked with and we'll send it again.",
    other: "Ver en español",
    otherHref: "/es/mi-reserva",
  },
  es: {
    index: "Tu reservación",
    title: "Encuentra tu reservación",
    dek: "¿Perdiste el enlace de tu página privada? Escribe el correo con el que reservaste y te lo enviamos otra vez.",
    other: "View in English",
    otherHref: "/my/booking",
  },
};

export function FindMyBooking({ lang }: { lang: "en" | "es" }) {
  const t = T[lang];
  return (
    <div className="tq-wrap tq-jr" lang={lang}>
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono">[{t.index}]</p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{t.title}</h1>
          <p className="tq-pg-mast__dek">{t.dek}</p>
          <MagicLinkForm lang={lang} />
          <Link href={t.otherHref} className="tq-pg-link" hrefLang={lang === "es" ? "en" : "es"}>
            <span>{t.other}</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
