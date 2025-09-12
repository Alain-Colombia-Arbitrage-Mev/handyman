import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nueva oferta comercial
export const createCommercialOffer = mutation({
  args: {
    businessId: v.id("businesses"),
    title: v.string(),
    description: v.string(),
    discount: v.number(),
    originalPrice: v.optional(v.number()),
    discountedPrice: v.optional(v.number()),
    category: v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment")
    ),
    validUntil: v.number(),
    termsAndConditions: v.string(),
    targetRadius: v.number(),
    images: v.optional(v.array(v.string())),
    maxRedemptions: v.optional(v.number()),
    isFlashOffer: v.boolean(),
  },
  handler: async (ctx, args) => {
    const offerId = await ctx.db.insert("commercialOffers", {
      ...args,
      status: "active",
      currentRedemptions: 0,
      notificationsSent: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return offerId;
  },
});

// Obtener ofertas activas cerca de una ubicación
export const getNearbyOffers = query({
  args: {
    userLatitude: v.number(),
    userLongitude: v.number(),
    city: v.string(),
    country: v.string(),
    category: v.optional(v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment")
    )),
    isFlashOffer: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Obtener todas las ofertas activas que no han expirado
    let offers = await ctx.db
      .query("commercialOffers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.gt(q.field("validUntil"), now))
      .collect();

    // Filtrar por categoría
    if (args.category) {
      offers = offers.filter(offer => offer.category === args.category);
    }

    // Filtrar por tipo flash
    if (args.isFlashOffer !== undefined) {
      offers = offers.filter(offer => offer.isFlashOffer === args.isFlashOffer);
    }

    // Obtener información del negocio para cada oferta
    const offersWithBusinessInfo = await Promise.all(
      offers.map(async (offer) => {
        const business = await ctx.db.get(offer.businessId);
        if (!business) return null;

        // Calcular distancia aproximada
        const distance = calculateDistance(
          args.userLatitude,
          args.userLongitude,
          business.location.latitude,
          business.location.longitude
        );

        // Solo incluir ofertas dentro del radio objetivo
        if (distance <= offer.targetRadius) {
          return {
            ...offer,
            business,
            distance,
          };
        }
        return null;
      })
    );

    // Filtrar ofertas nulas y ordenar por distancia
    const validOffers = offersWithBusinessInfo
      .filter(offer => offer !== null)
      .sort((a, b) => a!.distance - b!.distance);

    // Limitar resultados
    if (args.limit) {
      return validOffers.slice(0, args.limit);
    }

    return validOffers;
  },
});

// Obtener ofertas flash para notificaciones
export const getFlashOffersForNotification = query({
  args: {
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneHourFromNow = now + (60 * 60 * 1000);

    // Buscar ofertas flash activas que expiran en la próxima hora y no han sido notificadas
    const flashOffers = await ctx.db
      .query("commercialOffers")
      .withIndex("by_isFlashOffer", (q) => q.eq("isFlashOffer", true))
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("notificationsSent"), false),
          q.gt(q.field("validUntil"), now),
          q.lt(q.field("validUntil"), oneHourFromNow)
        )
      )
      .collect();

    return flashOffers;
  },
});

// Canjear oferta comercial
export const redeemOffer = mutation({
  args: {
    offerId: v.id("commercialOffers"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer || offer.status !== "active") {
      throw new Error("Offer not available");
    }

    // Verificar si la oferta ha expirado
    if (offer.validUntil < Date.now()) {
      throw new Error("Offer has expired");
    }

    // Verificar límite de canjes
    if (offer.maxRedemptions && offer.currentRedemptions >= offer.maxRedemptions) {
      throw new Error("Maximum redemptions reached");
    }

    // Generar código de canje único
    const redemptionCode = generateRedemptionCode();

    // Crear canje
    const redemptionId = await ctx.db.insert("offerRedemptions", {
      offerId: args.offerId,
      userId: args.userId,
      businessId: offer.businessId,
      redemptionCode,
      status: "active",
      redeemedAt: undefined,
      expiresAt: offer.validUntil,
      createdAt: Date.now(),
    });

    // Actualizar contador de canjes
    await ctx.db.patch(args.offerId, {
      currentRedemptions: offer.currentRedemptions + 1,
      updatedAt: Date.now(),
    });

    return { redemptionId, redemptionCode };
  },
});

// Marcar ofertas como notificadas
export const markOffersAsNotified = mutation({
  args: {
    offerIds: v.array(v.id("commercialOffers")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.offerIds.map(offerId =>
        ctx.db.patch(offerId, {
          notificationsSent: true,
          updatedAt: Date.now(),
        })
      )
    );
  },
});

// Obtener canjes de un usuario
export const getUserRedemptions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const redemptions = await ctx.db
      .query("offerRedemptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Obtener información completa de cada canje
    const redemptionsWithDetails = await Promise.all(
      redemptions.map(async (redemption) => {
        const offer = await ctx.db.get(redemption.offerId);
        const business = await ctx.db.get(redemption.businessId);
        
        return {
          ...redemption,
          offer,
          business,
        };
      })
    );

    return redemptionsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Función auxiliar para calcular distancia
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Función auxiliar para generar código de canje
function generateRedemptionCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}