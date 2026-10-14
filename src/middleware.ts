import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { privateLinkIsLive, privateTokenFromPath } from "@/lib/journey/edge-check";

// /admin/* — session refresh + allowlist guard. The public site stays untouched
// (and fast), except the families' private booking links, which get a real
// 404 status when the link is unknown (src/lib/journey/edge-check.ts).
export async function middleware(request: NextRequest) {
  const token = privateTokenFromPath(request.nextUrl.pathname);
  if (token !== undefined) {
    const live = token === null ? false : await privateLinkIsLive(token);
    if (live === false) return NextResponse.rewrite(new URL("/__txq-private-link-not-found", request.url));
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/my/booking/:path+", "/es/mi-reserva/:path+"],
};
