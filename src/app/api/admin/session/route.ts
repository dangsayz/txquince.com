import { NextResponse } from "next/server";
import { slotAdmin } from "@/lib/image-slot-admin";

export const dynamic = "force-dynamic";

/**
 * Is this browser signed in as the admin? Asked by the tiny Replace-photo
 * island on public pages (only when the "I've been in /admin" hint is set),
 * so public pages stay static and visitors never download the editor.
 */
export async function GET() {
  return NextResponse.json({ admin: Boolean(await slotAdmin()) }, { headers: { "cache-control": "no-store" } });
}
