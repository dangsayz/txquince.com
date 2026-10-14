#!/usr/bin/env node
/**
 * LOCAL ONLY — rebuild a throwaway database from scratch and apply EVERY
 * migration in supabase/migrations (0001 → latest) on top of the Supabase
 * shim. Refuses to touch anything that isn't localhost.
 *
 *   LOCAL_PG_URL=postgres://postgres@127.0.0.1:55432/postgres node scripts/local/db-reset.mjs [dbname]
 *
 * pg_cron isn't available on a plain Postgres, so 0004's
 * `create extension pg_cron` line is skipped (scripts/local/supabase-shim.sql
 * provides the cron.schedule() it calls).
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const admin = process.env.LOCAL_PG_URL || "postgres://postgres@127.0.0.1:55432/postgres";
const db = process.argv[2] || "txquince_local";
const u = new URL(admin);
if (!["127.0.0.1", "localhost", "::1"].includes(u.hostname)) {
  console.error(`Refusing: ${u.hostname} is not localhost.`);
  process.exit(1);
}
if (!/^[a-z0-9_]+$/.test(db)) {
  console.error("Bad database name.");
  process.exit(1);
}

const psql = (url, args, input) =>
  execFileSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-q", ...args], {
    input,
    stdio: ["pipe", "pipe", "inherit"],
  }).toString();

psql(admin, ["-c", `drop database if exists ${db} with (force)`]);
psql(admin, ["-c", `create database ${db}`]);
const target = new URL(admin);
target.pathname = `/${db}`;

const root = new URL("../..", import.meta.url).pathname;
psql(target.href, ["-f", join(root, "scripts/local/supabase-shim.sql")]);

const dir = join(root, "supabase/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const tmp = mkdtempSync(join(tmpdir(), "txq-mig-"));
for (const f of files) {
  let sql = readFileSync(join(dir, f), "utf8");
  sql = sql.replace(/^\s*create extension if not exists pg_cron;\s*$/im, "-- (local) pg_cron skipped");
  const p = join(tmp, f);
  writeFileSync(p, sql);
  process.stdout.write(`applying ${f} … `);
  psql(target.href, ["-1", "-f", p]);
  process.stdout.write("ok\n");
}
console.log(`\n${files.length} migrations applied to ${db}.`);
