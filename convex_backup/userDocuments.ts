import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Subir documento de usuario
export const uploadUserDocument = mutation({
  args: {
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
    expirationDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verificar si ya existe un documento del mismo tipo para este usuario
    const existingDoc = await ctx.db
      .query("userDocuments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("documentType"), args.documentType))
      .first();

    if (existingDoc) {
      // Actualizar documento existente
      await ctx.db.patch(existingDoc._id, {
        documentUrl: args.documentUrl,
        expirationDate: args.expirationDate,
        verificationStatus: "pending",
        uploadedAt: Date.now(),
        verifiedAt: undefined,
        verifiedBy: undefined,
        verificationNotes: undefined,
      });
      return existingDoc._id;
    } else {
      // Crear nuevo documento
      const documentId = await ctx.db.insert("userDocuments", {
        ...args,
        verificationStatus: "pending",
        uploadedAt: Date.now(),
      });
      return documentId;
    }
  },
});

// Obtener documentos de un usuario
export const getUserDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userDocuments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Verificar documento (solo para administradores)
export const verifyDocument = mutation({
  args: {
    documentId: v.id("userDocuments"),
    verificationStatus: v.union(
      v.literal("approved"),
      v.literal("rejected")
    ),
    verificationNotes: v.optional(v.string()),
    verifiedBy: v.id("users"), // ID del administrador
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      verificationStatus: args.verificationStatus,
      verificationNotes: args.verificationNotes,
      verifiedBy: args.verifiedBy,
      verifiedAt: Date.now(),
    });

    // Obtener información del documento y usuario para notificación
    const document = await ctx.db.get(args.documentId);
    if (document) {
      // TODO: Enviar notificación al usuario sobre el estado de verificación
      
      // Si todos los documentos requeridos están aprobados, marcar usuario como verificado
      if (args.verificationStatus === "approved") {
        await checkAndUpdateUserVerificationStatus(ctx, document.userId);
      }
    }
  },
});

// Obtener documentos pendientes de verificación
export const getPendingDocuments = query({
  args: {
    documentType: v.optional(v.union(
      v.literal("national_id"),
      v.literal("criminal_background_check"),
      v.literal("professional_license"),
      v.literal("certification"),
      v.literal("insurance_policy"),
      v.literal("tax_id")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("userDocuments")
      .withIndex("by_verificationStatus", (q) => q.eq("verificationStatus", "pending"));

    if (args.documentType) {
      query = query.filter((q) => q.eq(q.field("documentType"), args.documentType));
    }

    let documents = await query.collect();

    // Obtener información del usuario para cada documento
    const documentsWithUserInfo = await Promise.all(
      documents.map(async (doc) => {
        const user = await ctx.db.get(doc.userId);
        return { ...doc, user };
      })
    );

    // Ordenar por fecha de subida (más recientes primero)
    documentsWithUserInfo.sort((a, b) => b.uploadedAt - a.uploadedAt);

    // Limitar resultados si se especifica
    if (args.limit) {
      return documentsWithUserInfo.slice(0, args.limit);
    }

    return documentsWithUserInfo;
  },
});

// Obtener estadísticas de documentos
export const getDocumentsStats = query({
  args: {},
  handler: async (ctx) => {
    const allDocuments = await ctx.db.query("userDocuments").collect();
    
    const stats = {
      total: allDocuments.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      byType: {
        national_id: 0,
        criminal_background_check: 0,
        professional_license: 0,
        certification: 0,
        insurance_policy: 0,
        tax_id: 0,
      }
    };

    const now = Date.now();
    
    allDocuments.forEach(doc => {
      // Contar por estado
      stats[doc.verificationStatus]++;
      
      // Contar expirados
      if (doc.expirationDate && doc.expirationDate < now) {
        stats.expired++;
      }
      
      // Contar por tipo
      stats.byType[doc.documentType]++;
    });

    return stats;
  },
});

// Verificar si usuario tiene documentos requeridos
export const checkUserDocumentRequirements = query({
  args: { 
    userId: v.id("users"),
    userType: v.union(v.literal("client"), v.literal("handyman"))
  },
  handler: async (ctx, args) => {
    const userDocuments = await ctx.db
      .query("userDocuments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("verificationStatus"), "approved"))
      .collect();

    // Documentos requeridos según tipo de usuario
    const requiredDocuments = {
      client: ["national_id"],
      handyman: [
        "national_id", 
        "criminal_background_check",
        "professional_license", // O certification
        "insurance_policy"
      ]
    };

    const required = requiredDocuments[args.userType];
    const userDocTypes = userDocuments.map(doc => doc.documentType);
    
    const missing = required.filter(docType => {
      if (docType === "professional_license") {
        // Para handyman, puede ser professional_license O certification
        return !userDocTypes.includes("professional_license") && 
               !userDocTypes.includes("certification");
      }
      return !userDocTypes.includes(docType);
    });

    return {
      hasAllRequired: missing.length === 0,
      missing,
      submitted: userDocTypes,
      canBeVerified: missing.length === 0
    };
  },
});

// Crear certificación profesional
export const createProfessionalCertification = mutation({
  args: {
    handymanId: v.id("users"),
    certificationName: v.string(),
    issuingOrganization: v.string(),
    issueDate: v.number(),
    expirationDate: v.optional(v.number()),
    certificateUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const certificationId = await ctx.db.insert("professionalCertifications", {
      ...args,
      verificationStatus: "pending",
      createdAt: Date.now(),
    });
    
    return certificationId;
  },
});

// Obtener certificaciones de un profesional
export const getHandymanCertifications = query({
  args: { handymanId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("professionalCertifications")
      .withIndex("by_handymanId", (q) => q.eq("handymanId", args.handymanId))
      .collect();
  },
});

// Verificar certificación profesional
export const verifyCertification = mutation({
  args: {
    certificationId: v.id("professionalCertifications"),
    verificationStatus: v.union(
      v.literal("verified"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.certificationId, {
      verificationStatus: args.verificationStatus,
    });
  },
});

// Función auxiliar para verificar y actualizar estado de verificación del usuario
async function checkAndUpdateUserVerificationStatus(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return;

  const documentRequirements = await checkUserDocumentRequirements(ctx, {
    userId,
    userType: user.userType
  });

  if (documentRequirements.canBeVerified) {
    await ctx.db.patch(userId, {
      isVerified: true,
      updatedAt: Date.now(),
    });
  }
}

// Obtener documentos que están próximos a expirar
export const getExpiringDocuments = query({
  args: {
    daysBeforeExpiration: v.optional(v.number()), // Días antes de expiración
  },
  handler: async (ctx, args) => {
    const daysBeforeExpiration = args.daysBeforeExpiration || 30; // Default 30 días
    const now = Date.now();
    const expirationThreshold = now + (daysBeforeExpiration * 24 * 60 * 60 * 1000);

    const expiringDocuments = await ctx.db
      .query("userDocuments")
      .withIndex("by_expirationDate")
      .filter((q) => 
        q.and(
          q.neq(q.field("expirationDate"), undefined),
          q.gt(q.field("expirationDate"), now),
          q.lt(q.field("expirationDate"), expirationThreshold),
          q.eq(q.field("verificationStatus"), "approved")
        )
      )
      .collect();

    // Obtener información del usuario para cada documento
    const documentsWithUserInfo = await Promise.all(
      expiringDocuments.map(async (doc) => {
        const user = await ctx.db.get(doc.userId);
        const daysUntilExpiration = Math.ceil((doc.expirationDate! - now) / (24 * 60 * 60 * 1000));
        return { ...doc, user, daysUntilExpiration };
      })
    );

    return documentsWithUserInfo.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
  },
});