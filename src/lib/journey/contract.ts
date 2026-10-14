/**
 * contract.ts — the agreement a family signs on their page, built from the
 * booking's OWN snapshot (request details + the price book as it was at
 * request time) and the newest contract template. Pure.
 */
import { buildAgreement, type Agreement, type AgreementSection } from "@/lib/agreement";
import type { PriceBook } from "@/lib/commission";
import { CANCELLATION_POLICY } from "./policy";
import type { BookingRow, ContractTemplateRow, Lang, TemplateLangOverrides } from "./types";

export type AgreementDraft = Agreement & { templateVersion: number };

function cleanLines(v: unknown, max = 20): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").map((s) => s.trim().slice(0, 600)).filter(Boolean).slice(0, max)
    : [];
}

/** Defensive parse of a stored/posted template language block. */
export function normalizeOverrides(v: unknown): TemplateLangOverrides {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const changes = cleanLines(o.changes);
  const extra = Array.isArray(o.extra)
    ? (o.extra as unknown[])
        .map((s) => {
          const r = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
          return { title: typeof r.title === "string" ? r.title.trim().slice(0, 120) : "", lines: cleanLines(r.lines) };
        })
        .filter((s) => s.title && s.lines.length)
        .slice(0, 8)
    : [];
  return { ...(changes.length ? { changes } : {}), ...(extra.length ? { extra } : {}) };
}

/**
 * The agreement for this booking, or null when the booking predates the
 * journey (no request snapshot) — those were signed at request time already.
 */
export function agreementForBooking(
  b: Pick<BookingRow, "request" | "price_book" | "lang" | "event_date" | "name" | "email" | "phone">,
  template: ContractTemplateRow | null,
): AgreementDraft | null {
  if (!b.request || !b.price_book) return null;
  const lang: Lang = b.lang === "es" ? "es" : "en";
  const r = b.request;
  const overrides = template ? normalizeOverrides(template[lang]) : {};
  const extra: AgreementSection[] = overrides.extra ?? [];
  const a = buildAgreement(
    {
      lang,
      tier: r.tier,
      hours: r.hours,
      crew: r.crew,
      addOns: r.addOns,
      eventDate: b.event_date,
      cityLabel: r.cityLabel,
      venue: r.venue,
      startTime: r.startTime,
      honoree: r.honoree,
      name: b.name,
      email: b.email,
      phone: b.phone ?? "",
      sharePermission: r.sharePermission,
    },
    b.price_book as PriceBook,
    {
      flow: "journey",
      changesTitle: CANCELLATION_POLICY[lang].title,
      changes: overrides.changes ?? CANCELLATION_POLICY[lang].lines,
      extra,
    },
  );
  return { ...a, templateVersion: template?.version ?? 0 };
}
