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

/** "a, b and c" */
function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export type ScriptStep = { topic: string; say: string };

/**
 * The request said back to the family, one point at a time, in the order a
 * call goes: the day, the package, extras, the money, their note, photo sharing.
 * `eventLabel` is the formatted date ("Saturday, January 23, 2027") when known.
 */
export function callScript(r: PickedRequest, eventLabel: string | null): ScriptStep[] {
  const steps: ScriptStep[] = [];

  const where = [r.city ? `in ${r.city}` : "", r.venue ? `at ${r.venue}` : ""].filter(Boolean).join(", ");
  const whose = r.honoree ? `${r.honoree}'s quinceañera` : "The quinceañera";
  if (eventLabel || where) {
    steps.push({ topic: "The day", say: `${whose} is ${[eventLabel ? `on ${eventLabel}` : "", where].filter(Boolean).join(", ")}.` });
  }
  if (r.startTime) steps.push({ topic: "Start time", say: `We start at ${r.startTime}.` });

  const withTeam = r.team ? `, with ${r.team.replace(" + ", " and ")}` : "";
  const forHours = r.hours ? `, for ${r.hours} ${r.hours === "1" ? "hour" : "hours"}` : "";
  steps.push({ topic: "The package", say: `You picked ${r.packageName}${withTeam}${forHours}.` });

  const extras = r.extras.map((e) => (e.price ? `${e.name} for ${e.price}` : e.name));
  if (extras.length) steps.push({ topic: "Extras", say: `You added ${list(extras)}.` });
  if (r.coordinatorIncluded) steps.push({ topic: "Coordinator", say: "A day-of coordinator is included." });

  if (r.total) {
    const deposit = r.deposit ? ` The deposit is ${r.deposit}${r.depositPercent ? `, that is ${r.depositPercent}%` : ""}.` : "";
    const balance = r.balance ? ` The balance is ${r.balance}.` : "";
    steps.push({ topic: "The price", say: `The total is ${r.total}.${deposit}${balance}` });
  }
  if (r.note) steps.push({ topic: "Your note", say: `You told us: “${r.note.replace(/\s*\n\s*/g, " ")}”` });
  if (r.sharePhotos !== null) {
    steps.push({
      topic: "Photos",
      say: r.sharePhotos ? "You are okay with us sharing some photos publicly." : "You do not want us to share photos publicly.",
    });
  }
  return steps;
}
