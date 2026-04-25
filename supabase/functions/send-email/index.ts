import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "LA23PRODUCTION@GMAIL.COM";
const STUDIO_NAME = "23 Production LLC";
/** Verified domain in Resend; override with secret RESEND_FROM if needed. */
const DEFAULT_RESEND_FROM = `${STUDIO_NAME} <contact@23photostudio.com>`;

function getOutboundMailConfig(): { from: string; replyTo: string } {
  const from = Deno.env.get("RESEND_FROM")?.trim() || DEFAULT_RESEND_FROM;
  const replyTo = Deno.env.get("RESEND_REPLY_TO")?.trim() || ADMIN_EMAIL;
  return { from, replyTo };
}
const STUDIO_ADDRESS = "10710 Burbank Blvd, North Hollywood, CA 91601";
const STUDIO_PHONE = "(818) 974-45-76";
const STUDIO_INSTAGRAM = "https://www.instagram.com/23rental/";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=10710+Burbank+Blvd+North+Hollywood+CA+91601";

const COLORS = {
  green: "#023020",
  greenDark: "#011a12",
  yellow: "#e9b20a",
  beige: "#f5ecd0",
  white: "#ffffff",
  grayLight: "#f4f4f5",
  grayText: "#71717a",
};

interface BookingData {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  duration: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  project_type: string;
  total_price: number;
  status: string;
  notes?: string;
}

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildBookingClientEmail(booking: BookingData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${COLORS.grayLight};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.grayLight};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:${COLORS.white};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background-color:${COLORS.green};padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:${COLORS.yellow};font-size:28px;font-weight:700;letter-spacing:1px;">${STUDIO_NAME}</h1>
          <p style="margin:8px 0 0;color:${COLORS.beige};font-size:14px;letter-spacing:0.5px;">Professional Photo & Video Studio</p>
        </td></tr>

        <!-- Status Badge -->
        <tr><td style="padding:32px 40px 0;text-align:center;">
          <span style="display:inline-block;background-color:${COLORS.beige};color:${COLORS.green};font-size:13px;font-weight:600;padding:6px 20px;border-radius:20px;letter-spacing:0.5px;">BOOKING RECEIVED</span>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:24px 40px 0;">
          <h2 style="margin:0;color:${COLORS.green};font-size:22px;font-weight:600;">Thank you, ${booking.client_name}!</h2>
          <p style="margin:12px 0 0;color:#3f3f46;font-size:15px;line-height:1.6;">
            Your booking request has been received and is being reviewed. We will confirm your reservation shortly.
          </p>
        </td></tr>

        <!-- Booking Details -->
        <tr><td style="padding:24px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.grayLight};border-radius:8px;border-left:4px solid ${COLORS.yellow};">
            <tr><td style="padding:20px 24px;">
              <h3 style="margin:0 0 16px;color:${COLORS.green};font-size:16px;font-weight:600;">Booking Details</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:${COLORS.grayText};font-size:14px;width:120px;">Date</td>
                  <td style="padding:6px 0;color:#18181b;font-size:14px;font-weight:500;">${formatDate(booking.date)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:${COLORS.grayText};font-size:14px;">Time</td>
                  <td style="padding:6px 0;color:#18181b;font-size:14px;font-weight:500;">${booking.start_time} - ${booking.end_time}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:${COLORS.grayText};font-size:14px;">Duration</td>
                  <td style="padding:6px 0;color:#18181b;font-size:14px;font-weight:500;">${booking.duration}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:${COLORS.grayText};font-size:14px;">Project</td>
                  <td style="padding:6px 0;color:#18181b;font-size:14px;font-weight:500;">${booking.project_type}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:${COLORS.grayText};font-size:14px;">Total</td>
                  <td style="padding:6px 0;color:${COLORS.green};font-size:18px;font-weight:700;">$${booking.total_price}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Studio Location -->
        <tr><td style="padding:0 40px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.green};border-radius:8px;">
            <tr><td style="padding:20px 24px;">
              <h3 style="margin:0 0 8px;color:${COLORS.yellow};font-size:14px;font-weight:600;letter-spacing:0.5px;">STUDIO LOCATION</h3>
              <p style="margin:0 0 4px;color:${COLORS.white};font-size:14px;">${STUDIO_ADDRESS}</p>
              <a href="${GOOGLE_MAPS_URL}" target="_blank" style="color:${COLORS.yellow};font-size:13px;text-decoration:underline;">Get Directions</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Contact Info -->
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <p style="margin:0;color:${COLORS.grayText};font-size:13px;line-height:1.6;">
            Questions? Reach us at <a href="tel:+18189744576" style="color:${COLORS.green};text-decoration:none;font-weight:500;">${STUDIO_PHONE}</a>
            or <a href="mailto:${ADMIN_EMAIL}" style="color:${COLORS.green};text-decoration:none;font-weight:500;">${ADMIN_EMAIL}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:${COLORS.grayLight};padding:24px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <a href="${STUDIO_INSTAGRAM}" target="_blank" style="color:${COLORS.green};font-size:13px;text-decoration:none;font-weight:500;">@23rental on Instagram</a>
          <p style="margin:12px 0 0;color:#a1a1aa;font-size:11px;">&copy; ${new Date().getFullYear()} ${STUDIO_NAME}. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildBookingAdminEmail(booking: BookingData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${COLORS.grayLight};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.grayLight};padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:${COLORS.white};border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">

        <tr><td style="background-color:${COLORS.green};padding:20px 32px;">
          <h2 style="margin:0;color:${COLORS.yellow};font-size:18px;font-weight:600;">New Booking</h2>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;width:110px;">Client</td><td style="padding:4px 0;font-size:14px;font-weight:500;">${booking.client_name}</td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Email</td><td style="padding:4px 0;font-size:14px;"><a href="mailto:${booking.client_email}" style="color:${COLORS.green};">${booking.client_email}</a></td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Phone</td><td style="padding:4px 0;font-size:14px;"><a href="tel:${booking.client_phone}" style="color:${COLORS.green};">${booking.client_phone}</a></td></tr>
            <tr><td colspan="2" style="padding:12px 0 4px;border-top:1px solid #e4e4e7;"></td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Date</td><td style="padding:4px 0;font-size:14px;font-weight:500;">${formatDate(booking.date)}</td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Time</td><td style="padding:4px 0;font-size:14px;">${booking.start_time} - ${booking.end_time}</td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Duration</td><td style="padding:4px 0;font-size:14px;">${booking.duration}</td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Project</td><td style="padding:4px 0;font-size:14px;">${booking.project_type}</td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Total</td><td style="padding:4px 0;font-size:16px;font-weight:700;color:${COLORS.green};">$${booking.total_price}</td></tr>
            ${booking.notes ? `<tr><td colspan="2" style="padding:12px 0 4px;border-top:1px solid #e4e4e7;"></td></tr><tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;vertical-align:top;">Notes</td><td style="padding:4px 0;font-size:14px;color:#3f3f46;">${booking.notes}</td></tr>` : ""}
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildContactAdminEmail(contact: ContactData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${COLORS.grayLight};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.grayLight};padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:${COLORS.white};border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">

        <tr><td style="background-color:${COLORS.green};padding:20px 32px;">
          <h2 style="margin:0;color:${COLORS.yellow};font-size:18px;font-weight:600;">New Contact Message</h2>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;width:80px;">From</td><td style="padding:4px 0;font-size:14px;font-weight:500;">${contact.name}</td></tr>
            <tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Email</td><td style="padding:4px 0;font-size:14px;"><a href="mailto:${contact.email}" style="color:${COLORS.green};">${contact.email}</a></td></tr>
            ${contact.phone ? `<tr><td style="padding:4px 0;color:${COLORS.grayText};font-size:13px;">Phone</td><td style="padding:4px 0;font-size:14px;"><a href="tel:${contact.phone}" style="color:${COLORS.green};">${contact.phone}</a></td></tr>` : ""}
            <tr><td colspan="2" style="padding:12px 0 4px;border-top:1px solid #e4e4e7;"></td></tr>
            <tr><td colspan="2" style="padding:8px 0;">
              <p style="margin:0;color:#3f3f46;font-size:14px;line-height:1.6;white-space:pre-wrap;">${contact.message}</p>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(
  resendApiKey: string,
  from: string,
  replyTo: string,
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        reply_to: replyTo,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", res.status, errorData);
      return { success: false, error: `Resend API returned ${res.status}: ${errorData}` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Email send error:", message);
    return { success: false, error: message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: "Missing type or data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { from, replyTo } = getOutboundMailConfig();
    const results: { recipient: string; success: boolean; error?: string }[] = [];

    if (type === "booking") {
      const booking = data as BookingData;

      const clientResult = await sendEmail(
        resendApiKey,
        from,
        replyTo,
        booking.client_email,
        `Booking Confirmation - ${formatDate(booking.date)}`,
        buildBookingClientEmail(booking)
      );
      results.push({ recipient: "client", ...clientResult });

      const adminResult = await sendEmail(
        resendApiKey,
        from,
        replyTo,
        ADMIN_EMAIL,
        `New Booking: ${booking.client_name} - ${formatDate(booking.date)}`,
        buildBookingAdminEmail(booking)
      );
      results.push({ recipient: "admin", ...adminResult });
    } else if (type === "contact") {
      const contact = data as ContactData;

      const adminResult = await sendEmail(
        resendApiKey,
        from,
        replyTo,
        ADMIN_EMAIL,
        `New Message from ${contact.name}`,
        buildContactAdminEmail(contact)
      );
      results.push({ recipient: "admin", ...adminResult });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use 'booking' or 'contact'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
