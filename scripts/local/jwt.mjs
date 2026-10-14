/** LOCAL ONLY — mint HS256 JWTs for the local PostgREST / fake GoTrue. */
import { createHmac } from "node:crypto";

const b64 = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");

export function signJwt(payload, secret) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

export function verifyJwt(token, secret) {
  const [h, p, s] = String(token).split(".");
  if (!h || !p || !s) return null;
  const want = createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  if (want !== s) return null;
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  if (payload.exp && payload.exp < Date.now() / 1000) return null;
  return payload;
}

export const roleKey = (role, secret, years = 10) =>
  signJwt({ role, iss: "txq-local", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + years * 365 * 86400 }, secret);
