/** POST /api/admin/bookings/{id}/message — reply to the family (emailed). Admin only. */
import { journeyDeps } from "@/lib/journey/deps";
import { replyToFamily } from "@/lib/journey/admin";
import { failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await replyToFamily(journeyDeps(), id, (await readJson(req)) ?? {});
  return r.ok ? okResponse() : failResponse(r);
}
