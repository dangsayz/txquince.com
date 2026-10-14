/**
 * pricing.ts — SERVER-ONLY: the live price book.
 *
 * The owner edits prices at /admin/prices; they are stored as JSON in the
 * PORTFOLIO R2 bucket (no Stripe products exist — checkout prices are computed
 * from this book at charge time, so nothing else has to change):
 *
 *   config/pricing.json                      the live book
 *   config/pricing-history/<iso>.json        one file per save: who, when, what changed,
 *                                            the book before and after (append-only)
 *
 * getPriceBook() is what every server surface reads (pages, metadata, JSON-LD,
 * /api/inquiry, the agreement, emails). It reads storage on every request (so
 * a save is live on the next page load) and FALLS BACK TO THE LAUNCH DEFAULTS (commission.ts) when
 * storage is unreachable — plain `next build`, `next start` without
 * Cloudflare, or an R2 hiccup — so a page never fails because of pricing.
 *
 * Local development: with no R2 binding, `next dev` (or any process with
 * PRICING_LOCAL_DIR set) uses a folder on disk instead (default
 * ./.pricing-local), so the admin page works offline and tests can point a
 * production server at a mocked book without touching the real bucket.
 */
import "server-only";
import { cache } from "react";
import {
  ADD_ON_IDS,
  DEFAULT_PRICE_BOOK,
  TIER_IDS,
  describeChanges,
  priceBookSchema,
  type PriceBook,
} from "./commission";

export const PRICING_KEY = "config/pricing.json";
export const HISTORY_PREFIX = "config/pricing-history/";
const HISTORY_SHOWN = 25;

/* ---------------- minimal structural R2 types ---------------- */

interface ConfigObject {
  etag: string;
  text(): Promise<string>;
}
interface ListedObject {
  key: string;
  uploaded?: Date;
  customMetadata?: Record<string, string>;
}
export interface ConfigBucket {
  get(key: string): Promise<ConfigObject | null>;
  put(
    key: string,
    value: string,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string };
      customMetadata?: Record<string, string>;
      onlyIf?: { etagMatches?: string };
    },
  ): Promise<{ etag: string } | null>;
  list(options: {
    prefix: string;
    cursor?: string;
    limit?: number;
    include?: "customMetadata"[];
  }): Promise<{ objects: ListedObject[]; truncated: boolean; cursor?: string }>;
}

export type PricingStorage = "r2" | "local" | "none";

async function r2Bucket(): Promise<ConfigBucket | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const env = mod.getCloudflareContext().env as unknown as Record<string, unknown>;
    return (env?.PORTFOLIO as ConfigBucket | undefined) ?? null;
  } catch {
    return null;
  }
}

function localDir(): string | null {
  const dir = process.env.PRICING_LOCAL_DIR;
  if (dir) return dir;
  return process.env.NODE_ENV === "development" ? `${process.cwd()}/.pricing-local` : null;
}

/** Dev/test-only bucket on disk (same contract as R2, incl. etag conditions). */
function localBucket(root: string): ConfigBucket {
  const fs = () => import("node:fs/promises");
  const safe = (key: string) => {
    if (!/^config\/[A-Za-z0-9._\-/]+$/.test(key) || key.includes("..")) throw new Error("bad key");
    return `${root}/${key}`;
  };
  const tagOf = (st: { mtimeMs: number; size: number }) => `${Math.round(st.mtimeMs * 1000)}-${st.size}`;
  return {
    async get(key) {
      const f = await fs();
      try {
        const path = safe(key);
        const [buf, st] = await Promise.all([f.readFile(path), f.stat(path)]);
        return { etag: tagOf(st), text: async () => buf.toString("utf8") };
      } catch {
        return null;
      }
    },
    async put(key, value, options) {
      const f = await fs();
      const path = safe(key);
      if (options?.onlyIf?.etagMatches) {
        const st = await f.stat(path).catch(() => null);
        if (!st || tagOf(st) !== options.onlyIf.etagMatches) return null;
      }
      await f.mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
      await f.writeFile(path, value);
      if (options?.customMetadata) await f.writeFile(`${path}.meta`, JSON.stringify(options.customMetadata));
      return { etag: tagOf(await f.stat(path)) };
    },
    async list({ prefix }) {
      const f = await fs();
      const dir = safe(prefix.replace(/\/$/, ""));
      const names = await f.readdir(dir).catch(() => [] as string[]);
      const objects: ListedObject[] = [];
      for (const n of names) {
        if (!n.endsWith(".json")) continue;
        const meta = await f
          .readFile(`${dir}/${n}.meta`, "utf8")
          .then((t) => JSON.parse(t) as Record<string, string>)
          .catch(() => undefined);
        objects.push({ key: `${prefix}${n}`, customMetadata: meta });
      }
      return { objects, truncated: false };
    },
  };
}

export async function getPricingBucket(): Promise<{ bucket: ConfigBucket | null; storage: PricingStorage }> {
  const r2 = await r2Bucket();
  if (r2) return { bucket: r2, storage: "r2" };
  const dir = localDir();
  if (dir) return { bucket: localBucket(dir), storage: "local" };
  return { bucket: null, storage: "none" };
}

/* ---------------- parse / normalize ---------------- */

/**
 * Accept a stored book: known ids only, missing ids take the defaults (so a
 * package or extra added in code later still has a price), then validate
 * strictly. Returns null when the file can't be trusted.
 */
export function parseStoredBook(raw: unknown): PriceBook | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const pk = (o.packages ?? {}) as Record<string, unknown>;
  const ad = (o.addOns ?? {}) as Record<string, unknown>;
  const merged = {
    packages: Object.fromEntries(
      TIER_IDS.map((id) => [id, { ...DEFAULT_PRICE_BOOK.packages[id], ...((pk[id] as object) ?? {}) }]),
    ),
    addOns: Object.fromEntries(ADD_ON_IDS.map((id) => [id, ad[id] ?? DEFAULT_PRICE_BOOK.addOns[id]])),
    maxHours: o.maxHours ?? DEFAULT_PRICE_BOOK.maxHours,
    depositPercent: o.depositPercent ?? DEFAULT_PRICE_BOOK.depositPercent,
    balanceDueDays: o.balanceDueDays ?? DEFAULT_PRICE_BOOK.balanceDueDays,
    holdDays: o.holdDays ?? DEFAULT_PRICE_BOOK.holdDays,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : null,
    updatedBy: typeof o.updatedBy === "string" ? o.updatedBy : null,
  };
  const parsed = priceBookSchema.safeParse(merged);
  return parsed.success ? (Object.freeze(parsed.data) as PriceBook) : null;
}

export type StoredBook = {
  book: PriceBook;
  /** etag of config/pricing.json, or "none" when nothing has been saved yet. */
  version: string;
  storage: PricingStorage;
  /** The stored file exists but could not be read/validated (defaults are in use). */
  corrupt: boolean;
};

/** Read straight from storage (no cache). */
export async function readPriceBook(): Promise<StoredBook> {
  const { bucket, storage } = await getPricingBucket();
  if (!bucket) return { book: DEFAULT_PRICE_BOOK, version: "none", storage, corrupt: false };
  const obj = await bucket.get(PRICING_KEY);
  if (!obj) return { book: DEFAULT_PRICE_BOOK, version: "none", storage, corrupt: false };
  let book: PriceBook | null = null;
  try {
    book = parseStoredBook(JSON.parse(await obj.text()));
  } catch {
    book = null;
  }
  if (!book) {
    console.error("[pricing] config/pricing.json is invalid; using defaults.");
    return { book: DEFAULT_PRICE_BOOK, version: obj.etag, storage, corrupt: true };
  }
  return { book, version: obj.etag, storage, corrupt: false };
}

/* ---------------- public read ---------------- */

/** Last book this isolate read successfully: the fallback if storage hiccups. */
let lastKnown: PriceBook | null = null;

async function loadFresh(): Promise<PriceBook> {
  try {
    const r = await readPriceBook();
    lastKnown = r.book;
    return r.book;
  } catch (err) {
    console.error("[pricing] read failed; using", lastKnown ? "last known book" : "defaults", err);
    return lastKnown ?? DEFAULT_PRICE_BOOK;
  }
}

/**
 * The live price book. Every server surface that shows or charges a price
 * calls this. Read from storage on every request (deduped within a request by
 * React `cache`), so a save in /admin/prices shows on the very next page load
 * everywhere — no per-isolate delay. Never throws: falls back to the last
 * known book, then the defaults.
 */
export const getPriceBook = cache(loadFresh);

/* ---------------- write ---------------- */

export class PricingError extends Error {
  readonly status: number;
  readonly code: "unavailable" | "conflict" | "invalid";
  constructor(message: string, status: number, code: "unavailable" | "conflict" | "invalid") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const historyKey = (iso: string) => `${HISTORY_PREFIX}${iso.replace(/:/g, "-")}.json`;

/**
 * Save a new book. `baseVersion` is the version the admin's form was loaded
 * from: if the stored book changed since (someone else saved), nothing is
 * written and a conflict is thrown. The write itself is conditional on the
 * etag just read, so two saves racing can't both land.
 */
export async function savePriceBook(
  input: unknown,
  baseVersion: string,
  by: string,
): Promise<{ book: PriceBook; version: string; changes: string[]; historySaved: boolean }> {
  const parsed = priceBookSchema.safeParse(input);
  if (!parsed.success) {
    throw new PricingError(parsed.error.issues[0]?.message ?? "Please check the numbers.", 422, "invalid");
  }
  const { bucket } = await getPricingBucket();
  if (!bucket) throw new PricingError("Price storage isn't available here, so nothing was saved.", 503, "unavailable");

  const current = await readPriceBook();
  if (current.version !== baseVersion) {
    throw new PricingError(
      "Prices were changed somewhere else since you opened this page. Reload to see the latest, then make your change again.",
      409,
      "conflict",
    );
  }
  const at = new Date().toISOString();
  const next: PriceBook = { ...parsed.data, updatedAt: at, updatedBy: by };
  const changes = describeChanges(current.book, next);

  const written = await bucket.put(PRICING_KEY, JSON.stringify(next, null, 2), {
    httpMetadata: { contentType: "application/json", cacheControl: "no-store" },
    ...(current.version !== "none" ? { onlyIf: { etagMatches: current.version } } : {}),
  });
  if (!written) {
    throw new PricingError(
      "Prices were changed somewhere else at the same moment. Reload to see the latest, then try again.",
      409,
      "conflict",
    );
  }

  let historySaved = true;
  try {
    await bucket.put(
      historyKey(at),
      JSON.stringify({ at, by, changes, before: current.book, after: next }, null, 2),
      {
        httpMetadata: { contentType: "application/json" },
        customMetadata: { at, by: by.slice(0, 200), changes: JSON.stringify(changes).slice(0, 1500) },
      },
    );
  } catch (err) {
    historySaved = false;
    console.error("[pricing] history write failed:", err);
  }

  const book = Object.freeze(next);
  lastKnown = book;
  return { book, version: written.etag, changes, historySaved };
}

export type PriceHistoryEntry = { at: string; by: string; changes: string[] };

/** Most recent saves first. Best-effort: an unreadable listing is an empty list. */
export async function listPriceHistory(limit = HISTORY_SHOWN): Promise<PriceHistoryEntry[]> {
  const { bucket } = await getPricingBucket();
  if (!bucket) return [];
  try {
    const all: ListedObject[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 20; page++) {
      const res = await bucket.list({ prefix: HISTORY_PREFIX, cursor, limit: 1000, include: ["customMetadata"] });
      all.push(...res.objects);
      if (!res.truncated || !res.cursor) break;
      cursor = res.cursor;
    }
    return all
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .slice(0, limit)
      .map((o) => {
        const m = o.customMetadata ?? {};
        let changes: string[] = [];
        try {
          const c = JSON.parse(m.changes ?? "[]");
          if (Array.isArray(c)) changes = c.filter((x): x is string => typeof x === "string");
        } catch {
          /* summary was truncated — show none */
        }
        return { at: m.at ?? o.uploaded?.toISOString() ?? "", by: m.by ?? "", changes };
      });
  } catch (err) {
    console.error("[pricing] history list failed:", err);
    return [];
  }
}
