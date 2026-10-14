/** POST /api/my/message — a question or a change/cancel request. Only a message. */
import { journeyDeps } from "@/lib/journey/deps";
import { postFamilyMessage } from "@/lib/journey/family";
import { fail } from "@/lib/journey/core";
import { clientIp, failResponse, okResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return failResponse(fail(400, "invalid", "Invalid request."));
  const deps = journeyDeps();
  if (await deps.rateLimit("message-ip", clientIp(req), 20, 3600_000)) return failResponse(fail(429, "rate_limited", "Please try again later."));
  const r = await postFamilyMessage(deps, body);
  return r.ok ? okResponse() : failResponse(r);
}
