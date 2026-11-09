import { NextResponse } from "next/server";
import { revokeSession, SESSION_COOKIE } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

/** Revoke this browser's Studio session and clear its cookie. */
export async function POST() {
  await revokeSession().catch(() => undefined);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  return res;
}
