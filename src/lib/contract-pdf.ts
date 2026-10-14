/**
 * contract-pdf.ts — the signed booking agreement as a PDF the family keeps.
 *
 * Renders the stored SignedAgreement snapshot (never a re-built one) in the
 * agreement's own language, with the drawn signature, the signed name and
 * time, and a final bilingual "Signature record / Registro de firma" page that
 * lists the audit trail, the agreement version, the SHA-256 of the canonical
 * agreement text and the e-sign consent version.
 *
 * Runs on Cloudflare Workers (OpenNext): pure JS (pdf-lib), WebCrypto for the
 * hash, atob for base64, no Node `fs`/`Buffer`, no native modules. The only
 * fonts are the PDF standard Helvetica pair, which can only encode WinAnsi
 * (Windows-1252); every string goes through `sanitizeWinAnsi` before it is
 * measured or drawn, so an emoji in a venue name can never throw.
 */
import {
  PDFDocument,
  StandardFonts,
  rgb,
  setCharacterSpacing,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import { agreementToText, type SignedAgreement } from "@/lib/agreement";

export type ContractAuditEvent = {
  at: string; // ISO timestamp
  event: string; // e.g. "requested" | "approved" | "consented" | "viewed" | "signed" | "deposit_paid" | "countersigned"
  actor: "client" | "admin" | "system";
  ip?: string;
  userAgent?: string;
  detail?: string;
};

export type ContractPdfInput = {
  ref: string; // short booking reference shown to the family
  agreement: SignedAgreement;
  audit: ContractAuditEvent[];
  generatedAt: string; // ISO
};

/**
 * Consent to sign electronically, shown to the family before they sign and
 * printed (in their language) on the signature record page.
 *
 * !!! NEEDS REVIEW by the owner or an attorney before it is relied on. !!!
 * Written in plain words for moms, no legalese. It is meant to cover the
 * ESIGN Act / Texas UETA consumer-disclosure points (agree to e-sign and to
 * get documents by email, free paper copy on request, how to withdraw before
 * signing, what you need to open the PDF), but it has not been reviewed by a
 * lawyer. Bump `version` whenever the wording changes; the version is stored
 * with every signature record.
 */
export const ESIGN_CONSENT: { version: string; en: string; es: string } = {
  version: "2026-10-14",
  en: [
    "You can sign this agreement on your phone or computer instead of on paper. Here is what that means:",
    "• The name you type and the signature you draw count the same as signing with a pen.",
    "• We will send your agreement and other booking papers to your email. If your email changes, just tell us.",
    "• Want a paper copy? Just ask and we will mail you one. It's free.",
    "• You can change your mind any time before you sign. Just don't sign, and let us know by email or text. We'll find another way, like signing on paper.",
    "• To open your agreement, you need a phone, tablet or computer that can open PDF files (most can). To keep a copy, save it or print it.",
    "Saying yes here means you agree to sign electronically and to get your papers by email.",
  ].join("\n"),
  es: [
    "Puedes firmar este contrato en tu celular o computadora en lugar de en papel. Esto es lo que significa:",
    "• El nombre que escribes y la firma que dibujas valen igual que firmar con pluma.",
    "• Te enviaremos tu contrato y otros papeles de tu reservación a tu correo electrónico. Si cambias de correo, solo avísanos.",
    "• ¿Quieres una copia en papel? Solo pídela y te la enviamos por correo. Es gratis.",
    "• Puedes cambiar de opinión en cualquier momento antes de firmar. Solo no firmes y avísanos por correo o mensaje de texto. Buscaremos otra forma, como firmar en papel.",
    "• Para abrir tu contrato necesitas un celular, tableta o computadora que abra archivos PDF (casi todos lo hacen). Para quedarte con una copia, guárdala o imprímela.",
    "Al decir que sí aquí, aceptas firmar electrónicamente y recibir tus papeles por correo electrónico.",
  ].join("\n"),
};

/** Largest signature PNG we accept, in decoded bytes. */
export const MAX_SIGNATURE_BYTES = 400 * 1024;
/** Guard against tiny-but-huge PNGs (UPNG decodes to RGBA in memory). */
const MAX_SIGNATURE_SIDE = 4096;
const MAX_SIGNATURE_PIXELS = 4_000_000;

export class ContractPdfError extends Error {
  readonly code: "signature_format" | "signature_too_large" | "signature_unreadable" | "invalid_agreement";
  constructor(code: ContractPdfError["code"], message: string) {
    super(message);
    this.name = "ContractPdfError";
    this.code = code;
  }
}

/* ------------------------------------------------------------------------ */
/* Hash                                                                      */
/* ------------------------------------------------------------------------ */

/** Hex SHA-256 of the canonical agreement text (`agreementToText`), via WebCrypto. */
export async function contractSha256(agreement: SignedAgreement): Promise<string> {
  const bytes = new TextEncoder().encode(agreementToText(agreement));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------------------ */
/* WinAnsi sanitizer                                                         */
/* ------------------------------------------------------------------------ */

// Windows-1252 0x80–0x9F, the only non-Latin-1 code points WinAnsi has.
const CP1252_EXTRAS = new Set(
  Array.from("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ", (c) => c.codePointAt(0)!),
);

function isWinAnsi(cp: number): boolean {
  return (cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa1 && cp <= 0xff && cp !== 0xad) || CP1252_EXTRAS.has(cp);
}

const REPLACEMENTS: Record<string, string> = {
  "\t": " ",
  " ": " ",
  " ": " ",
  " ": " ",
  "　": " ",
  "‐": "-",
  "‑": "-",
  "‒": "-",
  "−": "-",
  "―": "—",
  "‛": "'",
  "‟": '"',
  "′": "'",
  "″": '"',
  "⁄": "/",
  "←": "<-",
  "→": "->",
  "≤": "<=",
  "≥": ">=",
  "≠": "!=",
  "≈": "~",
};

// Built at runtime so TypeScript's ES2017 target never sees the \p{} syntax.
const COMBINING_MARK = new RegExp("\\p{M}", "gu");
const LETTER_OR_NUMBER = new RegExp("^[\\p{L}\\p{N}]$", "u");

/**
 * Make any string drawable with the standard Helvetica fonts (WinAnsi).
 * Spanish letters, curly quotes, dashes, "·" and "•" pass through untouched;
 * odd spaces become spaces; accented letters outside WinAnsi lose the accent
 * (ă → a); other letters become "?"; emoji, symbols and invisible characters
 * are dropped. Newlines are kept ("\r\n" → "\n"). Never throws.
 */
export function sanitizeWinAnsi(input: unknown): string {
  const text = String(input ?? "").replace(/\r\n?/g, "\n").normalize("NFC");
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (ch === "\n" || isWinAnsi(cp)) {
      out += ch;
      continue;
    }
    if (ch in REPLACEMENTS) {
      out += REPLACEMENTS[ch];
      continue;
    }
    if (cp >= 0x2000 && cp <= 0x200a) {
      out += " "; // en/em/thin/hair spaces
      continue;
    }
    // Compatibility decomposition: ﬁ → fi, ă → a, ① → 1, № → No.
    const folded = ch.normalize("NFKD").replace(COMBINING_MARK, "");
    if (folded && Array.from(folded).every((c) => isWinAnsi(c.codePointAt(0)!))) {
      out += folded;
      continue;
    }
    // A letter we can't draw (Cyrillic, CJK…) is still a letter: keep its place.
    if (LETTER_OR_NUMBER.test(ch)) out += "?";
    // Everything else — emoji, ZWJ, variation selectors, controls — is dropped.
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Signature                                                                 */
/* ------------------------------------------------------------------------ */

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function kb(bytes: number) {
  return `${Math.ceil(bytes / 1024)} KB`;
}

/** Decode and check the signature data URL. Throws ContractPdfError. */
function decodeSignature(dataUrl: unknown): Uint8Array {
  if (typeof dataUrl !== "string") {
    throw new ContractPdfError("signature_format", "Signature must be a PNG data URL (data:image/png;base64,...).");
  }
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl.trim());
  if (!m) {
    throw new ContractPdfError("signature_format", "Signature must be a PNG data URL (data:image/png;base64,...).");
  }
  const b64 = m[1].replace(/\s+/g, "");
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const size = Math.floor((b64.length * 3) / 4) - padding;
  if (size > MAX_SIGNATURE_BYTES) {
    throw new ContractPdfError(
      "signature_too_large",
      `Signature image is too large (${kb(size)}). The limit is ${kb(MAX_SIGNATURE_BYTES)}.`,
    );
  }
  let bin: string;
  try {
    bin = atob(b64);
  } catch {
    throw new ContractPdfError("signature_format", "Signature data URL is not valid base64.");
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  if (bytes.length < 24 || !PNG_MAGIC.every((b, i) => bytes[i] === b)) {
    throw new ContractPdfError("signature_format", "Signature is not a PNG image.");
  }
  // IHDR is always the first chunk: width and height are big-endian at 16 and 20.
  const ihdr = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const w = view.getUint32(16);
  const h = view.getUint32(20);
  if (ihdr !== "IHDR" || w === 0 || h === 0) {
    throw new ContractPdfError("signature_unreadable", "Signature PNG could not be read.");
  }
  if (w > MAX_SIGNATURE_SIDE || h > MAX_SIGNATURE_SIDE || w * h > MAX_SIGNATURE_PIXELS) {
    throw new ContractPdfError(
      "signature_too_large",
      `Signature image is too large (${w}×${h} pixels). The limit is ${MAX_SIGNATURE_SIDE} pixels per side.`,
    );
  }
  return bytes;
}

/** Scale a natural size into a box, never above 1:1 (1 px = 1 pt). */
export function fitWithin(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: width * scale, height: height * scale };
}

/* ------------------------------------------------------------------------ */
/* Dates                                                                     */
/* ------------------------------------------------------------------------ */

const TZ = "America/Chicago";

function parseDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2026-10-14 20:21:05 UTC" */
function utcStamp(iso: string): string {
  const d = parseDate(iso);
  if (!d) return sanitizeWinAnsi(iso);
  const s = d.toISOString();
  return `${s.slice(0, 10)} ${s.slice(11, 19)} UTC`;
}

/** "2026-10-14 15:21:05" in America/Chicago (numeric, reads the same in EN and ES). */
function centralStamp(iso: string): string {
  const d = parseDate(iso);
  if (!d) return sanitizeWinAnsi(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

/** "October 14, 2026, 3:21 PM" / "14 de octubre de 2026, 3:21 p.m." in Central time. */
function centralLong(iso: string, lang: Lang): string {
  const d = parseDate(iso);
  if (!d) return sanitizeWinAnsi(iso);
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/* ------------------------------------------------------------------------ */
/* Copy                                                                      */
/* ------------------------------------------------------------------------ */

type Lang = "en" | "es";

const COPY = {
  en: {
    meta: (ref: string, v: string) => `Booking ref. ${ref}  ·  Agreement version ${v}`,
    signature: "Signature",
    signedBy: "Signed by",
    signedOn: "Signed electronically on",
    central: "Central Time, America/Chicago",
    page: (i: number, n: number) => `Page ${i} of ${n}`,
    language: "English",
  },
  es: {
    meta: (ref: string, v: string) => `Referencia ${ref}  ·  Versión del contrato ${v}`,
    signature: "Firma",
    signedBy: "Firmado por",
    signedOn: "Firmado electrónicamente el",
    central: "hora del Centro, America/Chicago",
    page: (i: number, n: number) => `Página ${i} de ${n}`,
    language: "Español",
  },
} as const;

const EVENT_LABELS: Record<string, string> = {
  requested: "Booking requested / Reservación solicitada",
  approved: "Approved by TX Quince / Aprobada por TX Quince",
  consented: "Agreed to sign electronically / Aceptó firmar electrónicamente",
  viewed: "Opened the agreement / Abrió el contrato",
  signed: "Signed the agreement / Firmó el contrato",
  deposit_paid: "Deposit paid / Depósito pagado",
  countersigned: "Countersigned by TX Quince / Firmado por TX Quince",
};

const ACTOR_LABELS: Record<ContractAuditEvent["actor"], string> = {
  client: "Client / Cliente",
  admin: "TX Quince",
  system: "System / Sistema",
};

/* ------------------------------------------------------------------------ */
/* Layout                                                                    */
/* ------------------------------------------------------------------------ */

const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const MARGIN_X = 72;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const CONTENT_TOP = PAGE_H - 104;
const CONTENT_BOTTOM = 76;
const INK = rgb(17 / 255, 17 / 255, 16 / 255); // #111110
const SIGNATURE_MAX_W = 240;
const SIGNATURE_MAX_H = 90;

type Fonts = { regular: PDFFont; bold: PDFFont };

/**
 * Greedy word wrap; words longer than the line are broken by character.
 * Keeps a 1.5% safety margin: Helvetica is not embedded, so viewers draw it
 * with a metric-compatible stand-in whose widths can differ by a hair.
 */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  const limit = maxWidth * 0.985;
  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= limit;
  for (const para of text.split("\n")) {
    const words = para.split(" ").filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let line = "";
    for (let word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (fits(candidate)) {
        line = candidate;
        continue;
      }
      if (line) out.push(line);
      line = "";
      // Break an over-long token (user agent, hash, URL) across lines.
      while (!fits(word)) {
        let cut = 1;
        const chars = Array.from(word);
        while (cut < chars.length && fits(chars.slice(0, cut + 1).join(""))) cut++;
        out.push(chars.slice(0, cut).join(""));
        word = chars.slice(cut).join("");
      }
      line = word;
    }
    if (line) out.push(line);
  }
  return out;
}

class Composer {
  readonly pages: PDFPage[] = [];
  page!: PDFPage;
  y = CONTENT_TOP;

  constructor(
    private readonly doc: PDFDocument,
    readonly fonts: Fonts,
    private readonly ref: string,
  ) {}

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.drawHeader();
    this.y = CONTENT_TOP;
  }

  /** Start a new page unless `height` more points fit on this one. */
  ensure(height: number) {
    if (this.y - height < CONTENT_BOTTOM) this.newPage();
  }

  draw(text: string, x: number, baseline: number, size: number, font: PDFFont, tracking = 0) {
    const t = sanitizeWinAnsi(text);
    if (!t) return;
    if (tracking) this.page.pushOperators(setCharacterSpacing(tracking));
    this.page.drawText(t, { x, y: baseline, size, font, color: INK });
    if (tracking) this.page.pushOperators(setCharacterSpacing(0));
  }

  width(text: string, size: number, font: PDFFont, tracking = 0) {
    const t = sanitizeWinAnsi(text);
    return font.widthOfTextAtSize(t, size) + tracking * Math.max(0, Array.from(t).length - 1);
  }

  rule(y: number, x1 = MARGIN_X, x2 = PAGE_W - MARGIN_X, opacity = 0.18, thickness = 0.5) {
    this.page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color: INK, opacity });
  }

  private drawHeader() {
    const { regular, bold } = this.fonts;
    const baseline = PAGE_H - 56;
    this.draw("TX QUINCE", MARGIN_X, baseline, 10, bold, 2.6);
    const ref = `Ref. ${this.ref}`;
    this.draw(ref, PAGE_W - MARGIN_X - this.width(ref, 9, regular, 0.6), baseline, 9, regular, 0.6);
    this.rule(baseline - 14, MARGIN_X, PAGE_W - MARGIN_X, 0.55, 0.6);
  }

  /** Wrapped paragraph, flowing across pages line by line. */
  paragraph(text: string, opts: { size: number; leading: number; font?: PDFFont; x?: number; width?: number }) {
    const font = opts.font ?? this.fonts.regular;
    const x = opts.x ?? MARGIN_X;
    const lines = wrap(sanitizeWinAnsi(text), font, opts.size, opts.width ?? CONTENT_W - (x - MARGIN_X));
    for (const line of lines) {
      this.ensure(opts.leading);
      this.draw(line, x, this.y - opts.size, opts.size, font);
      this.y -= opts.leading;
    }
  }

  /** Bulleted item with a hanging indent. */
  bullet(text: string, size: number, leading: number) {
    const indent = 14;
    const lines = wrap(sanitizeWinAnsi(text), this.fonts.regular, size, CONTENT_W - indent);
    lines.forEach((line, i) => {
      this.ensure(leading);
      if (i === 0) this.draw("•", MARGIN_X + 2, this.y - size, size * 0.9, this.fonts.regular);
      this.draw(line, MARGIN_X + indent, this.y - size, size, this.fonts.regular);
      this.y -= leading;
    });
  }

  /** Small tracked uppercase heading with a hairline above; never orphaned. */
  heading(text: string, keepWith: number) {
    const size = 8.5;
    const block = 22 + size + 10;
    this.ensure(block + keepWith);
    if (this.y < CONTENT_TOP) this.rule(this.y - 8);
    this.y -= 22;
    this.draw(text.toUpperCase(), MARGIN_X, this.y - size, size, this.fonts.bold, 1.4);
    this.y -= size + 10;
  }

  footers(sha: string, label: (i: number, n: number) => string) {
    const n = this.pages.length;
    this.pages.forEach((page, idx) => {
      this.page = page;
      const baseline = 40;
      this.rule(baseline + 16, MARGIN_X, PAGE_W - MARGIN_X, 0.18, 0.5);
      this.draw(`SHA-256 ${sha.slice(0, 16)}`, MARGIN_X, baseline, 7.5, this.fonts.regular, 0.3);
      const text = label(idx + 1, n);
      this.draw(text, PAGE_W - MARGIN_X - this.width(text, 8.5, this.fonts.regular), baseline, 8.5, this.fonts.regular);
    });
  }
}

/* ------------------------------------------------------------------------ */
/* Render                                                                    */
/* ------------------------------------------------------------------------ */

function safeRef(ref: string): string {
  const cleaned = String(ref ?? "")
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return cleaned || "booking";
}

export async function renderSignedContractPdf(
  input: ContractPdfInput,
): Promise<{ pdf: Uint8Array; sha256: string; filename: string }> {
  const { agreement, generatedAt } = input;
  if (!agreement || !Array.isArray(agreement.sections) || typeof agreement.signedName !== "string") {
    throw new ContractPdfError("invalid_agreement", "A signed agreement is required to render the contract PDF.");
  }
  // Validate the signature before doing any other work.
  const signatureBytes = decodeSignature(agreement.signature);

  const lang: Lang = agreement.lang === "es" ? "es" : "en";
  const c = COPY[lang];
  const ref = sanitizeWinAnsi(input.ref).trim() || "-";
  const sha256 = await contractSha256(agreement);

  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  let signature: PDFImage;
  try {
    signature = await doc.embedPng(signatureBytes);
  } catch {
    throw new ContractPdfError("signature_unreadable", "Signature PNG could not be read.");
  }

  const generated = parseDate(generatedAt) ?? new Date();
  doc.setTitle(sanitizeWinAnsi(`${agreement.title} — ${ref}`));
  doc.setAuthor("TX Quince");
  doc.setSubject(sanitizeWinAnsi(`${agreement.title}, signed by ${agreement.signedName}`));
  doc.setKeywords([`ref:${ref}`, `agreement:${agreement.version}`, `sha256:${sha256}`, `esign:${ESIGN_CONSENT.version}`]);
  doc.setCreator("txquince.com");
  doc.setProducer("txquince.com");
  doc.setLanguage(lang === "es" ? "es-US" : "en-US");
  doc.setCreationDate(generated);
  doc.setModificationDate(generated);

  const k = new Composer(doc, fonts, ref);
  const { regular, bold } = fonts;
  k.newPage();

  // Title, meta, intro — in the agreement's language.
  for (const line of wrap(sanitizeWinAnsi(agreement.title), regular, 24, CONTENT_W)) {
    k.ensure(30);
    k.draw(line, MARGIN_X, k.y - 24, 24, regular, -0.2);
    k.y -= 30;
  }
  k.y -= 4;
  k.paragraph(c.meta(ref, agreement.version), { size: 8.5, leading: 12 });
  k.y -= 14;
  k.paragraph(agreement.intro, { size: 11.5, leading: 17 });
  k.y -= 4;

  // Sections.
  const BODY = 10.5;
  const LEAD = 15.5;
  for (const section of agreement.sections) {
    k.heading(section.title, LEAD);
    for (const line of section.lines) k.bullet(line, BODY, LEAD);
  }

  // Signature block — kept together on one page.
  const box = fitWithin(signature.width, signature.height, SIGNATURE_MAX_W, SIGNATURE_MAX_H);
  const signedLong = `${c.signedOn} ${centralLong(agreement.signedAt, lang)} (${c.central})`;
  const signedLines = wrap(sanitizeWinAnsi(signedLong), regular, 9.5, CONTENT_W);
  const blockHeight = 8 + box.height + 4 + 10 + 18 + signedLines.length * 13.5 + 14;
  k.heading(c.signature, blockHeight);
  k.y -= 8;
  // The ink sits on the signature line, the way it does on a paper form.
  const lineY = k.y - box.height - 4;
  k.page.drawImage(signature, { x: MARGIN_X, y: lineY + 4, width: box.width, height: box.height });
  k.rule(lineY, MARGIN_X, MARGIN_X + SIGNATURE_MAX_W + 40, 0.7, 0.6);
  k.y = lineY - 10;
  k.draw(`${c.signedBy}: ${agreement.signedName}`, MARGIN_X, k.y - 11, 11, bold);
  k.y -= 18;
  for (const line of signedLines) {
    k.draw(line, MARGIN_X, k.y - 9.5, 9.5, regular);
    k.y -= 13.5;
  }
  k.draw(utcStamp(agreement.signedAt), MARGIN_X, k.y - 9.5, 9.5, regular);
  k.y -= 14;

  // Signature record — always starts on its own page.
  renderRecord(k, input, { lang, ref, sha256 });

  k.footers(sha256, c.page);

  const pdf = await doc.save();
  return { pdf, sha256, filename: `TXQuince-Agreement-${safeRef(input.ref)}.pdf` };
}

function renderRecord(k: Composer, input: ContractPdfInput, ctx: { lang: Lang; ref: string; sha256: string }) {
  const { agreement, audit, generatedAt } = input;
  const { regular, bold } = k.fonts;

  const title = (continued: boolean) => {
    k.newPage();
    const t = continued ? "Signature record / Registro de firma (cont.)" : "Signature record / Registro de firma";
    for (const line of wrap(t, regular, 18, CONTENT_W)) {
      k.draw(line, MARGIN_X, k.y - 18, 18, regular, -0.1);
      k.y -= 24;
    }
    k.y -= 4;
  };

  title(false);
  k.paragraph(
    "This page records how this agreement was signed electronically. / Esta página registra cómo se firmó electrónicamente este contrato.",
    { size: 9, leading: 13 },
  );
  k.y -= 10;

  // Summary as label / value rows.
  const LABEL_W = 150;
  const VALUE_X = MARGIN_X + LABEL_W;
  const VALUE_W = CONTENT_W - LABEL_W;
  const size = 8.5;
  const lead = 12;
  const rows: [string, string][] = [
    ["Booking ref. / Referencia", ctx.ref],
    ["Document / Documento", agreement.title],
    ["Language / Idioma", COPY[ctx.lang].language],
    ["Agreement version / Versión del contrato", agreement.version],
    ["Signed by / Firmado por", agreement.signedName],
    ["Signed at / Fecha de firma", `${centralStamp(agreement.signedAt)} Central (America/Chicago)\n${utcStamp(agreement.signedAt)}`],
    ["Signer IP / IP de quien firmó", agreement.ip || "-"],
    ["Signer device / Dispositivo", agreement.userAgent || "-"],
    ["E-sign consent version / Versión del consentimiento", ESIGN_CONSENT.version],
    ["Document SHA-256 / Huella SHA-256", ctx.sha256],
    ["Record generated / Registro generado", utcStamp(generatedAt)],
  ];
  for (const [label, value] of rows) {
    const l = wrap(sanitizeWinAnsi(label), bold, size, LABEL_W - 12);
    const v = wrap(sanitizeWinAnsi(value), regular, size, VALUE_W);
    const h = Math.max(l.length, v.length) * lead + 5;
    k.ensure(h);
    l.forEach((line, i) => k.draw(line, MARGIN_X, k.y - size - i * lead, size, bold));
    v.forEach((line, i) => k.draw(line, VALUE_X, k.y - size - i * lead, size, regular));
    k.y -= h;
  }

  // Audit trail table.
  const cols = [
    { title: "Time / Hora\n(Central · UTC)", w: 104 },
    { title: "What happened / Qué pasó", w: 120 },
    { title: "Who / Quién", w: 62 },
    { title: "IP", w: 70 },
    { title: "Device / Dispositivo", w: CONTENT_W - 104 - 120 - 62 - 70 },
  ];
  const T = 7.5;
  const TL = 10;
  const PAD = 6;
  const colX = cols.reduce<number[]>((xs, col, i) => [...xs, i ? xs[i - 1] + cols[i - 1].w : MARGIN_X], []);

  const cells = (texts: string[], font: PDFFont) =>
    texts.map((t, i) => wrap(sanitizeWinAnsi(t), font, T, cols[i].w - 8));

  const drawRow = (lines: string[][], font: PDFFont) => {
    lines.forEach((cell, i) => cell.forEach((line, j) => k.draw(line, colX[i], k.y - PAD - T - j * TL, T, font)));
  };
  const rowHeight = (lines: string[][]) => Math.max(...lines.map((l) => l.length)) * TL + PAD * 2;

  const header = cells(cols.map((col) => col.title), bold);
  const headerH = rowHeight(header);
  const drawHeader = () => {
    drawRow(header, bold);
    k.y -= headerH;
    k.rule(k.y, MARGIN_X, PAGE_W - MARGIN_X, 0.6, 0.6);
  };

  const events = audit.length
    ? audit.map((e) => {
        const what = EVENT_LABELS[e.event] ?? e.event;
        return [
          `${centralStamp(e.at)} CT\n${utcStamp(e.at)}`,
          e.detail ? `${what}\n${e.detail}` : what,
          ACTOR_LABELS[e.actor] ?? String(e.actor),
          e.ip || "-",
          (e.userAgent || "-").slice(0, 512),
        ];
      })
    : [["-", "No events recorded / Sin eventos registrados", "-", "-", "-"]];

  const first = cells(events[0], regular);
  k.heading("Events / Eventos", headerH + rowHeight(first));
  drawHeader();
  events.forEach((ev, idx) => {
    const lines = idx === 0 ? first : cells(ev, regular);
    const h = rowHeight(lines);
    if (k.y - h < CONTENT_BOTTOM) {
      title(true);
      drawHeader();
    }
    drawRow(lines, regular);
    k.y -= h;
    if (idx < events.length - 1) k.rule(k.y, MARGIN_X, PAGE_W - MARGIN_X, 0.15, 0.4);
  });

  // What the fingerprint means, in plain words.
  k.heading("About the fingerprint / Sobre la huella", 3 * 12);
  k.paragraph(
    "The SHA-256 above is a fingerprint of the agreement text in this document. If even one letter of the agreement changed, the fingerprint would change too.",
    { size: 8.5, leading: 12 },
  );
  k.y -= 4;
  k.paragraph(
    "El SHA-256 de arriba es una huella del texto del contrato en este documento. Si cambiara una sola letra del contrato, la huella también cambiaría.",
    { size: 8.5, leading: 12 },
  );

  // The consent the family saw, in their language.
  k.heading(
    ctx.lang === "es"
      ? `Consentimiento para firma electrónica (versión ${ESIGN_CONSENT.version})`
      : `Consent to sign electronically (version ${ESIGN_CONSENT.version})`,
    3 * 12,
  );
  for (const para of ESIGN_CONSENT[ctx.lang].split("\n")) {
    if (para.startsWith("• ")) k.bullet(para.slice(2), 8.5, 12);
    else k.paragraph(para, { size: 8.5, leading: 12 });
    k.y -= 3;
  }
}
