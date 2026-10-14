/** GET /api/admin/bookings/{id}/contract — the signed PDF, for the owner. */
import { journeyDeps } from "@/lib/journey/deps";
import { contractPdfFor } from "@/lib/journey/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deps = journeyDeps();
  if (!(await deps.adminEmail())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const b = await deps.db.getBooking(id);
  const file = b ? await contractPdfFor(deps, b) : null;
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
