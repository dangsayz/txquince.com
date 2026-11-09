/**
 * d1-query.ts — a small, Supabase-shaped query builder on Cloudflare D1.
 *
 * TX Quince moved off Supabase (2026-11). The app was written against
 * supabase-js, so this gives the SAME call shape for the subset the app uses:
 *
 *   db.from("bookings").select("id, status").eq("id", id).maybeSingle()
 *   db.from("bookings").update({...}).eq("id", id).in("status", [...]).select("id")
 *   db.from("site_settings").upsert({...}, { onConflict: "key" })
 *   db.from("page_views").select("id", { count: "exact", head: true }).gte(...)
 *   db.rpc("create_booking_hold", {...})
 *
 * Every value is a bound parameter; column and table names are checked against
 * a strict identifier pattern, so nothing a visitor sends can become SQL.
 * JSON / array / boolean columns are converted both ways (see TABLES).
 * Errors come back as { message, code } with Postgres codes the app already
 * handles (23505 unique / date_unavailable, 23514 check, 23503 foreign key).
 */
import type { D1Database } from "@/lib/d1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rows are untyped, as they were on supabase-js
type Row = Record<string, any>;
export type DbError = { message: string; code: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbResult<T = any> = { data: T; error: DbError | null; count?: number | null };

/* ------------------------------ table metadata ----------------------------- */

type TableMeta = { pk: string[]; json?: string[]; bool?: string[]; uuidId?: boolean; touch?: boolean };

export const TABLES: Record<string, TableMeta> = {
  inquiries: { pk: ["id"], json: ["attribution"], uuidId: true },
  inquiry_activity: { pk: ["id"], uuidId: true },
  bookings: { pk: ["id"], json: ["metadata", "attribution"], uuidId: true, touch: true },
  booking_payments: { pk: ["id"], uuidId: true, touch: true },
  quince_plans: { pk: ["id"], json: ["colors", "attribution"], uuidId: true, touch: true },
  date_availability: { pk: ["event_date"] },
  price_guide: { pk: ["id"], bool: ["published"], uuidId: true },
  site_settings: { pk: ["key"], json: ["value"] },
  portfolio_images: { pk: ["id"], json: ["colors"], bool: ["is_feature"], uuidId: true },
  videos: { pk: ["id"], bool: ["is_feature"], uuidId: true },
  vendors: { pk: ["id"], uuidId: true },
  portfolio_image_vendors: { pk: ["image_id", "vendor_id"] },
  venues: { pk: ["slug"], json: ["faq"] },
  conversion_changes: { pk: ["id"], json: ["baseline"], uuidId: true },
  page_views: { pk: ["id"], uuidId: true },
  lead_events: { pk: ["id"], uuidId: true },
  support_tickets: { pk: ["id"], uuidId: true },
  admin_login_codes: { pk: ["id"], uuidId: true },
  admin_sessions: { pk: ["id"], uuidId: true },
};

const IDENT = /^[a-z_][a-z0-9_]*$/;
function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`bad identifier: ${name}`);
  return name;
}

function meta(table: string): TableMeta {
  const m = TABLES[table];
  if (!m) throw new Error(`unknown table: ${table}`);
  return m;
}

/** App value → D1 value. */
function toDb(m: TableMeta, col: string, v: unknown): unknown {
  if (v === undefined) return null;
  if (m.json?.includes(col)) return v === null ? null : JSON.stringify(v);
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof Date) return v.toISOString();
  if (v !== null && typeof v === "object") return JSON.stringify(v);
  return v;
}

/** D1 row → app row (the shape supabase-js used to return). */
export function fromDb(table: string, row: Row): Row {
  const m = TABLES[table];
  if (!m) return row;
  const out: Row = { ...row };
  for (const c of m.json ?? []) {
    if (typeof out[c] === "string") {
      try {
        out[c] = JSON.parse(out[c] as string);
      } catch {
        /* leave as text */
      }
    }
  }
  for (const c of m.bool ?? []) if (c in out && out[c] !== null) out[c] = Boolean(Number(out[c]));
  return out;
}

export function mapError(err: unknown): DbError {
  const message = String((err as Error)?.message ?? err);
  if (message.includes("date_unavailable")) return { message: "date_unavailable", code: "23505" };
  if (message.includes("UNIQUE constraint failed")) return { message, code: "23505" };
  if (message.includes("CHECK constraint failed")) return { message, code: "23514" };
  if (message.includes("FOREIGN KEY constraint failed")) return { message, code: "23503" };
  if (message.includes("NOT NULL constraint failed")) return { message, code: "23502" };
  return { message, code: "D1" };
}

/* ---------------------------------- builder -------------------------------- */

type Op = "select" | "insert" | "update" | "upsert" | "delete";
type Filter = { sql: string; args: unknown[] };

function parseColumns(cols: string | undefined): string {
  const c = (cols ?? "*").trim();
  if (c === "*" || c === "") return "*";
  return c
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (s === "*") return "*";
      if (!IDENT.test(s)) throw new Error(`unsupported select: ${s}`);
      return s;
    })
    .join(", ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Query<T = any> implements PromiseLike<DbResult<T>> {
  private op: Op = "select";
  private cols = "*";
  private returning: string | null = null;
  private filters: Filter[] = [];
  private orders: string[] = [];
  private lim: number | null = null;
  private off = 0;
  private countMode = false;
  private head = false;
  private one: "single" | "maybe" | null = null;
  private rows: Row[] = [];
  private patch: Row = {};
  private conflict: string[] | null = null;

  constructor(private db: () => Promise<D1Database>, private table: string) {
    meta(table);
    ident(table);
  }

  select(cols?: string, opts?: { count?: "exact"; head?: boolean }): this {
    if (this.op === "select") {
      this.cols = parseColumns(cols);
      this.countMode = opts?.count === "exact";
      this.head = Boolean(opts?.head);
    } else {
      this.returning = parseColumns(cols);
    }
    return this;
  }
  insert(values: Row | Row[]): this {
    this.op = "insert";
    this.rows = Array.isArray(values) ? values : [values];
    return this;
  }
  upsert(values: Row | Row[], opts?: { onConflict?: string }): this {
    this.op = "upsert";
    this.rows = Array.isArray(values) ? values : [values];
    this.conflict = opts?.onConflict ? opts.onConflict.split(",").map((s) => ident(s.trim())) : meta(this.table).pk;
    return this;
  }
  update(values: Row): this {
    this.op = "update";
    this.patch = values;
    return this;
  }
  delete(): this {
    this.op = "delete";
    return this;
  }

  private where(col: string, sql: string, ...args: unknown[]): this {
    this.filters.push({ sql: `${ident(col)} ${sql}`, args: args.map((a) => toDb(meta(this.table), col, a)) });
    return this;
  }
  eq(col: string, v: unknown) {
    return v === null ? this.where(col, "IS NULL") : this.where(col, "= ?", v);
  }
  neq(col: string, v: unknown) {
    return v === null ? this.where(col, "IS NOT NULL") : this.where(col, "<> ?", v);
  }
  gt(col: string, v: unknown) {
    return this.where(col, "> ?", v);
  }
  gte(col: string, v: unknown) {
    return this.where(col, ">= ?", v);
  }
  lt(col: string, v: unknown) {
    return this.where(col, "< ?", v);
  }
  lte(col: string, v: unknown) {
    return this.where(col, "<= ?", v);
  }
  like(col: string, pattern: string) {
    return this.where(col, "LIKE ? ESCAPE '\\'", pattern);
  }
  is(col: string, v: null | boolean) {
    if (v === null) return this.where(col, "IS NULL");
    return this.where(col, "= ?", v);
  }
  in(col: string, values: readonly unknown[]) {
    if (values.length === 0) {
      this.filters.push({ sql: "0", args: [] });
      return this;
    }
    return this.where(col, `IN (${values.map(() => "?").join(", ")})`, ...values);
  }
  match(obj: Row) {
    for (const [k, v] of Object.entries(obj)) this.eq(k, v);
    return this;
  }
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    const dir = opts?.ascending === false ? "DESC" : "ASC";
    const nulls = opts?.nullsFirst === undefined ? "" : opts.nullsFirst ? " NULLS FIRST" : " NULLS LAST";
    this.orders.push(`${ident(col)} ${dir}${nulls}`);
    return this;
  }
  limit(n: number) {
    this.lim = Math.max(0, Math.floor(n));
    return this;
  }
  /** Inclusive row range, as in supabase-js: range(0, 999) = the first 1000 rows. */
  range(from: number, to: number) {
    this.off = Math.max(0, Math.floor(from));
    this.lim = Math.max(0, Math.floor(to) - this.off + 1);
    return this;
  }
  single(): PromiseLike<DbResult> {
    this.one = "single";
    return this as PromiseLike<DbResult>;
  }
  maybeSingle(): PromiseLike<DbResult> {
    this.one = "maybe";
    return this as PromiseLike<DbResult>;
  }

  // Non-generic on purpose: `await`/Promise.all then infer DbResult (data: any), as on supabase-js.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then(ok?: ((v: DbResult<T>) => any) | null, bad?: ((e: unknown) => any) | null): Promise<any> {
    return this.run().then(ok, bad);
  }

  private whereSql(): { sql: string; args: unknown[] } {
    if (!this.filters.length) return { sql: "", args: [] };
    return { sql: ` WHERE ${this.filters.map((f) => f.sql).join(" AND ")}`, args: this.filters.flatMap((f) => f.args) };
  }

  /** Fills id / timestamps the way Postgres defaults and triggers used to. */
  private prepRow(row: Row): Row {
    const m = meta(this.table);
    const r: Row = {};
    for (const [k, v] of Object.entries(row)) if (v !== undefined) r[ident(k)] = v;
    if (m.uuidId && (r.id === undefined || r.id === null)) r.id = crypto.randomUUID();
    return r;
  }

  private shape(rows: Row[]): DbResult<T> {
    const data = rows.map((r) => fromDb(this.table, r));
    if (this.one) {
      if (data.length === 1) return { data: data[0] as T, error: null };
      if (data.length === 0 && this.one === "maybe") return { data: null as T, error: null };
      return {
        data: null as T,
        error: { message: data.length ? "multiple rows returned" : "no rows returned", code: "PGRST116" },
      };
    }
    return { data: data as T, error: null };
  }

  private async run(): Promise<DbResult<T>> {
    try {
      const db = await this.db();
      const m = meta(this.table);
      const w = this.whereSql();

      if (this.op === "select") {
        if (this.countMode) {
          const r = await db.prepare(`SELECT count(*) AS n FROM ${this.table}${w.sql}`).bind(...w.args).first<{ n: number }>();
          const count = Number(r?.n ?? 0);
          if (this.head) return { data: null as T, error: null, count };
          const rows = await this.selectRows(db, w);
          return { ...this.shape(rows), count };
        }
        return this.shape(await this.selectRows(db, w));
      }

      if (this.op === "delete") {
        const ret = this.returning ? ` RETURNING ${this.returning}` : "";
        const r = await db.prepare(`DELETE FROM ${this.table}${w.sql}${ret}`).bind(...w.args).all<Row>();
        return this.returning ? this.shape(r.results) : { data: null as T, error: null };
      }

      if (this.op === "update") {
        const patch = { ...this.patch };
        if (m.touch && patch.updated_at === undefined) patch.updated_at = new Date().toISOString();
        const keys = Object.keys(patch).filter((k) => patch[k] !== undefined).map(ident);
        if (!keys.length) return { data: (this.returning ? [] : null) as T, error: null };
        const set = keys.map((k) => `${k} = ?`).join(", ");
        const args = keys.map((k) => toDb(m, k, patch[k]));
        const ret = this.returning ? ` RETURNING ${this.returning}` : "";
        const r = await db.prepare(`UPDATE ${this.table} SET ${set}${w.sql}${ret}`).bind(...args, ...w.args).all<Row>();
        return this.returning ? this.shape(r.results) : { data: null as T, error: null };
      }

      // insert / upsert — one statement per row (the app writes a row or a few at a time).
      const out: Row[] = [];
      for (const raw of this.rows) {
        const row = this.prepRow(raw);
        const keys = Object.keys(row);
        const args = keys.map((k) => toDb(m, k, row[k]));
        let sql = `INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
        if (this.op === "upsert") {
          const updates = keys.filter((k) => !this.conflict!.includes(k));
          if (m.touch && !keys.includes("updated_at")) updates.push("updated_at");
          sql += ` ON CONFLICT (${this.conflict!.join(", ")}) DO ${
            updates.length
              ? `UPDATE SET ${updates.map((k) => (k === "updated_at" && !keys.includes(k) ? `updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')` : `${k} = excluded.${k}`)).join(", ")}`
              : "NOTHING"
          }`;
        }
        sql += ` RETURNING ${this.returning ?? "*"}`;
        const r = await db.prepare(sql).bind(...args).all<Row>();
        out.push(...r.results);
      }
      return this.returning ? this.shape(out) : { data: null as T, error: null };
    } catch (err) {
      return { data: null as T, error: mapError(err) };
    }
  }

  private async selectRows(db: D1Database, w: { sql: string; args: unknown[] }): Promise<Row[]> {
    const order = this.orders.length ? ` ORDER BY ${this.orders.join(", ")}` : "";
    const lim =
      this.lim !== null
        ? ` LIMIT ${this.lim}${this.off ? ` OFFSET ${this.off}` : ""}`
        : this.one === "single" || this.one === "maybe"
          ? " LIMIT 2"
          : "";
    const r = await db.prepare(`SELECT ${this.cols} FROM ${this.table}${w.sql}${order}${lim}`).bind(...w.args).all<Row>();
    return r.results;
  }
}

/* ------------------------------------ rpc ---------------------------------- */

const nowIso = () => new Date().toISOString();

async function releaseExpiredHolds(db: D1Database): Promise<number> {
  const r = await db
    .prepare("UPDATE bookings SET status = 'expired', updated_at = ? WHERE status IN ('pending_payment', 'requested') AND expires_at < ?")
    .bind(nowIso(), nowIso())
    .run();
  return r.meta.changes;
}

/** The three Postgres functions the app called, now in TypeScript on D1. */
export async function runRpc(db: D1Database, fn: string, args: Row): Promise<DbResult> {
  try {
    if (fn === "release_expired_booking_holds") return { data: await releaseExpiredHolds(db), error: null };

    if (fn === "create_booking_hold") {
      await releaseExpiredHolds(db);
      const holdMinutes = Math.max(Number(args.p_hold_minutes) || 0, 10);
      const expires = new Date(Date.now() + holdMinutes * 60_000).toISOString();
      const id = crypto.randomUUID();
      const currency = String(args.p_currency ?? "usd").toLowerCase();
      const trimOrNull = (v: unknown) => {
        const s = String(v ?? "").trim();
        return s ? s : null;
      };
      await db
        .prepare(
          `INSERT INTO bookings (id, name, email, phone, event_date, package, notes, deposit_amount_cents, currency, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          String(args.p_name ?? "").trim(),
          String(args.p_email ?? "").trim().toLowerCase(),
          trimOrNull(args.p_phone),
          args.p_event_date,
          args.p_package,
          trimOrNull(args.p_notes),
          args.p_deposit_cents,
          currency,
          expires,
        )
        .run();
      return {
        data: [{ booking_id: id, event_date: args.p_event_date, deposit_amount_cents: args.p_deposit_cents, currency, expires_at: expires }],
        error: null,
      };
    }

    if (fn === "confirm_booking_payment") {
      const b = await db
        .prepare("SELECT id, status FROM bookings WHERE stripe_checkout_session_id = ?")
        .bind(args.p_checkout_session_id)
        .first<{ id: string; status: string }>();
      if (!b) return { data: null, error: { message: "booking_not_found", code: "P0001" } };
      if (b.status === "paid" || b.status === "payment_review") return { data: b.id, error: null };
      const set = (status: string) =>
        db
          .prepare(
            `UPDATE bookings SET status = ?, paid_at = COALESCE(paid_at, ?),
               stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id),
               stripe_customer_email = COALESCE(?, stripe_customer_email), updated_at = ?
             WHERE id = ?`,
          )
          .bind(status, nowIso(), args.p_payment_intent_id ?? null, args.p_customer_email ?? null, nowIso(), b.id)
          .run();
      try {
        await set("paid");
      } catch (err) {
        // The date filled up during checkout: money is in, but the operator decides.
        if (!String(err).includes("date_unavailable")) throw err;
        await set("payment_review");
      }
      return { data: b.id, error: null };
    }

    return { data: null, error: { message: `unknown function ${fn}`, code: "42883" } };
  } catch (err) {
    return { data: null, error: mapError(err) };
  }
}

/** The client: same entry points the app used on supabase-js. */
export function createD1Client(getDb: () => Promise<D1Database>) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => new Query<any[]>(getDb, table),
    rpc: async (fn: string, args: Row = {}) => runRpc(await getDb(), fn, args),
  };
}
export type D1Client = ReturnType<typeof createD1Client>;
