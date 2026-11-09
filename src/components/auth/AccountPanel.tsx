"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import "./auth.css";

export type AuthLang = "en" | "es";

const COPY = {
  en: {
    loading: "Checking your account…",
    failed: "Log in is not reachable right now. Please try again in a few minutes.",
    off: "Accounts are not switched on yet. Please check back soon.",
    signIn: "Log in",
    signUp: "Create account",
    signOut: "Log out",
    signingOut: "Logging out…",
    signedInAs: (n: string) => `You're logged in as ${n}.`,
    shared:
      "One account works on TX Quince and on Quince Network, our sister site for quinceañera ideas and designs. Logging in opens quincenetwork.com, then brings you back here.",
  },
  es: {
    loading: "Revisando tu cuenta…",
    failed: "No se puede entrar en este momento. Intenta de nuevo en unos minutos.",
    off: "Las cuentas todavía no están activas. Vuelve pronto.",
    signIn: "Entrar",
    signUp: "Crear cuenta",
    signOut: "Cerrar sesión",
    signingOut: "Cerrando sesión…",
    signedInAs: (n: string) => `Entraste como ${n}.`,
    shared:
      "Una sola cuenta sirve en TX Quince y en Quince Network, nuestro sitio hermano de ideas y diseños para quinceañera. Al entrar se abre quincenetwork.com y luego regresas aquí.",
  },
} as const;

/**
 * Log in / create account, for a page that sits inside <ClerkShell>.
 * `returnPath` is where a fresh session lands (a path on this site, already
 * checked by the page). It always goes back through a page the middleware
 * covers, so the satellite session sync finishes on the server too.
 */
export function AccountPanel({
  lang,
  enabled,
  returnPath,
  signedIn,
}: {
  lang: AuthLang;
  /** Clerk configured on the server. Without it, hooks would throw. */
  enabled: boolean;
  returnPath: string;
  /** Rendered when someone is signed in (gets the display name + a sign-out button). */
  signedIn?: (props: { name: string; signOut: React.ReactNode }) => React.ReactNode;
}) {
  const c = COPY[lang];
  if (!enabled) return <p className="tq-auth__note">{c.off}</p>;
  return <Panel lang={lang} returnPath={returnPath} signedIn={signedIn} />;
}

function Panel({
  lang,
  returnPath,
  signedIn,
}: {
  lang: AuthLang;
  returnPath: string;
  signedIn?: (props: { name: string; signOut: React.ReactNode }) => React.ReactNode;
}) {
  const c = COPY[lang];
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [busy, setBusy] = useState(false);

  // Built from Clerk (not hardcoded): on a satellite these carry the sync flag
  // that makes txquince.com pick up the session on the way back. Clerk only
  // reports loaded in the browser, so window is safe here.
  const links = clerk.loaded ? buildLinks(clerk, returnPath) : null;

  if (clerk.status === "error") return <p className="tq-auth__note" role="alert">{c.failed}</p>;
  if (!isLoaded) return <p className="tq-auth__note" role="status">{c.loading}</p>;

  if (isSignedIn) {
    const name = user.firstName || user.username || user.primaryEmailAddress?.emailAddress || "";
    const signOut = (
      <button
        type="button"
        className="tq-btn tq-btn--lg tq-btn--ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            window.localStorage.removeItem("txq_admin");
          } catch {
            /* ignore */
          }
          await clerk.signOut({ redirectUrl: lang === "es" ? "/es" : "/" });
        }}
      >
        {busy ? c.signingOut : c.signOut}
      </button>
    );
    return signedIn ? (
      <>{signedIn({ name, signOut })}</>
    ) : (
      <div className="tq-auth">
        <p className="tq-auth__lead">{c.signedInAs(name)}</p>
        <div className="tq-auth__actions">{signOut}</div>
      </div>
    );
  }

  return (
    <div className="tq-auth">
      <div className="tq-auth__actions">
        <a className="tq-btn tq-btn--lg" href={links?.signIn ?? "#"} aria-disabled={!links || undefined} rel="nofollow">
          {c.signIn} <span className="tq-arrow" aria-hidden>↗</span>
        </a>
        <a className="tq-btn tq-btn--lg tq-btn--ghost" href={links?.signUp ?? "#"} aria-disabled={!links || undefined} rel="nofollow">
          {c.signUp}
        </a>
      </div>
      <p className="tq-auth__note">{c.shared}</p>
    </div>
  );
}

function buildLinks(clerk: ReturnType<typeof useClerk>, returnPath: string) {
  const back = new URL(returnPath, window.location.origin).toString();
  const opts = { signInForceRedirectUrl: back, signUpForceRedirectUrl: back };
  return { signIn: clerk.buildSignInUrl(opts), signUp: clerk.buildSignUpUrl(opts) };
}
