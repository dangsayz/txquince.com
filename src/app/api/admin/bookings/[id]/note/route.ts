/** POST /api/admin/bookings/{id}/note — a private note (never shown to the family). Admin only. */
import { journeyDeps } from "@/lib/journey/deps";
import { addNote } from "@/lib/journey/admin";
import { failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await addNote(journeyDeps(), id, (await readJson(req)) ?? {});
  return r.ok ? okResponse() : failResponse(r);
}
