import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { clerkSettings } from "@/lib/clerk-config";

/**
 * Clerk for ONE part of the page (admin, login/sign-up/logout, the comment
 * box). The rest of the public site never loads Clerk's script, so pages stay
 * static and light. Settings come from the server at render time, so a build
 * without the NEXT_PUBLIC_CLERK_* values still works once the Worker has them.
 * With Clerk off (no key) the children render without it, and each client
 * component checks the `enabled` flag it is given before using Clerk hooks.
 */
export function ClerkShell({ children, lang = "en" }: { children: ReactNode; lang?: "en" | "es" }) {
  const s = clerkSettings();
  if (!s) return <>{children}</>;
  return (
    <ClerkProvider
      publishableKey={s.publishableKey}
      signInUrl={s.signInUrl}
      signUpUrl={s.signUpUrl}
      localization={lang === "es" ? esMX : undefined}
    >
      {children}
    </ClerkProvider>
  );
}

/** True when Clerk is configured (server-side check, passed to client islands). */
export function clerkOn(): boolean {
  return clerkSettings() !== null;
}
