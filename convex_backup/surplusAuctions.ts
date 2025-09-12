import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nueva subasta de excedentes
export const createSurplusAuction = mutation({
  args: {
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
    minimumBid: v.number(),
    originalValue: v.number(),
    condition: v.union(
      v.literal("new"), 
      v.literal("like_new"), 
      v.literal("good"), 
      v.literal("fair")
    ),
    images: v.array(v.string()),
    durationHours: v.number(), // Duración de la subasta en horas
  },
  handler: async (ctx, args) => {
    const { durationHours, ...auctionData } = args;
    const now = Date.now();
    const endsAt = now + (durationHours * 60 * 60 * 1000);

    const auctionId = await ctx.db.insert("surplusAuctions", {
      ...auctionData,
      currentBid: args.minimumBid,
      endsAt,
      status: "active",
      bidders: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return auctionId;
  },
});

// Obtener subastas activas cerca de una ubicación
export const getNearbyActiveAuctions = query({
  args: {
    userLatitude: v.number(),
    userLongitude: v.number(),
    city: v.string(),
    country: v.string(),
    category: v.optional(v.union(
      v.literal("food"), 
      v.literal("machinery"), 
      v.literal("clothing"), 
      v.literal("electronics"), 
      v.literal("furniture")
    )),
    radius: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 25; // Default 25km para subastas
    const now = Date.now();
    
    // Obtener subastas activas que no han expirado
    let auctions = await ctx.db
      .query("surplusAuctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.gt(q.field("endsAt"), now))
      .collect();

    // Filtrar por categoría si se especifica
    if (args.category) {
      auctions = auctions.filter(auction => auction.category === args.category);
    }

    // Obtener información del negocio para cada subasta y calcular distancia
    const auctionsWithBusinessInfo = await Promise.all(
      auctions.map(async (auction) => {
        const business = await ctx.db.get(auction.businessId);
        if (!business || business.location.city !== args.city || business.location.country !== args.country) {
          return null;
        }

        const distance = calculateDistance(
          args.userLatitude,
          args.userLongitude,
          business.location.latitude,
          business.location.longitude
        );

        if (distance <= radius) {
          return {
            ...auction,
            business,
            distance,
            timeRemaining: auction.endsAt - now,
          };
        }
        return null;
      })
    );

    // Filtrar subastas nulas y ordenar por tiempo restante
    const validAuctions = auctionsWithBusinessInfo
      .filter(auction => auction !== null)
      .sort((a, b) => a!.timeRemaining - b!.timeRemaining);

    // Limitar resultados
    if (args.limit) {
      return validAuctions.slice(0, args.limit);
    }

    return validAuctions;
  },
});

// Realizar una puja
export const placeBid = mutation({
  args: {
    auctionId: v.id("surplusAuctions"),
    bidderId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction || auction.status !== "active") {
      throw new Error("Auction not available");
    }

    // Verificar si la subasta ha expirado
    if (auction.endsAt < Date.now()) {
      throw new Error("Auction has ended");
    }

    // Verificar que la puja sea mayor que la actual
    if (args.amount <= auction.currentBid) {
      throw new Error("Bid must be higher than current bid");
    }

    // Marcar todas las pujas anteriores como no ganadoras
    const previousBids = await ctx.db
      .query("auctionBids")
      .withIndex("by_auctionId", (q) => q.eq("auctionId", args.auctionId))
      .filter((q) => q.eq(q.field("isWinning"), true))
      .collect();

    await Promise.all(
      previousBids.map(bid =>
        ctx.db.patch(bid._id, { isWinning: false })
      )
    );

    // Crear nueva puja
    const bidId = await ctx.db.insert("auctionBids", {
      auctionId: args.auctionId,
      bidderId: args.bidderId,
      amount: args.amount,
      timestamp: Date.now(),
      isWinning: true,
    });

    // Verificar si es un nuevo pujador
    const existingBids = await ctx.db
      .query("auctionBids")
      .withIndex("by_auctionId", (q) => q.eq("auctionId", args.auctionId))
      .filter((q) => q.eq(q.field("bidderId"), args.bidderId))
      .collect();

    const isNewBidder = existingBids.length === 1; // Solo la puja actual

    // Actualizar subasta
    await ctx.db.patch(args.auctionId, {
      currentBid: args.amount,
      highestBidderId: args.bidderId,
      bidders: isNewBidder ? auction.bidders + 1 : auction.bidders,
      updatedAt: Date.now(),
    });

    // TODO: Notificar a otros pujadores que fueron superados
    // TODO: Si quedan menos de 5 minutos, extender tiempo automáticamente

    return { bidId, newHighestBid: args.amount };
  },
});

// Obtener historial de pujas de una subasta
export const getAuctionBids = query({
  args: { auctionId: v.id("surplusAuctions") },
  handler: async (ctx, args) => {
    const bids = await ctx.db
      .query("auctionBids")
      .withIndex("by_auctionId", (q) => q.eq("auctionId", args.auctionId))
      .collect();

    // Obtener información del pujador para cada puja
    const bidsWithBidderInfo = await Promise.all(
      bids.map(async (bid) => {
        const bidder = await ctx.db.get(bid.bidderId);
        return {
          ...bid,
          bidder: bidder ? {
            id: bidder._id,
            name: bidder.name,
            avatar: bidder.avatar,
            rating: bidder.rating,
          } : null,
        };
      })
    );

    return bidsWithBidderInfo.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Finalizar subastas expiradas
export const finalizeExpiredAuctions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredAuctions = await ctx.db
      .query("surplusAuctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.lt(q.field("endsAt"), now))
      .collect();

    const results = [];

    for (const auction of expiredAuctions) {
      const winningBid = await ctx.db
        .query("auctionBids")
        .withIndex("by_auctionId", (q) => q.eq("auctionId", auction._id))
        .filter((q) => q.eq(q.field("isWinning"), true))
        .first();

      if (winningBid) {
        // Marcar como vendida
        await ctx.db.patch(auction._id, {
          status: "sold",
          updatedAt: now,
        });

        // TODO: Crear orden de compra
        // TODO: Notificar al ganador y al vendedor

        results.push({
          auctionId: auction._id,
          status: "sold",
          winnerId: winningBid.bidderId,
          finalPrice: winningBid.amount,
        });
      } else {
        // Marcar como terminada sin ventas
        await ctx.db.patch(auction._id, {
          status: "ended",
          updatedAt: now,
        });

        results.push({
          auctionId: auction._id,
          status: "ended",
          winnerId: null,
          finalPrice: 0,
        });
      }
    }

    return results;
  },
});

// Obtener subastas de un negocio
export const getBusinessAuctions = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surplusAuctions")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();
  },
});

// Obtener subastas en las que un usuario ha pujado
export const getUserBidAuctions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userBids = await ctx.db
      .query("auctionBids")
      .withIndex("by_bidderId", (q) => q.eq("bidderId", args.userId))
      .collect();

    // Obtener información de cada subasta
    const auctionsWithBidInfo = await Promise.all(
      userBids.map(async (bid) => {
        const auction = await ctx.db.get(bid.auctionId);
        if (!auction) return null;

        const business = await ctx.db.get(auction.businessId);
        
        return {
          auction,
          business,
          userBid: bid,
          isWinning: bid.isWinning,
        };
      })
    );

    return auctionsWithBidInfo
      .filter(item => item !== null)
      .sort((a, b) => b!.userBid.timestamp - a!.userBid.timestamp);
  },
});

// Obtener estadísticas de subastas
export const getAuctionStats = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    category: v.optional(v.union(
      v.literal("food"), 
      v.literal("machinery"), 
      v.literal("clothing"), 
      v.literal("electronics"), 
      v.literal("furniture")
    )),
  },
  handler: async (ctx, args) => {
    let auctions = await ctx.db.query("surplusAuctions").collect();

    // Filtrar por negocio si se especifica
    if (args.businessId) {
      auctions = auctions.filter(auction => auction.businessId === args.businessId);
    }

    // Filtrar por categoría si se especifica
    if (args.category) {
      auctions = auctions.filter(auction => auction.category === args.category);
    }

    const stats = {
      total: auctions.length,
      active: auctions.filter(a => a.status === "active").length,
      sold: auctions.filter(a => a.status === "sold").length,
      ended: auctions.filter(a => a.status === "ended").length,
      totalValue: auctions.reduce((sum, a) => sum + (a.status === "sold" ? a.currentBid : 0), 0),
      totalOriginalValue: auctions.reduce((sum, a) => sum + a.originalValue, 0),
      avgSalePrice: 0,
      avgDiscountPercent: 0,
    };

    const soldAuctions = auctions.filter(a => a.status === "sold");
    if (soldAuctions.length > 0) {
      stats.avgSalePrice = stats.totalValue / soldAuctions.length;
      stats.avgDiscountPercent = soldAuctions.reduce((sum, a) => {
        const discountPercent = ((a.originalValue - a.currentBid) / a.originalValue) * 100;
        return sum + discountPercent;
      }, 0) / soldAuctions.length;
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