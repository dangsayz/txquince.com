import { describe, expect, it } from "vitest";
import { isPinterestHost, pinCreateUrl, pinDescription, pinMedia } from "./pinterest";

describe("pinterest", () => {
  it("sizes branded images and makes them absolute", () => {
    expect(pinMedia("/api/img/red-dress?v=2")).toBe("https://txquince.com/api/img/red-dress?v=2&w=1440");
    expect(pinMedia("/portfolio/a.webp")).toBe("https://txquince.com/portfolio/a.webp");
  });

  it("builds a create-pin link back to the photo page", () => {
    const u = new URL(pinCreateUrl({ page: "/photos/portraits/red-dress", image: "/api/img/red-dress", description: "Red gown" }));
    expect(u.origin + u.pathname).toBe("https://www.pinterest.com/pin/create/button/");
    expect(u.searchParams.get("url")).toBe("https://txquince.com/photos/portraits/red-dress");
    expect(u.searchParams.get("media")).toBe("https://txquince.com/api/img/red-dress");
    expect(u.searchParams.get("description")).toBe("Red gown");
  });

  it("writes a localized description and caps its length", () => {
    expect(pinDescription("Quinceañera in a red gown.")).toBe("Quinceañera in a red gown. Quinceañera photography by TX Quince, Dallas–Fort Worth.");
    expect(pinDescription("", "es")).toBe("Fotografía de quinceañera por TX Quince, Dallas–Fort Worth.");
    expect(pinDescription("x".repeat(900)).length).toBe(500);
  });

  it("recognizes Pinterest referrers only", () => {
    expect(isPinterestHost("www.pinterest.com")).toBe(true);
    expect(isPinterestHost("pinterest.com.mx")).toBe(true);
    expect(isPinterestHost("pin.it")).toBe(true);
    expect(isPinterestHost("notpinterest.com")).toBe(false);
    expect(isPinterestHost("pinterest.com.evil.io")).toBe(false);
  });
});
