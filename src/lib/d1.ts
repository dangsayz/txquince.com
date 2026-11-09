/**
 * d1.ts — SERVER-ONLY access to the Cloudflare D1 database (binding DB,
 * database "txquince", schema in /migrations). Present on Workers, absent in
 * plain `next dev`, where callers degrade to "not configured".
 */
import "server-only";

/** Minimal structural types for the D1 binding (no generated env types). */
export interface D1Result<T> {
  results: T[];
  meta: { changes: number };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<never>>;
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

export async function getD1(): Promise<D1Database | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const { env } = mod.getCloudflareContext();
    return (env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

/** Throws a clear error when the binding is missing (write paths). */
export async function requireD1(): Promise<D1Database> {
  const db = await getD1();
  if (!db) throw new Error("Database not available (D1 binding DB is missing).");
  return db;
}
