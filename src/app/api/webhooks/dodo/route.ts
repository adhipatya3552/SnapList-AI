import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { verifyDodoWebhook, planFromProductId, PLAN_CREDIT_LIMITS } from "@/lib/dodo";

// ── Convex HTTP client (server-side, no React needed) ─────────────────────
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

// ── Webhook handler ──────────────────────────────────────────────────────────
// DodoPayments sends webhooks for every payment and subscription lifecycle event.
// We only care about:
//   • payment.succeeded    → activate/upgrade user plan
//   • subscription.active  → same as above (sent on subscription creation)
//   • subscription.cancelled / subscription.failed → downgrade to free
//
// Signature verification uses Standard Webhooks (HMAC-SHA256).
// Docs: https://docs.dodopayments.com/integration/webhooks

export async function POST(req: NextRequest) {
  // 1. Read raw body BEFORE parsing (needed for signature verification)
  const rawBody = await req.text();

  // 2. Extract Standard Webhooks headers
  const webhookId        = req.headers.get("webhook-id") ?? "";
  const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = req.headers.get("webhook-signature") ?? "";
  const webhookSecret    = process.env.DODO_WEBHOOK_SECRET ?? "";

  // 3. Reject if required headers or secret are missing
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.warn("[dodo-webhook] Missing webhook headers");
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error("[dodo-webhook] DODO_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // 4. Verify signature
  const isValid = verifyDodoWebhook(rawBody, webhookId, webhookTimestamp, webhookSignature, webhookSecret);
  if (!isValid) {
    console.warn("[dodo-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 5. Parse payload
  let event: DodoWebhookEvent;
  try {
    event = JSON.parse(rawBody) as DodoWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[dodo-webhook] Received event:", event.type);

  // 6. Route by event type
  try {
    switch (event.type) {
      case "payment.succeeded":
      case "subscription.active": {
        await handlePaymentSucceeded(event);
        break;
      }
      case "subscription.cancelled":
      case "subscription.failed":
      case "subscription.expired": {
        await handleSubscriptionCancelled(event);
        break;
      }
      default:
        // Acknowledge but ignore unhandled event types
        console.log("[dodo-webhook] Unhandled event type:", event.type);
    }
  } catch (err) {
    console.error("[dodo-webhook] Handler error:", err);
    // Return 500 so DodoPayments retries the webhook
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  // 7. Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}

// ── Event Handlers ───────────────────────────────────────────────────────────

async function handlePaymentSucceeded(event: DodoWebhookEvent) {
  const data = event.data;

  // customer.email is always present; customer.clerk_id is our custom metadata
  // we pass when building the checkout URL (optional enhancement)
  const clerkId     = data.customer?.clerk_id ?? data.metadata?.clerk_id;
  const productId   = data.product_id ?? data.product_cart?.[0]?.product_id;
  const paymentId   = data.payment_id ?? data.subscription_id ?? webhookUniqueId(event);

  if (!clerkId) {
    // Without a clerkId we can't update the user. Log the payment email for
    // manual resolution if needed.
    console.warn("[dodo-webhook] No clerkId in event — customer email:", data.customer?.email);
    return;
  }

  const plan = productId ? planFromProductId(productId) : null;
  if (!plan) {
    console.warn("[dodo-webhook] Could not resolve plan for productId:", productId);
    return;
  }

  // String-based mutation call — avoids importing convex/_generated/api
  // which Turbopack can't resolve since convex/ is excluded from tsconfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (convex as any).mutation("payments:syncSubscription", {
    clerkId,
    plan,
    creditLimit: PLAN_CREDIT_LIMITS[plan],
    dodoPaymentId: paymentId,
    status: "active",
  });

  console.log(`[dodo-webhook] ✅ Upgraded ${clerkId} → ${plan}`);
}

async function handleSubscriptionCancelled(event: DodoWebhookEvent) {
  const data = event.data;
  const clerkId   = data.customer?.clerk_id ?? data.metadata?.clerk_id;
  const paymentId = data.payment_id ?? data.subscription_id ?? webhookUniqueId(event);

  if (!clerkId) {
    console.warn("[dodo-webhook] No clerkId in cancellation event");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (convex as any).mutation("payments:cancelSubscription", {
    clerkId,
    dodoPaymentId: paymentId,
  });

  console.log(`[dodo-webhook] ⬇️ Cancelled — ${clerkId} downgraded to free`);
}

function webhookUniqueId(event: DodoWebhookEvent): string {
  return `${event.type}__${event.timestamp ?? Date.now()}`;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface DodoWebhookEvent {
  type: string;
  timestamp?: string;
  business_id?: string;
  data: {
    payment_id?:     string;
    subscription_id?: string;
    product_id?:     string;
    product_cart?:   { product_id: string; quantity: number }[];
    customer?: {
      email?:    string;
      clerk_id?: string;  // set if you pass it as metadata on checkout
    };
    metadata?: {
      clerk_id?: string;  // alternative location
    };
    status?: string;
  };
}
