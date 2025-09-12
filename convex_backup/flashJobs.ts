import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear nuevo TRABAJO FLASH (urgente con precio fijo)
export const createFlashJob = mutation({
  args: {
    clientId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    fixedPrice: v.number(),
    currency: v.string(),
    requiredSkills: v.array(v.string()),
    urgency: v.union(v.literal("high"), v.literal("urgent")),
    estimatedDuration: v.string(),
    scheduledFor: v.number(), // Timestamp de cuándo debe ejecutarse
    deadline: v.number(), // Timestamp límite
    images: v.optional(v.array(v.string())),
    targetRadius: v.optional(v.number()), // Default 15km para trabajos flash
    alertDurationHours: v.optional(v.number()), // Cuántas horas enviar alertas
  },
  handler: async (ctx, args) => {
    const { alertDurationHours, targetRadius, ...flashJobData } = args;
    const now = Date.now();
    const alertDuration = alertDurationHours || 4; // Default 4 horas
    const alertEndTime = Math.min(args.deadline, now + (alertDuration * 60 * 60 * 1000));
    
    // Obtener información del cliente
    const client = await ctx.db.get(args.clientId);
    if (!client || !client.location) {
      throw new Error("Client not found or location not set");
    }

    const flashJobId = await ctx.db.insert("flashJobs", {
      ...flashJobData,
      location: client.location,
      targetRadius: targetRadius || 15, // Default 15km para urgentes
      status: "open",
      notificationsSent: false,
      alertStartTime: now, // Empezar alertas inmediatamente
      alertEndTime,
      createdAt: now,
      updatedAt: now,
    });
    
    return flashJobId;
  },
});

// Obtener trabajos flash activos cerca de una ubicación y categorías específicas
export const getNearbyFlashJobs = query({
  args: {
    userLatitude: v.number(),
    userLongitude: v.number(),
    city: v.string(),
    country: v.string(),
    userSkills: v.array(v.string()), // Habilidades del handyman
    categories: v.optional(v.array(v.string())), // Categorías específicas del usuario
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Obtener trabajos flash abiertos que no han expirado
    let flashJobs = await ctx.db
      .query("flashJobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => q.gt(q.field("deadline"), now))
      .collect();

    // Filtrar por ubicación (ciudad/país)
    flashJobs = flashJobs.filter(job => 
      job.location.city === args.city && job.location.country === args.country
    );

    // Filtrar trabajos que el usuario puede realizar
    const matchingJobs = flashJobs
      .map(job => {
        // Calcular distancia
        const distance = calculateDistance(
          args.userLatitude,
          args.userLongitude,
          job.location.latitude,
          job.location.longitude
        );

        // Verificar si está dentro del radio
        if (distance > job.targetRadius) return null;

        // Verificar si el usuario tiene las habilidades requeridas
        const hasRequiredSkills = job.requiredSkills.some(skill => 
          args.userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );

        // Verificar si está en las categorías del usuario
        const matchesCategory = !args.categories || args.categories.length === 0 || 
          args.categories.includes(job.category);

        if (hasRequiredSkills && matchesCategory) {
          return {
            ...job,
            distance,
            timeToDeadline: job.deadline - now,
            timeToScheduled: job.scheduledFor - now,
          };
        }

        return null;
      })
      .filter(job => job !== null);

    // Obtener información del cliente para cada trabajo
    const jobsWithClientInfo = await Promise.all(
      matchingJobs.map(async (job) => {
        const client = await ctx.db.get(job.clientId);
        return { ...job, client };
      })
    );

    // Ordenar por urgencia y tiempo restante
    const sortedJobs = jobsWithClientInfo.sort((a, b) => {
      // Primero por urgencia
      if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
      if (b.urgency === "urgent" && a.urgency !== "urgent") return 1;
      
      // Luego por tiempo hasta deadline
      return a.timeToDeadline - b.timeToDeadline;
    });

    // Limitar resultados
    if (args.limit) {
      return sortedJobs.slice(0, args.limit);
    }

    return sortedJobs;
  },
});

// Obtener trabajos flash que necesitan alertas push
export const getFlashJobsForAlerts = query({
  args: {
    city: v.string(),
    country: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Buscar trabajos flash que:
    // 1. Están abiertos
    // 2. No han sido notificados
    // 3. Están en periodo de alerta
    // 4. No han expirado
    let flashJobsForAlerts = await ctx.db
      .query("flashJobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => 
        q.and(
          q.eq(q.field("notificationsSent"), false),
          q.lte(q.field("alertStartTime"), now),
          q.gte(q.field("alertEndTime"), now),
          q.gt(q.field("deadline"), now)
        )
      )
      .collect();

    // Filtrar por ubicación
    flashJobsForAlerts = flashJobsForAlerts.filter(job =>
      job.location.city === args.city && job.location.country === args.country
    );

    // Filtrar por categoría si se especifica
    if (args.category) {
      flashJobsForAlerts = flashJobsForAlerts.filter(job => job.category === args.category);
    }

    return flashJobsForAlerts;
  },
});

// Asignar trabajo flash a un handyman
export const assignFlashJob = mutation({
  args: {
    flashJobId: v.id("flashJobs"),
    handymanId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const flashJob = await ctx.db.get(args.flashJobId);
    if (!flashJob || flashJob.status !== "open") {
      throw new Error("Flash job not available");
    }

    // Verificar si no ha expirado
    if (flashJob.deadline < Date.now()) {
      throw new Error("Flash job has expired");
    }

    // Actualizar estado del trabajo
    await ctx.db.patch(args.flashJobId, {
      status: "assigned",
      assignedTo: args.handymanId,
      updatedAt: Date.now(),
    });

    // Crear asignación
    const assignmentId = await ctx.db.insert("jobAssignments", {
      jobType: "flash_job",
      jobId: args.flashJobId,
      handymanId: args.handymanId,
      clientId: flashJob.clientId,
      status: "assigned",
      assignedAt: Date.now(),
    });

    return { assignmentId, flashJobId: args.flashJobId };
  },
});

// Aceptar trabajo flash asignado
export const acceptFlashJob = mutation({
  args: {
    flashJobId: v.id("flashJobs"),
    handymanId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const flashJob = await ctx.db.get(args.flashJobId);
    if (!flashJob || flashJob.status !== "assigned" || flashJob.assignedTo !== args.handymanId) {
      throw new Error("Flash job not assigned to this handyman");
    }

    // Actualizar trabajo
    await ctx.db.patch(args.flashJobId, {
      status: "in_progress",
      updatedAt: Date.now(),
    });

    // Actualizar asignación
    const assignment = await ctx.db
      .query("jobAssignments")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.flashJobId))
      .filter((q) => q.eq(q.field("handymanId"), args.handymanId))
      .first();

    if (assignment) {
      await ctx.db.patch(assignment._id, {
        status: "accepted",
        acceptedAt: Date.now(),
        notes: args.notes,
      });
    }

    return { success: true };
  },
});

// Completar trabajo flash
export const completeFlashJob = mutation({
  args: {
    flashJobId: v.id("flashJobs"),
    handymanId: v.id("users"),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const flashJob = await ctx.db.get(args.flashJobId);
    if (!flashJob || flashJob.assignedTo !== args.handymanId) {
      throw new Error("Flash job not assigned to this handyman");
    }

    if (flashJob.status !== "in_progress") {
      throw new Error("Flash job is not in progress");
    }

    const now = Date.now();

    // Actualizar trabajo
    await ctx.db.patch(args.flashJobId, {
      status: "completed",
      updatedAt: now,
    });

    // Actualizar asignación
    const assignment = await ctx.db
      .query("jobAssignments")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.flashJobId))
      .filter((q) => q.eq(q.field("handymanId"), args.handymanId))
      .first();

    if (assignment) {
      await ctx.db.patch(assignment._id, {
        status: "completed",
        completedAt: now,
        notes: `${assignment.notes || ""}\nCompletion: ${args.completionNotes || ""}`,
      });
    }

    return { success: true, completedAt: now };
  },
});

// Marcar trabajos flash como notificados
export const markFlashJobsAsNotified = mutation({
  args: {
    flashJobIds: v.array(v.id("flashJobs")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.flashJobIds.map(id =>
        ctx.db.patch(id, {
          notificationsSent: true,
          updatedAt: Date.now(),
        })
      )
    );
  },
});

// Obtener trabajos flash por cliente
export const getClientFlashJobs = query({
  args: { clientId: v.id("users") },
  handler: async (ctx, args) => {
    const flashJobs = await ctx.db
      .query("flashJobs")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    return flashJobs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Obtener trabajos flash asignados a un handyman
export const getHandymanFlashJobs = query({
  args: { handymanId: v.id("users") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("jobAssignments")
      .withIndex("by_handymanId", (q) => q.eq("handymanId", args.handymanId))
      .filter((q) => q.eq(q.field("jobType"), "flash_job"))
      .collect();

    const flashJobsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const flashJob = await ctx.db.get(assignment.jobId as any);
        const client = flashJob ? await ctx.db.get(flashJob.clientId) : null;
        
        return {
          assignment,
          flashJob,
          client,
        };
      })
    );

    return flashJobsWithDetails.sort((a, b) => b.assignment.assignedAt - a.assignment.assignedAt);
  },
});

// Finalizar trabajos flash expirados
export const finalizeExpiredFlashJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredFlashJobs = await ctx.db
      .query("flashJobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .filter((q) => q.lt(q.field("deadline"), now))
      .collect();

    const results = [];
    for (const flashJob of expiredFlashJobs) {
      await ctx.db.patch(flashJob._id, {
        status: "expired",
        updatedAt: now,
      });

      results.push({
        flashJobId: flashJob._id,
        status: "expired",
        title: flashJob.title,
      });
    }

    return results;
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