import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Función para generar URL de subida
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    // Generar URL temporal para subir archivo
    return await ctx.storage.generateUploadUrl();
  },
});

// Función para guardar referencia de archivo subido
export const saveFile = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    userId: v.id("users"),
    documentType: v.union(
      v.literal("profile_photo"),
      v.literal("id_front"),
      v.literal("id_back"),
      v.literal("criminal_record"),
      v.literal("certification"),
      v.literal("business_license"),
      v.literal("tax_certificate"),
      v.literal("insurance"),
      v.literal("other")
    ),
    metadata: v.optional(v.object({
      verificationStatus: v.optional(v.string()),
      expiryDate: v.optional(v.number()),
      issuedBy: v.optional(v.string()),
    })),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    
    // Crear registro del documento
    const fileId = await ctx.db.insert("userDocuments", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      userId: args.userId,
      documentType: args.documentType,
      verificationStatus: "pending",
      uploadedAt: now,
      metadata: args.metadata,
    });

    // Si es foto de perfil, actualizar el usuario
    if (args.documentType === "profile_photo") {
      await ctx.db.patch(args.userId, {
        avatar: args.storageId,
        updatedAt: now,
      });
    }

    return fileId;
  },
});

// Obtener URL de descarga de un archivo
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Obtener documentos de un usuario
export const getUserDocuments = query({
  args: { 
    userId: v.id("users"),
    documentType: v.optional(v.string()),
  },
  handler: async (ctx: QueryCtx, args) => {
    let query = ctx.db
      .query("userDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    const documents = await query.collect();

    // Filtrar por tipo si se especifica
    const filtered = args.documentType 
      ? documents.filter(doc => doc.documentType === args.documentType)
      : documents;

    // Obtener URLs para cada documento
    const docsWithUrls = await Promise.all(
      filtered.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return docsWithUrls;
  },
});

// Actualizar estado de verificación de documento
export const updateDocumentVerification = mutation({
  args: {
    documentId: v.id("userDocuments"),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    verificationNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.id("users")),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.documentId, {
      verificationStatus: args.verificationStatus,
      verificationNotes: args.verificationNotes,
      verifiedAt: args.verificationStatus === "approved" ? now : undefined,
      verifiedBy: args.verifiedBy,
    });

    // Si todos los documentos requeridos están aprobados, marcar usuario como verificado
    const document = await ctx.db.get(args.documentId);
    if (document && args.verificationStatus === "approved") {
      const userDocs = await ctx.db
        .query("userDocuments")
        .withIndex("by_user", (q) => q.eq("userId", document.userId))
        .collect();

      const requiredDocs = ["id_front", "id_back", "criminal_record"];
      const hasAllRequired = requiredDocs.every(docType =>
        userDocs.some(doc => 
          doc.documentType === docType && 
          doc.verificationStatus === "approved"
        )
      );

      if (hasAllRequired) {
        await ctx.db.patch(document.userId, {
          isVerified: true,
          verifiedAt: now,
        });
      }
    }

    return { success: true };
  },
});

// Eliminar documento
export const deleteDocument = mutation({
  args: {
    documentId: v.id("userDocuments"),
    userId: v.id("users"),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Verificar que el documento pertenece al usuario
    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== args.userId) {
      throw new Error("Document not found or unauthorized");
    }

    // Eliminar archivo del storage
    await ctx.storage.delete(document.storageId);

    // Eliminar registro de la base de datos
    await ctx.db.delete(args.documentId);

    // Si era foto de perfil, actualizar usuario
    if (document.documentType === "profile_photo") {
      await ctx.db.patch(args.userId, {
        avatar: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Obtener estado de verificación del usuario
export const getUserVerificationStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const documents = await ctx.db
      .query("userDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const requiredDocs = ["id_front", "id_back", "criminal_record"];
    const documentStatus = requiredDocs.map(docType => {
      const doc = documents.find(d => d.documentType === docType);
      return {
        type: docType,
        uploaded: !!doc,
        status: doc?.verificationStatus || "not_uploaded",
      };
    });

    const optionalDocs = documents.filter(doc => 
      !requiredDocs.includes(doc.documentType)
    );

    return {
      isVerified: user.isVerified || false,
      verifiedAt: user.verifiedAt,
      requiredDocuments: documentStatus,
      optionalDocuments: optionalDocs.map(doc => ({
        type: doc.documentType,
        status: doc.verificationStatus,
        fileName: doc.fileName,
      })),
      profilePhoto: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
    };
  },
});