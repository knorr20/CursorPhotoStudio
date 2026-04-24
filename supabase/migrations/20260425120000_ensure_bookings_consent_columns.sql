/*
  # Ensure consent / promo columns on bookings

  Aligns schema with stripe-payment inserts and Typescript types when historical
  migrations never ran against this database.
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS agreed_to_terms boolean NOT NULL DEFAULT false;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS receive_promotional_comms boolean NOT NULL DEFAULT false;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS receive_promotional_comms_at timestamptz;

UPDATE bookings
SET agreed_to_terms = true
WHERE agreed_to_terms IS NOT DISTINCT FROM false;

CREATE INDEX IF NOT EXISTS idx_bookings_agreed_to_terms ON bookings (agreed_to_terms);

CREATE INDEX IF NOT EXISTS idx_bookings_terms_agreed_at ON bookings (terms_agreed_at);

NOTIFY pgrst, 'reload schema';
