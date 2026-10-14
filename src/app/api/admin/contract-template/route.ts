/**
 * POST /api/admin/contract-template — save a NEW version of the contract
 * overrides (append-only). Bookings already signed keep the exact text they
 * signed; unsigned approved bookings pick up the newest version.
 */
import { journeyDeps } from "@/lib/journey/deps";
import { saveContractTemplate } from "@/lib/journey/admin";
import { failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const r = await saveContractTemplate(journeyDeps(), (await readJson(req)) ?? {});
  return r.ok ? okResponse({ version: r.template.version }) : failResponse(r);
}
