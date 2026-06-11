/**
 * turnstile.ts — Cloudflare Turnstile server verification (PRIMARY abuse gate).
 *
 * The widget on /check-your-date produces a token; the server exchanges it with
 * Cloudflare's siteverify endpoint BEFORE any DB write. A failed or missing
 * token is rejected (ANTI-ABUSE LAW).
 *
 * Dev/preview without keys: if TURNSTILE_SECRET_KEY is unset we SKIP verification
 * (returns ok) so the form is testable locally — but we log a warning. Set the
 * key in production so the gate is live.
 */
import "server-only";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // No secret configured: dev/preview bypasses, but PRODUCTION FAILS CLOSED —
  // a misconfigured prod must never silently remove the primary abuse gate.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY missing in production — rejecting.");
      return { ok: false, reason: "not-configured" };
    }
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only).",
    );
    return { ok: true, reason: "skipped-no-secret" };
  }

  if (!token) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (data.success) return { ok: true };
    return { ok: false, reason: (data["error-codes"] ?? []).join(",") || "failed" };
  } catch (err) {
    console.error("[turnstile] verify error", err);
    return { ok: false, reason: "verify-exception" };
  }
}
