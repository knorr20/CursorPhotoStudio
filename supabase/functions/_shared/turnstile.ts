/** Cloudflare Turnstile server-side verification (siteverify). */

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY")?.trim();
  if (!secret) {
    console.error("verifyTurnstileToken: TURNSTILE_SECRET_KEY is not set");
    return { ok: false, error: "Verification is not configured." };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: "Human verification required." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", trimmed);
  const firstIp = remoteIp?.split(",")[0]?.trim();
  if (firstIp && firstIp !== "unknown") {
    body.set("remoteip", firstIp);
  }

  let data: { success?: boolean; "error-codes"?: string[] };
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  } catch (e) {
    console.error("verifyTurnstileToken fetch error:", e);
    return { ok: false, error: "Verification service unavailable. Try again." };
  }

  if (!data.success) {
    console.warn("Turnstile siteverify failed:", data["error-codes"]);
    return { ok: false, error: "Verification failed. Please refresh and try again." };
  }

  return { ok: true };
}
