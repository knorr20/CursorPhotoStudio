import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type BookingPayload = {
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectType: string;
  totalPrice: number;
  notes: string;
  receivePromotionalComms: boolean;
  agreedToTerms: boolean;
  termsAgreedAt: string | null;
  receivePromotionalCommsAt: string | null;
};

const getTimeValue = (timeString: string): number => {
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let hour24 = hours;

  if (period === "PM" && hours !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  return hour24 * 60 + minutes;
};

const isWeekend = (dateString: string): boolean => {
  const date = new Date(`${dateString}T00:00:00`);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/** Best-effort: notifies admin + client via send-email (Resend). Does not throw. */
async function invokeSendEmail(payload: {
  type: "booking" | "contact";
  data: Record<string, unknown>;
  /** Dedupes Resend sends when webhook + client both finalize the same PI */
  booking_idempotency_key?: string;
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

const calculatePrice = (date: string, startTime: string, endTime: string): number => {
  const startValue = getTimeValue(startTime);
  const endValue = getTimeValue(endTime);
  if (endValue <= startValue) {
    throw new Error("Invalid booking time range");
  }

  const durationMinutes = endValue - startValue;
  if (durationMinutes < 120) {
    throw new Error("Minimum booking is 2 hours");
  }

  const totalHours = durationMinutes / 60;
  const weekend = isWeekend(date);
  const hourlyRate = totalHours >= 5 ? (weekend ? 50 : 40) : (weekend ? 60 : 50);
  return Math.round(totalHours * hourlyRate);
};

const overlaps = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const aStart = getTimeValue(startA);
  const aEnd = getTimeValue(endA);
  const bStart = getTimeValue(startB);
  const bEnd = getTimeValue(endB);
  return aStart < bEnd && bStart < aEnd;
};

const parseBookingDataFromMetadata = (metadata: Record<string, string>): BookingPayload => {
  return {
    date: metadata.date,
    startTime: metadata.startTime,
    endTime: metadata.endTime,
    duration: metadata.duration,
    clientName: metadata.clientName,
    clientEmail: metadata.clientEmail,
    clientPhone: metadata.clientPhone,
    projectType: metadata.projectType,
    totalPrice: Number(metadata.totalPrice),
    notes: metadata.notes ?? "",
    receivePromotionalComms: metadata.receivePromotionalComms === "true",
    agreedToTerms: metadata.agreedToTerms === "true",
    termsAgreedAt: metadata.termsAgreedAt || null,
    receivePromotionalCommsAt: metadata.receivePromotionalCommsAt || null,
  };
};

const buildSupabaseAdminClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase not configured for Edge Function: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. In Dashboard → Edge Functions → Secrets, add SUPABASE_SERVICE_ROLE_KEY (service_role from Settings → API) if your project does not inject it automatically."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const finalizeBookingFromPaymentIntent = async (
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  paymentIntent: Stripe.PaymentIntent
) => {
  const paymentIntentId = paymentIntent.id;
  if (!paymentIntentId) {
    throw new Error("Payment intent has no id");
  }

  const { error: pingError } = await supabase.from("bookings").select("id").limit(1);
  if (pingError) {
    console.error("finalize: bookings table ping", pingError);
    throw new Error(
      `Cannot access bookings table: ${pingError.message}${pingError.code ? ` (${pingError.code})` : ""}. Check SUPABASE_SERVICE_ROLE_KEY and that the bookings table exists.`
    );
  }

  // Use limit(1) instead of maybeSingle(): avoids PostgREST PGRST116 when duplicate rows exist.
  const { data: existingRows, error: existingError } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .limit(1);

  if (existingError) {
    console.error("finalize: existing booking lookup", existingError);
    throw new Error(
      `Failed to check existing booking: ${existingError.message}${existingError.code ? ` (${existingError.code})` : ""}. If this mentions a missing column, run pending Supabase migrations (stripe_payment_intent_id on bookings).`
    );
  }

  const existingBooking = existingRows?.[0];
  if (existingBooking) {
    // Webhook often inserts before the browser calls finalize_booking — still send emails once.
    const { data: fullRow, error: fullErr } = await supabase
      .from("bookings")
      .select(
        "id, date, start_time, end_time, duration, client_name, client_email, client_phone, project_type, total_price, status, notes"
      )
      .eq("id", existingBooking.id)
      .single();

    if (!fullErr && fullRow) {
      await invokeSendEmail({
        type: "booking",
        booking_idempotency_key: paymentIntentId,
        data: {
          id: fullRow.id,
          date: fullRow.date,
          start_time: fullRow.start_time,
          end_time: fullRow.end_time,
          duration: fullRow.duration,
          client_name: fullRow.client_name,
          client_email: fullRow.client_email,
          client_phone: fullRow.client_phone,
          project_type: fullRow.project_type,
          total_price: fullRow.total_price,
          status: fullRow.status,
          notes: fullRow.notes ?? "",
        },
      });
    } else {
      console.error("already_finalized: could not load booking row for email", fullErr);
    }

    return { status: "already_finalized" as const, bookingId: existingBooking.id };
  }

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment not completed");
  }

  const bookingData = parseBookingDataFromMetadata(paymentIntent.metadata ?? {});
  const serverCalculatedPrice = calculatePrice(bookingData.date, bookingData.startTime, bookingData.endTime);
  if (serverCalculatedPrice !== bookingData.totalPrice) {
    throw new Error("Booking amount mismatch");
  }

  const expectedCents = Math.round(serverCalculatedPrice * 100);
  // Use PI.amount (charged total in cents); amount_received can be unset/zero in edge cases before settlement.
  if (paymentIntent.amount !== expectedCents) {
    throw new Error(
      `Payment amount mismatch: expected ${expectedCents}¢ charged, Stripe paymentIntent.amount=${paymentIntent.amount}`
    );
  }

  const { data: sameDayBookings, error: conflictsError } = await supabase
    .from("bookings")
    .select("id, start_time, end_time")
    .eq("date", bookingData.date)
    .eq("status", "confirmed");

  if (conflictsError) {
    console.error("finalize: conflicts query", conflictsError);
    throw new Error(
      `Failed to check booking conflicts: ${conflictsError.message}${conflictsError.code ? ` (${conflictsError.code})` : ""}`
    );
  }

  const conflict = (sameDayBookings ?? []).find((item) =>
    overlaps(bookingData.startTime, bookingData.endTime, item.start_time, item.end_time)
  );

  if (conflict) {
    return { status: "conflict_paid" as const, conflictingBookingId: conflict.id };
  }

  let receiptUrl: string | null = null;
  if (paymentIntent.latest_charge) {
    try {
      const charge = await stripe.charges.retrieve(String(paymentIntent.latest_charge));
      receiptUrl = charge.receipt_url ?? null;
    } catch {
      receiptUrl = null;
    }
  }

  const { data: insertedBooking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      date: bookingData.date,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      duration: bookingData.duration,
      client_name: bookingData.clientName,
      client_email: bookingData.clientEmail,
      client_phone: bookingData.clientPhone,
      project_type: bookingData.projectType,
      total_price: bookingData.totalPrice,
      status: "confirmed",
      notes: bookingData.notes || "",
      receive_promotional_comms: bookingData.receivePromotionalComms,
      agreed_to_terms: bookingData.agreedToTerms,
      terms_agreed_at: bookingData.termsAgreedAt,
      receive_promotional_comms_at: bookingData.receivePromotionalCommsAt,
      stripe_payment_intent_id: paymentIntentId,
      payment_status: "paid",
      receipt_url: receiptUrl,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("booking insert:", insertError);
    throw new Error(
      `Failed to create confirmed booking: ${insertError.message}${insertError.details ? ` — ${insertError.details}` : ""}`
    );
  }

  await invokeSendEmail({
    type: "booking",
    booking_idempotency_key: paymentIntentId,
    data: {
      id: insertedBooking.id,
      date: bookingData.date,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      duration: bookingData.duration,
      client_name: bookingData.clientName,
      client_email: bookingData.clientEmail,
      client_phone: bookingData.clientPhone,
      project_type: bookingData.projectType,
      total_price: bookingData.totalPrice,
      status: "confirmed",
      notes: bookingData.notes || "",
    },
  });

  return { status: "finalized" as const, bookingId: insertedBooking.id, receiptUrl };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmed = stripeSecretKey.trim();
    if (trimmed.startsWith("pk_")) {
      return new Response(
        JSON.stringify({
          error:
            "STRIPE_SECRET_KEY is set to a publishable key (pk_...). Use your Stripe secret key (sk_test_... or sk_live_...) in Supabase Edge Function secrets, not VITE_STRIPE_PUBLISHABLE_KEY.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!trimmed.startsWith("sk_")) {
      return new Response(
        JSON.stringify({
          error:
            "STRIPE_SECRET_KEY must start with sk_ (secret key from Stripe Dashboard → Developers → API keys).",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(trimmed, { apiVersion: "2024-06-20" });

    // Only load Supabase admin client when DB access is required (webhook / finalize).
    // create_payment_intent uses Stripe only — avoids 500 when service role isn't wired yet.

    if (req.headers.get("stripe-signature")) {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!webhookSecret) {
        return new Response("Webhook secret is not configured", { status: 500 });
      }

      const signature = req.headers.get("stripe-signature") ?? "";
      const rawBody = await req.text();
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const supabase = buildSupabaseAdminClient();
        await finalizeBookingFromPaymentIntent(supabase, stripe, paymentIntent);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, amount, description, clientEmail, paymentIntentId, bookingData } = body;

    if (action === "create_payment_intent") {
      if (!amount || amount <= 0 || !bookingData) {
        return new Response(JSON.stringify({ error: "Invalid amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload = bookingData as BookingPayload;
      const serverCalculatedPrice = calculatePrice(payload.date, payload.startTime, payload.endTime);
      if (serverCalculatedPrice !== amount || serverCalculatedPrice !== payload.totalPrice) {
        return new Response(JSON.stringify({ error: "Price validation failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        description: description ?? `Studio booking ${payload.date} ${payload.startTime}-${payload.endTime}`,
        receipt_email: clientEmail ?? undefined,
        metadata: {
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          duration: payload.duration,
          clientName: payload.clientName,
          clientEmail: payload.clientEmail,
          clientPhone: payload.clientPhone,
          projectType: payload.projectType,
          totalPrice: String(payload.totalPrice),
          notes: payload.notes ?? "",
          receivePromotionalComms: String(payload.receivePromotionalComms),
          agreedToTerms: String(payload.agreedToTerms),
          termsAgreedAt: payload.termsAgreedAt ?? "",
          receivePromotionalCommsAt: payload.receivePromotionalCommsAt ?? "",
        },
        automatic_payment_methods: { enabled: true },
      });

      return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "finalize_booking") {
      if (!paymentIntentId) {
        return new Response(JSON.stringify({ error: "Missing paymentIntentId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = buildSupabaseAdminClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const result = await finalizeBookingFromPaymentIntent(supabase, stripe, paymentIntent);

      if (result.status === "conflict_paid") {
        return new Response(
          JSON.stringify({ error: "Time slot conflict after successful payment", code: "conflict_paid" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, bookingId: result.bookingId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("stripe-payment error:", err);
    const raw =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: string }).message)
          : String(err);

    let status = 500;
    if (raw.includes("Supabase not configured")) status = 503;
    else if (
      raw.includes("Price validation") ||
      raw.includes("Invalid amount") ||
      raw.includes("Minimum booking") ||
      raw.includes("Payment amount mismatch") ||
      raw.includes("Booking amount mismatch") ||
      raw.includes("Missing paymentIntentId") ||
      raw.includes("Missing ")
    )
      status = 400;

    const body =
      raw.trim().length > 0 && raw !== "[object Object]"
        ? raw
        : "Internal server error";

    return new Response(JSON.stringify({ error: body }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
