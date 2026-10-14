/**
 * http.ts — request helpers shared by the journey routes.
 *
 * clientIp(): Cloudflare's own header first (can't be forged through the
 * edge), then the first X-Forwarded-For hop, then X-Real-IP. The security
 * work is consolidating this into one site-wide helper; swap it in here.
 */
import { NextResponse } from "next/server";
import type { Fail } from "./core";

export function clientIp(req: Request): string {
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

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
