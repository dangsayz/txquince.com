-- Payments taken outside Stripe (cash, Zelle, check), recorded by the owner in
-- the Studio. They live in booking_payments with status 'paid', so the family's
-- balance, their account page and the Payments list all count them with no
-- second ledger. Stripe rows keep method = 'stripe'.
ALTER TABLE booking_payments ADD COLUMN method TEXT NOT NULL DEFAULT 'stripe'
  CHECK (method IN ('stripe', 'cash', 'zelle', 'check', 'other'));
ALTER TABLE booking_payments ADD COLUMN note TEXT;
ALTER TABLE booking_payments ADD COLUMN recorded_by TEXT;
