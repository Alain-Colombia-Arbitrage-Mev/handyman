import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a review
export const createReview = mutation({
  args: {
    jobId: v.id("jobs"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    reviewType: v.union(
      v.literal("client_to_handyman"),
      v.literal("handyman_to_client")
    ),
  },
  handler: async (ctx, args) => {
    // Verify the job exists and is completed
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    
    if (job.status !== "completed") {
      throw new Error("Can only review completed jobs");
    }

    // Verify reviewer is part of the job
    const isValidReviewer = (
      (args.reviewType === "client_to_handyman" && job.clientId === args.reviewerId && job.handymanId === args.revieweeId) ||
      (args.reviewType === "handyman_to_client" && job.handymanId === args.reviewerId && job.clientId === args.revieweeId)
    );

    if (!isValidReviewer) {
      throw new Error("Invalid reviewer or reviewee for this job");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .filter((q) => 
        q.and(
          q.eq(q.field("reviewerId"), args.reviewerId),
          q.eq(q.field("reviewType"), args.reviewType)
        )
      )
      .first();

    if (existingReview) {
      throw new Error("Review already exists for this job");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = await ctx.db.insert("reviews", {
      ...args,
      createdAt: Date.now(),
    });

    return review;
  },
});

// Get reviews for a user
export const getReviewsForUser = query({
  args: { 
    userId: v.id("users"),
    reviewType: v.optional(v.union(
      v.literal("client_to_handyman"),
      v.literal("handyman_to_client")
    ))
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId));

    if (args.reviewType) {
      reviewsQuery = reviewsQuery.filter((q) => 
        q.eq(q.field("reviewType"), args.reviewType)
      );
    }

    const reviews = await reviewsQuery.order("desc").collect();

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

// Get reviews by a user
export const getReviewsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewer", (q) => q.eq("reviewerId", args.userId))
      .order("desc")
      .collect();

    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        const reviewee = await ctx.db.get(review.revieweeId);
        const job = await ctx.db.get(review.jobId);
        
        return {
          ...review,
          reviewee,
          job,
        };
      })
    );

    return reviewsWithDetails;
  },
});

// Get review statistics for a user
export const getReviewStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .collect();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist] = (dist[review.rating as keyof typeof dist] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  },
});

// Get pending reviews for a user
export const getPendingReviews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get completed jobs where user can leave a review
    const completedJobs = await ctx.db
      .query("jobs")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "completed"),
          q.or(
            q.eq(q.field("clientId"), args.userId),
            q.eq(q.field("handymanId"), args.userId)
          )
        )
      )
      .collect();

    const pendingReviews = [];

    for (const job of completedJobs) {
      // Determine review type based on user role
      const reviewType = job.clientId === args.userId ? "client_to_handyman" : "handyman_to_client";
      const revieweeId = job.clientId === args.userId ? job.handymanId : job.clientId;

      if (!revieweeId) continue;

      // Check if review already exists
      const existingReview = await ctx.db
        .query("reviews")
        .withIndex("by_job", (q) => q.eq("jobId", job._id))
        .filter((q) => 
          q.and(
            q.eq(q.field("reviewerId"), args.userId),
            q.eq(q.field("reviewType"), reviewType)
          )
        )
        .first();

      if (!existingReview) {
        const reviewee = await ctx.db.get(revieweeId);
        pendingReviews.push({
          job,
          reviewee,
          reviewType,
        });
      }
    }

    return pendingReviews.sort((a, b) => b.job.completedAt! - a.job.completedAt!);
  },
});

// Update a review
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { reviewId, ...updateData } = args;
    
    const review = await ctx.db.get(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    return await ctx.db.patch(reviewId, updateData);
  },
});

// Delete a review
export const deleteReview = mutation({
  args: { 
    reviewId: v.id("reviews"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Only the reviewer can delete their review
    if (review.reviewerId !== args.userId) {
      throw new Error("Unauthorized to delete this review");
    }

    await ctx.db.delete(args.reviewId);
    return { success: true };
  },
});