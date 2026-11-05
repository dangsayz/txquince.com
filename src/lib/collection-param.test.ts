import { describe, expect, it } from "vitest";
import { PUBLIC_TIER_IDS, collectionParamTier } from "./commission";

describe("/reserve?collection=", () => {
  it("accepts every package families can choose, by id", () => {
    for (const id of PUBLIC_TIER_IDS) expect(collectionParamTier(id)).toBe(id);
    expect(collectionParamTier(" Moments ")).toBe("moments");
  });

  it("accepts the display names that differ from the id", () => {
    expect(collectionParamTier("duo")).toBe("cinema");
    expect(collectionParamTier("DUO")).toBe("cinema");
    expect(collectionParamTier("portrait")).toBe("study");
  });

  it("ignores retired and unknown packages", () => {
    for (const v of ["production", "archive", "essential", "signature", "legacy", "the-duo", "", "constructor", "__proto__", null, undefined]) {
      expect(collectionParamTier(v)).toBeNull();
    }
  });
});
