#!/usr/bin/env node
/**
 * LOCAL ONLY — write .env.local + .local/postgrest.conf for the demo stack.
 * Every secret here is freshly random and useless anywhere else. Emails go to
 * the mail sink (MAIL_SINK=1, no Resend key). Stripe is the local fake with a
 * placeholder sk_test_ key. Nothing points at production.
 */
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { roleKey } from "./jwt.mjs";

const root = new URL("../..", import.meta.url).pathname;
mkdirSync(`${root}.local`, { recursive: true });
const secretFile = `${root}.local/jwt-secret`;
const JWT_SECRET = existsSync(secretFile) ? readFileSync(secretFile, "utf8").trim() : randomBytes(32).toString("hex");
writeFileSync(secretFile, JWT_SECRET);

const db = process.env.LOCAL_DB || "txquince_local";
const pg = process.env.LOCAL_PG_PORT || "55432";
writeFileSync(
  `${root}.local/postgrest.conf`,
  [
    `db-uri = "postgres://authenticator:authenticator-local-only@127.0.0.1:${pg}/${db}"`,
    `db-schemas = "public"`,
    `db-anon-role = "anon"`,
    `jwt-secret = "${JWT_SECRET}"`,
    `server-host = "127.0.0.1"`,
    `server-port = 54322`,
  ].join("\n") + "\n",
);

const env = {
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3210",
  SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SERVICE_ROLE_KEY: roleKey("service_role", JWT_SECRET),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: roleKey("anon", JWT_SECRET),
  ADMIN_EMAILS: "owner@example.com",
  OPERATOR_NOTIFY_EMAIL: "owner@example.com",
  MAIL_SINK: "1",
  STRIPE_SECRET_KEY: "sk_test_local_fake_not_a_real_key",
  STRIPE_API_BASE: "http://127.0.0.1:54323/v1",
  STRIPE_WEBHOOK_SECRET: `whsec_local_${randomBytes(16).toString("hex")}`,
  CRON_SECRET: randomBytes(24).toString("hex"),
  PRICING_LOCAL_DIR: `${root}.pricing-local`,
  CONTRACTS_LOCAL_DIR: `${root}.contracts-local`,
};
writeFileSync(`${root}.env.local`, Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
console.log("wrote .env.local and .local/postgrest.conf (local-only secrets)");
