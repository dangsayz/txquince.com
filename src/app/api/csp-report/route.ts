/**
 * /api/csp-report — receives Content-Security-Policy violation reports from
 * browsers (the Report-Only policy in src/lib/security-headers.ts) and logs a
 * one-line summary to Workers Logs. Nothing is stored; nothing is returned.
 *
 * Public by design (browsers send these without credentials), so it is
 * size-capped and rate-limited per IP, and only whitelisted fields are logged.
 * Query strings are dropped from URLs so tokens in pay links never hit logs.
 */
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BYTES = 16 * 1024;
const rateLimited = rateLimiter("csp-report");
const noContent = () => new Response(null, { status: 204 });

/** The pay-link id in /booking/<id> is a bearer secret: never log it. */
const redactPath = (p: string) => p.replace(/\/booking\/[^/]+/, "/booking/:id");

function stripQuery(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  const s = v.slice(0, 300);
  try {
    const u = new URL(s);
    return `${u.origin}${redactPath(u.pathname)}`;
  } catch {
    return redactPath(s.split(/[?#]/)[0]); // "inline", "eval", "data", …
  }
}

type Summary = { directive?: string; blocked?: string; page?: string; source?: string; line?: number };

function summarize(r: Record<string, unknown>): Summary {
  // report-uri format uses kebab-case; Reporting API ("csp-violation") uses camelCase.
  const pick = (...names: string[]) => names.map((n) => r[n]).find((v) => v !== undefined);
  const line = pick("line-number", "lineNumber");
  return {
    directive: String(pick("effective-directive", "effectiveDirective", "violated-directive") ?? "").slice(0, 80) || undefined,
    blocked: stripQuery(pick("blocked-uri", "blockedURL")),
    page: stripQuery(pick("document-uri", "documentURL")),
    source: stripQuery(pick("source-file", "sourceFile")),
    line: typeof line === "number" ? line : undefined,
  };
}

export async function POST(req: Request) {
  if (await rateLimited(clientIp(req))) return noContent();
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES) return noContent();

  const text = (await req.text().catch(() => "")).slice(0, MAX_BYTES);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return noContent();
  }

  const reports: Record<string, unknown>[] = [];
  if (Array.isArray(body)) {
    for (const item of body.slice(0, 10)) {
      const b = (item as { body?: unknown })?.body;
      if (b && typeof b === "object") reports.push(b as Record<string, unknown>);
    }
  } else if (body && typeof body === "object") {
    const r = (body as { "csp-report"?: unknown })["csp-report"];
    if (r && typeof r === "object") reports.push(r as Record<string, unknown>);
  }

  for (const r of reports) console.warn("[csp-report]", JSON.stringify(summarize(r)));
  return noContent();
}
