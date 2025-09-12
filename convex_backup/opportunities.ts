import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nueva OPORTUNIDAD (liquidación de última hora)
export const createOpportunity = mutation({
  args: {
    businessId: v.id("businesses"),
    title: v.string(),
    description: v.string(),
    originalPrice: v.number(),
    discountedPrice: v.number(),
    discount: v.number(),
    category: v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment"),
      v.literal("perishables")
    ),
    quantity: v.number(),
    images: v.array(v.string()),
    hoursAvailable: v.number(), // Cuántas horas estará disponible
    targetRadius: v.optional(v.number()), // Default 5km para liquidaciones
    alertStartImmediately: v.optional(v.boolean()), // Si empezar alertas de inmediato
  },
  handler: async (ctx, args) => {
    const { hoursAvailable, alertStartImmediately, targetRadius, ...opportunityData } = args;
    const now = Date.now();
    const availableUntil = now + (hoursAvailable * 60 * 60 * 1000);
    const alertStartTime = alertStartImmediately ? now : now + (30 * 60 * 1000); // 30 min después
    
    // Obtener información del negocio
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const opportunityId = await ctx.db.insert("opportunities", {
      ...opportunityData,
      location: business.location,
      availableUntil,
      remainingQuantity: args.quantity,
      targetRadius: targetRadius || 5, // Default 5km
      status: "active",
      notificationsSent: false,
      alertStartTime,
      createdAt: now,
      updatedAt: now,
    });
    
    return opportunityId;
  },
});

// Obtener oportunidades activas cerca de una ubicación
export const getNearbyOpportunities = query({
  args: {
    userLatitude: v.number(),
    userLongitude: v.number(),
    city: v.string(),
    country: v.string(),
    category: v.optional(v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment"),
      v.literal("perishables")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Obtener oportunidades activas que no han expirado
    let opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => 
        q.and(
          q.gt(q.field("availableUntil"), now),
          q.gt(q.field("remainingQuantity"), 0)
        )
      )
      .collect();

    // Filtrar por categoría si se especifica
    if (args.category) {
      opportunities = opportunities.filter(opp => opp.category === args.category);
    }

    // Filtrar por ciudad/país y calcular distancia
    const opportunitiesWithDistance = opportunities
      .filter(opp => 
        opp.location.city === args.city && opp.location.country === args.country
      )
      .map(opp => {
        const distance = calculateDistance(
          args.userLatitude,
          args.userLongitude,
          opp.location.latitude,
          opp.location.longitude
        );

        if (distance <= opp.targetRadius) {
          return {
            ...opp,
            distance,
            timeRemaining: opp.availableUntil - now,
            business: null, // Será llenado después
          };
        }
        return null;
      })
      .filter(opp => opp !== null);

    // Obtener información del negocio para cada oportunidad
    const opportunitiesWithBusiness = await Promise.all(
      opportunitiesWithDistance.map(async (opp) => {
        const business = await ctx.db.get(opp.businessId);
        return { ...opp, business };
      })
    );

    // Ordenar por tiempo restante (más urgentes primero)
    const sortedOpportunities = opportunitiesWithBusiness
      .sort((a, b) => a.timeRemaining - b.timeRemaining);

    // Limitar resultados
    if (args.limit) {
      return sortedOpportunities.slice(0, args.limit);
    }

    return sortedOpportunities;
  },
});

// Obtener oportunidades que necesitan alertas push
export const getOpportunitiesForAlerts = query({
  args: {
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Buscar oportunidades activas que:
    // 1. Ya es tiempo de enviar alertas
    // 2. No han sido notificadas
    // 3. Están disponibles
    const opportunitiesForAlerts = await ctx.db
      .query("opportunities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => 
        q.and(
          q.eq(q.field("notificationsSent"), false),
          q.lte(q.field("alertStartTime"), now),
          q.gt(q.field("availableUntil"), now),
          q.gt(q.field("remainingQuantity"), 0)
        )
      )
      .collect();

    // Filtrar por ubicación
    const localOpportunities = opportunitiesForAlerts.filter(opp =>
      opp.location.city === args.city && opp.location.country === args.country
    );

    return localOpportunities;
  },
});

// Tomar/Comprar una oportunidad
export const takeOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
    quantityTaken: v.number(),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity || opportunity.status !== "active") {
      throw new Error("Opportunity not available");
    }

    // Verificar si aún hay tiempo
    if (opportunity.availableUntil < Date.now()) {
      throw new Error("Opportunity has expired");
    }

    // Verificar si hay suficiente cantidad
    if (args.quantityTaken > opportunity.remainingQuantity) {
      throw new Error("Not enough quantity available");
    }

    const newRemainingQuantity = opportunity.remainingQuantity - args.quantityTaken;

    // Generar código de canje
    const redemptionCode = generateRedemptionCode();

    // Crear registro de compra
    const purchaseId = await ctx.db.insert("opportunityPurchases", {
      opportunityId: args.opportunityId,
      userId: args.userId,
      businessId: opportunity.businessId,
      quantityPurchased: args.quantityTaken,
      totalPaid: opportunity.discountedPrice * args.quantityTaken,
      redemptionCode,
      status: "active",
      purchasedAt: Date.now(),
      expiresAt: opportunity.availableUntil,
    });

    // Actualizar cantidad restante
    await ctx.db.patch(args.opportunityId, {
      remainingQuantity: newRemainingQuantity,
      status: newRemainingQuantity === 0 ? "sold_out" : "active",
      updatedAt: Date.now(),
    });

    return { purchaseId, redemptionCode };
  },
});

// Marcar oportunidades como notificadas
export const markOpportunitiesAsNotified = mutation({
  args: {
    opportunityIds: v.array(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.opportunityIds.map(id =>
        ctx.db.patch(id, {
          notificationsSent: true,
          updatedAt: Date.now(),
        })
      )
    );
  },
});

// Finalizar oportunidades expiradas
export const finalizeExpiredOpportunities = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredOpportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.lt(q.field("availableUntil"), now))
      .collect();

    const results = [];
    for (const opportunity of expiredOpportunities) {
      await ctx.db.patch(opportunity._id, {
        status: "expired",
        updatedAt: now,
      });

      results.push({
        opportunityId: opportunity._id,
        status: "expired",
        remainingQuantity: opportunity.remainingQuantity,
      });
    }

    return results;
  },
});

// Obtener oportunidades por negocio
export const getBusinessOpportunities = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("opportunities")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();
  },
});

// Obtener estadísticas de oportunidades
export const getOpportunitiesStats = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    category: v.optional(v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment"),
      v.literal("perishables")
    )),
  },
  handler: async (ctx, args) => {
    let opportunities = await ctx.db.query("opportunities").collect();

    if (args.businessId) {
      opportunities = opportunities.filter(opp => opp.businessId === args.businessId);
    }

    if (args.category) {
      opportunities = opportunities.filter(opp => opp.category === args.category);
    }

    const stats = {
      total: opportunities.length,
      active: opportunities.filter(o => o.status === "active").length,
      expired: opportunities.filter(o => o.status === "expired").length,
      soldOut: opportunities.filter(o => o.status === "sold_out").length,
      totalValue: opportunities.reduce((sum, o) => sum + (o.originalPrice * (o.quantity - o.remainingQuantity)), 0),
      totalDiscount: opportunities.reduce((sum, o) => sum + ((o.originalPrice - o.discountedPrice) * (o.quantity - o.remainingQuantity)), 0),
      avgDiscountPercent: 0,
    };

    if (opportunities.length > 0) {
      stats.avgDiscountPercent = opportunities.reduce((sum, o) => sum + o.discount, 0) / opportunities.length;
    }

    return stats;
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