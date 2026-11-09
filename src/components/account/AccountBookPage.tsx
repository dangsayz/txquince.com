import { redirect } from "next/navigation";
import { getSignedInUser } from "@/lib/clerk-user";
import { getAccountBookings } from "@/lib/account-db";
import { AccountBook } from "./AccountBook";
import { PayMarks } from "./PayMarks";
import { ACCOUNT_PATH } from "./AccountDashboard";
import "@/components/txq/pages/pages.css";
import "./account.css";

type Lang = "en" | "es";
export const BOOK_PATH = { en: "/account/book", es: "/es/cuenta/reservar" } as const;

const COPY = {
  en: {
    index: "[Your account / Book]",
    title: "Book your date.",
    dek: "Four short screens: your package, your date, your details, then you read and sign. Nothing is charged today.",
    back: "Back to your account",
    pay: "After we approve it, pay your deposit by card or over time:",
  },
  es: {
    index: "[Tu cuenta / Reservar]",
    title: "Aparta tu fecha.",
    dek: "Cuatro pantallas cortas: tu paquete, tu fecha, tus datos, y luego lees y firmas. Hoy no se cobra nada.",
    back: "Regresar a tu cuenta",
    pay: "Cuando lo aprobemos, paga tu depósito con tarjeta o en pagos:",
  },
} as const;

/** /account/book and /es/cuenta/reservar. One open booking at a time: with one, back to the dashboard. */
export async function AccountBookPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const self = BOOK_PATH[lang];
  const user = await getSignedInUser();
  if (!user) redirect(`${lang === "es" ? "/es/entrar" : "/login"}?next=${encodeURIComponent(self)}`);
  const open = (await getAccountBookings(user.verifiedEmails)).filter((b) => b.state !== "closed");
  if (open.length > 0) redirect(ACCOUNT_PATH[lang]);

  return (
    <div className="tq-wrap" lang={lang}>
      <header className="tq-pg-mast" aria-labelledby="acct-book-title">
        <p className="tq-pg-mast__index tq-mono">{c.index}</p>
        <div className="tq-pg-mast__body">
          <h1 id="acct-book-title" className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{c.title}</h1>
          <p className="tq-pg-mast__dek">{c.dek}</p>
          <a className="acct-link" href={ACCOUNT_PATH[lang]}><span aria-hidden>←</span>&nbsp;{c.back}</a>
        </div>
      </header>
      <div className="acct-book">
        <AccountBook email={user.verifiedEmails[0] ?? ""} done={`${ACCOUNT_PATH[lang]}?booked=1`} />
        <div className="acct-book__pay">
          <p className="acct-note">{c.pay}</p>
          <PayMarks lang={lang} />
        </div>
      </div>
    </div>
  );
}
