import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
    userId:       v.string(),
    title:        v.string(),
    descriptions: v.object({
      poshmark: v.string(),
      ebay:     v.string(),
      etsy:     v.string(),
      facebook: v.string(),
    }),
    condition:      v.string(),
    conditionNotes: v.array(v.string()),
    category:       v.string(),
    brand:          v.string(),
    platformRecommendation: v.array(v.object({ platform: v.string(), reason: v.string() })),
    priceRange: v.object({ low: v.number(), avg: v.number(), high: v.number() }),
    confidence: v.number(),
    flaggedForReview: v.boolean(),
    userPrice:         v.optional(v.number()),
    selectedPlatform:  v.optional(v.string()),
    templateName:      v.optional(v.string()),
    imageStorageId:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("listings", { ...args, savedAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id:         v.id("listings"),
    title:      v.optional(v.string()),
    descriptions: v.optional(v.object({
      poshmark: v.string(),
      ebay:     v.string(),
      etsy:     v.string(),
      facebook: v.string(),
    })),
    userPrice:        v.optional(v.number()),
    selectedPlatform: v.optional(v.string()),
    templateName:     v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const listByUser = query({
  args: {
    userId:   v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { userId, category }) => {
    let q = ctx.db
      .query("listings")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc");

    const all = await q.collect();
    if (category) return all.filter((l) => l.category === category);
    return all;
  },
});

export const getById = query({
  args: { id: v.id("listings") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
