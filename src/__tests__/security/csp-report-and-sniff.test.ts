import { afterEach, describe, expect, it, vi } from "vitest";
import { sniffImage } from "@/lib/image-sniff";

describe("sniffImage", () => {
  const bytes = (...b: (number | string)[]) =>
    new Uint8Array(b.flatMap((x) => (typeof x === "string" ? [...x].map((c) => c.charCodeAt(0)) : [x])));

  it("recognises JPEG, PNG, WebP and AVIF by magic bytes", () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))?.type).toBe("image/jpeg");
    expect(sniffImage(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a))?.type).toBe("image/png");
    expect(sniffImage(bytes("RIFF", 0, 0, 0, 0, "WEBP"))?.type).toBe("image/webp");
    expect(sniffImage(bytes(0, 0, 0, 0x20, "ftypavif"))?.type).toBe("image/avif");
  });

  it("refuses HTML, SVG, GIF, HEIC and empty input", () => {
    expect(sniffImage(bytes("<!doctype html>"))).toBeNull();
    expect(sniffImage(bytes("<svg xmlns="))).toBeNull();
    expect(sniffImage(bytes("GIF89a"))).toBeNull();
    expect(sniffImage(bytes(0, 0, 0, 0x18, "ftypheic"))).toBeNull();
    expect(sniffImage(new Uint8Array())).toBeNull();
  });
});

describe("POST /api/csp-report", () => {
  afterEach(() => vi.restoreAllMocks());

  const post = async (body: string, type = "application/csp-report") => {
    const { POST } = await import("@/app/api/csp-report/route");
    return POST(new Request("https://txquince.com/api/csp-report", { method: "POST", headers: { "content-type": type }, body }));
  };

  it("logs a summary with query strings and pay-link ids stripped", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await post(
      JSON.stringify({
        "csp-report": {
          "document-uri": "https://txquince.com/booking/9f8e7d6c5b4a?token=SECRET",
          "effective-directive": "img-src",
          "blocked-uri": "https://evil.example/pixel.gif?u=SECRET",
        },
      }),
    );
    expect(res.status).toBe(204);
    const line = warn.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(line).toContain("img-src");
    expect(line).toContain("https://txquince.com/booking/:id");
    expect(line).toContain("https://evil.example/pixel.gif");
    expect(line).not.toContain("SECRET");
    expect(line).not.toContain("9f8e7d6c5b4a");
  });

  it("accepts the Reporting API batch format", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await post(
      JSON.stringify([{ type: "csp-violation", body: { documentURL: "https://txquince.com/", effectiveDirective: "frame-src", blockedURL: "https://x.example/" } }]),
      "application/reports+json",
    );
    expect(warn.mock.calls.join(" ")).toContain("frame-src");
  });

  it("ignores junk and oversize bodies without error", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await post("not json")).status).toBe(204);
    expect((await post("x".repeat(20_000))).status).toBe(204);
    expect(warn).not.toHaveBeenCalled();
  });
});
