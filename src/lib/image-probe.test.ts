import { describe, expect, it } from "vitest";
import { probeImage } from "@/lib/image-probe";
import { fakeJpeg, fakeWebp } from "@/lib/test-helpers/images";

describe("probeImage", () => {
  it("reads WebP size and spots EXIF", () => {
    expect(probeImage(fakeWebp(960, 640))).toEqual({ type: "webp", width: 960, height: 640, hasMetadata: false });
    expect(probeImage(fakeWebp(960, 640, { exif: true }))?.hasMetadata).toBe(true);
  });

  it("reads JPEG size and spots EXIF", () => {
    expect(probeImage(fakeJpeg(1600, 1067))).toEqual({ type: "jpeg", width: 1600, height: 1067, hasMetadata: false });
    expect(probeImage(fakeJpeg(1600, 1067, { exif: true }))?.hasMetadata).toBe(true);
  });

  it("rejects anything else", () => {
    expect(probeImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(probeImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
  });
});
