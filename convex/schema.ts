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
    isVerified: v.optional(v.boolean()),
    verifiedAt: v.optional(v.number()),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    currency: v.optional(v.string()),
    availability: v.optional(v.string()),
    completedJobs: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_verified", ["isVerified"]),

  userDocuments: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    documentType: v.union(
      v.literal("profile_photo"),
      v.literal("id_front"),
      v.literal("id_back"),
      v.literal("criminal_record"),
      v.literal("certification"),
      v.literal("business_license"),
      v.literal("tax_certificate"),
      v.literal("insurance"),
      v.literal("other")
    ),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    verificationNotes: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")),
    uploadedAt: v.number(),
    metadata: v.optional(v.object({
      verificationStatus: v.optional(v.string()),
      expiryDate: v.optional(v.number()),
      issuedBy: v.optional(v.string()),
    })),
  }).index("by_user", ["userId"])
    .index("by_type", ["documentType"])
    .index("by_status", ["verificationStatus"]),

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
    handymanId: v.optional(v.id("users")),
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
    completedAt: v.optional(v.number()),
    finalPrice: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_client", ["clientId"])
    .index("by_handyman", ["handymanId"])
    .index("by_category", ["category"])
    .index("by_location", ["location.lat", "location.lng"]),

  jobProposals: defineTable({
    jobId: v.id("jobs"),
    handymanId: v.id("users"),
    proposedPrice: v.number(),
    estimatedDuration: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_job", ["jobId"])
    .index("by_handyman", ["handymanId"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    jobId: v.id("jobs"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(), // 1-5 stars
    comment: v.optional(v.string()),
    reviewType: v.union(
      v.literal("client_to_handyman"),
      v.literal("handyman_to_client")
    ),
    createdAt: v.number(),
  }).index("by_reviewee", ["revieweeId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_job", ["jobId"])
    .index("by_type", ["reviewType"]),

  favorites: defineTable({
    userId: v.id("users"),
    targetId: v.id("users"), // favorited user or job
    targetType: v.union(
      v.literal("handyman"),
      v.literal("job")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_target", ["targetId"])
    .index("by_user_type", ["userId", "targetType"]),

  paymentMethods: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("bank_account"),
      v.literal("digital_wallet")
    ),
    provider: v.string(), // "visa", "mastercard", "mercadopago", etc.
    lastFourDigits: v.string(),
    holderName: v.string(),
    expiryMonth: v.optional(v.number()),
    expiryYear: v.optional(v.number()),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      token: v.optional(v.string()),
      fingerprint: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_default", ["userId", "isDefault"]),

  payments: defineTable({
    jobId: v.id("jobs"),
    payerId: v.id("users"),
    receiverId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    paymentMethodId: v.id("paymentMethods"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    transactionId: v.optional(v.string()),
    gatewayResponse: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_job", ["jobId"])
    .index("by_payer", ["payerId"])
    .index("by_receiver", ["receiverId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    conversationId: v.string(),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system")
    ),
    attachmentUrl: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
    lastMessageAt: v.number(),
    jobId: v.optional(v.id("jobs")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_participants", ["participants"])
    .index("by_job", ["jobId"]),

  helpArticles: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  supportTickets: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_assigned", ["assignedTo"]),
});