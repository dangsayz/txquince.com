/**
 * /api/admin/notifications — the Studio bell. Admin only.
 *   GET  → { items, seenAt, unread }  the newest events on the site
 *   POST → { seenAt }                 the owner opened the bell: all are seen
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { unreadCount } from "@/lib/notifications";
import { getSeenAt, listNotices, markSeen } from "@/lib/notifications-db";

export const dynamic = "force-dynamic";
const noStore = { "cache-control": "no-store" };

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const [items, seenAt] = await Promise.all([listNotices(), getSeenAt()]);
  return NextResponse.json({ items, seenAt, unread: unreadCount(items, seenAt) }, { headers: noStore });
}

export async function POST() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  try {
    return NextResponse.json({ seenAt: await markSeen() }, { headers: noStore });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
