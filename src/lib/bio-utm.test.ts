import { describe, expect, it } from "vitest";
import { attributedSearch, withBioUtm } from "./bio-utm";

describe("Instagram bio attribution", () => {
  it("adds the bio UTM to internal links, keeping the hash last", () => {
    expect(withBioUtm("/portfolio")).toBe("/portfolio?utm_source=instagram&utm_medium=bio");
    expect(withBioUtm("/#commissions")).toBe("/?utm_source=instagram&utm_medium=bio#commissions");
    expect(withBioUtm("/check-your-date?date=2027-03-06")).toBe(
      "/check-your-date?date=2027-03-06&utm_source=instagram&utm_medium=bio",
    );
  });

  it("treats a bare /links visit as the Instagram bio campaign", () => {
    const s = attributedSearch("/links", new URLSearchParams());
    expect(s.get("utm_source")).toBe("instagram");
    expect(s.get("utm_medium")).toBe("bio");
  });

  it("never overrides a UTM the link already carries, nor other pages", () => {
    expect(attributedSearch("/links", new URLSearchParams("utm_source=tiktok")).get("utm_source")).toBe("tiktok");
    expect(attributedSearch("/portfolio", new URLSearchParams()).get("utm_source")).toBeNull();
  });
});
