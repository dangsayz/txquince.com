/**
 * price-guide.ts — the DFW quince price guide (pure; client + server + tests).
 *
 *   parsePriceGuideSheet() — rows copied from the lead sheet (Google Sheets
 *     copies tab-separated; a CSV export works too) → validated rows.
 *   priceGuideFaq() — the FAQ (page body + FAQPage JSON-LD), written from the
 *     numbers themselves so it can never disagree with the table.
 */
import { isRealIsoDate, type PlanLang } from "@/lib/plan";

export type GuideRowInput = {
  category: string;
  category_es: string | null;
  low_usd: number;
  typical_usd: number;
  high_usd: number;
  sample_count: number;
  last_updated: string;
  sort_order: number;
};

/** The fields the public page reads (a subset of the DB row). */
export type GuideRow = Pick<GuideRowInput, "category" | "category_es" | "low_usd" | "typical_usd" | "high_usd" | "sample_count" | "last_updated">;

type Col = "category" | "category_es" | "low" | "typical" | "high" | "samples" | "updated";
const DEFAULT_ORDER: Col[] = ["category", "category_es", "low", "typical", "high", "samples", "updated"];

const HEADER_WORDS: Record<string, Col> = {
  category: "category", categoria: "category", "category en": "category", "category english": "category",
  "category es": "category_es", "categoria es": "category_es", "category spanish": "category_es", spanish: "category_es", espanol: "category_es",
  low: "low", bajo: "low", min: "low", minimum: "low",
  typical: "typical", tipico: "typical", median: "typical", mediana: "typical", avg: "typical", average: "typical", promedio: "typical",
  high: "high", alto: "high", max: "high", maximum: "high",
  samples: "samples", "sample count": "samples", count: "samples", muestras: "samples", n: "samples", quotes: "samples",
  updated: "updated", "last updated": "updated", actualizado: "updated", date: "updated", fecha: "updated",
};

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function splitLine(line: string, sep: string): string[] {
  if (sep === "\t") return line.split("\t").map((c) => c.trim());
  // Minimal CSV: commas outside double quotes; "" is an escaped quote.
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** "$1,250" / "1250.00" / "1.2k" → 1250. NaN when it isn't a money amount. */
export function parseUsd(v: string | undefined): number {
  if (!v) return NaN;
  const s = v.replace(/[$\s,]/g, "").toLowerCase();
  const k = s.endsWith("k");
  const n = Number(k ? s.slice(0, -1) : s);
  return Number.isFinite(n) && n >= 0 ? Math.round(k ? n * 1000 : n) : NaN;
}

/** "10/31/2026" or "2026-10-31" → "2026-10-31"; anything else → null. */
function parseDate(v: string | undefined): string | null {
  if (!v) return null;
  const s = v.trim();
  if (isRealIsoDate(s)) return s;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(s);
  if (!m) return null;
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  const iso = `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  return isRealIsoDate(iso) ? iso : null;
}

export type ParsedSheet = { rows: GuideRowInput[]; errors: string[] };

/**
 * Parse pasted rows. A header row is optional: with one, columns are matched
 * by name (English or Spanish); without, the order is
 *   category · category (Spanish) · low · typical · high · samples · last updated
 * A row with low > typical > high, missing numbers or no category is reported,
 * not guessed. `today` fills a missing last-updated date.
 */
export function parsePriceGuideSheet(text: string, today: string): ParsedSheet {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim());
  const errors: string[] = [];
  if (!lines.length) return { rows: [], errors: ["Paste at least one row."] };
  const sep = lines.some((l) => l.includes("\t")) ? "\t" : ",";

  let order = DEFAULT_ORDER;
  const first = splitLine(lines[0], sep).map(fold);
  if (first.some((c) => HEADER_WORDS[c] === "category")) {
    // "Category" + "Categoría" fold alike: the second category column is the Spanish one.
    let seenCategory = false;
    order = first.map((c) => {
      const col = HEADER_WORDS[c] ?? ("ignore" as Col);
      if (col !== "category") return col;
      if (seenCategory) return "category_es";
      seenCategory = true;
      return col;
    });
    lines.shift();
  }
  const at = (cells: string[], col: Col) => {
    const i = order.indexOf(col);
    return i >= 0 ? cells[i] : undefined;
  };

  const rows: GuideRowInput[] = [];
  lines.forEach((line, i) => {
    const cells = splitLine(line, sep);
    const n = i + 1;
    const category = (at(cells, "category") ?? "").trim();
    const low = parseUsd(at(cells, "low"));
    const typical = parseUsd(at(cells, "typical"));
    const high = parseUsd(at(cells, "high"));
    const samplesRaw = (at(cells, "samples") ?? "").replace(/[,\s]/g, "");
    const samples = samplesRaw ? Number(samplesRaw) : 0;
    if (category.length < 2) return void errors.push(`Row ${n}: missing category.`);
    if (category.length > 80) return void errors.push(`Row ${n}: category is longer than 80 characters.`);
    if ([low, typical, high].some((x) => Number.isNaN(x))) return void errors.push(`Row ${n} (${category}): low, typical and high must be dollar amounts.`);
    if (!(low <= typical && typical <= high)) return void errors.push(`Row ${n} (${category}): low ≤ typical ≤ high is required (got ${low} / ${typical} / ${high}).`);
    if (!Number.isInteger(samples) || samples < 0) return void errors.push(`Row ${n} (${category}): sample count must be a whole number.`);
    const es = (at(cells, "category_es") ?? "").trim();
    rows.push({
      category,
      category_es: es ? es.slice(0, 80) : null,
      low_usd: low,
      typical_usd: typical,
      high_usd: high,
      sample_count: samples,
      last_updated: parseDate(at(cells, "updated")) ?? today,
      sort_order: rows.length,
    });
  });
  if (rows.length > 200) errors.push("At most 200 rows.");
  return { rows: rows.slice(0, 200), errors };
}

export const guideUsd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function guideCategory(row: GuideRow, lang: PlanLang): string {
  return lang === "es" ? row.category_es || row.category : row.category;
}

/** Newest last-updated date across rows (ISO), or null. */
export function guideUpdated(rows: readonly GuideRow[]): string | null {
  return rows.reduce<string | null>((max, r) => (!max || r.last_updated > max ? r.last_updated : max), null);
}

export function guideSamples(rows: readonly GuideRow[]): number {
  return rows.reduce((s, r) => s + r.sample_count, 0);
}

export type FaqItem = { q: string; a: string };

/**
 * The FAQ, written from the data: one question per category (the most-quoted
 * first, at most 6) plus how the numbers were gathered.
 */
export function priceGuideFaq(rows: readonly GuideRow[], lang: PlanLang, updatedLabel: string): FaqItem[] {
  if (!rows.length) return [];
  const total = guideSamples(rows);
  const top = [...rows].sort((a, b) => b.sample_count - a.sample_count).slice(0, 6);
  const items: FaqItem[] = top.map((r) => {
    const cat = guideCategory(r, lang);
    const n = r.sample_count;
    return lang === "es"
      ? {
          q: `¿Cuánto cuesta ${cat.toLowerCase()} para una quinceañera en Dallas–Fort Worth?`,
          a: `En DFW, ${cat.toLowerCase()} cuesta normalmente alrededor de ${guideUsd(r.typical_usd)}. El rango que vemos va de ${guideUsd(r.low_usd)} a ${guideUsd(r.high_usd)}${n ? `, según ${n} ${n === 1 ? "cotización" : "cotizaciones"} reales de familias` : ""}.`,
        }
      : {
          q: `How much does ${cat.toLowerCase()} cost for a quinceañera in Dallas–Fort Worth?`,
          a: `In DFW, ${cat.toLowerCase()} typically runs about ${guideUsd(r.typical_usd)}. The range we see is ${guideUsd(r.low_usd)} to ${guideUsd(r.high_usd)}${n ? `, based on ${n} real ${n === 1 ? "quote" : "quotes"} families shared with us` : ""}.`,
        };
  });
  items.push(
    lang === "es"
      ? {
          q: "¿De dónde salen estos precios?",
          a: `De cotizaciones reales que familias de Dallas–Fort Worth nos compartieron al planear su quinceañera${total ? ` (${total} en total)` : ""}. "Típico" es lo que paga la mayoría; "bajo" y "alto" son los extremos que vimos. Última actualización: ${updatedLabel}.`,
        }
      : {
          q: "Where do these prices come from?",
          a: `From real quotes Dallas–Fort Worth families shared with us while planning their quinceañera${total ? ` (${total} in all)` : ""}. "Typical" is what most families pay; "low" and "high" are the ends of the range we saw. Last updated ${updatedLabel}.`,
        },
  );
  return items;
}
