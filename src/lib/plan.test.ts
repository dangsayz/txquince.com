import { describe, expect, it } from "vitest";
import {
  detectPlanLang,
  isPlannableDate,
  parseContact,
  planInputSchema,
  planPath,
  prefillDate,
  resolveDateStatus,
  sanitizeSource,
  timelinePath,
  todayInDallas,
} from "./plan";

const NOW = new Date("2026-10-31T17:00:00Z"); // noon in Dallas

describe("contact box", () => {
  it("accepts a US phone in any format", () => {
    expect(parseContact("2145550100")).toEqual({ email: null, phone: "(214) 555-0100" });
    expect(parseContact("(214) 555-0100")).toEqual({ email: null, phone: "(214) 555-0100" });
    expect(parseContact("+1 214-555-0100")).toEqual({ email: null, phone: "(214) 555-0100" });
    expect(parseContact("1 214 555 0100")).toEqual({ email: null, phone: "(214) 555-0100" });
  });
  it("accepts an international WhatsApp number with +", () => {
    expect(parseContact("+52 55 1234 5678")).toEqual({ email: null, phone: "+525512345678" });
  });
  it("accepts an email, lowercased", () => {
    expect(parseContact(" Mama@Example.com ")).toEqual({ email: "mama@example.com", phone: null });
  });
  it("rejects anything else", () => {
    for (const bad of ["", "12345", "call me", "mama@", "555-0100", 42]) expect(parseContact(bad)).toBeNull();
  });
});

describe("source tag", () => {
  it("keeps a safe slug", () => {
    expect(sanitizeSource("fb-group")).toBe("fb-group");
    expect(sanitizeSource(" FB Quince Dallas ")).toBe("fb-quince-dallas");
    expect(sanitizeSource("<script>")).toBe("script");
    expect(sanitizeSource("x")).toBeNull();
    expect(sanitizeSource(undefined)).toBeNull();
  });
});

describe("dates", () => {
  it("uses Dallas time for today", () => {
    expect(todayInDallas(new Date("2026-11-01T04:30:00Z"))).toBe("2026-10-31");
  });
  it("accepts today through three years out, rejects nonsense", () => {
    expect(isPlannableDate("2026-11-21", NOW)).toBe(true);
    expect(isPlannableDate("2026-10-31", NOW)).toBe(true);
    expect(isPlannableDate("2026-10-30", NOW)).toBe(false);
    expect(isPlannableDate("2029-10-31", NOW)).toBe(true);
    expect(isPlannableDate("2029-11-01", NOW)).toBe(false);
    expect(isPlannableDate("2027-02-30", NOW)).toBe(false);
    expect(prefillDate("2026-11-21", NOW)).toBe("2026-11-21");
    expect(prefillDate("nov 21", NOW)).toBe("");
  });
});

describe("date status", () => {
  it("a live booking always wins, then the owner's mark, then Available", () => {
    expect(resolveDateStatus({ date: "2026-11-21", taken: true, override: "available" })).toBe("booked");
    expect(resolveDateStatus({ date: "2026-11-21", override: "limited" })).toBe("limited");
    expect(resolveDateStatus({ date: "2026-11-21" })).toBe("available");
    expect(resolveDateStatus({ date: "2026-10-01", today: "2026-10-31" })).toBe("booked");
  });
});

describe("language", () => {
  it("explicit param, then Accept-Language, then English", () => {
    expect(detectPlanLang("es", "en-US")).toBe("es");
    expect(detectPlanLang(null, "es-MX,es;q=0.9,en;q=0.8")).toBe("es");
    expect(detectPlanLang(null, "en-US,en;q=0.9,es;q=0.8")).toBe("en");
    expect(detectPlanLang(null, "fr-FR,es;q=0.5")).toBe("es");
    expect(detectPlanLang(null, "fr-FR")).toBe("en");
    expect(detectPlanLang(undefined, null)).toBe("en");
  });
  it("builds language paths", () => {
    expect(planPath("abcdefghjk", "en")).toBe("/plan/abcdefghjk");
    expect(planPath("abcdefghjk", "es")).toBe("/es/plan/abcdefghjk");
    expect(timelinePath("abcdefghjk", "es")).toBe("/es/plan/abcdefghjk/cronograma");
  });
});

describe("intake schema", () => {
  it("normalizes colors and keeps only known ones", () => {
    const r = planInputSchema.safeParse({
      event_date: "2027-03-20",
      city: "Irving",
      colors: ["Fuchsia", "oro", "glitter"],
      name: "Ana López",
      contact: "2145550100",
      language: "es",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.colors).toEqual(["fucsia", "dorado"]);
  });
});
