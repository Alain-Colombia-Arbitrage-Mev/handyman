import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("handyman"), v.literal("client"), v.literal("business")),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    })),
    skills: v.optional(v.array(v.string())),
    categories: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("job_match"),
      v.literal("proposal_received"),
      v.literal("job_assigned"),
      v.literal("message"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId", "isRead"]),

  jobs: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    budget: v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    }),
    clientId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    }),
    isUrgent: v.optional(v.boolean()),
    deadline: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_client", ["clientId"])
    .index("by_category", ["category"]),
});