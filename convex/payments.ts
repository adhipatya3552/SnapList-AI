import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ── syncSubscription ─────────────────────────────────────────────────────────
// Called by the DodoPayments webhook handler after verifying the signature.
// Updates the user's plan + creditLimit in the DB and records the payment.

export const syncSubscription = mutation({
  args: {
    clerkId:       v.string(),
    plan:          v.union(v.literal("hustler"), v.literal("flipper"), v.literal("pro")),
    creditLimit:   v.number(),
    dodoPaymentId: v.optional(v.string()),
    status:        v.union(v.literal("pending"), v.literal("active"), v.literal("cancelled")),
  },
  handler: async (ctx, { clerkId, plan, creditLimit, dodoPaymentId, status }) => {
    // 1. Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      // User hasn't signed in yet — they'll get the plan on next sign-in
      // via getOrCreate + a secondary sync. Log and return gracefully.
      console.warn("[syncSubscription] User not found for clerkId:", clerkId);
      return { ok: false, reason: "user_not_found" };
    }

    // 2. Upgrade the user's plan
    await ctx.db.patch(user._id, { plan, creditLimit });

    // 3. Record the payment event
    // Check for existing payment record to avoid duplicates (idempotency)
    if (dodoPaymentId) {
      const existing = await ctx.db
        .query("payments")
        .withIndex("by_user", (q) => q.eq("userId", clerkId))
        .filter((q) => q.eq(q.field("dodoPaymentId"), dodoPaymentId))
        .first();

      if (!existing) {
        await ctx.db.insert("payments", {
          userId:        clerkId,
          plan,
          dodoPaymentId,
          status,
          createdAt:     Date.now(),
        });
      } else if (existing.status !== status) {
        await ctx.db.patch(existing._id, { status });
      }
    }

    return { ok: true, plan, creditLimit };
  },
});

// ── cancelSubscription ───────────────────────────────────────────────────────
// Called when DodoPayments sends a subscription.cancelled event.
// Resets the user to the free plan.

export const cancelSubscription = mutation({
  args: {
    clerkId:       v.string(),
    dodoPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, dodoPaymentId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { plan: "free", creditLimit: 10 });
    }

    // Mark the payment as cancelled
    if (dodoPaymentId) {
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_user", (q) => q.eq("userId", clerkId))
        .filter((q) => q.eq(q.field("dodoPaymentId"), dodoPaymentId))
        .first();

      if (payment) {
        await ctx.db.patch(payment._id, { status: "cancelled" });
      }
    }

    return { ok: true };
  },
});
