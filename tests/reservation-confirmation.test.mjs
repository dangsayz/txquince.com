import assert from "node:assert/strict";
import { test } from "node:test";
import { reservationConfirmation } from "../src/lib/reservation-confirmation.ts";

test("only a paid checkout says the date is reserved", () => {
  const paid = reservationConfirmation({ paid: true, checkoutFound: true, eventDate: "May 15, 2027", depositLabel: "$300" });
  const processing = reservationConfirmation({ paid: false, checkoutFound: true, eventDate: "May 15, 2027", depositLabel: "$300" });
  const unknown = reservationConfirmation({ paid: false, checkoutFound: false, eventDate: null, depositLabel: null });

  assert.match(paid.title, /reserved.*May 15, 2027/);
  assert.match(paid.message, /\$300 deposit is in/);
  assert.doesNotMatch(processing.title, /reserved/);
  assert.match(processing.message, /when it clears/);
  assert.doesNotMatch(unknown.title, /reserved|confirming your deposit/);
  assert.match(unknown.message, /If you completed a payment/);
});
