/** POST /api/admin/bookings/{id}/payment — record Zelle / cash / check. Admin only. */
import { journeyDeps } from "@/lib/journey/deps";
import { recordOfflinePayment } from "@/lib/journey/admin";
import { failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await recordOfflinePayment(journeyDeps(), id, (await readJson(req)) ?? {});
  return r.ok ? okResponse(r) : failResponse(r);
}
