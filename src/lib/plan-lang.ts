/**
 * plan-lang.ts — which language a plan link opens in (pure, dependency-free so
 * the middleware bundle stays tiny).
 */
export type PlanLang = "en" | "es";

/**
 * The page language: an explicit ?lang= wins, then the browser's
 * Accept-Language (highest-q of English/Spanish), then English.
 */
export function detectPlanLang(langParam: unknown, acceptLanguage: string | null | undefined): PlanLang {
  if (langParam === "es" || langParam === "en") return langParam;
  if (!acceptLanguage) return "en";
  let best: { lang: PlanLang; q: number } | null = null;
  for (const part of acceptLanguage.split(",")) {
    const [tag, ...params] = part.trim().toLowerCase().split(";");
    const primary = tag.split("-")[0];
    if (primary !== "es" && primary !== "en") continue;
    const qp = params.find((p) => p.trim().startsWith("q="));
    const q = qp ? Number(qp.trim().slice(2)) : 1;
    if (!Number.isFinite(q)) continue;
    if (!best || q > best.q) best = { lang: primary, q };
  }
  return best?.lang ?? "en";
}

