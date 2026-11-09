/**
 * Test helper: a real SQLite database (node:sqlite) behind the D1 binding
 * interface, loaded with the real /migrations. Lets tests run the actual SQL,
 * triggers and constraints that production D1 runs.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { D1Database, D1PreparedStatement } from "@/lib/d1";

export function sqliteD1(): D1Database & { raw: DatabaseSync } {
  const raw = new DatabaseSync(":memory:");
  const dir = join(process.cwd(), "migrations");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) raw.exec(readFileSync(join(dir, f), "utf8"));

  const prepare = (sql: string): D1PreparedStatement => {
    let args: unknown[] = [];
    const stmt: D1PreparedStatement = {
      bind: (...a: unknown[]) => ((args = a), stmt),
      first: async <T,>() => (raw.prepare(sql).get(...(args as never[])) as T) ?? null,
      all: async <T,>() => {
        const s = raw.prepare(sql);
        if (/^\s*(select|with)\b/i.test(sql) || /\breturning\b/i.test(sql)) {
          return { results: s.all(...(args as never[])) as T[], meta: { changes: 0 } };
        }
        const r = s.run(...(args as never[]));
        return { results: [] as T[], meta: { changes: Number(r.changes) } };
      },
      run: async () => {
        const r = raw.prepare(sql).run(...(args as never[]));
        return { results: [], meta: { changes: Number(r.changes) } };
      },
    };
    return stmt;
  };
  return { prepare, raw };
}
