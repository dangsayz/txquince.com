import { crc32, deflateSync, inflateSync } from "node:zlib";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildAgreement, type AgreementInput, type SignedAgreement } from "@/lib/agreement";
import {
  ContractPdfError,
  ESIGN_CONSENT,
  MAX_SIGNATURE_BYTES,
  contractSha256,
  fitWithin,
  renderSignedContractPdf,
  sanitizeWinAnsi,
  type ContractAuditEvent,
  type ContractPdfInput,
} from "@/lib/contract-pdf";

/* ---------- fixtures (fictional families only) ---------- */

/** Minimal RGBA PNG encoder so the tests need no image files. */
function makePng(width: number, height: number, ink: (x: number, y: number) => boolean): Uint8Array {
  const chunk = (type: string, data: Uint8Array) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, "latin1");
    Buffer.from(data).copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)) >>> 0, 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!ink(x, y)) continue;
      const o = y * (width * 4 + 1) + 1 + x * 4;
      raw[o] = 17;
      raw[o + 1] = 17;
      raw[o + 2] = 16;
      raw[o + 3] = 255;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", new Uint8Array()),
  ]);
}

const dataUrl = (bytes: Uint8Array) => `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;

// A loopy "signature" stroke.
const SIGNATURE = dataUrl(
  makePng(600, 160, (x, y) => {
    const cy = 80 + 38 * Math.sin(x / 26) * Math.cos(x / 90);
    return x > 30 && x < 570 && Math.abs(y - cy) < 2.4;
  }),
);

const baseInput: AgreementInput = {
  lang: "en",
  tier: "production",
  hours: 8,
  crew: null,
  addOns: ["sameday", "parents"],
  eventDate: "2027-03-20",
  cityLabel: "Houston",
  venue: "The Magnolia Room",
  startTime: "6:00 PM",
  honoree: "Lucía",
  name: "Marisol Ejemplo",
  email: "familia@example.com",
  phone: "555-0100",
  sharePermission: true,
};

function signed(input: Partial<AgreementInput> = {}, extra: Partial<SignedAgreement> = {}): SignedAgreement {
  const a = buildAgreement({ ...baseInput, ...input });
  return {
    ...a,
    signedName: input.name ?? baseInput.name,
    signature: SIGNATURE,
    signedAt: "2026-10-14T20:21:05.000Z",
    ip: "203.0.113.24",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
    sharePermission: true,
    ...extra,
  };
}

const AUDIT: ContractAuditEvent[] = [
  { at: "2026-10-14T20:15:00.000Z", event: "requested", actor: "client", ip: "203.0.113.24" },
  { at: "2026-10-14T20:19:30.000Z", event: "consented", actor: "client", ip: "203.0.113.24", detail: `E-sign consent v${ESIGN_CONSENT.version}` },
  { at: "2026-10-14T20:21:05.000Z", event: "signed", actor: "client", ip: "203.0.113.24", userAgent: "Mozilla/5.0 (iPhone)" },
  { at: "2026-10-15T14:02:00.000Z", event: "approved", actor: "admin" },
];

const pdfInput = (agreement: SignedAgreement, extra: Partial<ContractPdfInput> = {}): ContractPdfInput => ({
  ref: "TXQ-7F3K",
  agreement,
  audit: AUDIT,
  generatedAt: "2026-10-15T14:05:00.000Z",
  ...extra,
});

/** Pull the drawn text back out of the PDF (content streams are flate, text is WinAnsi hex). */
function extractText(pdf: Uint8Array): string[] {
  const raw = Buffer.from(pdf).toString("latin1");
  const pages: string[] = [];
  // Node's TextDecoder treats windows-1252 as Latin-1, so map 0x80–0x9F by hand.
  const C1 = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ";
  const decode = (bytes: Buffer) =>
    Array.from(bytes, (b) => (b >= 0x80 && b <= 0x9f ? C1[b - 0x80] : String.fromCharCode(b))).join("");
  for (const m of raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    let body: string;
    try {
      body = inflateSync(Buffer.from(m[1], "latin1")).toString("latin1");
    } catch {
      continue;
    }
    const strings = Array.from(body.matchAll(/<([0-9A-Fa-f]*)> Tj/g), (t) =>
      decode(Buffer.from(t[1], "hex")),
    );
    if (strings.length) pages.push(strings.join("\n"));
  }
  return pages;
}

/* ---------- tests ---------- */

describe("renderSignedContractPdf", () => {
  it("generates a valid PDF that pdf-lib can reload", async () => {
    const agreement = signed();
    const { pdf, sha256, filename } = await renderSignedContractPdf(pdfInput(agreement));

    expect(new TextDecoder().decode(pdf.subarray(0, 5))).toBe("%PDF-");
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
    const { width, height } = doc.getPage(0).getSize();
    expect([width, height]).toEqual([612, 792]);
    expect(sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(sha256).toBe(await contractSha256(agreement));
    expect(filename).toBe("TXQuince-Agreement-TXQ-7F3K.pdf");

    const text = extractText(pdf).join("\n");
    expect(text).toContain("TX QUINCE");
    expect(text).toContain("Ref. TXQ-7F3K");
    expect(text).toContain(agreement.title);
    expect(text).toContain("Signed by: Marisol Ejemplo");
    expect(text).toContain("2026-10-14 20:21:05 UTC");
    expect(text).toContain("2026-10-14 15:21:05 Central"); // CDT = UTC-5
    expect(text).toContain("Signature record / Registro de firma");
    expect(text).toContain(sha256);
    expect(text).toContain(ESIGN_CONSENT.version);
    expect(text).toContain("Agreed to sign electronically");
    expect(text).toContain("•"); // bullets survive as WinAnsi 0x95
    const n = doc.getPageCount();
    expect(text).toContain(`Page 1 of ${n}`);
    expect(text).toContain(`Page ${n} of ${n}`);
  });

  it("renders the Spanish agreement in Spanish, with its accents intact", async () => {
    const agreement = signed({ lang: "es", name: "Marisol Ejemplo Núñez" });
    const { pdf } = await renderSignedContractPdf(pdfInput(agreement));
    const doc = await PDFDocument.load(pdf);
    expect(doc.getTitle()).toContain("Contrato de reservación de TX Quince");
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);

    const text = extractText(pdf).join("\n");
    expect(text).toContain("Contrato de reservación de TX Quince");
    expect(text).toContain("quinceañera");
    expect(text).toContain("Firmado por: Marisol Ejemplo Núñez");
    expect(text).toContain("CÓMO FUNCIONA LA RESERVACIÓN");
    expect(text).toContain("¿Quieres");
    expect(text).toMatch(/Dallas–Fort Worth/); // en dash survives
    expect(text).toContain("Página 1 de");
  });

  it("paginates a long agreement and numbers every page", async () => {
    const agreement = signed();
    const long: SignedAgreement = {
      ...agreement,
      sections: [
        ...agreement.sections,
        ...Array.from({ length: 6 }, (_, s) => ({
          title: `Extra section ${s + 1}`,
          lines: Array.from(
            { length: 30 },
            (_, i) => `Line ${i + 1}: ${"a long clause that keeps going so it has to wrap across the line ".repeat(3)}`,
          ),
        })),
      ],
    };
    const audit = Array.from({ length: 60 }, (_, i): ContractAuditEvent => ({
      at: new Date(Date.UTC(2026, 9, 14, 12, i)).toISOString(),
      event: "viewed",
      actor: "client",
      ip: "198.51.100.7",
      userAgent: "Mozilla/5.0 ".repeat(20),
    }));
    const { pdf } = await renderSignedContractPdf(pdfInput(long, { audit }));
    const doc = await PDFDocument.load(pdf);
    const n = doc.getPageCount();
    expect(n).toBeGreaterThan(6);
    const pages = extractText(pdf);
    for (let i = 1; i <= n; i++) expect(pages.join("\n")).toContain(`Page ${i} of ${n}`);
    expect(pages.join("\n")).toContain("Signature record / Registro de firma (cont.)");
    expect(pages.join("\n")).toContain("Line 30:");
  });
});

describe("contractSha256", () => {
  it("is stable for the same agreement", async () => {
    const a = await contractSha256(signed());
    const b = await contractSha256(signed());
    expect(a).toBe(b);
    // Only the agreement text is hashed, not who/when it was signed.
    expect(await contractSha256(signed({}, { signedAt: "2027-01-01T00:00:00.000Z" }))).toBe(a);
  });

  it("changes when any line changes", async () => {
    const agreement = signed();
    const base = await contractSha256(agreement);
    for (let s = 0; s < agreement.sections.length; s++) {
      for (let l = 0; l < agreement.sections[s].lines.length; l++) {
        const sections = agreement.sections.map((sec, i) =>
          i === s ? { ...sec, lines: sec.lines.map((line, j) => (j === l ? `${line}.` : line)) } : sec,
        );
        expect(await contractSha256({ ...agreement, sections })).not.toBe(base);
      }
    }
    expect(await contractSha256({ ...agreement, title: `${agreement.title} ` })).not.toBe(base);
    expect(await contractSha256({ ...agreement, intro: agreement.intro.replace("TX", "Tx") })).not.toBe(base);
    expect(await contractSha256(signed({ venue: "Another Hall" }))).not.toBe(base);
  });
});

describe("signature validation", () => {
  const render = (signature: string) => renderSignedContractPdf(pdfInput(signed({}, { signature })));

  it("rejects anything that isn't a PNG data URL", async () => {
    await expect(render("not a data url")).rejects.toThrow(/PNG data URL/);
    await expect(render("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).rejects.toThrow(/PNG data URL/);
    await expect(render("data:image/png,rawbytes")).rejects.toThrow(/PNG data URL/);
    await expect(render("data:image/svg+xml;base64,PHN2Zz4=")).rejects.toThrow(ContractPdfError);
    // Right label, wrong bytes.
    await expect(render(dataUrl(new TextEncoder().encode("GIF89a definitely not a png image")))).rejects.toThrow(
      /not a PNG/,
    );
    // PNG header, corrupt body.
    const corrupt = makePng(40, 20, () => true).slice(0, 40);
    await expect(render(dataUrl(corrupt))).rejects.toThrow(ContractPdfError);
  });

  it("rejects a signature over 400 KB", async () => {
    const big = new Uint8Array(MAX_SIGNATURE_BYTES + 1024);
    big.set(makePng(4, 4, () => true));
    const err = await render(dataUrl(big)).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ContractPdfError);
    expect((err as ContractPdfError).code).toBe("signature_too_large");
    expect((err as Error).message).toMatch(/too large .*400 KB/);
  });

  it("rejects a small file that decodes to an enormous image", async () => {
    const png = makePng(8, 8, () => false);
    const view = new DataView(png.buffer, png.byteOffset);
    view.setUint32(16, 20000); // forge IHDR width
    await expect(render(dataUrl(png))).rejects.toThrow(/too large/);
  });

  it("never upscales the signature beyond its natural size", () => {
    expect(fitWithin(120, 40, 240, 90)).toEqual({ width: 120, height: 40 });
    expect(fitWithin(1200, 320, 240, 90)).toEqual({ width: 240, height: 64 });
    expect(fitWithin(300, 300, 240, 90)).toEqual({ width: 90, height: 90 });
  });
});

describe("WinAnsi sanitizer", () => {
  it("keeps Spanish letters and typographic punctuation", () => {
    const s = "á é í ó ú ñ ü Á É Í Ó Ú Ñ Ü ¿ ¡ — – “ ” ‘ ’ · • … × €";
    expect(sanitizeWinAnsi(s)).toBe(s);
  });

  it("maps or drops what WinAnsi can't encode", () => {
    expect(sanitizeWinAnsi("Lucía 💖✨ XV")).toBe("Lucía  XV");
    expect(sanitizeWinAnsi("Dalia ❤️ 👩‍👧")).toBe("Dalia  ");
    expect(sanitizeWinAnsi("Ştefan Łucja")).toBe("Stefan ?ucja");
    expect(sanitizeWinAnsi("中文")).toBe("??");
    expect(sanitizeWinAnsi("3:21 PM CDT")).toBe("3:21 PM CDT");
    expect(sanitizeWinAnsi("ﬁesta ‐ 10‑12 −5 ≥ 2")).toBe("fiesta - 10-12 -5 >= 2");
    expect(sanitizeWinAnsi("zero​width﻿")).toBe("zerowidth");
    expect(sanitizeWinAnsi("a\r\nb\u0007")).toBe("a\nb");
    expect(sanitizeWinAnsi("ñ")).toBe("ñ"); // decomposed → composed
  });

  it("only ever produces text Helvetica can encode", async () => {
    const doc = await PDFDocument.create();
    const fonts = [await doc.embedFont(StandardFonts.Helvetica), await doc.embedFont(StandardFonts.HelveticaBold)];
    let all = "";
    for (let cp = 0; cp < 0x3000; cp++) all += String.fromCodePoint(cp);
    all += "😀👩‍👧❤️🇲🇽\u{1F3FD}";
    const clean = sanitizeWinAnsi(all).replace(/\n/g, "");
    for (const font of fonts) expect(() => font.encodeText(clean)).not.toThrow();
  });

  it("renders a PDF full of unsupported characters without throwing", async () => {
    const agreement = signed({
      name: "Zoë 💖 Ştefan Łucja 中文  ",
      honoree: "Dalia 👑✨",
      venue: "Salón «Los Álamos» 🎉 ⟨VIP⟩ \u0007",
      cityLabel: "San Antonio ★",
    });
    const audit: ContractAuditEvent[] = [
      { at: "not a date", event: "custom_event 🚀", actor: "system", detail: "Ünïcödé ✓ ok 🙂", userAgent: "x".repeat(900) },
    ];
    const { pdf } = await renderSignedContractPdf(pdfInput(agreement, { audit, ref: "TXQ/9 ✨" }));
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
    const text = extractText(pdf).join("\n");
    expect(text).toContain("Salón «Los Álamos»");
  });

  it("keeps the filename safe", async () => {
    const { filename } = await renderSignedContractPdf(pdfInput(signed(), { ref: "TXQ/9 ✨\"x" }));
    expect(filename).toBe("TXQuince-Agreement-TXQ-9-x.pdf");
  });
});
