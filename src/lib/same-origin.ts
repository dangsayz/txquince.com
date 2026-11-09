import type { NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

/** Blocks cross-site POSTs: an Origin header, when present, must be this site. */
export function sameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return origin === new URL(getSiteUrl()).origin || origin === req.nextUrl.origin;
  } catch {
    return false;
  }
}
