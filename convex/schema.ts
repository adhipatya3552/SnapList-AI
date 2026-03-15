import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId:      v.string(),
    email:        v.optional(v.string()),
    plan:         v.union(v.literal("free"), v.literal("hustler"), v.literal("flipper"), v.literal("pro")),
    creditsUsed:  v.number(),
    creditLimit:  v.number(), // 10 | 100 | 500 | 999999 (pro)
    createdAt:    v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  listings: defineTable({
    userId:       v.string(), // clerkId
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
    platformRecommendation: v.array(v.object({
      platform: v.string(),
      reason:   v.string(),
    })),
    priceRange: v.object({
      low: v.number(),
      avg: v.number(),
      high: v.number(),
    }),
    userPrice:         v.optional(v.number()),
    selectedPlatform:  v.optional(v.string()),
    confidence:        v.number(),
    flaggedForReview:  v.boolean(),
    imageStorageId:    v.optional(v.string()),
    savedAt:           v.number(),
    templateName:      v.optional(v.string()),
  })
    .index("by_user",     ["userId"])
    .index("by_user_date",["userId", "savedAt"])
    .index("by_category", ["userId", "category"]),

  payments: defineTable({
    userId:        v.string(),
    plan:          v.string(),
    dodoPaymentId: v.optional(v.string()),
    status:        v.union(v.literal("pending"), v.literal("active"), v.literal("cancelled")),
    createdAt:     v.number(),
  }).index("by_user", ["userId"]),
});
