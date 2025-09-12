import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Crear nueva puja con conversión automática de moneda
export const createEnhancedBid = mutation({
  args: {
    jobOfferId: v.id("jobOffers"),
    handymanId: v.id("users"),
    bidAmount: v.number(),
    currency: v.union(v.literal("USD"), v.literal("COP")),
    message: v.string(),
    estimatedDuration: v.string(),
    proposedStartDate: v.number(),
    availability: v.string(),
  },
  handler: async (ctx, args) => {
    const jobOffer = await ctx.db.get(args.jobOfferId);
    if (!jobOffer || jobOffer.status !== "open" || !jobOffer.acceptsBids) {
      throw new Error("Job offer does not accept bids or is not available");
    }

    // Verificar si el handyman ya tiene una puja activa
    const existingBid = await ctx.db
      .query("enhancedBids")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
      .filter((q) => 
        q.and(
          q.eq(q.field("handymanId"), args.handymanId),
          q.eq(q.field("status"), "active")
        )
      )
      .first();

    if (existingBid) {
      throw new Error("You already have an active bid for this job");
    }

    // Obtener tasa de cambio actual
    const exchangeRateToUSD = await getExchangeRate(ctx, args.currency, "USD");
    const exchangeRateToCOP = await getExchangeRate(ctx, args.currency, "COP");

    // Convertir a ambas monedas
    const bidAmountUSD = args.currency === "USD" ? args.bidAmount : args.bidAmount * exchangeRateToUSD;
    const bidAmountCOP = args.currency === "COP" ? args.bidAmount : args.bidAmount * exchangeRateToCOP;

    // Verificar si esta puja es más alta que las existentes
    const currentHighestBid = await ctx.db
      .query("enhancedBids")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("isCurrentHighest"), true)
        )
      )
      .first();

    const isCurrentHighest = !currentHighestBid || bidAmountUSD > currentHighestBid.bidAmountUSD;

    // Si esta puja es la más alta, marcar la anterior como superada
    if (isCurrentHighest && currentHighestBid) {
      await ctx.db.patch(currentHighestBid._id, {
        status: "outbid",
        isCurrentHighest: false,
        updatedAt: Date.now(),
      });
    }

    // Crear nueva puja
    const bidId = await ctx.db.insert("enhancedBids", {
      jobOfferId: args.jobOfferId,
      handymanId: args.handymanId,
      bidAmount: args.bidAmount,
      currency: args.currency,
      bidAmountUSD,
      bidAmountCOP,
      exchangeRateUsed: args.currency === "USD" ? exchangeRateToCOP : exchangeRateToUSD,
      message: args.message,
      estimatedDuration: args.estimatedDuration,
      proposedStartDate: args.proposedStartDate,
      availability: args.availability,
      status: "active",
      isCurrentHighest,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Actualizar recomendaciones de precio
    await updatePriceRecommendations(ctx, args.jobOfferId);

    // Notificar al cliente si es una puja nueva más alta
    if (isCurrentHighest) {
      const handyman = await ctx.db.get(args.handymanId);
      await ctx.db.insert("notifications", {
        userId: jobOffer.clientId,
        title: "💰 Nueva Puja Más Alta",
        message: `${handyman?.name} pujó ${formatCurrency(args.bidAmount, args.currency)} por "${jobOffer.title}"`,
        type: "proposal_received",
        data: {
          bidId,
          jobOfferId: args.jobOfferId,
          handymanId: args.handymanId,
          bidAmount: args.bidAmount,
          currency: args.currency,
          bidAmountUSD,
          bidAmountCOP,
        },
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { bidId, isCurrentHighest, bidAmountUSD, bidAmountCOP };
  },
});

// Obtener pujas de una oferta de trabajo con detalles
export const getJobOfferBids = query({
  args: { 
    jobOfferId: v.id("jobOffers"),
    includeOutbid: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let bidsQuery = ctx.db
      .query("enhancedBids")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId));

    if (!args.includeOutbid) {
      bidsQuery = bidsQuery.filter((q) => q.eq(q.field("status"), "active"));
    }

    const bids = await bidsQuery.collect();

    // Obtener información del handyman para cada puja
    const bidsWithHandymanInfo = await Promise.all(
      bids.map(async (bid) => {
        const handyman = await ctx.db.get(bid.handymanId);
        const handymanProfile = handyman ? await ctx.db
          .query("handymanProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", handyman._id))
          .first() : null;

        return {
          ...bid,
          handyman: handyman ? {
            id: handyman._id,
            name: handyman.name,
            avatar: handyman.avatar,
            rating: handyman.rating,
            totalJobs: handyman.totalJobs,
            isVerified: handyman.isVerified,
          } : null,
          handymanProfile: handymanProfile ? {
            skills: handymanProfile.skills,
            experience: handymanProfile.experience,
            hourlyRate: handymanProfile.hourlyRate,
          } : null,
        };
      })
    );

    // Ordenar por cantidad de puja (mayor primero)
    return bidsWithHandymanInfo.sort((a, b) => b.bidAmountUSD - a.bidAmountUSD);
  },
});

// Obtener recomendaciones de precio para el cliente
export const getPriceRecommendations = query({
  args: { jobOfferId: v.id("jobOffers") },
  handler: async (ctx, args) => {
    const recommendation = await ctx.db
      .query("priceRecommendations")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
      .first();

    if (!recommendation) {
      // Calcular recomendaciones iniciales
      await updatePriceRecommendations(ctx, args.jobOfferId);
      return await ctx.db
        .query("priceRecommendations")
        .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
        .first();
    }

    return recommendation;
  },
});

// Actualizar presupuesto basado en recomendaciones
export const updateJobOfferBudget = mutation({
  args: {
    jobOfferId: v.id("jobOffers"),
    clientId: v.id("users"),
    newBudgetMin: v.number(),
    newBudgetMax: v.number(),
    currency: v.union(v.literal("USD"), v.literal("COP")),
  },
  handler: async (ctx, args) => {
    const jobOffer = await ctx.db.get(args.jobOfferId);
    if (!jobOffer || jobOffer.clientId !== args.clientId) {
      throw new Error("Job offer not found or access denied");
    }

    // Convertir presupuesto a ambas monedas
    const exchangeRateToUSD = await getExchangeRate(ctx, args.currency, "USD");
    const exchangeRateToCOP = await getExchangeRate(ctx, args.currency, "COP");

    const budgetUSD = args.currency === "USD" ? 
      { min: args.newBudgetMin, max: args.newBudgetMax } :
      { 
        min: args.newBudgetMin * exchangeRateToUSD, 
        max: args.newBudgetMax * exchangeRateToUSD 
      };

    const budgetCOP = args.currency === "COP" ? 
      { min: args.newBudgetMin, max: args.newBudgetMax } :
      { 
        min: args.newBudgetMin * exchangeRateToCOP, 
        max: args.newBudgetMax * exchangeRateToCOP 
      };

    // Actualizar oferta de trabajo
    await ctx.db.patch(args.jobOfferId, {
      budget: {
        min: args.newBudgetMin,
        max: args.newBudgetMax,
        currency: args.currency,
      },
      updatedAt: Date.now(),
    });

    // Notificar a pujadores activos sobre el nuevo presupuesto
    const activeBids = await ctx.db
      .query("enhancedBids")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const bid of activeBids) {
      const handyman = await ctx.db.get(bid.handymanId);
      if (handyman) {
        await ctx.db.insert("notifications", {
          userId: handyman._id,
          title: "💰 Presupuesto Actualizado",
          message: `El presupuesto para "${jobOffer.title}" se actualizó a ${formatCurrency(args.newBudgetMin, args.currency)} - ${formatCurrency(args.newBudgetMax, args.currency)}`,
          type: "system",
          data: {
            jobOfferId: args.jobOfferId,
            newBudget: {
              min: args.newBudgetMin,
              max: args.newBudgetMax,
              currency: args.currency,
            },
            budgetUSD,
            budgetCOP,
          },
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true, budgetUSD, budgetCOP };
  },
});

// Aceptar puja específica
export const acceptBid = mutation({
  args: {
    bidId: v.id("enhancedBids"),
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const bid = await ctx.db.get(args.bidId);
    if (!bid || bid.status !== "active") {
      throw new Error("Bid not available");
    }

    const jobOffer = await ctx.db.get(bid.jobOfferId);
    if (!jobOffer || jobOffer.clientId !== args.clientId) {
      throw new Error("Job offer not found or access denied");
    }

    // Actualizar puja como aceptada
    await ctx.db.patch(args.bidId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Actualizar oferta de trabajo
    await ctx.db.patch(bid.jobOfferId, {
      status: "in_progress",
      assignedTo: bid.handymanId,
      updatedAt: Date.now(),
    });

    // Rechazar todas las otras pujas
    const otherBids = await ctx.db
      .query("enhancedBids")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", bid.jobOfferId))
      .filter((q) => 
        q.and(
          q.neq(q.field("_id"), args.bidId),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    await Promise.all(
      otherBids.map(b => 
        ctx.db.patch(b._id, { 
          status: "rejected", 
          isCurrentHighest: false,
          updatedAt: Date.now() 
        })
      )
    );

    // Crear asignación de trabajo
    const assignmentId = await ctx.db.insert("jobAssignments", {
      jobType: "job_offer",
      jobId: bid.jobOfferId,
      handymanId: bid.handymanId,
      clientId: args.clientId,
      status: "assigned",
      assignedAt: Date.now(),
    });

    // Notificar al handyman ganador
    const handyman = await ctx.db.get(bid.handymanId);
    if (handyman) {
      await ctx.db.insert("notifications", {
        userId: handyman._id,
        title: "🎉 ¡Puja Aceptada!",
        message: `Tu puja de ${formatCurrency(bid.bidAmount, bid.currency)} para "${jobOffer.title}" fue aceptada`,
        type: "job_assigned",
        data: {
          jobOfferId: bid.jobOfferId,
          bidId: args.bidId,
          bidAmount: bid.bidAmount,
          currency: bid.currency,
          assignmentId,
        },
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true, assignmentId };
  },
});

// Funciones auxiliares
async function getExchangeRate(ctx: QueryCtx, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  const rate = await ctx.db
    .query("exchangeRates")
    .withIndex("by_currencies", (q) => 
      q.eq("fromCurrency", fromCurrency).eq("toCurrency", toCurrency)
    )
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();

  if (!rate) {
    // Valores por defecto
    return fromCurrency === "USD" ? 4000 : 0.00025;
  }

  return rate.rate;
}

async function updatePriceRecommendations(ctx: MutationCtx, jobOfferId: string) {
  const bids = await ctx.db
    .query("enhancedBids")
    .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", jobOfferId))
    .filter((q) => q.eq(q.field("status"), "active"))
    .collect();

  if (bids.length === 0) {
    return; // No hay pujas para calcular recomendaciones
  }

  const bidAmountsUSD = bids.map(bid => bid.bidAmountUSD);
  const bidAmountsCOP = bids.map(bid => bid.bidAmountCOP);

  const averageBidUSD = bidAmountsUSD.reduce((sum, amount) => sum + amount, 0) / bids.length;
  const averageBidCOP = bidAmountsCOP.reduce((sum, amount) => sum + amount, 0) / bids.length;
  const highestBidUSD = Math.max(...bidAmountsUSD);
  const highestBidCOP = Math.max(...bidAmountsCOP);
  const lowestBidUSD = Math.min(...bidAmountsUSD);
  const lowestBidCOP = Math.min(...bidAmountsCOP);

  // Calcular quality score basado en ratings de handymen
  let totalRating = 0;
  let ratedHandymen = 0;
  for (const bid of bids) {
    const handyman = await ctx.db.get(bid.handymanId);
    if (handyman && handyman.rating) {
      totalRating += handyman.rating;
      ratedHandymen++;
    }
  }
  const qualityScore = ratedHandymen > 0 ? totalRating / ratedHandymen : 3.5;

  // Calcular presupuesto recomendado (promedio + 15% si calidad es alta)
  const qualityMultiplier = qualityScore > 4.0 ? 1.15 : qualityScore > 3.5 ? 1.05 : 1.0;
  const recommendedBudgetUSD = Math.round(averageBidUSD * qualityMultiplier);
  const recommendedBudgetCOP = Math.round(averageBidCOP * qualityMultiplier);

  // Determinar tendencia del mercado
  let marketTrend: "low" | "average" | "high" = "average";
  if (averageBidUSD > highestBidUSD * 0.8) marketTrend = "high";
  else if (averageBidUSD < lowestBidUSD * 1.2) marketTrend = "low";

  // Actualizar o crear recomendación
  const existingRecommendation = await ctx.db
    .query("priceRecommendations")
    .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", jobOfferId))
    .first();

  const recommendationData = {
    jobOfferId,
    averageBidUSD: Math.round(averageBidUSD),
    averageBidCOP: Math.round(averageBidCOP),
    highestBidUSD: Math.round(highestBidUSD),
    highestBidCOP: Math.round(highestBidCOP),
    lowestBidUSD: Math.round(lowestBidUSD),
    lowestBidCOP: Math.round(lowestBidCOP),
    recommendedBudgetUSD,
    recommendedBudgetCOP,
    totalBids: bids.length,
    qualityScore: Math.round(qualityScore * 100) / 100,
    marketTrend,
    lastCalculated: Date.now(),
  };

  if (existingRecommendation) {
    await ctx.db.patch(existingRecommendation._id, recommendationData);
  } else {
    await ctx.db.insert("priceRecommendations", recommendationData);
  }
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${amount.toLocaleString('es-CO')} COP`;
  }
}