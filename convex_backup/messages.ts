import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear o obtener conversación entre dos usuarios
export const getOrCreateConversation = mutation({
  args: {
    participant1: v.id("users"),
    participant2: v.id("users"),
    jobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, args) => {
    // Buscar conversación existente
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => 
        q.and(
          q.eq(q.field("participants"), [args.participant1, args.participant2]),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Buscar conversación con participantes en orden inverso
    const reverseConversation = await ctx.db
      .query("conversations")
      .filter((q) => 
        q.and(
          q.eq(q.field("participants"), [args.participant2, args.participant1]),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    if (reverseConversation) {
      return reverseConversation._id;
    }

    // Crear nueva conversación
    const conversationId = await ctx.db.insert("conversations", {
      participants: [args.participant1, args.participant2],
      jobId: args.jobId,
      lastMessage: undefined,
      lastMessageAt: undefined,
      isActive: true,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Enviar mensaje
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("location"),
      v.literal("system")
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type,
      readBy: [{
        userId: args.senderId,
        readAt: Date.now(),
      }],
      createdAt: Date.now(),
    });

    // Actualizar conversación con último mensaje
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

// Obtener mensajes de una conversación
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()), // timestamp para paginación
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => 
        q.eq("conversationId", args.conversationId)
      );

    let messages = await query.collect();

    // Filtrar mensajes antes de un timestamp (para paginación)
    if (args.before) {
      messages = messages.filter(msg => msg.createdAt < args.before);
    }

    // Ordenar por fecha (más recientes primero)
    messages.sort((a, b) => b.createdAt - a.createdAt);

    // Limitar resultados
    if (args.limit) {
      messages = messages.slice(0, args.limit);
    }

    // Devolver en orden cronológico
    return messages.reverse();
  },
});

// Obtener conversaciones de un usuario
export const getUserConversations = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("participants")[0], args.userId),
            q.eq(q.field("participants")[1], args.userId)
          ),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    // Ordenar por último mensaje
    const sortedConversations = conversations
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    // Limitar resultados
    if (args.limit) {
      return sortedConversations.slice(0, args.limit);
    }

    return sortedConversations;
  },
});

// Marcar mensaje como leído
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    // Verificar si ya está marcado como leído por este usuario
    const alreadyRead = message.readBy.some(read => read.userId === args.userId);
    if (alreadyRead) return;

    // Agregar usuario a la lista de lectores
    await ctx.db.patch(args.messageId, {
      readBy: [
        ...message.readBy,
        {
          userId: args.userId,
          readAt: Date.now(),
        }
      ],
    });
  },
});

// Marcar todos los mensajes de una conversación como leídos
export const markConversationAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const unreadMessages = messages.filter(msg => 
      !msg.readBy.some(read => read.userId === args.userId)
    );

    // Marcar todos los mensajes no leídos como leídos
    await Promise.all(
      unreadMessages.map(message =>
        ctx.db.patch(message._id, {
          readBy: [
            ...message.readBy,
            {
              userId: args.userId,
              readAt: Date.now(),
            }
          ],
        })
      )
    );
  },
});

// Obtener conteo de mensajes no leídos
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Obtener todas las conversaciones del usuario
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("participants")[0], args.userId),
            q.eq(q.field("participants")[1], args.userId)
          ),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    let totalUnread = 0;

    // Contar mensajes no leídos en cada conversación
    for (const conversation of conversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) => 
          q.eq("conversationId", conversation._id)
        )
        .collect();

      const unreadInConversation = messages.filter(msg => 
        msg.senderId !== args.userId && // No contar propios mensajes
        !msg.readBy.some(read => read.userId === args.userId)
      ).length;

      totalUnread += unreadInConversation;
    }

    return totalUnread;
  },
});