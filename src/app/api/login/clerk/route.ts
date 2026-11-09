/**
 * GET /api/login/clerk?next=/admin — Studio sign-in with Google (via Clerk).
 *
 * The Studio login page sends the owner through the site's Clerk log in
 * (/login, which shows "Continue with Google"), which returns here. If the
 * Clerk user has a VERIFIED email on ADMIN_EMAILS, we start a normal Studio
 * session (same HttpOnly cookie as the email code) and go to `next`.
 * Anyone else goes back to the Studio login with a plain message.
 * Clerk runs on this route (middleware CLERK_ROUTES), so the session is real.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSignedInUser } from "@/lib/clerk-user";
import { isAuthorizedAdminEmail } from "@/lib/admin-auth";
import { createAdminSession, sessionCookie } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const asked = req.nextUrl.searchParams.get("next") ?? "";
  const next = /^\/admin(?:[/?#]|$)/.test(asked) && !asked.startsWith("//") ? asked : "/admin";
  const back = (error: string) => {
    const u = new URL("/admin/login", req.nextUrl.origin);
    u.searchParams.set("error", error);
    return NextResponse.redirect(u, { headers: { "Cache-Control": "no-store" } });
  };

  const user = await getSignedInUser();
  if (!user) return back("google");
  const email = user.verifiedEmails.find((e) => isAuthorizedAdminEmail(e));
  if (!email) return back("not-admin");

  const token = await createAdminSession(email, req.headers.get("user-agent") ?? "");
  if (!token) return back("google");
  const res = NextResponse.redirect(new URL(next, req.nextUrl.origin), { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(sessionCookie(token));
  return res;
}
