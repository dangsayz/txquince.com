/**
 * inquiry-message.ts — read a package-picker inquiry back out of its message.
 *
 * The picker's request is stored as plain lines (describeInquiryPackage in
 * inquiry-package.ts, describeCommission in commission.ts). The owner's inquiry
 * page shows those lines as a laid-out request and as a script to say back to
 * the family on a call. A message a person typed (the contact form) has no
 * "Package:" line: parse returns null and the page shows their words as written.
 *
 * Pure: safe for server components and tests. Only repeats what the message
 * says; it never prices or adds a fact.
 */

export type Extra = { name: string; price: string };

export type PickedRequest = {
  /** "Sent from the package picker. Nothing was booked or charged." or the offer line. */
  intro: string | null;
  /** True when the family named their own price on the budget page. */
  isOffer: boolean;
  packageName: string;
  packagePrice: string | null;
  includedHours: string | null;
  hours: string | null;
  extras: Extra[];
  team: string | null;
  coordinatorIncluded: boolean;
  total: string | null;
  deposit: string | null;
  depositPercent: string | null;
  balance: string | null;
  signedBy: string | null;
  city: string | null;
  venue: string | null;
  startTime: string | null;
  honoree: string | null;
  language: string | null;
  note: string | null;
  /** null when the message does not say. */
  sharePhotos: boolean | null;
};

const after = (line: string, label: string) => line.slice(label.length).trim();

export function parsePickedRequest(message: string | null | undefined): PickedRequest | null {
  if (!message) return null;
  const lines = message.replace(/\r\n/g, "\n").split("\n");
  if (!lines.some((l) => l.startsWith("Package: "))) return null;

  const r: PickedRequest = {
    intro: null,
    isOffer: false,
    packageName: "",
    packagePrice: null,
    includedHours: null,
    hours: null,
    extras: [],
    team: null,
    coordinatorIncluded: false,
    total: null,
    deposit: null,
    depositPercent: null,
    balance: null,
    signedBy: null,
    city: null,
    venue: null,
    startTime: null,
    honoree: null,
    language: null,
    note: null,
    sharePhotos: null,
  };

  const note: string[] = [];
  let inNote = false;
  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();
    const share = /^OK to share some photos publicly:\s*(yes|no)$/i.exec(line);
    if (share) {
      r.sharePhotos = share[1].toLowerCase() === "yes";
      inNote = false;
      continue;
    }
    if (inNote) {
      note.push(raw);
      continue;
    }
    if (line === "Note from family:") {
      inNote = true;
      continue;
    }
    if (!line) continue;
    if (i === 0 && !line.startsWith("Package: ")) {
      r.intro = line;
      r.isOffer = line.startsWith("OFFER");
      continue;
    }
    if (line.startsWith("Package: ")) {
      const m = /^(.*?)\s+—\s+(\$[\d,.]+)(?:\s+\((.+?) hrs included\))?$/.exec(after(line, "Package: "));
      r.packageName = m ? m[1] : after(line, "Package: ");
      r.packagePrice = m?.[2] ?? null;
      r.includedHours = m?.[3] ?? null;
    } else if (line.startsWith("+ ")) {
      const m = /^(.*?)\s+—\s+(\$[\d,.]+)$/.exec(after(line, "+ "));
      r.extras.push(m ? { name: m[1], price: m[2] } : { name: after(line, "+ "), price: "" });
    } else if (line.startsWith("Hours on the day: ")) r.hours = after(line, "Hours on the day: ");
    else if (line.startsWith("Team ")) r.team = line.slice(line.indexOf(":") + 1).trim();
    else if (line === "Day-of coordinator: included") r.coordinatorIncluded = true;
    else if (line.startsWith("Total: ")) {
      const m = /^Total: (\$[\d,.]+) · Deposit \((\d+)%\): (\$[\d,.]+) · Balance: (\$[\d,.]+)$/.exec(line);
      if (m) [, r.total, r.depositPercent, r.deposit, r.balance] = m;
      else r.total = after(line, "Total: ");
    } else if (line.startsWith("Signed by: ")) r.signedBy = after(line, "Signed by: ");
    else if (line.startsWith("City: ")) {
      for (const part of line.split(" · ")) {
        if (part.startsWith("City: ")) r.city = after(part, "City: ");
        else if (part.startsWith("Venue: ")) r.venue = after(part, "Venue: ");
        else if (part.startsWith("Starts: ")) r.startTime = after(part, "Starts: ");
        // A venue name with " · " in it: keep the rest with the venue.
        else if (r.venue && !r.startTime) r.venue += ` · ${part}`;
      }
    } else if (line.startsWith("Quinceañera: ")) r.honoree = after(line, "Quinceañera: ");
    else if (line.startsWith("Preferred language: ")) r.language = after(line, "Preferred language: ");
  }
  r.note = note.join("\n").trim() || null;
  return r.packageName ? r : null;
}

/** "a, b and c" (or "a, b y c"). */
function list(items: string[], and = "and"): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

export type ScriptStep = { topic: string; say: string };
export type ScriptLang = "en" | "es";

/** Words the script uses, per language. Only the owner's own phrasing: no facts. */
const WORDS = {
  en: {
    open: (name: string) => `So ${name}, let me make sure I have this right.`,
    close: "Did I get all of that right?",
    day: "The day",
    start: "Start time",
    pkg: "The package",
    extras: "Extras",
    coordinator: "Coordinator",
    price: "The price",
    note: "Your note",
    photos: "Photos",
    whose: (h: string | null) => (h ? `${h}'s quinceañera` : "The quinceañera"),
    on: (d: string) => `on ${d}`,
    inCity: (c: string) => `in ${c}`,
    atVenue: (v: string) => `at ${v}`,
    is: "is",
    startAt: (t: string) => `We start at ${t}.`,
    picked: (p: string) => `You picked ${p}`,
    withTeam: (t: string) => `, with ${t.replace(" + ", " and ")}`,
    forHours: (h: string) => `, for ${h} ${h === "1" ? "hour" : "hours"}`,
    added: (x: string) => `You added ${x}.`,
    extraFor: (n: string, p: string) => `${n} for ${p}`,
    and: "and",
    coordinatorIncluded: "A day-of coordinator is included.",
    total: (t: string) => `The total is ${t}.`,
    deposit: (d: string, pct: string | null) => ` The deposit is ${d}${pct ? `, that is ${pct}%` : ""}.`,
    balance: (b: string) => ` The balance is ${b}.`,
    told: (n: string) => `You told us: “${n}”`,
    shareYes: "You are okay with us sharing some photos publicly.",
    shareNo: "You do not want us to share photos publicly.",
  },
  es: {
    open: (name: string) => `Entonces ${name}, déjeme confirmar que tengo todo bien.`,
    close: "¿Tengo todo bien?",
    day: "El día",
    start: "Hora de inicio",
    pkg: "El paquete",
    extras: "Extras",
    coordinator: "Coordinadora",
    price: "El precio",
    note: "Su nota",
    photos: "Fotos",
    whose: (h: string | null) => (h ? `Los quince de ${h} son` : "Los quince son"),
    on: (d: string) => `el ${d}`,
    inCity: (c: string) => `en ${c}`,
    atVenue: (v: string) => `en ${v}`,
    is: "",
    startAt: (t: string) => `Empezamos a las ${t}.`,
    picked: (p: string) => `Eligió ${p}`,
    withTeam: (t: string) =>
      `, con ${t
        .replace(/(\d+) photographers?/, (_, n: string) => `${n} ${n === "1" ? "fotógrafo" : "fotógrafos"}`)
        .replace(/(\d+) videographers?/, (_, n: string) => `${n} ${n === "1" ? "videógrafo" : "videógrafos"}`)
        .replace(" + ", " y ")}`,
    forHours: (h: string) => `, por ${h} ${h === "1" ? "hora" : "horas"}`,
    added: (x: string) => `Agregó ${x}.`,
    extraFor: (n: string, p: string) => `${n} por ${p}`,
    and: "y",
    coordinatorIncluded: "Incluye una coordinadora para el día.",
    total: (t: string) => `El total es ${t}.`,
    deposit: (d: string, pct: string | null) => ` El depósito es ${d}${pct ? `, o sea el ${pct}%` : ""}.`,
    balance: (b: string) => ` El resto es ${b}.`,
    told: (n: string) => `Nos dijo: “${n}”`,
    shareYes: "Está de acuerdo con que compartamos algunas fotos en público.",
    shareNo: "Prefiere que no compartamos fotos en público.",
  },
} as const;

/** The opening and closing lines of the call, in the family's language. */
export function scriptBookends(lang: ScriptLang, name: string): { open: string; close: string } {
  return { open: WORDS[lang].open(name), close: WORDS[lang].close };
}

/** "Español" on the request means the call goes in Spanish. */
export const scriptLangFor = (r: PickedRequest): ScriptLang => (r.language === "Español" ? "es" : "en");

/**
 * The request said back to the family, one point at a time, in the order a
 * call goes: the day, the package, extras, the money, their note, photo sharing.
 * `eventLabel` is the formatted date in the script's language, when known.
 * Package and extra names stay as the family saw them on the site.
 */
export function callScript(r: PickedRequest, eventLabel: string | null, lang: ScriptLang = "en"): ScriptStep[] {
  const w = WORDS[lang];
  const steps: ScriptStep[] = [];

  const where = [r.city ? w.inCity(r.city) : "", r.venue ? w.atVenue(r.venue) : ""].filter(Boolean).join(", ");
  if (eventLabel || where) {
    const when = [eventLabel ? w.on(eventLabel) : "", where].filter(Boolean).join(", ");
    steps.push({ topic: w.day, say: `${[w.whose(r.honoree), w.is, when].filter(Boolean).join(" ")}.` });
  }
  if (r.startTime) steps.push({ topic: w.start, say: w.startAt(r.startTime) });

  steps.push({ topic: w.pkg, say: `${w.picked(r.packageName)}${r.team ? w.withTeam(r.team) : ""}${r.hours ? w.forHours(r.hours) : ""}.` });

  const extras = r.extras.map((e) => (e.price ? w.extraFor(e.name, e.price) : e.name));
  if (extras.length) steps.push({ topic: w.extras, say: w.added(list(extras, w.and)) });
  if (r.coordinatorIncluded) steps.push({ topic: w.coordinator, say: w.coordinatorIncluded });

  if (r.total) {
    steps.push({ topic: w.price, say: `${w.total(r.total)}${r.deposit ? w.deposit(r.deposit, r.depositPercent) : ""}${r.balance ? w.balance(r.balance) : ""}` });
  }
  if (r.note) steps.push({ topic: w.note, say: w.told(r.note.replace(/\s*\n\s*/g, " ")) });
  if (r.sharePhotos !== null) steps.push({ topic: w.photos, say: r.sharePhotos ? w.shareYes : w.shareNo });
  return steps;
}

/** Minutes after midnight for "4:47 PM", "1", "6pm", "10:30 p.m.". `pm` guesses afternoon for a bare hour. */
function minutes(h: string, m: string | undefined, ampm: string | undefined, pmGuess: boolean): number {
  let hour = Number(h) % 12;
  const isPm = ampm ? /^p/i.test(ampm) : pmGuess;
  if (isPm) hour += 12;
  return hour * 60 + (m ? Number(m) : 0);
}

const clock = (mins: number) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
};

/**
 * A warning when the family's note names times and the start time is not one
 * of them (the form's start time vs "church at 1 then event at 6"). Null when
 * they agree or the note names no time. Only compares what they wrote.
 */
export function startTimeCheck(r: PickedRequest, lang: ScriptLang = "en"): string | null {
  if (!r.startTime || !r.note) return null;
  const start = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(r.startTime.trim());
  if (!start) return null;
  const startMins = minutes(start[1], start[2], start[3], false);
  // A time in the note: "at 1", "a la 1", "1pm", "6:30", "6 - 10pm", "de 6 a 10" (both ends of a range).
  const found: number[] = [];
  const re = /(?:\bat\s+|\ba las?\s+|\b)(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?(?=\b|\s|$)/gi;
  for (const m of r.note.matchAll(re)) {
    const hasAt = /^(at|a las?)\s/i.test(m[0].trim());
    const n = Number(m[1]);
    if (n < 1 || n > 12) continue;
    // A bare number only counts when it reads as a time ("at 1", "1pm", "6:30", "6 - 10pm").
    const rangeStart = /^\s*(?:[-–]|a)\s*\d/.test(r.note.slice((m.index ?? 0) + m[0].length));
    if (!m[2] && !m[3] && !hasAt && !rangeStart) continue;
    // Quince days run late morning to night: a bare 1 to 11 is afternoon or evening.
    found.push(minutes(m[1], m[2], m[3], n < 12 && n >= 1));
  }
  if (!found.length || found.includes(startMins)) return null;
  const listed = list([...new Set(found)].sort((a, b) => a - b).map(clock), lang === "es" ? "y" : "and");
  return lang === "es"
    ? `La hora de inicio dice ${r.startTime}, pero su nota menciona ${listed}. Pregunte a qué hora empezamos.`
    : `The start time says ${r.startTime}, but their note mentions ${listed}. Ask which time we start.`;
}
