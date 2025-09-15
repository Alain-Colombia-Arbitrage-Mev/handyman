import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const createJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    budget: v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    }),
    clientId: v.id("users"),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    }),
    isUrgent: v.optional(v.boolean()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

export const getJobs = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args) => {
    let jobs;

    if (args.status) {
      jobs = await ctx.db
        .query("jobs")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .take(args.limit || 50);
    } else {
      jobs = await ctx.db
        .query("jobs")
        .order("desc")
        .take(args.limit || 50);
    }

    return jobs;
  },
});

export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.jobId);
  },
});