import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nueva OFERTA DE TRABAJO (con categorías, precio fijo o pujas)
export const createJobOffer = mutation({
  args: {
    clientId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    jobType: v.union(v.literal("fixed_price"), v.literal("bids_allowed")),
    budget: v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    }),
    fixedPrice: v.optional(v.number()),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    requiredSkills: v.array(v.string()),
    estimatedDuration: v.string(),
    images: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.number()),
    deadline: v.optional(v.number()),
    acceptsBids: v.boolean(),
    targetCategories: v.array(v.string()), // Categorías específicas a notificar
    alertStartDelay: v.optional(v.number()), // Minutos después de crear para empezar alertas
    alertDurationHours: v.optional(v.number()), // Cuántas horas enviar alertas
  },
  handler: async (ctx, args) => {
    const { alertStartDelay, alertDurationHours, ...jobOfferData } = args;
    const now = Date.now();
    const alertDelay = alertStartDelay || 5; // Default 5 minutos
    const alertDuration = alertDurationHours || 24; // Default 24 horas
    const alertStartTime = now + (alertDelay * 60 * 1000);
    const alertEndTime = args.deadline || (now + (alertDuration * 60 * 60 * 1000));
    
    // Obtener información del cliente
    const client = await ctx.db.get(args.clientId);
    if (!client || !client.location) {
      throw new Error("Client not found or location not set");
    }

    // Validar que si es precio fijo, se proporcione el precio
    if (args.jobType === "fixed_price" && !args.fixedPrice) {
      throw new Error("Fixed price is required for fixed price jobs");
    }

    const jobOfferId = await ctx.db.insert("jobOffers", {
      ...jobOfferData,
      location: client.location,
      status: "open",
      alertStartTime,
      alertEndTime: Math.min(alertEndTime, args.deadline || alertEndTime),
      createdAt: now,
      updatedAt: now,
    });
    
    return jobOfferId;
  },
});

// Obtener ofertas de trabajo cerca de una ubicación para categorías específicas
export const getNearbyJobOffers = query({
  args: {
    userLatitude: v.number(),
    userLongitude: v.number(),
    city: v.string(),
    country: v.string(),
    userSkills: v.array(v.string()),
    userCategories: v.array(v.string()), // Categorías del handyman
    jobType: v.optional(v.union(v.literal("fixed_price"), v.literal("bids_allowed"))),
    urgency: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    radius: v.optional(v.number()), // Radio personalizado
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const searchRadius = args.radius || 25; // Default 25km
    
    // Obtener ofertas abiertas que no han expirado
    let jobOffers = await ctx.db
      .query("jobOffers")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => 
        args.deadline ? q.gt(q.field("deadline"), now) : q.neq(q.field("deadline"), undefined)
      )
      .collect();

    // Filtrar por tipo de trabajo si se especifica
    if (args.jobType) {
      jobOffers = jobOffers.filter(job => job.jobType === args.jobType);
    }

    // Filtrar por urgencia si se especifica
    if (args.urgency) {
      jobOffers = jobOffers.filter(job => job.urgency === args.urgency);
    }

    // Filtrar por ubicación y relevancia
    const relevantJobs = jobOffers
      .filter(job => job.location.city === args.city && job.location.country === args.country)
      .map(job => {
        // Calcular distancia
        const distance = calculateDistance(
          args.userLatitude,
          args.userLongitude,
          job.location.latitude,
          job.location.longitude
        );

        if (distance > searchRadius) return null;

        // Verificar si coincide con categorías del usuario
        const matchesCategory = job.targetCategories.length === 0 || 
          job.targetCategories.some(cat => args.userCategories.includes(cat));

        // Verificar habilidades
        const hasRequiredSkills = job.requiredSkills.length === 0 ||
          job.requiredSkills.some(skill => 
            args.userSkills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            )
          );

        if (matchesCategory && hasRequiredSkills) {
          // Calcular puntuación de relevancia
          let relevanceScore = 0;
          
          // Puntuación por proximidad (más cerca = mejor)
          relevanceScore += Math.max(0, 100 - (distance * 4));
          
          // Puntuación por urgencia
          const urgencyScores = { low: 10, medium: 20, high: 30 };
          relevanceScore += urgencyScores[job.urgency];
          
          // Puntuación por coincidencia de habilidades
          const skillMatches = job.requiredSkills.filter(skill => 
            args.userSkills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase())
            )
          ).length;
          relevanceScore += skillMatches * 15;

          return {
            ...job,
            distance,
            relevanceScore,
            timeToDeadline: job.deadline ? job.deadline - now : null,
          };
        }

        return null;
      })
      .filter(job => job !== null);

    // Obtener información del cliente y propuestas existentes
    const jobsWithDetails = await Promise.all(
      relevantJobs.map(async (job) => {
        const client = await ctx.db.get(job.clientId);
        
        // Contar propuestas si acepta pujas
        let proposalsCount = 0;
        if (job.acceptsBids) {
          const proposals = await ctx.db
            .query("jobProposals")
            .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", job._id))
            .collect();
          proposalsCount = proposals.length;
        }

        return { ...job, client, proposalsCount };
      })
    );

    // Ordenar por relevancia
    const sortedJobs = jobsWithDetails.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limitar resultados
    if (args.limit) {
      return sortedJobs.slice(0, args.limit);
    }

    return sortedJobs;
  },
});

// Obtener ofertas de trabajo que necesitan alertas push por categoría
export const getJobOffersForAlerts = query({
  args: {
    city: v.string(),
    country: v.string(),
    targetCategory: v.string(), // Categoría específica para alertas
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Buscar ofertas que:
    // 1. Están abiertas
    // 2. Están en periodo de alertas
    // 3. Incluyen la categoría objetivo
    // 4. No han expirado
    const jobOffersForAlerts = await ctx.db
      .query("jobOffers")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => 
        q.and(
          q.lte(q.field("alertStartTime"), now),
          q.gte(q.field("alertEndTime"), now),
          args.deadline ? q.gt(q.field("deadline"), now) : q.neq(q.field("deadline"), undefined)
        )
      )
      .collect();

    // Filtrar por ubicación y categoría
    const relevantOffers = jobOffersForAlerts.filter(job =>
      job.location.city === args.city && 
      job.location.country === args.country &&
      (job.targetCategories.length === 0 || job.targetCategories.includes(args.targetCategory))
    );

    return relevantOffers;
  },
});

// Crear propuesta para oferta de trabajo (solo si acepta pujas)
export const createJobProposal = mutation({
  args: {
    jobOfferId: v.id("jobOffers"),
    handymanId: v.id("users"),
    message: v.string(),
    proposedRate: v.number(),
    estimatedTime: v.string(),
    availability: v.string(),
  },
  handler: async (ctx, args) => {
    const jobOffer = await ctx.db.get(args.jobOfferId);
    if (!jobOffer || jobOffer.status !== "open") {
      throw new Error("Job offer not available");
    }

    if (!jobOffer.acceptsBids) {
      throw new Error("This job offer does not accept bids");
    }

    // Verificar si el handyman ya tiene una propuesta
    const existingProposal = await ctx.db
      .query("jobProposals")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
      .filter((q) => q.eq(q.field("handymanId"), args.handymanId))
      .first();

    if (existingProposal) {
      throw new Error("You already have a proposal for this job");
    }

    const proposalId = await ctx.db.insert("jobProposals", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return proposalId;
  },
});

// Aceptar propuesta (para trabajos con pujas)
export const acceptJobProposal = mutation({
  args: {
    proposalId: v.id("jobProposals"),
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal || proposal.status !== "pending") {
      throw new Error("Proposal not available");
    }

    const jobOffer = await ctx.db.get(proposal.jobOfferId);
    if (!jobOffer || jobOffer.clientId !== args.clientId) {
      throw new Error("Job offer not found or access denied");
    }

    // Actualizar propuesta
    await ctx.db.patch(args.proposalId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Actualizar oferta de trabajo
    await ctx.db.patch(proposal.jobOfferId, {
      status: "in_progress",
      assignedTo: proposal.handymanId,
      updatedAt: Date.now(),
    });

    // Rechazar otras propuestas
    const otherProposals = await ctx.db
      .query("jobProposals")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", proposal.jobOfferId))
      .filter((q) => 
        q.and(
          q.neq(q.field("_id"), args.proposalId),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    await Promise.all(
      otherProposals.map(p => 
        ctx.db.patch(p._id, { status: "rejected", updatedAt: Date.now() })
      )
    );

    // Crear asignación
    const assignmentId = await ctx.db.insert("jobAssignments", {
      jobType: "job_offer",
      jobId: proposal.jobOfferId,
      handymanId: proposal.handymanId,
      clientId: args.clientId,
      status: "assigned",
      assignedAt: Date.now(),
    });

    return { success: true, assignmentId };
  },
});

// Asignar directamente oferta de precio fijo
export const assignFixedPriceJob = mutation({
  args: {
    jobOfferId: v.id("jobOffers"),
    handymanId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const jobOffer = await ctx.db.get(args.jobOfferId);
    if (!jobOffer || jobOffer.status !== "open") {
      throw new Error("Job offer not available");
    }

    if (jobOffer.jobType !== "fixed_price") {
      throw new Error("This is not a fixed price job");
    }

    // Actualizar oferta
    await ctx.db.patch(args.jobOfferId, {
      status: "in_progress",
      assignedTo: args.handymanId,
      updatedAt: Date.now(),
    });

    // Crear asignación
    const assignmentId = await ctx.db.insert("jobAssignments", {
      jobType: "job_offer",
      jobId: args.jobOfferId,
      handymanId: args.handymanId,
      clientId: jobOffer.clientId,
      status: "assigned",
      assignedAt: Date.now(),
    });

    return { success: true, assignmentId };
  },
});

// Obtener ofertas por cliente
export const getClientJobOffers = query({
  args: { clientId: v.id("users") },
  handler: async (ctx, args) => {
    const jobOffers = await ctx.db
      .query("jobOffers")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    return jobOffers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Obtener propuestas de una oferta
export const getJobOfferProposals = query({
  args: { jobOfferId: v.id("jobOffers") },
  handler: async (ctx, args) => {
    const proposals = await ctx.db
      .query("jobProposals")
      .withIndex("by_jobOfferId", (q) => q.eq("jobOfferId", args.jobOfferId))
      .collect();

    // Obtener información del handyman para cada propuesta
    const proposalsWithHandyman = await Promise.all(
      proposals.map(async (proposal) => {
        const handyman = await ctx.db.get(proposal.handymanId);
        return { ...proposal, handyman };
      })
    );

    return proposalsWithHandyman.sort((a, b) => b.createdAt - a.createdAt);
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