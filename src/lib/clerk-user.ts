/**
 * clerk-user.ts — SERVER-ONLY: who is signed in (TX Quince
 * account, via Clerk). The one seam every server check goes through, so tests
 * mock this module and nothing else.
 *
 * Needs the Clerk middleware to have run on the request (see middleware.ts
 * matcher). Any failure (Clerk off, middleware not on this route, Clerk
 * unreachable) answers null: signed out. Never trusts the client.
 */
import "server-only";
import { cache } from "react";
import { clerkServerEnabled } from "@/lib/clerk-config";

export type SignedInUser = {
  id: string;
  /** Only addresses Clerk has VERIFIED. An unverified address proves nothing. */
  verifiedEmails: string[];
  /** Name to show next to a comment ("Maria G."), never the email. */
  displayName: string;
  imageUrl: string | null;
};

/** Cheap: the session's user id, no Clerk API call. */
export async function getSignedInUserId(): Promise<string | null> {
  if (!clerkServerEnabled()) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

/** Full profile (one Clerk API call, cached per request). */
export const getSignedInUser = cache(async (): Promise<SignedInUser | null> => {
  if (!clerkServerEnabled()) return null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (!user) return null;
    const verifiedEmails = user.emailAddresses
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress.trim().toLowerCase());
    return {
      id: user.id,
      verifiedEmails,
      displayName: publicName(user.firstName, user.lastName, user.username),
      imageUrl: user.hasImage ? user.imageUrl : null,
    };
  } catch {
    return null;
  }
});

/** "Maria Gonzalez" → "Maria G." ; nothing usable → "TX Quince member". */
export function publicName(first?: string | null, last?: string | null, username?: string | null): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  if (f) return l ? `${f} ${l[0]!.toUpperCase()}.` : f;
  const u = (username ?? "").trim();
  return u || "TX Quince member";
}
