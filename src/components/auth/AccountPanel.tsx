"use client";

import { useEffect, useState } from "react";
import { SignIn, SignUp, useClerk, useUser } from "@clerk/nextjs";
import { announceAuthChanged } from "@/lib/signed-in-hint";
import "./auth.css";

export type AuthLang = "en" | "es";
export type AuthMode = "sign-in" | "sign-up";

const COPY = {
  en: {
    loading: "Checking your account…",
    failed: "Log in is not reachable right now. Please try again in a few minutes.",
    off: "Accounts are not switched on yet. Please check back soon.",
    signOut: "Log out",
    signingOut: "Logging out…",
    signedInAs: (n: string) => `You're logged in as ${n}.`,
  },
  es: {
    loading: "Revisando tu cuenta…",
    failed: "No se puede entrar en este momento. Intenta de nuevo en unos minutos.",
    off: "Las cuentas todavía no están activas. Vuelve pronto.",
    signOut: "Cerrar sesión",
    signingOut: "Cerrando sesión…",
    signedInAs: (n: string) => `Entraste como ${n}.`,
  },
} as const;

/** Where the log-in and create-account pages live, per language. */
export const AUTH_PATHS = {
  en: { "sign-in": "/login", "sign-up": "/signup" },
  es: { "sign-in": "/es/entrar", "sign-up": "/es/registro" },
} as const;

/** Clerk's form, dressed in the TX Quince brand kit (src/app/brand.css). */
const appearance = {
  variables: {
    colorPrimary: "#111110",
    colorText: "#111110",
    colorTextSecondary: "#4d4b48",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111110",
    borderRadius: "14px",
    fontFamily: "inherit",
    fontSize: "16px",
  },
  elements: {
    rootBox: { width: "100%" },
    cardBox: { width: "100%", maxWidth: "28rem", boxShadow: "none", border: "1px solid #e2ddd5" },
    formButtonPrimary: { minHeight: "48px", fontSize: "16px", textTransform: "none" },
    socialButtonsBlockButton: { minHeight: "48px", fontSize: "16px" },
    formFieldInput: { minHeight: "48px", fontSize: "16px" },
    footerActionLink: { color: "#111110", textDecoration: "underline", display: "inline-flex", alignItems: "center", minHeight: "44px" },
  },
} as const;

/**
 * Log in or create an account, on this site, for a page inside <ClerkShell>.
 * Signed out: Clerk's own form (email code, no password). Signed in: who you
 * are + log out, or whatever `signedIn` renders. `returnPath` is where a new
 * session lands (a path on this site, already checked by the page).
 */
export function AccountPanel({
  lang,
  enabled,
  mode = "sign-in",
  returnPath,
  next,
  signedIn,
}: {
  lang: AuthLang;
  /** Clerk configured on the server. Without it, hooks would throw. */
  enabled: boolean;
  mode?: AuthMode;
  returnPath: string;
  /** Carried to the other form (log in ↔ create account) so the return trip survives. */
  next?: string | null;
  /** Rendered when someone is signed in (gets the display name + a sign-out button). */
  signedIn?: (props: { name: string; signOut: React.ReactNode }) => React.ReactNode;
}) {
  const c = COPY[lang];
  if (!enabled) return <p className="tq-auth__note">{c.off}</p>;
  return <Panel lang={lang} mode={mode} returnPath={returnPath} next={next ?? null} signedIn={signedIn} />;
}

function Panel({
  lang,
  mode,
  returnPath,
  next,
  signedIn,
}: {
  lang: AuthLang;
  mode: AuthMode;
  returnPath: string;
  next: string | null;
  signedIn?: (props: { name: string; signOut: React.ReactNode }) => React.ReactNode;
}) {
  const c = COPY[lang];
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [busy, setBusy] = useState(false);

  // Tell the header the moment a log in / log out lands (no page load happens
  // after Google returns), and drop Clerk's leftover "#/sso-callback…" from the URL.
  useEffect(() => {
    if (!isLoaded) return;
    announceAuthChanged();
    // Clerk may write its cookie a beat after the session turns active.
    const timers = [400, 1500].map((ms) => window.setTimeout(announceAuthChanged, ms));
    if (isSignedIn && window.location.hash.startsWith("#/")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [isLoaded, isSignedIn]);

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

  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  const paths = AUTH_PATHS[lang];
  return (
    <div className="tq-auth tq-auth--form">
      {mode === "sign-up" ? (
        <SignUp
          routing="hash"
          appearance={appearance}
          signInUrl={`${paths["sign-in"]}${q}`}
          forceRedirectUrl={returnPath}
          signInForceRedirectUrl={returnPath}
        />
      ) : (
        <SignIn
          routing="hash"
          appearance={appearance}
          signUpUrl={`${paths["sign-up"]}${q}`}
          forceRedirectUrl={returnPath}
          signUpForceRedirectUrl={returnPath}
        />
      )}
    </div>
  );
}
