/*
  # Refactor booking statuses and payment tracking

  1. Remove legacy `pending` status usage.
  2. Store payment linkage fields required by Stripe finalization flow.
*/

-- Backfill legacy pending bookings into confirmed to keep existing occupied slots.
UPDATE bookings
SET status = 'confirmed'
WHERE status = 'pending';

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text]));

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'paid',
ADD COLUMN IF NOT EXISTS receipt_url text;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check
CHECK (payment_status = ANY (ARRAY['paid'::text, 'refunded'::text]));

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent_id
ON bookings (stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;
