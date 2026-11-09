/**
 * plan-stages.ts — "Her date, her plan": the planning post's own checklist
 * turned into dated tasks.
 *
 * Nothing here is written twice. Stages and tasks are read from the post's
 * blocks: a heading such as "9–10 months out: dress and court" followed by a
 * list becomes a stage that is due 9 months before the party, and each list
 * item becomes one task (its first sentence). Edit the post and the planner
 * follows. No server imports: used by the client planner and by tests.
 */
import type { BlogBlock } from "@/content/blog";

export type PlanLang = "en" | "es";
export type PlanOffset = { months: number } | { days: number };
export type PlanTask = { id: string; title: string; detail: string };
export type PlanStage = {
  /** Stable key, e.g. "m9" or "d7". */
  key: string;
  /** The post's own window wording: "9–10 months out". */
  window: string;
  /** What the stage is about: "dress and court" (may be empty). */
  label: string;
  offset: PlanOffset;
  tasks: PlanTask[];
};

const WORD_ONE = /^(one|un|una)$/i;

/** Read "9–10 months out: dress and court" / "Una semana antes" → offset + parts. */
export function parseStageHeading(text: string): { window: string; label: string; offset: PlanOffset } | null {
  const m = /^(\d+|one|un|una)(?:\s*[–-]\s*(\d+))?\s+(months?|weeks?|mes(?:es)?|semanas?)\s+(?:out|antes)\b\s*:?\s*(.*)$/i.exec(
    text.trim(),
  );
  if (!m) return null;
  const n = WORD_ONE.test(m[1]) ? 1 : Number(m[1]);
  const unitIsWeek = /^(week|semana)/i.test(m[3]);
  const window = text.trim().slice(0, text.trim().length - m[4].length).replace(/\s*:\s*$/, "");
  return { window, label: m[4].trim(), offset: unitIsWeek ? { days: n * 7 } : { months: n } };
}

/** Drop markdown links and keep their label: "[check your date](/x)" → "check your date". */
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

/** First sentence is the task; the rest is its detail. */
export function splitTask(item: string): { title: string; detail: string } {
  const text = plain(item).trim();
  const cut = text.search(/[.!?](\s|$)/);
  if (cut < 0) return { title: text, detail: "" };
  return { title: text.slice(0, cut + 1).replace(/\.$/, ""), detail: text.slice(cut + 1).trim() };
}

/** Walk the post: each stage heading owns the first list that follows it. */
export function planStages(blocks: BlogBlock[]): PlanStage[] {
  const stages: PlanStage[] = [];
  let open: Omit<PlanStage, "tasks"> | null = null;
  for (const b of blocks) {
    if (b.type === "h2" || b.type === "h3") {
      const parsed = parseStageHeading(b.text);
      open = parsed
        ? { key: "months" in parsed.offset ? `m${parsed.offset.months}` : `d${parsed.offset.days}`, ...parsed }
        : null;
      continue;
    }
    if (open && (b.type === "ul" || b.type === "ol")) {
      const stage = open;
      stages.push({
        ...stage,
        tasks: b.items.map((item, i) => ({ id: `${stage.key}-${i}`, ...splitTask(item) })),
      });
      open = null;
    }
  }
  return stages;
}

// ---------------------------------------------------------------------------
// Dates (local calendar days as "YYYY-MM-DD"; no time zones involved)
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0");
export const toIso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

export function parseIso(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return { y, m: mo, d };
}

const fromUtc = (dt: Date) => toIso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());

/** The day a stage is due: the party date minus its offset (May 31 − 3 months = Feb 28). */
export function dueDate(partyIso: string, offset: PlanOffset): string | null {
  const p = parseIso(partyIso);
  if (!p) return null;
  if ("days" in offset) return fromUtc(new Date(Date.UTC(p.y, p.m - 1, p.d - offset.days)));
  const first = new Date(Date.UTC(p.y, p.m - 1 - offset.months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return toIso(first.getUTCFullYear(), first.getUTCMonth() + 1, Math.min(p.d, lastDay));
}

/** Whole days from `fromIso` to `toIso` (negative when `to` is earlier). */
export function daysBetween(fromIso: string, toIsoDate: string): number | null {
  const a = parseIso(fromIso);
  const b = parseIso(toIsoDate);
  if (!a || !b) return null;
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

export function formatDay(iso: string, lang: PlanLang): string {
  const p = parseIso(iso);
  if (!p) return "";
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(p.y, p.m - 1, p.d)));
}

export type StageStatus = "late" | "now" | "later" | "done";

export type DatedStage = PlanStage & { due: string | null; status: StageStatus; doneCount: number };

/**
 * Put dates and a status on every stage. With no party date, stages keep the
 * post's order and nothing is late. "now" is the first stage that is not done
 * and not late; every unfinished stage whose due day has passed is "late".
 */
export function dateStages(stages: PlanStage[], partyIso: string | null, todayIso: string, done: ReadonlySet<string>): DatedStage[] {
  let nowTaken = false;
  return stages.map((s) => {
    const due = partyIso ? dueDate(partyIso, s.offset) : null;
    const doneCount = s.tasks.filter((t) => done.has(t.id)).length;
    let status: StageStatus;
    if (doneCount === s.tasks.length) status = "done";
    else if (due && (daysBetween(todayIso, due) ?? 0) < 0) status = "late";
    else if (!nowTaken) {
      status = "now";
      nowTaken = true;
    } else status = "later";
    return { ...s, due, status, doneCount };
  });
}

// ---------------------------------------------------------------------------
// Sharing: plain text for WhatsApp / Messages, and a calendar file
// ---------------------------------------------------------------------------

const SHARE = {
  en: { title: "Our quince plan", party: "Party day", by: "By", done: "done", made: "Made with the TX Quince planner" },
  es: { title: "Nuestro plan de quince", party: "Día de la fiesta", by: "Antes del", done: "listo", made: "Hecho con el planeador de TX Quince" },
} as const;

/** The plan as a short message: unfinished tasks first, grouped by stage. */
export function planText(stages: DatedStage[], partyIso: string | null, lang: PlanLang, done: ReadonlySet<string>, url: string): string {
  const c = SHARE[lang];
  const lines: string[] = [partyIso ? `${c.title} · ${c.party}: ${formatDay(partyIso, lang)}` : c.title, ""];
  for (const s of stages) {
    const open = s.tasks.filter((t) => !done.has(t.id));
    if (!open.length) continue;
    lines.push(s.due ? `${c.by} ${formatDay(s.due, lang)} (${s.window})` : s.window);
    for (const t of open) lines.push(`☐ ${t.title}`);
    lines.push("");
  }
  lines.push(`${c.made}: ${url}`);
  return lines.join("\n");
}

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsDay = (iso: string) => iso.replace(/-/g, "");
const nextDay = (iso: string) => {
  const p = parseIso(iso)!;
  return fromUtc(new Date(Date.UTC(p.y, p.m - 1, p.d + 1)));
};

/** An .ics file: one all-day entry per unfinished stage, plus the party day. */
export function planIcs(stages: DatedStage[], partyIso: string, lang: PlanLang, done: ReadonlySet<string>, stamp: string): string {
  const c = SHARE[lang];
  const events = stages
    .filter((s) => s.due && s.tasks.some((t) => !done.has(t.id)))
    .map((s) => ({
      day: s.due!,
      uid: `plan-${s.key}-${partyIso}@txquince.com`,
      summary: `${c.title}: ${s.label || s.window}`,
      description: s.tasks.filter((t) => !done.has(t.id)).map((t) => `- ${t.title}`).join("\n"),
    }));
  events.push({ day: partyIso, uid: `plan-party-${partyIso}@txquince.com`, summary: `${c.party} ✨`, description: "" });
  const body = events.flatMap((e) => [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDay(e.day)}`,
    `DTEND;VALUE=DATE:${icsDay(nextDay(e.day))}`,
    `SUMMARY:${icsEscape(e.summary)}`,
    ...(e.description ? [`DESCRIPTION:${icsEscape(e.description)}`] : []),
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ]);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TX Quince//Quince planner//EN", "CALSCALE:GREGORIAN", ...body, "END:VCALENDAR"].join("\r\n") + "\r\n";
}
