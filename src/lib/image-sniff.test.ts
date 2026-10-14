import { describe, expect, it } from "vitest";
import { sniffImage } from "@/lib/image-sniff";
import { fakeJpeg, fakeWebp } from "@/lib/test-helpers/images";

describe("sniffImage", () => {
  it("reads WebP size and spots EXIF", () => {
    expect(sniffImage(fakeWebp(960, 640))).toEqual({ type: "webp", width: 960, height: 640, hasMetadata: false });
    expect(sniffImage(fakeWebp(960, 640, { exif: true }))?.hasMetadata).toBe(true);
  });

  it("reads JPEG size and spots EXIF", () => {
    expect(sniffImage(fakeJpeg(1600, 1067))).toEqual({ type: "jpeg", width: 1600, height: 1067, hasMetadata: false });
    expect(sniffImage(fakeJpeg(1600, 1067, { exif: true }))?.hasMetadata).toBe(true);
  });

  it("rejects anything else", () => {
    expect(sniffImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
  });
});
