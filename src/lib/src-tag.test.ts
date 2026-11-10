import { describe, expect, it } from "vitest";
import { normalizeSrc, sourceKey, visitSourceKey } from "./src-tag";
import { sanitizeAttribution, sourceName } from "./attribution";

describe("src tags", () => {
  it("accepts the eight platform tags, lower-cased", () => {
    for (const t of ["instagram", "facebook", "tiktok", "youtube", "pinterest", "quora", "gbp", "whatsapp"]) expect(normalizeSrc(t)).toBe(t);
    expect(normalizeSrc(" Instagram ")).toBe("instagram");
  });

  it("drops anything else", () => {
    for (const t of ["", "mandalay", "arboretum", "blog", "reddit", "fb-group", "<script>", 42, null]) expect(normalizeSrc(t)).toBeNull();
  });

  it("accepts a known venue's tag and nothing that only looks like one", () => {
    expect(normalizeSrc("venue-vm-ballroom")).toBe("venue-vm-ballroom");
    expect(normalizeSrc(" Venue-TP-Station ")).toBe("venue-tp-station");
    for (const t of ["venue-", "venue-nowhere", "vm-ballroom", "venue-vm-ballroom-2", "venue-__proto__", "venue-toString"]) expect(normalizeSrc(t)).toBeNull();
  });

  it("carries a venue tag from the link to the inquiry and names the venue", () => {
    const a = sanitizeAttribution({ source: "google.com", landing: "/budget", src: "venue-tp-station", srcLanding: "/budget" });
    expect(a).toMatchObject({ src: "venue-tp-station" });
    expect(sourceKey(a)).toBe("venue-tp-station");
    expect(sourceName("venue-tp-station")).toBe("Venue: T&P Station");
    expect(visitSourceKey("venue-vm-ballroom", null)).toBe("venue-vm-ballroom");
    expect(sourceName("venue-nowhere")).toBe("venue-nowhere");
  });

  it("is saved with an inquiry's attribution", () => {
    const a = sanitizeAttribution({ source: "google.com", landing: "/budget", src: "Instagram", srcLanding: "/budget" });
    expect(a).toMatchObject({ source: "google.com", src: "instagram", srcLanding: "/budget" });
    expect(a).not.toHaveProperty("ref");
    expect(sanitizeAttribution({ src: "mandalay" })).toBeNull();
  });

  it("groups the dashboard by src first, then the first-touch source", () => {
    expect(sourceKey({ source: "google.com", src: "pinterest" })).toBe("pinterest");
    expect(sourceKey({ source: "google.com", ref: "youtube" })).toBe("youtube"); // saved before the switch
    expect(sourceKey({ source: "google.com", ref: "mandalay" })).toBe("google.com");
    expect(sourceKey({ source: "Pinterest.com" })).toBe("pinterest.com");
    expect(sourceKey(null)).toBe("direct");
  });

  it("counts visits by their src tag, so gbp and whatsapp are their own rows", () => {
    expect(visitSourceKey("gbp", "google.com")).toBe("gbp");
    expect(visitSourceKey("whatsapp", null)).toBe("whatsapp");
    expect(visitSourceKey(null, "google.com")).toBe("google.com");
    expect(visitSourceKey(null, null)).toBe("direct");
  });
});
