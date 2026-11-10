import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { signedContractPdf } from "./contract-file";
import { buildAgreement, type SignedAgreement } from "./agreement";
import { DEFAULT_PRICE_BOOK } from "./commission";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const signed = (lang: "en" | "es"): SignedAgreement => ({
  ...buildAgreement({ lang, tier: "trio", hours: 7, crew: null, addOns: [], eventDate: "2027-05-15", cityLabel: "Dallas–Fort Worth", venue: "Sample Ballroom", startTime: "4:00 PM", honoree: "vida", name: "maria garcia", email: "m@example.com", phone: "214-555-0100", sharePermission: true }, DEFAULT_PRICE_BOOK),
  signedName: "Maria Garcia", signature: PNG, signedAt: "2026-11-10T01:00:00.000Z", ip: "203.0.113.5", userAgent: "test", sharePermission: true,
});

describe("signed contract PDF", () => {
  for (const lang of ["en", "es"] as const) {
    it(`renders the full ${lang} agreement, protections included`, async () => {
      const a = signed(lang);
      expect(a.intro).toContain("Maria Garcia");
      expect(a.intro).toContain("Vida");
      expect(a.sections.length).toBeGreaterThanOrEqual(14);
      const file = await signedContractPdf({ id: "11111111-2222-4333-8444-555555555555", metadata: { agreement: a } });
      expect(file?.filename).toBe("TXQuince-Agreement-TXQ-111111.pdf");
      expect(new TextDecoder().decode(file!.content.slice(0, 5))).toBe("%PDF-");
      expect(file!.content.byteLength).toBeGreaterThan(3000);
    });
  }
  it("no signed agreement → no file (never throws)", async () => {
    expect(await signedContractPdf({ id: "x", metadata: {} })).toBeNull();
    expect(await signedContractPdf({ id: "x", metadata: { agreement: { ...signed("en"), signature: "junk" } } })).toBeNull();
  });
});
