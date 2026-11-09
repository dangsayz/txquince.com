/** POST /api/login/code — email a one-time Studio sign-in code (see admin-session.ts). */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requestLoginCode } from "@/lib/admin-session";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/same-origin";

export const dynamic = "force-dynamic";
const rateLimited = rateLimiter("login");
const Schema = z.object({ email: z.string().trim().email().max(200) }).strict();

export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (await rateLimited(clientIp(req))) return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  await requestLoginCode(parsed.data.email).catch((err) => console.error("[admin-login] code:", err));
  // Same answer whether or not the email is an admin.
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
