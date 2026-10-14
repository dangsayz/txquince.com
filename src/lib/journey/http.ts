/**
 * http.ts — request helpers shared by the journey routes.
 * The client IP always comes from the site-wide src/lib/client-ip.ts.
 */
import { NextResponse } from "next/server";
import type { Fail } from "./core";

export { clientIp } from "@/lib/client-ip";

export const userAgent = (req: Request) => (req.headers.get("user-agent") ?? "").slice(0, 300);

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export function failResponse(f: Fail & Record<string, unknown>) {
  const { ok: _ok, status, ...rest } = f;
  void _ok;
  return NextResponse.json({ ok: false, ...rest }, { status, headers: NO_STORE });
}

export function okResponse(body: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status, headers: NO_STORE });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const v = (await req.json()) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
