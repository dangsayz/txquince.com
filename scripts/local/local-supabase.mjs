#!/usr/bin/env node
/**
 * LOCAL ONLY — a Supabase-shaped front door for the demo.
 *
 *   /rest/v1/*  → the real PostgREST (POSTGREST_URL), path prefix stripped.
 *   /auth/v1/*  → a tiny fake GoTrue: password sign-in for ONE fictional admin
 *                 (LOCAL_ADMIN_EMAIL / LOCAL_ADMIN_PASSWORD), /user, /logout.
 *
 * The app talks to it exactly like self-hosted Supabase: the service role key
 * (a JWT signed with JWT_SECRET) reaches PostgREST unchanged; admin login sets
 * a real Supabase session cookie. Listens on 127.0.0.1 only.
 */
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { signJwt, verifyJwt } from "./jwt.mjs";

const PORT = Number(process.env.LOCAL_SUPABASE_PORT || 54321);
const PGRST = process.env.POSTGREST_URL || "http://127.0.0.1:54322";
const SECRET =
  process.env.JWT_SECRET ||
  (await import("node:fs")).readFileSync(new URL("../../.local/jwt-secret", import.meta.url), "utf8").trim();
const ADMIN = (process.env.LOCAL_ADMIN_EMAIL || "owner@example.com").toLowerCase();
const PASSWORD = process.env.LOCAL_ADMIN_PASSWORD || "local-demo-only";
if (!SECRET || SECRET.length < 32) throw new Error("JWT_SECRET (≥32 chars) required");
const USER_ID = "00000000-0000-4000-8000-0000000000a1";

const user = () => ({
  id: USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: ADMIN,
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
});
function session() {
  const now = Math.floor(Date.now() / 1000);
  const access_token = signJwt({ sub: USER_ID, email: ADMIN, role: "authenticated", aud: "authenticated", iat: now, exp: now + 3600, session_id: randomUUID() }, SECRET);
  return { access_token, token_type: "bearer", expires_in: 3600, expires_at: now + 3600, refresh_token: randomUUID(), user: user() };
}

const readBody = (req) =>
  new Promise((res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => res(Buffer.concat(chunks)));
  });
const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*" });
  res.end(JSON.stringify(body));
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://local");
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" });
    return res.end();
  }
  if (url.pathname.startsWith("/rest/v1")) {
    const target = `${PGRST}${url.pathname.slice("/rest/v1".length) || "/"}${url.search}`;
    const headers = { ...req.headers };
    delete headers.host;
    delete headers["content-length"];
    delete headers.connection;
    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await readBody(req);
    const r = await fetch(target, { method: req.method, headers, body });
    const out = Buffer.from(await r.arrayBuffer());
    const h = Object.fromEntries([...r.headers.entries()].filter(([k]) => !["content-encoding", "transfer-encoding", "connection"].includes(k)));
    res.writeHead(r.status, h);
    return res.end(out);
  }
  if (url.pathname === "/auth/v1/token") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    if (url.searchParams.get("grant_type") === "password") {
      if (String(body.email).toLowerCase() === ADMIN && body.password === PASSWORD) return json(res, 200, session());
      return json(res, 400, { error: "invalid_grant", error_description: "Invalid login credentials", msg: "Invalid login credentials" });
    }
    if (url.searchParams.get("grant_type") === "refresh_token") return json(res, 200, session());
    return json(res, 400, { error: "unsupported_grant_type" });
  }
  if (url.pathname === "/auth/v1/user") {
    const tok = (req.headers.authorization || "").replace(/^Bearer /, "");
    const claims = verifyJwt(tok, SECRET);
    if (!claims || claims.role !== "authenticated") return json(res, 401, { msg: "invalid JWT", code: 401 });
    return json(res, 200, user());
  }
  if (url.pathname === "/auth/v1/logout") {
    res.writeHead(204);
    return res.end();
  }
  if (url.pathname === "/auth/v1/settings" || url.pathname === "/auth/v1/health") return json(res, 200, { ok: true });
  json(res, 404, { error: "not found (local-supabase)" });
}).listen(PORT, "127.0.0.1", () => console.log(`[local-supabase] http://127.0.0.1:${PORT} → ${PGRST}`));
