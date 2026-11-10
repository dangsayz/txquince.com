import { describe, expect, it } from "vitest";
import { bannerFromStored, bannerShowsOn } from "@/lib/site-banner-shared";

describe("the banner's sale line", () => {
  const sale = { en: "Book this week", es: "Reserva esta semana", ends: "2026-11-30" };

  it("shows through its last day and not after", () => {
    expect(bannerFromStored(sale, "2026-11-30").sale).toEqual({ en: sale.en, es: sale.es });
    expect(bannerFromStored(sale, "2026-12-01").sale).toBeNull();
  });

  it("with no end date, shows until removed", () => {
    expect(bannerFromStored({ ...sale, ends: "" }, "2030-01-01").sale).not.toBeNull();
  });

  it("is no sale when nothing, or something malformed, is stored", () => {
    for (const stored of [null, {}, { en: "Only English", es: "", ends: "" }, { en: "<b>x</b> sale", es: "venta", ends: "" }, "sale"]) {
      expect(bannerFromStored(stored, "2026-11-10").sale).toBeNull();
    }
  });
});

describe("where the banner shows", () => {
  it("shows on public reading pages in both languages", () => {
    for (const p of ["/", "/es", "/budget", "/es/presupuesto", "/blog/some-post", "/venues/a-venue", "/reviews"]) expect(bannerShowsOn(p)).toBe(true);
  });
  it("stays off forms, payments and private pages", () => {
    for (const p of ["/account", "/account/book", "/booking/abc", "/reserve", "/review/tok", "/login", "/signup", "/es/login", "/plan", "/plan/abc", "/thank-you"]) expect(bannerShowsOn(p)).toBe(false);
  });
});
