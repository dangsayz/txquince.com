/**
 * POST /api/my/link — "Email me my link". { email, lang, cf-turnstile-response }
 *
 * Always answers with the SAME body (MAGIC_LINK_RESPONSE), and does the lookup
 * and sending after the response, so neither the answer nor its timing tells
 * anyone whether an email has a booking. Links go only to the stored address.
 * Rate limited per IP and per email; Turnstile required.
 */
import { z } from "zod";
import { TURNSTILE_FIELD } from "@/lib/booking";
import { journeyDeps } from "@/lib/journey/deps";
import { MAGIC_LINK_RESPONSE, sendMagicLinks } from "@/lib/journey/family";
import { fail } from "@/lib/journey/core";
import { clientIp, failResponse, readJson } from "@/lib/journey/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), lang: z.enum(["en", "es"]).default("en") });

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return failResponse(fail(400, "invalid", "Invalid request."));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return failResponse(fail(422, "invalid", "Please enter a valid email."));
  const deps = journeyDeps();
  const ip = clientIp(req);
  if (await deps.rateLimit("magic-ip", ip, 5, 15 * 60_000)) {
    return failResponse(fail(429, "rate_limited", "Too many tries. Please wait a few minutes."));
  }
  const token = typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined;
  if (!(await deps.turnstile(token, ip)).ok) {
    return failResponse(fail(403, "verification", "Verification failed. Please refresh and try again."));
  }
  const { email, lang } = parsed.data;
  // Per-email limit is silent: the response must not differ for known emails.
  const emailLimited = await deps.rateLimit("magic-email", email, 3, 3600_000);
  if (!emailLimited) {
    deps.defer(async () => {
      try {
        await sendMagicLinks(deps, email, lang);
      } catch (err) {
        console.error("[my/link]", err);
      }
    });
  }
  return Response.json(MAGIC_LINK_RESPONSE, { headers: { "Cache-Control": "no-store" } });
}
