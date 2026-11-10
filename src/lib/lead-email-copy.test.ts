import { describe, expect, it } from "vitest";
import {
  type EmailCopy,
  type LeadLang,
  bothSubject,
  copyToText,
  followupCopy,
  isFollowupStep,
  leadLangFrom,
  recoveryCopy,
} from "./lead-email-copy";

const ctx = {
  firstName: "Ana",
  siteUrl: "https://txquince.com",
  portraitPrice: "$400",
  photoVideoFrom: "$1,200",
  depositPercent: 25,
  balanceDue: { en: "14 days", es: "14 días" },
};
const rctx = {
  firstName: "Ana",
  eventDate: { en: "Saturday, March 13, 2027", es: "sábado, 13 de marzo de 2027" },
  packageName: "The Solo",
  replyEmail: "quincebookings@gmail.com",
};

const all: { name: string; lang: LeadLang; copy: EmailCopy }[] = [];
for (const lang of ["en", "es"] as const) {
  for (const step of [1, 2, 3] as const) all.push({ name: `followup ${step} ${lang}`, lang, copy: followupCopy(step, lang, ctx) });
  all.push({ name: `recovery ${lang}`, lang, copy: recoveryCopy(lang, rctx) });
}
const words = (c: EmailCopy) => [c.subject, c.greeting, ...c.lines.map((l) => l.text), c.cta.label, copyToText(c)].join("\n");

describe("lead email copy", () => {
  it.each(all)("$name makes no claim the site can't check", ({ copy }) => {
    const t = words(copy).toLowerCase();
    for (const banned of [
      "call",
      "llamada",
      "limited number",
      "fill early",
      "holding a window",
      "whoever reserves first",
      "still open",
      "sigue disponible",
      "two minutes",
      "dos minutos",
      "daughter",
    ])
      expect(t).not.toContain(banned);
    expect(words(copy)).not.toMatch(/[—–]/); // no dashes
  });

  it.each(all)("$name greets in its own language", ({ lang, copy }) => {
    expect(copy.greeting).toBe(lang === "es" ? "Hola Ana," : "Hi Ana,");
  });

  it("states only price-book facts in touch 2", () => {
    for (const lang of ["en", "es"] as const) {
      const t = words(followupCopy(2, lang, ctx));
      expect(t).toContain("25%");
      expect(t).toContain(lang === "es" ? "14 días" : "14 days");
    }
    expect(words(followupCopy(1, "en", ctx))).toContain("$400");
    expect(words(followupCopy(1, "es", ctx))).toContain("$1,200");
  });

  it("sends Spanish families to the Spanish pages", () => {
    const es = followupCopy(2, "es", ctx);
    expect(es.cta.url).toBe("https://txquince.com/es#intake");
    expect(followupCopy(1, "es", ctx).lines.find((l) => l.link?.url.includes("#commissions"))?.link?.url).toBe(
      "https://txquince.com/es#commissions",
    );
    expect(followupCopy(2, "en", ctx).cta.url).toBe("https://txquince.com#intake");
  });

  it("recovery asks for a reply and says nothing was charged", () => {
    const en = recoveryCopy("en", rctx);
    expect(en.cta.url.startsWith("mailto:quincebookings@gmail.com?subject=")).toBe(true);
    expect(words(en)).toContain("nothing was charged");
    expect(words(recoveryCopy("es", rctx))).toContain("no se cobró nada");
  });

  it("reads well with no first name", () => {
    const blank = { ...ctx, firstName: "" };
    expect(followupCopy(1, "en", blank).greeting).toBe("Hi there,");
    expect(followupCopy(1, "es", blank).greeting).toBe("Hola,");
    expect(followupCopy(1, "en", blank).subject).toBe("Did you get a chance to look?");
    expect(recoveryCopy("en", { ...rctx, firstName: "" }).subject).toBe("About your hold for Saturday, March 13, 2027");
  });

  it("reads the language the family picked", () => {
    expect(leadLangFrom("Español")).toBe("es");
    expect(leadLangFrom("English")).toBe("en");
    expect(leadLangFrom("es")).toBe("es");
    expect(leadLangFrom(undefined)).toBe("both");
    expect(leadLangFrom("")).toBe("both");
  });

  it("guards the step range", () => {
    expect(isFollowupStep(0)).toBe(false);
    expect(isFollowupStep(4)).toBe(false);
    expect(isFollowupStep(3)).toBe(true);
  });

  it("joins both subjects when the language is unknown", () => {
    expect(bothSubject("A", "B")).toBe("A · B");
  });
});
