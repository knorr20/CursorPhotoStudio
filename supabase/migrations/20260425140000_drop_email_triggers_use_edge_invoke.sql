/*
  Email notifications are triggered from Edge Functions (spam-protection, stripe-payment)
  via HTTP to send-email, using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY available there.

  Removes DB triggers that called send-email via pg_net + vault secrets (often misconfigured).
*/

DROP TRIGGER IF EXISTS on_new_booking_send_email ON bookings;
DROP TRIGGER IF EXISTS on_new_contact_send_email ON contact_messages;

DROP FUNCTION IF EXISTS handle_new_booking_email();
DROP FUNCTION IF EXISTS handle_new_contact_email();
