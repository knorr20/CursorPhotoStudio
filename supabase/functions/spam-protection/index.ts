import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DEFAULT_ALLOWED_ORIGINS = ["https://23photostudio.com", "http://localhost:5173"];
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? DEFAULT_ALLOWED_ORIGINS.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  Vary: "Origin",
});

interface RateLimitRecord {
  id: string;
  ip_address: string;
  endpoint: string;
  request_count: number;
  window_start: string;
}

const asSafeString = (value: unknown, maxLength: number): string =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const getClientIp = (req: Request): string => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
};

async function verifyTurnstile(captchaToken: string, ipAddress: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) return true;
  if (!captchaToken) return false;

  try {
    const body = new URLSearchParams({
      secret,
      response: captchaToken,
      remoteip: ipAddress,
    });
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!verifyRes.ok) return false;
    const verifyData = await verifyRes.json();
    return Boolean(verifyData.success);
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

function getTimeValue(timeString: string): number {
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let hour24 = hours;

  if (period === "PM" && hours !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  return hour24 * 60 + minutes;
}

/** Best-effort admin + template mail via send-email. Does not throw. */
async function invokeSendEmail(payload: {
  type: "booking" | "contact";
  data: Record<string, unknown>;
}): Promise<void> {
  const baseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!baseUrl || !serviceKey) {
    console.error("invokeSendEmail: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return;
  }
  try {
    const res = await fetch(`${baseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("invokeSendEmail failed", res.status, await res.text());
    }
  } catch (e) {
    console.error("invokeSendEmail error", e);
  }
}

function checkTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Value = getTimeValue(start1);
  const end1Value = getTimeValue(end1);
  const start2Value = getTimeValue(start2);
  const end2Value = getTimeValue(end2);

  return start1Value < end2Value && start2Value < end1Value;
}

async function checkRateLimit(
  supabase: any,
  ipAddress: string,
  endpoint: string
): Promise<{ allowed: boolean }> {
  const now = new Date();
  const maxRequests = 5;

  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from("rate_limiting")
      .select("*")
      .eq("ip_address", ipAddress)
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching rate limit record:", fetchError);
      return { allowed: false };
    }

    if (!existingRecord) {
      const { error: insertError } = await supabase
        .from("rate_limiting")
        .insert([
          {
            ip_address: ipAddress,
            endpoint: endpoint,
            request_count: 1,
            window_start: now.toISOString(),
          },
        ]);

      if (insertError) {
        console.error("Error creating rate limit record:", insertError);
        return { allowed: false };
      }

      return { allowed: true };
    }

    const recordWindowStart = new Date(existingRecord.window_start);
    const timeSinceWindowStart =
      now.getTime() - recordWindowStart.getTime();
    const windowDurationMs = 5 * 60 * 1000;

    if (timeSinceWindowStart > windowDurationMs) {
      const { error: updateError } = await supabase
        .from("rate_limiting")
        .update({
          request_count: 1,
          window_start: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existingRecord.id);

      if (updateError) {
        console.error("Error resetting rate limit record:", updateError);
        return { allowed: false };
      }

      return { allowed: true };
    }

    if (existingRecord.request_count >= maxRequests) {
      return { allowed: false };
    }

    const { error: updateError } = await supabase
      .from("rate_limiting")
      .update({
        request_count: existingRecord.request_count + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", existingRecord.id);

    if (updateError) {
      console.error("Error updating rate limit record:", updateError);
      return { allowed: false };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error in rate limiting check:", error);
    return { allowed: false };
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Origin not allowed", { status: 403, headers: corsHeaders });
    }
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
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientIP = getClientIp(req);

    const body = await req.json();
    const { type, data, honeypot, captchaToken } = body;

    if (!type || !data || (type !== "booking" && type !== "contact")) {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (honeypot && honeypot.trim() !== "") {
      console.log(`Honeypot triggered for IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: "Spam detected" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const captchaOk = await verifyTurnstile(asSafeString(captchaToken, 2048), clientIP);
    if (!captchaOk) {
      return new Response(JSON.stringify({ error: "CAPTCHA verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rateLimitResult = await checkRateLimit(supabase, clientIP, type);
    if (!rateLimitResult.allowed) {
      console.log(
        `Rate limit exceeded for IP: ${clientIP}, endpoint: ${type}`
      );
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;
    if (type === "booking") {
      if (!data.date || !data.startTime || !data.endTime) {
        return new Response(
          JSON.stringify({ error: "Invalid booking precheck payload" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: existingBookings, error } = await supabase
        .from("bookings")
        .select("id, date, start_time, end_time")
        .eq("date", data.date)
        .eq("status", "confirmed");

      if (error) throw error;

      const conflict = (existingBookings ?? []).find((booking: any) =>
        checkTimeOverlap(data.startTime, data.endTime, booking.start_time, booking.end_time)
      );

      if (conflict) {
        return new Response(
          JSON.stringify({
            error: "This time slot is already booked.",
            conflictDetails: {
              bookingId: conflict.id,
              date: conflict.date,
              startTime: conflict.start_time,
              endTime: conflict.end_time,
            },
          }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      result = { success: true, message: "Precheck passed" };
    } else if (type === "contact") {
      const name = asSafeString(data.name, 120);
      const email = asSafeString(data.email, 254).toLowerCase();
      const phone = asSafeString(data.phone, 40);
      const message = asSafeString(data.message, 3000);
      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: "Missing required contact fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ error: "Invalid email format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("contact_messages").insert([
        {
          name,
          email,
          phone: phone || null,
          message,
          status: "new",
        },
      ]);

      if (error) throw error;

      await invokeSendEmail({
        type: "contact",
        data: {
          name,
          email,
          phone: phone || "",
          message,
        },
      });

      result = { success: true, message: "Message sent successfully" };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in spam-protection function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
