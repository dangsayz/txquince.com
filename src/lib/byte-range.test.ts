import { describe, expect, it } from "vitest";
import { contentRange, parseByteRange } from "./byte-range";

describe("parseByteRange", () => {
  it("returns null without a usable header", () => {
    expect(parseByteRange(null, 100)).toBeNull();
    expect(parseByteRange("bytes=-", 100)).toBeNull();
    expect(parseByteRange("items=0-5", 100)).toBeNull();
    expect(parseByteRange("bytes=0-1,5-9", 100)).toBeNull();
  });

  it("reads the probe Safari sends first", () => {
    expect(parseByteRange("bytes=0-1", 1000)).toEqual({ offset: 0, length: 2 });
  });

  it("reads open-ended and clamped ranges", () => {
    expect(parseByteRange("bytes=500-", 1000)).toEqual({ offset: 500, length: 500 });
    expect(parseByteRange("bytes=900-5000", 1000)).toEqual({ offset: 900, length: 100 });
  });

  it("reads suffix ranges", () => {
    expect(parseByteRange("bytes=-100", 1000)).toEqual({ offset: 900, length: 100 });
    expect(parseByteRange("bytes=-5000", 1000)).toEqual({ offset: 0, length: 1000 });
  });

  it("flags ranges that cannot be served", () => {
    expect(parseByteRange("bytes=1000-", 1000)).toBe("unsatisfiable");
    expect(parseByteRange("bytes=10-5", 1000)).toBe("unsatisfiable");
    expect(parseByteRange("bytes=-0", 1000)).toBe("unsatisfiable");
  });

  it("formats Content-Range", () => {
    expect(contentRange({ offset: 0, length: 2 }, 1000)).toBe("bytes 0-1/1000");
  });
});
