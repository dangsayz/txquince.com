import { NextResponse } from "next/server";
import { clerkServerEnabled } from "@/lib/clerk-config";

export const dynamic = "force-dynamic";

/**
 * Ends the current Clerk session on the server (revoked everywhere, so a
 * copied cookie stops working). The browser then visits /logout, which clears
 * the shared session cookies. Open by design: signing out is harmless.
 */
export async function POST() {
  if (clerkServerEnabled()) {
    try {
      const { auth, clerkClient } = await import("@clerk/nextjs/server");
      const { sessionId } = await auth();
      if (sessionId) await (await clerkClient()).sessions.revokeSession(sessionId);
    } catch {
      /* already signed out, or Clerk unreachable: /logout still clears the browser */
    }
  }
  return NextResponse.json({ ok: true });
}
