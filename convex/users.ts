import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("handyman"), v.literal("client"), v.literal("business")),
    phone: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    
    const userId = await ctx.db.insert("users", {
      ...args,
      rating: 0,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});