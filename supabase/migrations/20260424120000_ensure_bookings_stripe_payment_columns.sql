/*
  # Ensure Stripe payment columns on bookings

  Repairs databases where migration 20260422120000 is marked applied but the
  column was never created (divergent history, manual edits, or wrong project).
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_status text;

UPDATE bookings
SET payment_status = 'paid'
WHERE payment_status IS NULL;

ALTER TABLE bookings
  ALTER COLUMN payment_status SET DEFAULT 'paid';

ALTER TABLE bookings
  ALTER COLUMN payment_status SET NOT NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS receipt_url text;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status = ANY (ARRAY['paid'::text, 'refunded'::text]));

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent_id
  ON bookings (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
