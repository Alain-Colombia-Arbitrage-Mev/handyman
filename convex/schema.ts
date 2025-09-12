import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Usuarios del sistema
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    userType: v.union(v.literal("client"), v.literal("handyman")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
    })),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    rating: v.optional(v.number()),
    totalJobs: v.optional(v.number()),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_userType", ["userType"])
    .index("by_location", ["location.city", "location.country"])
    .index("by_isOnline", ["isOnline"]),

  // Perfiles de profesionales
  handymanProfiles: defineTable({
    userId: v.id("users"),
    skills: v.array(v.string()),
    experience: v.string(),
    hourlyRate: v.number(),
    availability: v.object({
      monday: v.array(v.string()),
      tuesday: v.array(v.string()),
      wednesday: v.array(v.string()),
      thursday: v.array(v.string()),
      friday: v.array(v.string()),
      saturday: v.array(v.string()),
      sunday: v.array(v.string()),
    }),
    serviceRadius: v.number(), // en kilómetros
    portfolio: v.optional(v.array(v.string())), // URLs de imágenes
    certifications: v.optional(v.array(v.string())),
    description: v.string(),
    isActive: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_skills", ["skills"])
    .index("by_hourlyRate", ["hourlyRate"])
    .index("by_isActive", ["isActive"]),

  // Trabajos/Oportunidades
  jobs: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    clientId: v.id("users"),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
    }),
    budget: v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    }),
    urgency: v.union(
      v.literal("low"),
      v.literal("medium"), 
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    requiredSkills: v.array(v.string()),
    estimatedDuration: v.string(),
    images: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    isFlashJob: v.boolean(), // Para trabajos urgentes
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_location", ["location.city", "location.country"])
    .index("by_urgency", ["urgency"])
    .index("by_isFlashJob", ["isFlashJob"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_createdAt", ["createdAt"]),

  // Ofertas/Propuestas de profesionales
  proposals: defineTable({
    jobId: v.id("jobs"),
    handymanId: v.id("users"),
    message: v.string(),
    proposedRate: v.number(),
    estimatedTime: v.string(),
    availability: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_handymanId", ["handymanId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // Conversaciones de chat
  conversations: defineTable({
    participants: v.array(v.id("users")),
    jobId: v.optional(v.id("jobs")),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_participants", ["participants"])
    .index("by_jobId", ["jobId"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  // Mensajes de chat
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("location"),
      v.literal("system")
    ),
    readBy: v.array(v.object({
      userId: v.id("users"),
      readAt: v.number(),
    })),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_senderId", ["senderId"])
    .index("by_createdAt", ["createdAt"]),

  // Notificaciones
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("job_match"),
      v.literal("proposal_received"),
      v.literal("job_assigned"),
      v.literal("message"),
      v.literal("system")
    ),
    data: v.optional(v.any()), // Datos adicionales para la notificación
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isRead", ["isRead"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  // Reseñas y calificaciones
  reviews: defineTable({
    jobId: v.id("jobs"),
    reviewerId: v.id("users"), // Quien hace la reseña
    revieweeId: v.id("users"), // Quien recibe la reseña
    rating: v.number(), // 1-5
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_reviewerId", ["reviewerId"])
    .index("by_revieweeId", ["revieweeId"])
    .index("by_rating", ["rating"]),

  // Categorías de servicios
  categories: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    parentCategory: v.optional(v.id("categories")),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_parentCategory", ["parentCategory"])
    .index("by_isActive", ["isActive"])
    .index("by_sortOrder", ["sortOrder"]),
});