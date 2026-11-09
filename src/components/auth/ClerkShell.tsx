import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkSettings } from "@/lib/clerk-config";

/**
 * Clerk for ONE part of the page (admin, login/logout, the comment box). The
 * rest of the public site never loads Clerk's script, so pages stay static and
 * light. Settings come from the server at render time, so a build without the
 * NEXT_PUBLIC_CLERK_* values still works once the Worker has them.
 *
 * TX Quince is a satellite of Quince Network: same accounts, sign-in on
 * quincenetwork.com. With Clerk off (no key) the children render without it,
 * and every component below checks `useClerkReady()`-style state itself.
 */
export function ClerkShell({ children }: { children: ReactNode }) {
  const s = clerkSettings();
  if (!s) return <>{children}</>;
  return (
    <ClerkProvider
      publishableKey={s.publishableKey}
      isSatellite={s.isSatellite}
      domain={s.domain}
      signInUrl={s.signInUrl}
      signUpUrl={s.signUpUrl}
    >
      {children}
    </ClerkProvider>
  );
}

/** True when Clerk is configured (server-side check, passed to client islands). */
export function clerkOn(): boolean {
  return clerkSettings() !== null;
}
