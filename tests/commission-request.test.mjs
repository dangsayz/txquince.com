// Run: node --conditions=react-server --import ./tests/helpers/register-ts-resolve.mjs --test tests/commission-request.test.mjs
// The homepage booking panel sends an unsigned REQUEST; the agreement is signed later.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_PRICE_BOOK, commissionSchema, describeCommission, quoteCommission } from "../src/lib/commission.ts";

const future = () => {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
};

// Fictional family.
const request = () => ({
  event_date: future(),
  city: "dfw",
  venue: "Salón Ejemplo",
  start_time: "4:00 PM",
  scope: "both",
  tier: "production",
  add_ons: ["sameday"],
  crew_mix: { photo: 2, motion: 2 },
  hours: 7,
  name: "Ana Prueba",
  honoree: "Lucía",
  email: "ana@example.com",
  phone: "214-555-0100",
  language: "es",
  note: "",
  share_permission: true,
  quoted_total_usd: 3100,
  quoted_deposit_usd: 775,
});

test("a request without signature fields is accepted", () => {
  const r = commissionSchema.safeParse(request());
  assert.ok(r.success, JSON.stringify(r.error?.issues));
  assert.equal(r.data.signed_name, undefined);
  assert.equal(r.data.signature, undefined);
  assert.equal(r.data.agree, undefined);
  const q = quoteCommission(DEFAULT_PRICE_BOOK, r.data.tier, r.data.add_ons, r.data.hours);
  assert.equal(q.totalUsd, 2800 + 300); // Full Celebration, 7 hrs included + Same-Day Edit
  assert.match(describeCommission(r.data, q, DEFAULT_PRICE_BOOK), /not signed yet/);
});

test("a signed body still validates the signature when it is sent", () => {
  assert.equal(commissionSchema.safeParse({ ...request(), signature: "not-a-png", signed_name: "Ana Prueba", agree: true }).success, false);
  assert.equal(commissionSchema.safeParse({ ...request(), agree: false }).success, false);
  const ok = commissionSchema.safeParse({
    ...request(),
    signed_name: "Ana Prueba",
    signature: "data:image/png;base64,iVBORw0KGgo=",
    agree: true,
  });
  assert.ok(ok.success);
  assert.match(describeCommission(ok.data, quoteCommission(DEFAULT_PRICE_BOOK, "production", ["sameday"], 7), DEFAULT_PRICE_BOOK), /Signed by: Ana Prueba/);
});

test("the request still needs a future date and contact details", () => {
  assert.equal(commissionSchema.safeParse({ ...request(), event_date: "2020-01-01" }).success, false);
  assert.equal(commissionSchema.safeParse({ ...request(), email: "nope" }).success, false);
  assert.equal(commissionSchema.safeParse({ ...request(), phone: "1" }).success, false);
});
