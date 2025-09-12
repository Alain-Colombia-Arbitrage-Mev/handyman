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

  // OPORTUNIDADES - Ofertas de última hora para liquidar mercancía/comida
  opportunities: defineTable({
    businessId: v.id("businesses"),
    title: v.string(),
    description: v.string(),
    originalPrice: v.number(),
    discountedPrice: v.number(),
    discount: v.number(), // Porcentaje de descuento
    category: v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment"),
      v.literal("perishables") // Productos perecederos
    ),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
    }),
    availableUntil: v.number(), // Timestamp - cuándo expira
    quantity: v.number(), // Cantidad disponible
    remainingQuantity: v.number(),
    images: v.array(v.string()),
    targetRadius: v.number(), // Radio de notificación en km
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("sold_out")),
    notificationsSent: v.boolean(),
    alertStartTime: v.number(), // Cuándo empezar a enviar alertas
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_location", ["location.city", "location.country"])
    .index("by_availableUntil", ["availableUntil"])
    .index("by_createdAt", ["createdAt"]),

  // TRABAJOS FLASH - Trabajos urgentes con monto específico
  flashJobs: defineTable({
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
    fixedPrice: v.number(), // Precio fijo, no negociable
    currency: v.string(),
    requiredSkills: v.array(v.string()),
    urgency: v.union(v.literal("high"), v.literal("urgent")), // Solo alta urgencia
    estimatedDuration: v.string(),
    scheduledFor: v.number(), // Cuándo debe ejecutarse
    deadline: v.number(), // Fecha límite
    status: v.union(
      v.literal("open"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("expired")
    ),
    images: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.id("users")),
    targetRadius: v.number(), // Radio para notificaciones
    notificationsSent: v.boolean(),
    alertStartTime: v.number(), // Cuándo empezar alertas
    alertEndTime: v.number(), // Cuándo parar alertas
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_location", ["location.city", "location.country"])
    .index("by_urgency", ["urgency"])
    .index("by_scheduledFor", ["scheduledFor"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_createdAt", ["createdAt"]),

  // OFERTAS - Trabajos con categorías, precio fijo o pujas
  jobOffers: defineTable({
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
    jobType: v.union(v.literal("fixed_price"), v.literal("bids_allowed")),
    budget: v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    }),
    fixedPrice: v.optional(v.number()), // Para trabajos de precio fijo
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
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
    deadline: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    acceptsBids: v.boolean(),
    targetCategories: v.array(v.string()), // Categorías de trabajadores a notificar
    alertStartTime: v.number(), // Cuándo empezar alertas push
    alertEndTime: v.number(), // Cuándo terminar alertas push
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_location", ["location.city", "location.country"])
    .index("by_urgency", ["urgency"])
    .index("by_jobType", ["jobType"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_createdAt", ["createdAt"]),

  // Propuestas/Pujas para ofertas de trabajo (solo jobOffers que aceptan pujas)
  jobProposals: defineTable({
    jobOfferId: v.id("jobOffers"),
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
    .index("by_jobOfferId", ["jobOfferId"])
    .index("by_handymanId", ["handymanId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // Asignaciones directas para trabajos flash y ofertas de precio fijo
  jobAssignments: defineTable({
    jobType: v.union(v.literal("flash_job"), v.literal("job_offer")),
    jobId: v.string(), // ID del trabajo (flashJob o jobOffer)
    handymanId: v.id("users"),
    clientId: v.id("users"),
    status: v.union(
      v.literal("assigned"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignedAt: v.number(),
    acceptedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_jobId", ["jobId"])
    .index("by_handymanId", ["handymanId"])
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_assignedAt", ["assignedAt"]),

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

  // Ofertas comerciales de negocios
  commercialOffers: defineTable({
    businessId: v.id("businesses"),
    title: v.string(),
    description: v.string(),
    discount: v.number(), // Porcentaje de descuento
    originalPrice: v.optional(v.number()),
    discountedPrice: v.optional(v.number()),
    category: v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment")
    ),
    validUntil: v.number(), // timestamp
    termsAndConditions: v.string(),
    targetRadius: v.number(), // Radio en kilómetros
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("paused")),
    images: v.optional(v.array(v.string())),
    maxRedemptions: v.optional(v.number()),
    currentRedemptions: v.number(),
    isFlashOffer: v.boolean(), // Para ofertas de último momento
    notificationsSent: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_validUntil", ["validUntil"])
    .index("by_isFlashOffer", ["isFlashOffer"])
    .index("by_createdAt", ["createdAt"]),

  // Subastas de excedentes
  surplusAuctions: defineTable({
    businessId: v.id("businesses"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("food"), 
      v.literal("machinery"), 
      v.literal("clothing"), 
      v.literal("electronics"), 
      v.literal("furniture")
    ),
    currentBid: v.number(),
    minimumBid: v.number(),
    originalValue: v.number(),
    endsAt: v.number(),
    condition: v.union(
      v.literal("new"), 
      v.literal("like_new"), 
      v.literal("good"), 
      v.literal("fair")
    ),
    status: v.union(v.literal("active"), v.literal("ended"), v.literal("sold")),
    images: v.array(v.string()),
    highestBidderId: v.optional(v.id("users")),
    bidders: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_endsAt", ["endsAt"])
    .index("by_currentBid", ["currentBid"]),

  // Pujas en subastas
  auctionBids: defineTable({
    auctionId: v.id("surplusAuctions"),
    bidderId: v.id("users"),
    amount: v.number(),
    timestamp: v.number(),
    isWinning: v.boolean(),
  })
    .index("by_auctionId", ["auctionId"])
    .index("by_bidderId", ["bidderId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_isWinning", ["isWinning"]),

  // Negocios/Restaurantes/Tiendas
  businesses: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("restaurant"), 
      v.literal("retail_store"), 
      v.literal("service_provider"),
      v.literal("entertainment"),
      v.literal("supermarket")
    ),
    logo: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
    }),
    contactInfo: v.object({
      phone: v.string(),
      email: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    businessHours: v.object({
      monday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      tuesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      wednesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      thursday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      friday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      saturday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      sunday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
    }),
    rating: v.number(),
    totalReviews: v.number(),
    isVerified: v.boolean(),
    verificationDocuments: v.optional(v.array(v.string())), // URLs de documentos
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_location", ["location.city", "location.country"])
    .index("by_status", ["status"])
    .index("by_isVerified", ["isVerified"]),

  // Documentos de verificación de usuarios
  userDocuments: defineTable({
    userId: v.id("users"),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("criminal_background_check"),
      v.literal("professional_license"),
      v.literal("certification"),
      v.literal("insurance_policy"),
      v.literal("tax_id")
    ),
    documentUrl: v.string(),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    expirationDate: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")), // Admin que verificó
    verificationNotes: v.optional(v.string()),
    uploadedAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_documentType", ["documentType"])
    .index("by_verificationStatus", ["verificationStatus"])
    .index("by_expirationDate", ["expirationDate"]),

  // Certificaciones y cursos de profesionales
  professionalCertifications: defineTable({
    handymanId: v.id("users"),
    certificationName: v.string(),
    issuingOrganization: v.string(),
    issueDate: v.number(),
    expirationDate: v.optional(v.number()),
    certificateUrl: v.optional(v.string()),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  })
    .index("by_handymanId", ["handymanId"])
    .index("by_verificationStatus", ["verificationStatus"])
    .index("by_expirationDate", ["expirationDate"]),

  // Canjes de ofertas comerciales
  offerRedemptions: defineTable({
    offerId: v.id("commercialOffers"),
    userId: v.id("users"),
    businessId: v.id("businesses"),
    redemptionCode: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("used"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    redeemedAt: v.optional(v.number()),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_offerId", ["offerId"])
    .index("by_userId", ["userId"])
    .index("by_businessId", ["businessId"])
    .index("by_redemptionCode", ["redemptionCode"])
    .index("by_status", ["status"]),

  // Compras de oportunidades de liquidación
  opportunityPurchases: defineTable({
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
    businessId: v.id("businesses"),
    quantityPurchased: v.number(),
    totalPaid: v.number(),
    currency: v.union(v.literal("USD"), v.literal("COP")),
    exchangeRate: v.number(), // Tasa de cambio al momento de la compra
    redemptionCode: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("used"),
      v.literal("expired"),
      v.literal("refunded")
    ),
    purchasedAt: v.number(),
    redeemedAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_opportunityId", ["opportunityId"])
    .index("by_userId", ["userId"])
    .index("by_businessId", ["businessId"])
    .index("by_redemptionCode", ["redemptionCode"])
    .index("by_status", ["status"]),

  // Cotizaciones de monedas en tiempo real
  exchangeRates: defineTable({
    fromCurrency: v.union(v.literal("USD"), v.literal("COP")),
    toCurrency: v.union(v.literal("USD"), v.literal("COP")),
    rate: v.number(),
    source: v.string(), // API que proporciona la cotización
    lastUpdated: v.number(),
    isActive: v.boolean(),
  })
    .index("by_currencies", ["fromCurrency", "toCurrency"])
    .index("by_lastUpdated", ["lastUpdated"])
    .index("by_isActive", ["isActive"]),

  // Sistema de pujas mejorado para ofertas de trabajo
  enhancedBids: defineTable({
    jobOfferId: v.id("jobOffers"),
    handymanId: v.id("users"),
    bidAmount: v.number(),
    currency: v.union(v.literal("USD"), v.literal("COP")),
    bidAmountUSD: v.number(), // Convertido a USD para comparaciones
    bidAmountCOP: v.number(), // Convertido a COP para comparaciones
    exchangeRateUsed: v.number(),
    message: v.string(),
    estimatedDuration: v.string(),
    proposedStartDate: v.number(),
    availability: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("outbid"), // Superado por otra puja
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    isCurrentHighest: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_jobOfferId", ["jobOfferId"])
    .index("by_handymanId", ["handymanId"])
    .index("by_status", ["status"])
    .index("by_bidAmountUSD", ["bidAmountUSD"]) // Para encontrar pujas más altas
    .index("by_isCurrentHighest", ["isCurrentHighest"])
    .index("by_createdAt", ["createdAt"]),

  // Recomendaciones automáticas de precios para clientes
  priceRecommendations: defineTable({
    jobOfferId: v.id("jobOffers"),
    averageBidUSD: v.number(),
    averageBidCOP: v.number(),
    highestBidUSD: v.number(),
    highestBidCOP: v.number(),
    lowestBidUSD: v.number(),
    lowestBidCOP: v.number(),
    recommendedBudgetUSD: v.number(), // Precio recomendado basado en pujas
    recommendedBudgetCOP: v.number(),
    totalBids: v.number(),
    qualityScore: v.number(), // Score basado en ratings de handymen
    marketTrend: v.union(v.literal("low"), v.literal("average"), v.literal("high")),
    lastCalculated: v.number(),
  })
    .index("by_jobOfferId", ["jobOfferId"])
    .index("by_lastCalculated", ["lastCalculated"]),
});