import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get help articles
export const getHelpArticles = query({
  args: { 
    category: v.optional(v.string()),
    searchTerm: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let articlesQuery = ctx.db
      .query("helpArticles")
      .withIndex("by_published", (q) => q.eq("isPublished", true));

    if (args.category) {
      articlesQuery = articlesQuery.filter((q) => 
        q.eq(q.field("category"), args.category)
      );
    }

    let articles = await articlesQuery.order("desc").collect();

    // Simple search functionality
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return articles;
  },
});

// Get help article by ID
export const getHelpArticle = query({
  args: { articleId: v.id("helpArticles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article || !article.isPublished) {
      throw new Error("Article not found");
    }
    return article;
  },
});

// Get help categories
export const getHelpCategories = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("helpArticles")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const categories = [...new Set(articles.map(article => article.category))];
    
    const categoriesWithCount = categories.map(category => ({
      name: category,
      count: articles.filter(article => article.category === category).length
    }));

    return categoriesWithCount.sort((a, b) => b.count - a.count);
  },
});

// Create support ticket
export const createSupportTicket = mutation({
  args: {
    userId: v.id("users"),
    subject: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.insert("supportTickets", {
      ...args,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return ticket;
  },
});

// Get user's support tickets
export const getUserSupportTickets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return tickets;
  },
});

// Get support ticket by ID
export const getSupportTicket = query({
  args: { 
    ticketId: v.id("supportTickets"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Verify user owns this ticket
    if (ticket.userId !== args.userId) {
      throw new Error("Unauthorized to view this ticket");
    }

    return ticket;
  },
});

// Update support ticket
export const updateSupportTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const { ticketId, userId, ...updateData } = args;
    
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Verify user owns this ticket
    if (ticket.userId !== userId) {
      throw new Error("Unauthorized to update this ticket");
    }

    return await ctx.db.patch(ticketId, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Seed help articles (for initial setup)
export const seedHelpArticles = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = [
      {
        title: "Cómo publicar un trabajo",
        content: `Para publicar un trabajo en Parkiing, sigue estos pasos:

1. **Accede a la pestaña "Publicar"**: Toca el botón central "+" en la barra de navegación inferior.

2. **Completa los detalles del trabajo**:
   - Título: Escribe un título claro y descriptivo
   - Descripción: Proporciona detalles específicos sobre el trabajo
   - Categoría: Selecciona la categoría apropiada
   - Presupuesto: Indica tu rango de presupuesto estimado

3. **Configura opciones adicionales**:
   - Marca como "Urgente" si necesitas el trabajo completado rápidamente
   - Verifica tu ubicación

4. **Publica el trabajo**: Toca "Publicar Trabajo" para hacer tu solicitud visible a los profesionales.

Una vez publicado, comenzarás a recibir propuestas de handymen calificados en tu área.`,
        category: "Trabajos",
        tags: ["publicar", "trabajo", "tutorial", "básico"],
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Cómo verificar tu cuenta",
        content: `La verificación de cuenta es importante para generar confianza en la plataforma. Aquí te explicamos cómo verificar tu cuenta:

**Documentos requeridos**:
- Foto de documento de identidad (frente y dorso)
- Selfie con el documento
- Para profesionales: certificaciones relevantes (opcional)

**Proceso de verificación**:
1. Ve a tu perfil y toca "Verificación de Cuenta"
2. Sube los documentos solicitados
3. Nuestro equipo revisará tu información (24-48 horas)
4. Recibirás una notificación una vez aprobada

**Beneficios de la verificación**:
- Mayor confianza de los clientes
- Acceso a trabajos premium
- Badge de verificación en tu perfil`,
        category: "Cuenta",
        tags: ["verificación", "documentos", "identidad", "confianza"],
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Métodos de pago disponibles",
        content: `Parkiing acepta múltiples métodos de pago para tu conveniencia:

**Tarjetas de crédito y débito**:
- Visa
- Mastercard
- American Express

**Billeteras digitales**:
- MercadoPago
- PayPal (próximamente)

**Transferencias bancarias**:
- Disponible para pagos mayores a $1000

**Seguridad de pagos**:
- Todos los pagos están protegidos con encriptación SSL
- Nunca almacenamos información completa de tarjetas
- Sistema de pagos en custodia para mayor seguridad

**Agregar método de pago**:
1. Ve a "Perfil" > "Métodos de Pago"
2. Toca "Agregar método de pago"
3. Ingresa los datos solicitados
4. Verifica la información y guarda`,
        category: "Pagos",
        tags: ["pagos", "tarjetas", "seguridad", "métodos"],
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Cómo dejar reseñas",
        content: `Las reseñas son fundamentales para mantener la calidad del servicio. Aprende cómo dejar reseñas:

**Cuándo puedes dejar reseñas**:
- Solo después de que un trabajo esté completado
- Tanto clientes como profesionales pueden reseñarse mutuamente

**Cómo dejar una reseña**:
1. Ve a "Perfil" > "Reseñas y Calificaciones"
2. Busca el trabajo completado
3. Toca "Dejar reseña"
4. Califica del 1 al 5 estrellas
5. Escribe un comentario detallado (opcional pero recomendado)

**Consejos para buenas reseñas**:
- Sé honesto y constructivo
- Menciona aspectos específicos del servicio
- Considera puntualidad, calidad y comunicación
- Evita información personal

**Editar reseñas**:
- Puedes editar tu reseña dentro de 7 días después de publicarla
- Las reseñas editadas muestran una marca de tiempo actualizada`,
        category: "Reseñas",
        tags: ["reseñas", "calificaciones", "feedback", "calidad"],
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Políticas de cancelación",
        content: `Entender nuestras políticas de cancelación te ayudará a evitar cargos innecesarios:

**Cancelación por parte del cliente**:
- Gratuita: Hasta 2 horas antes del inicio del trabajo
- 50% del monto: Entre 30 minutos y 2 horas antes
- 100% del monto: Menos de 30 minutos antes o no presentarse

**Cancelación por parte del profesional**:
- Debe notificar con al menos 2 horas de anticipación
- Cancelaciones tardías pueden afectar su calificación
- Cancelaciones frecuentes pueden resultar en suspensión

**Cancelaciones por emergencias**:
- Se evalúan caso por caso
- Requieren documentación apropiada
- Contacta soporte para asistencia

**Proceso de cancelación**:
1. Ve al trabajo activo en tu perfil
2. Toca "Cancelar trabajo"
3. Selecciona el motivo
4. Confirma la cancelación

Los reembolsos se procesan en 3-5 días hábiles.`,
        category: "Políticas",
        tags: ["cancelación", "reembolso", "políticas", "emergencias"],
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    // Check if articles already exist to avoid duplicates
    const existingArticles = await ctx.db
      .query("helpArticles")
      .collect();

    if (existingArticles.length === 0) {
      for (const article of articles) {
        await ctx.db.insert("helpArticles", article);
      }
      return { message: `Seeded ${articles.length} help articles` };
    }

    return { message: "Help articles already exist" };
  },
});