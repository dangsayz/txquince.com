import { describe, expect, it } from "vitest";
import { normalizeSrc, sourceKey } from "./src-tag";
import { sanitizeAttribution } from "./attribution";

describe("src tags", () => {
  it("accepts only the six platform tags, lower-cased", () => {
    for (const t of ["instagram", "facebook", "tiktok", "youtube", "pinterest", "quora"]) expect(normalizeSrc(t)).toBe(t);
    expect(normalizeSrc(" Instagram ")).toBe("instagram");
  });

  it("drops anything else", () => {
    for (const t of ["", "mandalay", "arboretum", "blog", "gbp", "fb-group", "<script>", 42, null]) expect(normalizeSrc(t)).toBeNull();
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
});
