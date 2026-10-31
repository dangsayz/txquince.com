/**
 * POST /api/plan — create a personalized quince plan.
 *
 * Flow (same gates as /api/inquiry): parse → honeypot → per-IP rate limit →
 * Turnstile (production) → zod + contact parsing → insert (service role,
 * RLS-locked) → family + operator emails → respond with the plan's slug.
 *
 * PRIVACY: the form posts its fields in the BODY, never a query string, and
 * the response only carries the random slug. JSON callers get { slug }; a
 * plain HTML form post (no JavaScript yet, e.g. a slow in-app browser) gets a
 * 303 redirect to /plan/<slug>, so even the no-JS path never puts a name,
 * phone or email in a URL.
 */
import { NextResponse, type NextRequest } from "next/server";
import { planInputSchema, parseContact, planPath, sanitizeSource, PLAN_HONEYPOT_FIELD, type PlanField } from "@/lib/plan";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { createPlan, getDateStatus } from "@/lib/plan-db";
import { sendPlanFamilyEmail, sendPlanOperatorEmail } from "@/lib/plan-email";
import { verifyTurnstile } from "@/lib/turnstile";
import { sanitizeAttribution } from "@/lib/attribution";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const rateLimited = rateLimiter("plan");

type Body = Record<string, unknown>;

async function readBody(req: NextRequest): Promise<{ body: Body; form: boolean } | null> {
  const type = req.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) return { body: (await req.json()) as Body, form: false };
    if (type.includes("form")) {
      const fd = await req.formData();
      const body: Body = {};
      for (const [k, v] of fd.entries()) {
        if (typeof v !== "string") continue;
        if (k === "colors") body.colors = [...((body.colors as string[]) ?? []), v];
        else body[k] = v;
      }
      return { body, form: true };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const parsedBody = await readBody(req);
  if (!parsedBody) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  const { body, form } = parsedBody;
  const lang = body.language === "es" ? "es" : "en";
  const back = (code: string) =>
    NextResponse.redirect(new URL(`${lang === "es" ? "/es/plan" : "/plan"}?e=${code}`, req.url), 303);
  const fail = (status: number, error: string, fieldErrors?: PlanField[]) =>
    form ? back(error) : NextResponse.json({ ok: false, error, fieldErrors }, { status });

  // 1) Honeypot: pretend success, save nothing.
  const hp = body[PLAN_HONEYPOT_FIELD];
  if (typeof hp === "string" && hp.trim()) {
    return form ? back("ok") : NextResponse.json({ ok: true, slug: null });
  }

  // 2) Rate limit.
  const ip = clientIp(req);
  if (await rateLimited(ip)) return fail(429, "rateLimited");

  // 3) Turnstile (fails closed in production when the secret is missing).
  const token = typeof body["cf-turnstile-response"] === "string" ? (body["cf-turnstile-response"] as string) : undefined;
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) return fail(403, "verification");

  // 4) Validation.
  const parsed = planInputSchema.safeParse({
    ...body,
    colors: Array.isArray(body.colors) ? body.colors : typeof body.colors === "string" ? body.colors.split(",") : [],
  });
  const contact = parseContact(body.contact);
  if (!parsed.success || !contact) {
    const fields = new Set<PlanField>();
    for (const issue of parsed.success ? [] : parsed.error.issues) {
      const key = issue.path[0];
      if (key === "event_date" || key === "city" || key === "name" || key === "contact") fields.add(key);
    }
    if (!contact) fields.add("contact");
    return fail(422, "form", [...fields]);
  }

  if (!isSupabaseConfigured()) {
    console.error("[plan] database not configured — cannot save plan.");
    return fail(503, "unavailable");
  }

  // 5) Save.
  let plan;
  try {
    plan = await createPlan(parsed.data, contact, {
      source: sanitizeSource(parsed.data.src),
      attribution: sanitizeAttribution(typeof body.attribution === "string" ? safeJson(body.attribution) : body.attribution),
    });
  } catch (err) {
    console.error("[plan] insert failed:", err);
    return fail(500, "unavailable");
  }

  // 6) Emails: the plan is saved, so a mail failure never blocks the family.
  const site = getSiteUrl();
  const path = planPath(plan.slug, plan.language);
  const planUrl = `${site}${path}`;
  const status = await getDateStatus(plan.event_date);
  const [family, operator] = await Promise.all([
    sendPlanFamilyEmail(plan, planUrl),
    sendPlanOperatorEmail(plan, { planUrl, adminUrl: `${site}/admin/plans` }, status),
  ]);
  if (!family.ok) console.error("[plan] family email failed:", family.error);
  if (!operator.ok) console.error("[plan] operator email failed:", operator.error);

  if (form) return NextResponse.redirect(new URL(path, req.url), 303);
  return NextResponse.json({ ok: true, slug: plan.slug, path });
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
