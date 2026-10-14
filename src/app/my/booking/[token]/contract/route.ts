/**
 * GET /my/booking/{token}/contract — the family's signed agreement PDF.
 * Served only to a valid token (or to the admin via /api/admin/bookings/{id}/contract).
 */
import { journeyDeps } from "@/lib/journey/deps";
import { resolveToken } from "@/lib/journey/core";
import { contractPdfFor } from "@/lib/journey/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const deps = journeyDeps();
  const b = await resolveToken(deps, token);
  const file = b ? await contractPdfFor(deps, b) : null;
  if (!file) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(file.pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "Referrer-Policy": "no-referrer",
    },
  });
}
