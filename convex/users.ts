import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: { clerkId: v.string(), email: v.optional(v.string()) },
  handler: async (ctx, { clerkId, email }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) return existing._id;

    return ctx.db.insert("users", {
      clerkId,
      email,
      plan: "free",
      creditsUsed: 0,
      creditLimit: 10,
      createdAt: Date.now(),
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const consumeCredit = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) throw new Error("User not found");
    if (user.creditsUsed >= user.creditLimit) {
      return { success: false, reason: "limit_reached" };
    }

    await ctx.db.patch(user._id, { creditsUsed: user.creditsUsed + 1 });
    return { success: true, remaining: user.creditLimit - user.creditsUsed - 1 };
  },
});

export const upgradePlan = mutation({
  args: {
    clerkId: v.string(),
    plan: v.union(v.literal("free"), v.literal("hustler"), v.literal("flipper"), v.literal("pro")),
  },
  handler: async (ctx, { clerkId, plan }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");

    const limits = { free: 10, hustler: 100, flipper: 500, pro: 999999 };
    await ctx.db.patch(user._id, { plan, creditLimit: limits[plan] });
  },
});
