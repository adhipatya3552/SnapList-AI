import { createHmac } from "crypto";

// ── Webhook Signature Verification ──────────────────────────────────────────
// DodoPayments follows the Standard Webhooks spec:
// https://www.standardwebhooks.com/
// Signed message = "${webhook-id}.${webhook-timestamp}.${rawBody}"
// Signature     = base64(HMAC-SHA256(signedMessage, secret))
// Secret is prefixed with "whsec_" and base64-encoded in the env var.

export function verifyDodoWebhook(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string,
  secret: string          // the DODO_WEBHOOK_SECRET env var (whsec_...)
): boolean {
  try {
    // Strip the "whsec_" prefix, then base64-decode to get the raw key bytes
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");

    // Build the signed message exactly as the spec requires
    const signedMessage = `${webhookId}.${webhookTimestamp}.${rawBody}`;

    // Compute HMAC-SHA256
    const computed = createHmac("sha256", secretBytes)
      .update(signedMessage)
      .digest("base64");

    // The header may contain multiple space-separated "v1,<sig>" signatures
    // (DodoPayments rotates secrets). Accept if any one matches.
    const signatures = webhookSignature.split(" ");
    return signatures.some((sig) => {
      const sigValue = sig.startsWith("v1,") ? sig.slice(3) : sig;
      return timingSafeEqual(computed, sigValue);
    });
  } catch {
    return false;
  }
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.equals(bufB); // Buffer.equals is timing-safe in Node.js
}

// ── Plan resolution ──────────────────────────────────────────────────────────
// Map DodoPayments product IDs to internal plan keys.
// The product IDs come from your payment link URLs (pdt_xxx).

const PRODUCT_PLAN_MAP: Record<string, "hustler" | "flipper" | "pro"> = {
  pdt_0NZfyMJuKVGMz4z737CDb: "hustler",
  pdt_0NZfyQxzAPY6wSh4Iyhw9: "flipper",
  pdt_0NZfyVqG88UQnq5hCezmv: "pro",
};

export function planFromProductId(productId: string): "hustler" | "flipper" | "pro" | null {
  return PRODUCT_PLAN_MAP[productId] ?? null;
}

export const PLAN_CREDIT_LIMITS = {
  hustler: 100,
  flipper: 500,
  pro:     999999,
} as const;
