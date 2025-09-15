import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user profile
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user statistics
    const completedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_handyman", (q) => q.eq("handymanId", args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .collect();

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      ...user,
      completedJobs: completedJobs.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    currency: v.optional(v.string()),
    availability: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    categories: v.optional(v.array(v.string())),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, ...updateData } = args;
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await ctx.db.patch(userId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return updatedUser;
  },
});

// Get user's job history
export const getUserJobHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Jobs as client
    const clientJobs = await ctx.db
      .query("jobs")
      .withIndex("by_client", (q) => q.eq("clientId", args.userId))
      .order("desc")
      .collect();

    // Jobs as handyman
    const handymanJobs = await ctx.db
      .query("jobs")
      .withIndex("by_handyman", (q) => q.eq("handymanId", args.userId))
      .order("desc")
      .collect();

    // Get user details for jobs
    const allJobs = [...clientJobs, ...handymanJobs];
    const jobsWithDetails = await Promise.all(
      allJobs.map(async (job) => {
        const client = await ctx.db.get(job.clientId);
        const handyman = job.handymanId ? await ctx.db.get(job.handymanId) : null;
        
        return {
          ...job,
          client,
          handyman,
          role: job.clientId === args.userId ? "client" : "handyman",
        };
      })
    );

    return jobsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get user reviews
export const getUserReviews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .order("desc")
      .collect();

    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const job = await ctx.db.get(review.jobId);
        
        return {
          ...review,
          reviewer,
          job,
        };
      })
    );

    return reviewsWithDetails;
  },
});

// Get user's favorite handymen/jobs
export const getUserFavorites = query({
  args: { 
    userId: v.id("users"),
    targetType: v.optional(v.union(v.literal("handyman"), v.literal("job")))
  },
  handler: async (ctx, args) => {
    let favoritesQuery = ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.targetType) {
      favoritesQuery = favoritesQuery.filter((q) => 
        q.eq(q.field("targetType"), args.targetType)
      );
    }

    const favorites = await favoritesQuery.collect();

    const favoritesWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        if (favorite.targetType === "handyman") {
          const handyman = await ctx.db.get(favorite.targetId);
          return {
            ...favorite,
            handyman,
          };
        } else {
          const job = await ctx.db.get(favorite.targetId as any);
          return {
            ...favorite,
            job,
          };
        }
      })
    );

    return favoritesWithDetails;
  },
});

// Toggle favorite
export const toggleFavorite = mutation({
  args: {
    userId: v.id("users"),
    targetId: v.id("users"),
    targetType: v.union(v.literal("handyman"), v.literal("job"))
  },
  handler: async (ctx, args) => {
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", args.userId).eq("targetType", args.targetType)
      )
      .filter((q) => q.eq(q.field("targetId"), args.targetId))
      .first();

    if (existingFavorite) {
      // Remove favorite
      await ctx.db.delete(existingFavorite._id);
      return { isFavorite: false };
    } else {
      // Add favorite
      await ctx.db.insert("favorites", {
        userId: args.userId,
        targetId: args.targetId,
        targetType: args.targetType,
        createdAt: Date.now(),
      });
      return { isFavorite: true };
    }
  },
});

// Check if target is favorited
export const isFavorited = query({
  args: {
    userId: v.id("users"),
    targetId: v.id("users"),
    targetType: v.union(v.literal("handyman"), v.literal("job"))
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", args.userId).eq("targetType", args.targetType)
      )
      .filter((q) => q.eq(q.field("targetId"), args.targetId))
      .first();

    return !!favorite;
  },
});

// Export aliases for compatibility
export const getProfile = getUserProfile;