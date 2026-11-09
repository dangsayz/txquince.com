/** POST /api/login/verify — trade a valid one-time code for a session cookie. */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sessionCookie, verifyLoginCode } from "@/lib/admin-session";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/same-origin";

export const dynamic = "force-dynamic";
const rateLimited = rateLimiter("login");
const Schema = z.object({ email: z.string().trim().email().max(200), code: z.string().regex(/^\d{6}$/) }).strict();

export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (await rateLimited(`verify:${clientIp(req)}`)) return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That code isn't right." }, { status: 400 });
  const token = await verifyLoginCode(parsed.data.email, parsed.data.code, req.headers.get("user-agent") ?? "").catch(() => null);
  if (!token) return NextResponse.json({ error: "That code isn't right or has expired." }, { status: 401 });
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(sessionCookie(token));
  return res;
}
