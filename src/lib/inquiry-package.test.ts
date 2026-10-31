import { describe, expect, it } from "vitest";
import { DEFAULT_PRICE_BOOK, type PriceBook } from "@/lib/commission";
import { BUDGET_FOR_TIER, describeInquiryPackage, inquiryPackageSchema, servicesForTier } from "@/lib/inquiry-package";

// Fictional family.
const pick = {
  city: "dfw",
  venue: "Salón Ejemplo",
  start_time: "4:00 PM",
  scope: "both",
  tier: "trio",
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
    expect(BUDGET_FOR_TIER.trio).toBe("trio");
    expect(servicesForTier("study")).toBe("photo");
    expect(servicesForTier("archive")).toBe("both");
  });

  it("accepts the Trio and the Second Portrait Day extra", () => {
    const r = inquiryPackageSchema.safeParse({ ...pick, tier: "trio", hours: 6, add_ons: ["secondday"] });
    expect(r.success).toBe(true);
    expect(BUDGET_FOR_TIER.trio).toBe("trio");
  });

  it("refuses an extra the package doesn't offer, called directly", () => {
    // The Trio already includes a highlight film; the Dress Session is included in both packages now.
    expect(inquiryPackageSchema.safeParse({ ...pick, tier: "trio", add_ons: ["highlight"] }).success).toBe(false);
    expect(inquiryPackageSchema.safeParse({ ...pick, tier: "cinema", hours: 6, add_ons: ["highlight", "coordinator"] }).success).toBe(true);
    expect(inquiryPackageSchema.safeParse({ ...pick, tier: "cinema", hours: 6, add_ons: ["destination"] }).success).toBe(false);
  });

  it("refuses the Solo with an extra it doesn't offer, called directly", () => {
    const solo = { ...pick, tier: "solo", hours: 5 };
    expect(inquiryPackageSchema.safeParse({ ...solo, add_ons: ["highlight", "coordinator"] }).success).toBe(true);
    for (const extra of ["secondday", "sameday", "super8", "parents", "destination"]) {
      expect(inquiryPackageSchema.safeParse({ ...solo, add_ons: [extra] }).success).toBe(false);
    }
    expect(BUDGET_FOR_TIER.solo).toBe("solo");
  });

  it("prices a Solo asking for 8 hours at the 6-hour cap and names the hybrid shooter", () => {
    const p = inquiryPackageSchema.parse({ ...pick, tier: "solo", hours: 8, add_ons: [] });
    const text = describeInquiryPackage(p, ctx, DEFAULT_PRICE_BOOK);
    expect(text).toContain("Hours on the day: 6");
    expect(text).toContain("1 hybrid shooter");
    expect(text).toContain("Total: $1,400");
  });

  it("refuses the retired Two-Day and Full Celebration on a new request, called directly", () => {
    expect(inquiryPackageSchema.safeParse({ ...pick, tier: "archive" }).success).toBe(false);
    expect(inquiryPackageSchema.safeParse({ ...pick, tier: "production" }).success).toBe(false);
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
    expect(text).toContain("The Trio");
    expect(text).toContain("Church at 2pm");
    expect(text).not.toContain("not signed yet");

    const pricier: PriceBook = {
      ...DEFAULT_PRICE_BOOK,
      packages: { ...DEFAULT_PRICE_BOOK.packages, trio: { ...DEFAULT_PRICE_BOOK.packages.trio, price: 5555 } },
    };
    expect(describeInquiryPackage(p, ctx, pricier)).toContain("$5,555");
  });
});
