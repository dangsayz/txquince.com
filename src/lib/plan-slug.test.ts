import { describe, expect, it } from "vitest";
import { generatePlanSlug, isPlanSlug, SLUG_ALPHABET, SLUG_LENGTH } from "./plan-slug";

describe("generatePlanSlug", () => {
  it("is 10 characters from the look-alike-free alphabet", () => {
    for (let i = 0; i < 500; i++) {
      const s = generatePlanSlug();
      expect(s).toHaveLength(SLUG_LENGTH);
      expect([...s].every((ch) => SLUG_ALPHABET.includes(ch))).toBe(true);
      expect(isPlanSlug(s)).toBe(true);
      expect(s).not.toMatch(/[01ilo]/);
    }
  });

  it("does not repeat across many draws (≈49.5 bits each)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20_000; i++) seen.add(generatePlanSlug());
    expect(seen.size).toBe(20_000);
  });

  it("skips biased bytes (rejection sampling) instead of folding them", () => {
    // 248..255 would over-weight the first 8 letters if taken modulo 31.
    let call = 0;
    const rng = (bytes: Uint8Array) => {
      call++;
      bytes.fill(call === 1 ? 250 : 0); // first batch all rejected, then all "2"
      return bytes;
    };
    expect(generatePlanSlug(rng)).toBe("2".repeat(SLUG_LENGTH));
    expect(call).toBe(2);
  });

  it("maps each accepted byte to the alphabet uniformly", () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 4000; i++) for (const ch of generatePlanSlug()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    const expected = (4000 * SLUG_LENGTH) / SLUG_ALPHABET.length;
    expect(counts.size).toBe(SLUG_ALPHABET.length);
    for (const n of counts.values()) expect(Math.abs(n - expected) / expected).toBeLessThan(0.15);
  });

  it("never contains anything about the family", () => {
    expect(isPlanSlug("maria-garcia")).toBe(false);
    expect(isPlanSlug("2026-11-21")).toBe(false);
    expect(isPlanSlug("abcdefghij")).toBe(false); // contains i
    expect(isPlanSlug("abcdefghjk")).toBe(true);
  });
});
