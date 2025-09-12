import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Crear nuevo negocio
export const createBusiness = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const businessId = await ctx.db.insert("businesses", {
      ...args,
      rating: 0,
      totalReviews: 0,
      isVerified: false,
      status: "inactive", // Requiere verificación
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return businessId;
  },
});

// Obtener negocios cerca de una ubicación
export const getNearbyBusinesses = query({
  args: {
    userLatitude: v.number(),
    userLongitude: v.number(),
    city: v.string(),
    country: v.string(),
    category: v.optional(v.union(
      v.literal("restaurant"), 
      v.literal("retail_store"), 
      v.literal("service_provider"),
      v.literal("entertainment"),
      v.literal("supermarket")
    )),
    radius: v.optional(v.number()), // en kilómetros
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 10; // Default 10km
    
    // Obtener todos los negocios activos de la ciudad
    let businesses = await ctx.db
      .query("businesses")
      .withIndex("by_location", (q) => 
        q.eq("location.city", args.city).eq("location.country", args.country)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Filtrar por categoría si se especifica
    if (args.category) {
      businesses = businesses.filter(business => business.category === args.category);
    }

    // Calcular distancia y filtrar por radio
    const businessesWithDistance = businesses
      .map(business => {
        const distance = calculateDistance(
          args.userLatitude,
          args.userLongitude,
          business.location.latitude,
          business.location.longitude
        );

        return distance <= radius ? { ...business, distance } : null;
      })
      .filter(business => business !== null)
      .sort((a, b) => a!.distance - b!.distance);

    // Limitar resultados
    if (args.limit) {
      return businessesWithDistance.slice(0, args.limit);
    }

    return businessesWithDistance;
  },
});

// Obtener negocios de un propietario
export const getBusinessesByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

// Actualizar información del negocio
export const updateBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    contactInfo: v.optional(v.object({
      phone: v.string(),
      email: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
    businessHours: v.optional(v.object({
      monday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      tuesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      wednesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      thursday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      friday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      saturday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      sunday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
    })),
  },
  handler: async (ctx, args) => {
    const { businessId, ...updates } = args;
    
    await ctx.db.patch(businessId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Verificar negocio (solo para administradores)
export const verifyBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    isVerified: v.boolean(),
    verificationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.businessId, {
      isVerified: args.isVerified,
      status: args.isVerified ? "active" : "inactive",
      updatedAt: Date.now(),
    });

    // TODO: Enviar notificación al propietario del negocio
  },
});

// Obtener estadísticas de un negocio
export const getBusinessStats = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) return null;

    // Contar ofertas comerciales activas
    const activeOffers = await ctx.db
      .query("commercialOffers")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Contar subastas activas
    const activeAuctions = await ctx.db
      .query("surplusAuctions")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Contar canjes totales
    const totalRedemptions = await ctx.db
      .query("offerRedemptions")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();

    return {
      business,
      stats: {
        activeOffers: activeOffers.length,
        activeAuctions: activeAuctions.length,
        totalRedemptions: totalRedemptions.length,
        totalOffers: activeOffers.reduce((sum, offer) => sum + offer.currentRedemptions, 0),
      }
    };
  },
});

// Obtener negocios que están cerca de cerrar (para ofertas flash)
export const getBusinessesNearClosing = query({
  args: {
    city: v.string(),
    country: v.string(),
    category: v.optional(v.union(
      v.literal("restaurant"), 
      v.literal("retail_store"), 
      v.literal("supermarket")
    )),
    hoursBeforeClosing: v.optional(v.number()), // Horas antes del cierre
  },
  handler: async (ctx, args) => {
    const hoursBeforeClosing = args.hoursBeforeClosing || 2; // Default 2 horas
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()] as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Obtener negocios de la ciudad
    let businesses = await ctx.db
      .query("businesses")
      .withIndex("by_location", (q) => 
        q.eq("location.city", args.city).eq("location.country", args.country)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Filtrar por categoría si se especifica
    if (args.category) {
      businesses = businesses.filter(business => business.category === args.category);
    }

    // Filtrar negocios que están cerca de cerrar
    const businessesNearClosing = businesses.filter(business => {
      const businessHours = business.businessHours;
      const todayHours = businessHours[currentDay];
      
      if (!todayHours || todayHours.closed) {
        return false;
      }

      // Parsear hora de cierre
      const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
      const closeTimeInMinutes = closeHour * 60 + closeMinute;
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const hoursBeforeClosingInMinutes = hoursBeforeClosing * 60;

      // Verificar si está dentro del rango de cierre
      return (closeTimeInMinutes - currentTimeInMinutes) <= hoursBeforeClosingInMinutes &&
             (closeTimeInMinutes - currentTimeInMinutes) > 0;
    });

    return businessesNearClosing;
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