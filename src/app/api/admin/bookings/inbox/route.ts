/** GET /api/admin/bookings/inbox — counts for the nav badge (new requests + unread messages). */
import { journeyDeps } from "@/lib/journey/deps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const deps = journeyDeps();
  if (!(await deps.adminEmail())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [requests, unread] = await Promise.all([deps.db.listBookings({ statuses: ["requested", "payment_review"], limit: 500 }), deps.db.unreadCounts()]);
    const unreadMessages = Object.values(unread).reduce((a, b) => a + b, 0);
    return Response.json(
      { newRequests: requests.length, unreadMessages, total: requests.length + unreadMessages },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ newRequests: 0, unreadMessages: 0, total: 0 });
  }
}
