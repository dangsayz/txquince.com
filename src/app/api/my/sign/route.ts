/**
 * POST /api/my/sign — the family signs their agreement from their private
 * page. The token is the only key; a wrong token is 404. Re-signing is
 * impossible: the write only lands while status = approved AND signed_at is
 * null (and a DB trigger forbids changing a signed agreement).
 */
import { journeyDeps } from "@/lib/journey/deps";
import { signAgreement } from "@/lib/journey/family";
import { fail } from "@/lib/journey/core";
import { clientIp, failResponse, okResponse, readJson, userAgent } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return failResponse(fail(400, "invalid", "Invalid request."));
  const deps = journeyDeps();
  const ip = clientIp(req);
  if (await deps.rateLimit("sign", ip, 10, 60_000)) return failResponse(fail(429, "rate_limited", "Please wait a minute and try again."));
  const r = await signAgreement(deps, body, { ip, userAgent: userAgent(req) });
  return r.ok ? okResponse({ contractReady: r.contractReady }) : failResponse(r);
}
