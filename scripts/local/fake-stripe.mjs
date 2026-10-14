#!/usr/bin/env node
/**
 * LOCAL ONLY — a pretend Stripe for the demo (there are no Stripe keys here).
 * The app reaches it because STRIPE_API_BASE points here AND the key is a
 * sk_test_ key AND NODE_ENV isn't production (see src/lib/stripe.ts).
 *
 *   POST /v1/checkout/sessions            → a session + a hosted "checkout" page URL
 *   GET  /v1/checkout/sessions/:id
 *   POST /v1/checkout/sessions/:id/expire
 *   POST /v1/refunds                      (Idempotency-Key honored)
 *   GET  /pay/:id                         a fake checkout page with a "Pay (test)" button
 *   POST /pay/:id                         marks it paid, sends a SIGNED
 *                                         checkout.session.completed webhook to
 *                                         WEBHOOK_URL, redirects to success_url
 * No card data, no network beyond 127.0.0.1.
 */
import { createServer } from "node:http";
import { createHmac, randomBytes } from "node:crypto";

const PORT = Number(process.env.FAKE_STRIPE_PORT || 54323);
const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://127.0.0.1:3210/api/stripe/webhook";
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET;
if (!WHSEC) throw new Error("STRIPE_WEBHOOK_SECRET required");

const sessions = new Map();
const refunds = new Map();
const byKey = new Map();
const id = (p) => `${p}_test_${randomBytes(12).toString("hex")}`;

function parseForm(buf) {
  const out = {};
  for (const [k, v] of new URLSearchParams(buf.toString())) {
    const path = k.replace(/\]/g, "").split("[");
    let o = out;
    path.forEach((seg, i) => {
      if (i === path.length - 1) o[seg] = v;
      else o = o[seg] ??= {};
    });
  }
  return out;
}
const body = (req) => new Promise((r) => { const c = []; req.on("data", (x) => c.push(x)); req.on("end", () => r(Buffer.concat(c))); });
const send = (res, status, obj, type = "application/json") => {
  res.writeHead(status, { "content-type": type });
  res.end(type === "application/json" ? JSON.stringify(obj) : obj);
};

async function deliver(event) {
  const raw = JSON.stringify(event);
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", WHSEC).update(`${t}.${raw}`).digest("hex");
  const r = await fetch(WEBHOOK_URL, { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}`, "content-type": "application/json" }, body: raw });
  console.log(`[fake-stripe] webhook ${event.type} → ${r.status} ${await r.text()}`);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const m = url.pathname.match(/^\/v1\/checkout\/sessions(?:\/([^/]+))?(\/expire)?$/);
  try {
    if (m && req.method === "POST" && !m[1]) {
      const key = req.headers["idempotency-key"];
      if (key && byKey.has(key)) return send(res, 200, byKey.get(key));
      const f = parseForm(await body(req));
      const sid = id("cs");
      const s = {
        id: sid,
        object: "checkout.session",
        url: `http://127.0.0.1:${PORT}/pay/${sid}`,
        status: "open",
        payment_status: "unpaid",
        payment_intent: null,
        client_reference_id: f.client_reference_id,
        amount_total: Number(f.line_items[0].price_data.unit_amount),
        currency: f.line_items[0].price_data.currency,
        metadata: f.metadata ?? {},
        success_url: f.success_url,
        cancel_url: f.cancel_url,
        expires_at: Number(f.expires_at),
        customer_details: { email: f.customer_email },
        _name: f.line_items[0].price_data.product_data.name,
      };
      sessions.set(sid, s);
      if (key) byKey.set(key, s);
      return send(res, 200, s);
    }
    if (m && m[1] && m[2] && req.method === "POST") {
      const s = sessions.get(m[1]);
      if (!s) return send(res, 404, { error: { message: "No such session" } });
      if (s.status !== "open") return send(res, 400, { error: { message: `Session is ${s.status}`, code: "checkout_session_not_open" } });
      s.status = "expired";
      return send(res, 200, s);
    }
    if (m && m[1] && req.method === "GET") {
      const s = sessions.get(m[1]);
      return s ? send(res, 200, s) : send(res, 404, { error: { message: "No such session" } });
    }
    if (url.pathname === "/v1/refunds" && req.method === "POST") {
      const key = req.headers["idempotency-key"];
      if (!key) return send(res, 400, { error: { message: "This test server requires an Idempotency-Key for refunds" } });
      if (byKey.has(key)) return send(res, 200, byKey.get(key));
      const f = parseForm(await body(req));
      const r = { id: id("re"), object: "refund", amount: Number(f.amount), currency: "usd", status: "succeeded", payment_intent: f.payment_intent, metadata: f.metadata ?? {} };
      refunds.set(r.id, r);
      byKey.set(key, r);
      setTimeout(() => deliver({ id: id("evt"), type: "refund.created", data: { object: r } }), 300);
      return send(res, 200, r);
    }
    const pay = url.pathname.match(/^\/pay\/([^/]+)$/);
    if (pay) {
      const s = sessions.get(pay[1]);
      if (!s) return send(res, 404, "No such session", "text/plain");
      if (req.method === "GET") {
        const usd = (s.amount_total / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
        return send(
          res,
          200,
          `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Test checkout</title>
<body style="font:16px/1.5 system-ui;margin:0;padding:24px;color:#111110;background:#faf8f5">
<p style="font:12px ui-monospace;letter-spacing:.1em">TEST MODE · LOCAL FAKE STRIPE · NO REAL MONEY</p>
<h1 style="font-weight:500">${s._name}</h1><p style="font-size:28px;margin:0 0 24px">${usd}</p>
${s.status === "open" ? `<form method=post><button style="min-height:48px;padding:0 24px;font-size:16px;background:#111110;color:#fff;border:0">Pay ${usd} (test)</button></form>` : `<p>This checkout is ${s.status}.</p>`}
<p><a href="${s.cancel_url}" style="color:#111110">← Back</a></p></body>`,
          "text/html; charset=utf-8",
        );
      }
      if (req.method === "POST" && s.status === "open") {
        s.status = "complete";
        s.payment_status = "paid";
        s.payment_intent = id("pi");
        await deliver({ id: id("evt"), type: "checkout.session.completed", data: { object: s } });
        res.writeHead(303, { location: s.success_url });
        return res.end();
      }
      res.writeHead(303, { location: s.cancel_url });
      return res.end();
    }
    send(res, 404, { error: { message: "not found (fake-stripe)" } });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: { message: String(err) } });
  }
}).listen(PORT, "127.0.0.1", () => console.log(`[fake-stripe] http://127.0.0.1:${PORT}`));
