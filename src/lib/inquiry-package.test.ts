import { describe, expect, it } from "vitest";
import { DEFAULT_PRICE_BOOK, type PriceBook } from "@/lib/commission";
import { BUDGET_FOR_TIER, describeInquiryPackage, inquiryPackageSchema, servicesForTier } from "@/lib/inquiry-package";

// Fictional family.
const pick = {
  city: "dfw",
  venue: "Salón Ejemplo",
  start_time: "4:00 PM",
  scope: "both",
  tier: "production",
  add_ons: ["sameday"],
  hours: 7,
  honoree: "Lucía",
  language: "en",
  share_permission: true,
};
const ctx = { name: "Ana Prueba", email: "ana@example.com", phone: "214-555-0100", eventDate: "2027-03-20", note: "Church at 2pm" };

describe("inquiry package", () => {
  it("accepts the picker's payload and maps it to the inquiry's fields", () => {
    const r = inquiryPackageSchema.safeParse(pick);
    expect(r.success).toBe(true);
    expect(BUDGET_FOR_TIER.production).toBe("full");
    expect(servicesForTier("study")).toBe("photo");
    expect(servicesForTier("archive")).toBe("both");
  });

  it("accepts the Trio and the Second Portrait Day extra", () => {
    const r = inquiryPackageSchema.safeParse({ ...pick, tier: "trio", hours: 6, add_ons: ["secondday"] });
    expect(r.success).toBe(true);
    expect(BUDGET_FOR_TIER.trio).toBe("trio");
  });

  it("refuses the retired Two-Day Celebration on a new request, called directly", () => {
    const r = inquiryPackageSchema.safeParse({ ...pick, tier: "archive" });
    expect(r.success).toBe(false);
  });

  it("refuses unknown packages, extras and smuggled fields such as a client total", () => {
    expect(inquiryPackageSchema.safeParse({ ...pick, tier: "platinum" }).success).toBe(false);
    expect(inquiryPackageSchema.safeParse({ ...pick, add_ons: ["drone"] }).success).toBe(false);
    expect(inquiryPackageSchema.safeParse({ ...pick, quoted_total_usd: 1 }).success).toBe(false);
  });

  it("prices the summary with the server's book, not anything the browser sent", () => {
    const p = inquiryPackageSchema.parse(pick);
    const text = describeInquiryPackage(p, ctx, DEFAULT_PRICE_BOOK);
    expect(text).toContain("Nothing was booked or charged");
    expect(text).toContain("Full Celebration");
    expect(text).toContain("Church at 2pm");
    expect(text).not.toContain("not signed yet");

    const pricier: PriceBook = {
      ...DEFAULT_PRICE_BOOK,
      packages: { ...DEFAULT_PRICE_BOOK.packages, production: { ...DEFAULT_PRICE_BOOK.packages.production, price: 5555 } },
    };
    expect(describeInquiryPackage(p, ctx, pricier)).toContain("$5,555");
  });
});
