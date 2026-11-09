import { ClerkShell, clerkOn } from "./ClerkShell";
import { LoginView } from "./LoginView";
import type { AuthLang, AuthMode } from "./AccountPanel";
import "@/components/txq/pages/pages.css";

const COPY = {
  en: {
    "sign-in": { index: "[Account / Log in]", title: "Log in", em: "— welcome back.", dek: "Continue with Google, or we email you a 6-digit code. No password to remember." },
    "sign-up": { index: "[Account / Create]", title: "Create a free account", em: "— it takes a minute.", dek: "Join the conversation on the Journal: ask a question or share what worked for your quince." },
  },
  es: {
    "sign-in": { index: "[Cuenta / Entrar]", title: "Entrar", em: "— qué gusto verte.", dek: "Continúa con Google, o te enviamos un código de 6 dígitos por correo. Sin contraseña que recordar." },
    "sign-up": { index: "[Cuenta / Crear]", title: "Crea una cuenta gratis", em: "— toma un minuto.", dek: "Únete a la conversación en el Diario: haz una pregunta o comparte lo que te funcionó en tu quince." },
  },
} as const;

/** /login, /signup, /es/entrar, /es/registro — one layout, Clerk's form on this site. */
export function AuthPage({ lang, mode, next }: { lang: AuthLang; mode: AuthMode; next: string | null }) {
  const c = COPY[lang][mode];
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" aria-labelledby="auth-title">
        <p className="tq-pg-mast__index tq-mono">{c.index}</p>
        <div className="tq-pg-mast__body">
          <h1 id="auth-title" className="tq-display tq-pg-mast__title">
            {c.title} <em>{c.em}</em>
          </h1>
          <p className="tq-pg-mast__dek">{c.dek}</p>
          <ClerkShell lang={lang}>
            <LoginView lang={lang} mode={mode} enabled={clerkOn()} next={next} />
          </ClerkShell>
        </div>
      </header>
    </div>
  );
}
