import type { Metadata } from "next";
import { PlanIntake } from "@/components/plan/PlanIntake";
import { PLAN_COPY } from "@/content/plan-copy";
import { locations } from "@/content/locations";
import { site } from "@/content/site";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";
import { parseColors } from "@/lib/quince-colors";
import { prefillDate, sanitizeSource, todayInDallas, type PlanLang } from "@/lib/plan";

/**
 * /plan and /es/plan — the intake. Query params (never personal data):
 *   date=YYYY-MM-DD   prefilled when it is a plannable date
 *   colors=a,b,c      any spelling, English or Spanish ("fucsia,blanco,dorado")
 *   src=fb-group      which group or post the link was shared in
 * The middleware has already sent Spanish-preferring visitors to /es/plan.
 */
export type IntakeSearch = Promise<Record<string, string | string[] | undefined>>;

const PATH: Record<PlanLang, string> = { en: "/plan", es: "/es/plan" };

export function planIntakeMetadata(lang: PlanLang): Metadata {
  const t = PLAN_COPY[lang].intake;
  return {
    title: { absolute: `${t.metaTitle} · ${site.brand}` },
    description: t.metaDescription,
    alternates: { canonical: PATH[lang], languages: languageAlternates(PATH.en, PATH.es) },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `${site.url}${PATH[lang]}`,
      locale: OG_LOCALE[lang],
    },
  };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function PlanIntakePage({ lang, searchParams }: { lang: PlanLang; searchParams: IntakeSearch }) {
  const q = await searchParams;
  const today = todayInDallas();
  const [y, m, d] = today.split("-").map(Number);
  const maxDate = `${y + 3}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const cities = Array.from(new Set([...locations.map((l) => l.city), "Grand Prairie", "Mesquite", "Denton", "Carrollton", "Lewisville", "Richardson", "Garland", "Oak Cliff", "Balch Springs"])).sort();
  return (
    <PlanIntake
      lang={lang}
      initialDate={prefillDate(one(q.date))}
      initialColors={parseColors(one(q.colors) ?? "")}
      src={sanitizeSource(one(q.src))}
      minDate={today}
      maxDate={maxDate}
      cities={cities}
      errorCode={one(q.e) ?? null}
    />
  );
}
