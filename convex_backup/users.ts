import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nuevo usuario
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    userType: v.union(v.literal("client"), v.literal("handyman")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      ...args,
      avatar: undefined,
      isOnline: true,
      lastSeen: Date.now(),
      rating: 0,
      totalJobs: 0,
      isVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return userId;
  },
});

// Obtener usuario por ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Obtener usuario por email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Actualizar estado online del usuario
export const updateOnlineStatus = mutation({
  args: {
    userId: v.id("users"),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Obtener usuarios online
export const getOnlineUsers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_isOnline", (q) => q.eq("isOnline", true))
      .collect();
  },
});

// Actualizar ubicación del usuario
export const updateUserLocation = mutation({
  args: {
    userId: v.id("users"),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      location: args.location,
      updatedAt: Date.now(),
    });
  },
});

// Obtener usuarios por ubicación (ciudad)
export const getUsersByLocation = query({
  args: {
    city: v.string(),
    country: v.string(),
    userType: v.optional(v.union(v.literal("client"), v.literal("handyman"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("users")
      .withIndex("by_location", (q) => 
        q.eq("location.city", args.city).eq("location.country", args.country)
      );

    const users = await query.collect();
    
    if (args.userType) {
      return users.filter(user => user.userType === args.userType);
    }
    
    return users;
  },
});

// Actualizar perfil de usuario
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Filtrar valores undefined
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(userId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});