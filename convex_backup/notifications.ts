import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear notificación
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("opportunity"), // Oportunidades de liquidación
      v.literal("flash_job"), // Trabajos flash urgentes
      v.literal("job_offer"), // Ofertas de trabajo normales
      v.literal("proposal_received"),
      v.literal("job_assigned"),
      v.literal("message"),
      v.literal("commercial_offer"),
      v.literal("flash_offer"),
      v.literal("surplus_auction"),
      v.literal("document_verification"),
      v.literal("system")
    ),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
    
    // TODO: Enviar push notification usando Firebase
    
    return notificationId;
  },
});

// Obtener notificaciones de un usuario
export const getUserNotifications = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false));
    }

    let notifications = await query.collect();

    // Ordenar por fecha de creación (más recientes primero)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    // Limitar resultados
    if (args.limit) {
      notifications = notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

// Marcar notificación como leída
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      unreadNotifications.map(notification =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );
  },
});

// Contar notificaciones no leídas
export const getUnreadNotificationsCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  },
});

// Enviar notificaciones de ofertas flash
export const sendFlashOfferNotifications = mutation({
  args: {
    city: v.string(),
    country: v.string(),
    userLatitude: v.number(),
    userLongitude: v.number(),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 15; // Default 15km

    // Obtener ofertas flash que necesitan ser notificadas
    const flashOffers = await ctx.db
      .query("commercialOffers")
      .withIndex("by_isFlashOffer", (q) => q.eq("isFlashOffer", true))
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("notificationsSent"), false),
          q.gt(q.field("validUntil"), Date.now())
        )
      )
      .collect();

    if (flashOffers.length === 0) return { notificationsSent: 0 };

    // Obtener usuarios activos de la ciudad que tienen notificaciones habilitadas
    const users = await ctx.db
      .query("users")
      .withIndex("by_location", (q) => 
        q.eq("location.city", args.city).eq("location.country", args.country)
      )
      .filter((q) => q.eq(q.field("isOnline"), true))
      .collect();

    let notificationsSent = 0;

    for (const offer of flashOffers) {
      const business = await ctx.db.get(offer.businessId);
      if (!business) continue;

      // Calcular qué usuarios están dentro del radio de la oferta
      const eligibleUsers = users.filter(user => {
        if (!user.location) return false;
        
        const distance = calculateDistance(
          user.location.latitude,
          user.location.longitude,
          business.location.latitude,
          business.location.longitude
        );
        
        return distance <= Math.min(offer.targetRadius, radius);
      });

      // Crear notificaciones para usuarios elegibles
      for (const user of eligibleUsers) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          title: "🔥 Oferta Flash Disponible",
          message: `${business.name}: ${offer.title} - ${offer.discount}% de descuento`,
          type: "flash_offer",
          data: {
            offerId: offer._id,
            businessId: business._id,
            businessName: business.name,
            discount: offer.discount,
            validUntil: offer.validUntil,
          },
          isRead: false,
          createdAt: Date.now(),
        });
        
        notificationsSent++;
      }

      // Marcar oferta como notificada
      await ctx.db.patch(offer._id, {
        notificationsSent: true,
        updatedAt: Date.now(),
      });
    }

    return { notificationsSent, offersProcessed: flashOffers.length };
  },
});

// Enviar notificaciones de nuevas subastas
export const sendAuctionNotifications = mutation({
  args: {
    auctionId: v.id("surplusAuctions"),
    city: v.string(),
    country: v.string(),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 20; // Default 20km para subastas
    
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) return { notificationsSent: 0 };

    const business = await ctx.db.get(auction.businessId);
    if (!business) return { notificationsSent: 0 };

    // Obtener usuarios interesados en subastas de la ciudad
    const users = await ctx.db
      .query("users")
      .withIndex("by_location", (q) => 
        q.eq("location.city", args.city).eq("location.country", args.country)
      )
      .filter((q) => q.eq(q.field("isOnline"), true))
      .collect();

    let notificationsSent = 0;

    for (const user of users) {
      if (!user.location) continue;

      const distance = calculateDistance(
        user.location.latitude,
        user.location.longitude,
        business.location.latitude,
        business.location.longitude
      );

      if (distance <= radius) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          title: "🔥 Nueva Subasta de Excedentes",
          message: `${business.name}: ${auction.title} - Desde $${auction.minimumBid}`,
          type: "surplus_auction",
          data: {
            auctionId: auction._id,
            businessId: business._id,
            businessName: business.name,
            category: auction.category,
            minimumBid: auction.minimumBid,
            endsAt: auction.endsAt,
          },
          isRead: false,
          createdAt: Date.now(),
        });
        
        notificationsSent++;
      }
    }

    return { notificationsSent };
  },
});

// Enviar notificaciones de OPORTUNIDADES por ubicación
export const sendOpportunityNotifications = mutation({
  args: {
    city: v.string(),
    country: v.string(),
    category: v.optional(v.union(
      v.literal("food"), 
      v.literal("retail"), 
      v.literal("services"), 
      v.literal("entertainment"),
      v.literal("perishables")
    )),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 10; // Default 10km para oportunidades
    
    // Obtener oportunidades que necesitan notificaciones
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => 
        q.and(
          q.eq(q.field("notificationsSent"), false),
          q.lte(q.field("alertStartTime"), Date.now()),
          q.gt(q.field("availableUntil"), Date.now())
        )
      )
      .collect();

    if (opportunities.length === 0) return { notificationsSent: 0 };

    // Filtrar por categoría si se especifica
    let filteredOpportunities = opportunities;
    if (args.category) {
      filteredOpportunities = opportunities.filter(opp => opp.category === args.category);
    }

    // Obtener usuarios activos de la ciudad
    const users = await ctx.db
      .query("users")
      .withIndex("by_location", (q) => 
        q.eq("location.city", args.city).eq("location.country", args.country)
      )
      .filter((q) => q.eq(q.field("isOnline"), true))
      .collect();

    let notificationsSent = 0;

    for (const opportunity of filteredOpportunities) {
      const business = await ctx.db.get(opportunity.businessId);
      if (!business) continue;

      for (const user of users) {
        if (!user.location) continue;

        const distance = calculateDistance(
          user.location.latitude,
          user.location.longitude,
          opportunity.location.latitude,
          opportunity.location.longitude
        );

        if (distance <= Math.min(opportunity.targetRadius, radius)) {
          await ctx.db.insert("notifications", {
            userId: user._id,
            title: "🎯 Oportunidad de Liquidación",
            message: `${business.name}: ${opportunity.title} - ${opportunity.discount}% OFF`,
            type: "opportunity",
            data: {
              opportunityId: opportunity._id,
              businessId: business._id,
              businessName: business.name,
              discount: opportunity.discount,
              category: opportunity.category,
              availableUntil: opportunity.availableUntil,
            },
            isRead: false,
            createdAt: Date.now(),
          });
          
          notificationsSent++;
        }
      }

      // Marcar como notificada
      await ctx.db.patch(opportunity._id, {
        notificationsSent: true,
        updatedAt: Date.now(),
      });
    }

    return { notificationsSent };
  },
});

// Enviar notificaciones de TRABAJOS FLASH por categoría específica
export const sendFlashJobNotifications = mutation({
  args: {
    city: v.string(),
    country: v.string(),
    category: v.string(), // Categoría específica del trabajo
  },
  handler: async (ctx, args) => {
    // Obtener trabajos flash que necesitan notificaciones para esa categoría
    const flashJobs = await ctx.db
      .query("flashJobs")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "open"),
          q.eq(q.field("notificationsSent"), false),
          q.lte(q.field("alertStartTime"), Date.now()),
          q.gte(q.field("alertEndTime"), Date.now())
        )
      )
      .collect();

    if (flashJobs.length === 0) return { notificationsSent: 0 };

    // Obtener handymen activos con esa categoría específica
    const handymenProfiles = await ctx.db
      .query("handymanProfiles")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    let notificationsSent = 0;

    for (const flashJob of flashJobs) {
      // Filtrar handymen de la misma ciudad
      const eligibleHandymen = [];
      
      for (const profile of handymenProfiles) {
        const handyman = await ctx.db.get(profile.userId);
        if (!handyman || !handyman.location || !handyman.isOnline) continue;
        
        // Verificar ubicación
        if (handyman.location.city !== args.city || handyman.location.country !== args.country) continue;
        
        // Verificar si tiene las habilidades o categoría
        const hasCategory = profile.skills.some(skill => 
          skill.toLowerCase().includes(args.category.toLowerCase()) ||
          args.category.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Verificar habilidades específicas
        const hasRequiredSkills = flashJob.requiredSkills.length === 0 ||
          flashJob.requiredSkills.some(skill => 
            profile.skills.some(handymanSkill => 
              handymanSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );

        if (hasCategory || hasRequiredSkills) {
          const distance = calculateDistance(
            handyman.location.latitude,
            handyman.location.longitude,
            flashJob.location.latitude,
            flashJob.location.longitude
          );

          if (distance <= flashJob.targetRadius) {
            eligibleHandymen.push({ handyman, profile, distance });
          }
        }
      }

      // Enviar notificaciones a handymen elegibles
      for (const { handyman, distance } of eligibleHandymen) {
        await ctx.db.insert("notifications", {
          userId: handyman._id,
          title: "⚡ Trabajo Flash Urgente",
          message: `${flashJob.title} - $${flashJob.fixedPrice} ${flashJob.currency}`,
          type: "flash_job",
          data: {
            flashJobId: flashJob._id,
            title: flashJob.title,
            category: flashJob.category,
            fixedPrice: flashJob.fixedPrice,
            urgency: flashJob.urgency,
            deadline: flashJob.deadline,
            distance: Math.round(distance * 10) / 10,
          },
          isRead: false,
          createdAt: Date.now(),
        });
        
        notificationsSent++;
      }

      // Marcar como notificado
      await ctx.db.patch(flashJob._id, {
        notificationsSent: true,
        updatedAt: Date.now(),
      });
    }

    return { notificationsSent };
  },
});

// Enviar notificaciones de OFERTAS DE TRABAJO por categorías específicas
export const sendJobOfferNotifications = mutation({
  args: {
    city: v.string(),
    country: v.string(),
    targetCategories: v.array(v.string()), // Categorías específicas
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Obtener ofertas que necesitan notificaciones para esas categorías
    const jobOffers = await ctx.db
      .query("jobOffers")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => 
        q.and(
          q.lte(q.field("alertStartTime"), now),
          q.gte(q.field("alertEndTime"), now)
        )
      )
      .collect();

    // Filtrar ofertas que incluyan las categorías objetivo
    const relevantOffers = jobOffers.filter(job =>
      job.location.city === args.city && 
      job.location.country === args.country &&
      (job.targetCategories.length === 0 || 
       job.targetCategories.some(cat => args.targetCategories.includes(cat)))
    );

    if (relevantOffers.length === 0) return { notificationsSent: 0 };

    // Obtener handymen activos con esas categorías
    const handymenProfiles = await ctx.db
      .query("handymanProfiles")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    let notificationsSent = 0;

    for (const jobOffer of relevantOffers) {
      for (const profile of handymenProfiles) {
        const handyman = await ctx.db.get(profile.userId);
        if (!handyman || !handyman.location || !handyman.isOnline) continue;
        
        // Verificar ubicación
        if (handyman.location.city !== args.city || handyman.location.country !== args.country) continue;
        
        // Verificar si tiene las categorías o habilidades
        const matchesCategory = jobOffer.targetCategories.length === 0 ||
          jobOffer.targetCategories.some(cat => 
            profile.skills.some(skill => 
              skill.toLowerCase().includes(cat.toLowerCase()) ||
              cat.toLowerCase().includes(skill.toLowerCase())
            )
          );

        const hasRequiredSkills = jobOffer.requiredSkills.length === 0 ||
          jobOffer.requiredSkills.some(skill => 
            profile.skills.some(handymanSkill => 
              handymanSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );

        if (matchesCategory && hasRequiredSkills) {
          const distance = calculateDistance(
            handyman.location.latitude,
            handyman.location.longitude,
            jobOffer.location.latitude,
            jobOffer.location.longitude
          );

          // Usar radio personalizado o default 25km
          if (distance <= 25) {
            const priceInfo = jobOffer.jobType === "fixed_price" 
              ? `$${jobOffer.fixedPrice} ${jobOffer.budget.currency}`
              : `$${jobOffer.budget.min}-${jobOffer.budget.max} ${jobOffer.budget.currency}`;

            await ctx.db.insert("notifications", {
              userId: handyman._id,
              title: "💼 Nueva Oferta de Trabajo",
              message: `${jobOffer.title} - ${priceInfo}`,
              type: "job_offer",
              data: {
                jobOfferId: jobOffer._id,
                title: jobOffer.title,
                category: jobOffer.category,
                jobType: jobOffer.jobType,
                budget: jobOffer.budget,
                fixedPrice: jobOffer.fixedPrice,
                urgency: jobOffer.urgency,
                acceptsBids: jobOffer.acceptsBids,
                distance: Math.round(distance * 10) / 10,
              },
              isRead: false,
              createdAt: Date.now(),
            });
            
            notificationsSent++;
          }
        }
      }
    }

    return { notificationsSent };
  },
});

// Enviar notificación de verificación de documento
export const sendDocumentVerificationNotification = mutation({
  args: {
    userId: v.id("users"),
    documentType: v.string(),
    verificationStatus: v.union(
      v.literal("approved"),
      v.literal("rejected")
    ),
    verificationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = args.verificationStatus === "approved" 
      ? "✅ Documento Aprobado" 
      : "❌ Documento Rechazado";

    const message = args.verificationStatus === "approved"
      ? `Tu ${args.documentType} ha sido verificado y aprobado`
      : `Tu ${args.documentType} fue rechazado. ${args.verificationNotes || 'Revisa los requisitos'}`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title,
      message,
      type: "document_verification",
      data: {
        documentType: args.documentType,
        verificationStatus: args.verificationStatus,
        verificationNotes: args.verificationNotes,
      },
      isRead: false,
      createdAt: Date.now(),
    });
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