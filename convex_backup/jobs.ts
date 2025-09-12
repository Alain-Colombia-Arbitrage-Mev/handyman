import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nuevo trabajo
export const createJob = mutation({
  args: {
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
    requiredSkills: v.array(v.string()),
    estimatedDuration: v.string(),
    images: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.number()),
    isFlashJob: v.boolean(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      status: "open",
      assignedTo: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return jobId;
  },
});

// Obtener trabajos disponibles
export const getAvailableJobs = query({
  args: {
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    category: v.optional(v.string()),
    urgency: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"), 
      v.literal("high"),
      v.literal("urgent")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"));

    let jobs = await query.collect();

    // Filtrar por ubicación
    if (args.city && args.country) {
      jobs = jobs.filter(job => 
        job.location.city === args.city && job.location.country === args.country
      );
    }

    // Filtrar por categoría
    if (args.category) {
      jobs = jobs.filter(job => job.category === args.category);
    }

    // Filtrar por urgencia
    if (args.urgency) {
      jobs = jobs.filter(job => job.urgency === args.urgency);
    }

    // Ordenar por fecha de creación (más recientes primero)
    jobs.sort((a, b) => b.createdAt - a.createdAt);

    // Limitar resultados
    if (args.limit) {
      jobs = jobs.slice(0, args.limit);
    }

    return jobs;
  },
});

// Obtener trabajos flash (urgentes)
export const getFlashJobs = query({
  args: {
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("jobs")
      .withIndex("by_isFlashJob", (q) => q.eq("isFlashJob", true))
      .filter((q) => q.eq(q.field("status"), "open"))
      .collect();

    // Filtrar por ubicación
    if (args.city && args.country) {
      jobs = jobs.filter(job => 
        job.location.city === args.city && job.location.country === args.country
      );
    }

    // Ordenar por urgencia y fecha
    jobs.sort((a, b) => {
      const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aUrgency = urgencyOrder[a.urgency];
      const bUrgency = urgencyOrder[b.urgency];
      
      if (aUrgency !== bUrgency) {
        return bUrgency - aUrgency;
      }
      
      return b.createdAt - a.createdAt;
    });

    // Limitar resultados
    if (args.limit) {
      jobs = jobs.slice(0, args.limit);
    }

    return jobs;
  },
});

// Obtener trabajo por ID
export const getJobById = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Obtener trabajos de un cliente
export const getJobsByClient = query({
  args: { 
    clientId: v.id("users"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("jobs")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    if (args.status) {
      jobs = jobs.filter(job => job.status === args.status);
    }

    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Obtener trabajos asignados a un profesional
export const getJobsByHandyman = query({
  args: { 
    handymanId: v.id("users"),
    status: v.optional(v.union(
      v.literal("in_progress"),
      v.literal("completed")
    )),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("jobs")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.handymanId))
      .collect();

    if (args.status) {
      jobs = jobs.filter(job => job.status === args.status);
    }

    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Asignar trabajo a un profesional
export const assignJob = mutation({
  args: {
    jobId: v.id("jobs"),
    handymanId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      assignedTo: args.handymanId,
      status: "in_progress",
      updatedAt: Date.now(),
    });
  },
});

// Actualizar estado del trabajo
export const updateJobStatus = mutation({
  args: {
    jobId: v.id("jobs"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Buscar trabajos por texto
export const searchJobs = query({
  args: {
    searchText: v.string(),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    // Filtrar por ubicación
    if (args.city && args.country) {
      jobs = jobs.filter(job => 
        job.location.city === args.city && job.location.country === args.country
      );
    }

    // Buscar en título y descripción
    const searchLower = args.searchText.toLowerCase();
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      job.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))
    );

    // Ordenar por relevancia (más recientes primero)
    jobs.sort((a, b) => b.createdAt - a.createdAt);

    // Limitar resultados
    if (args.limit) {
      jobs = jobs.slice(0, args.limit);
    }

    return jobs;
  },
});