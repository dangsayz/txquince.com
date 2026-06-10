import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

/**
 * Tiny probe the public-site edit overlay uses to decide whether to render
 * admin controls. Only called when a local "I've been in /admin" hint exists,
 * so regular visitors never pay for it.
 */
export async function GET() {
  return NextResponse.json(
    { admin: await requireAdmin() },
    { headers: { "cache-control": "no-store" } },
  );
}
