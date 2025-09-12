import { socketService } from './socketService';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Servicio que integra Convex con Socket.io para sincronización en tiempo real
 * 
 * Este servicio actúa como puente entre:
 * - Convex: Base de datos persistente y queries reactivas
 * - Socket.io: Comunicación en tiempo real
 */

interface ConvexSocketConfig {
  convexClient: any; // Cliente de Convex
  userId: Id<"users">;
}

class ConvexSocketService {
  private convexClient: any = null;
  private userId: Id<"users"> | null = null;

  // Inicializar el servicio con cliente de Convex
  initialize(config: ConvexSocketConfig) {
    this.convexClient = config.convexClient;
    this.userId = config.userId;
  }

  // Conectar Socket.io y sincronizar con Convex
  async connectAndSync(userId: Id<"users">) {
    try {
      // Conectar Socket.io
      await socketService.connect(userId);

      // TODO: Actualizar estado online en Convex cuando implementemos la función
      // if (this.convexClient && this.userId) {
      //   await this.convexClient.mutation("users:updateOnlineStatus", {
      //     userId: this.userId,
      //     isOnline: true,
      //   });
      // }

      // Configurar listeners para sincronización
      this.setupSocketListeners();

      return true;
    } catch (error) {
      console.error('Error connecting ConvexSocket service:', error);
      return false;
    }
  }

  // Configurar listeners de Socket.io para sincronizar con Convex
  private setupSocketListeners() {
    // Cuando llega un mensaje por Socket.io, guardarlo en Convex
    socketService.onNewMessage(async (message) => {
      if (this.convexClient) {
        try {
          // TODO: Guardar mensaje en Convex cuando implementemos messages
          // await this.convexClient.mutation("messages:sendMessage", {
          //   conversationId: message.conversationId as Id<"conversations">,
          //   senderId: message.senderId as Id<"users">,
          //   content: message.content,
          //   type: message.type,
          // });
        } catch (error) {
          console.error('Error saving message to Convex:', error);
        }
      }
    });

    // Sincronizar estado de escritura
    socketService.onTyping((data) => {
      // Aquí podrías guardar indicadores de escritura temporales
      // o propagar a otros usuarios conectados
    });

    // Actualizar estado online/offline
    socketService.onUserStatusChange(async (data) => {
      if (this.convexClient) {
        try {
          // TODO: Actualizar estado de usuario cuando implementemos la función
          // await this.convexClient.mutation("users:updateOnlineStatus", {
          //   userId: data.userId as Id<"users">,
          //   isOnline: data.isOnline,
          // });
        } catch (error) {
          console.error('Error updating user status in Convex:', error);
        }
      }
    });
  }

  // Enviar mensaje con sincronización dual
  async sendMessage(messageData: {
    conversationId: string; // TODO: Cambiar a Id<"conversations"> cuando implementemos conversations
    senderId: Id<"users">;
    receiverId: Id<"users">;
    content: string;
    type: 'text' | 'image' | 'location';
  }) {
    try {
      // 1. Enviar por Socket.io para tiempo real
      socketService.sendMessage({
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        type: messageData.type,
        conversationId: messageData.conversationId,
      });

      // TODO: Guardar en Convex para persistencia cuando implementemos messages
      // if (this.convexClient) {
      //   await this.convexClient.mutation("messages:sendMessage", {
      //     conversationId: messageData.conversationId,
      //     senderId: messageData.senderId,
      //     content: messageData.content,
      //     type: messageData.type,
      //   });
      // }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Crear trabajo con notificación en tiempo real
  async createJob(jobData: {
    title: string;
    description: string;
    category: string;
    clientId: Id<"users">;
    location: any;
    budget: any;
    urgency: "low" | "medium" | "high" | "urgent";
    requiredSkills: string[];
    estimatedDuration: string;
    isFlashJob: boolean;
  }) {
    try {
      // Crear trabajo en Convex
      if (this.convexClient) {
        // Usar nuestra función simplificada de createJob
        const jobId = await this.convexClient.mutation("jobs:createJob", {
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          clientId: jobData.clientId,
          location: jobData.location,
          budget: jobData.budget,
        });

        // Si es trabajo flash, notificar por Socket.io a profesionales cercanos
        if (jobData.isFlashJob) {
          // Aquí emitirías una notificación a profesionales en la zona
          // socketService.emit('flash_job_created', { jobId, location: jobData.location });
        }

        return jobId;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      return null;
    }
  }

  // Desconectar y actualizar estado
  async disconnect() {
    // TODO: Actualizar estado offline en Convex cuando implementemos la función
    // if (this.convexClient && this.userId) {
    //   await this.convexClient.mutation("users:updateOnlineStatus", {
    //     userId: this.userId,
    //     isOnline: false,
    //   });
    // }

    // Desconectar Socket.io
    socketService.disconnect();
  }

  // Obtener estado de conexión
  isConnected() {
    return socketService.isConnected();
  }
}

// Exportar instancia singleton
export const convexSocketService = new ConvexSocketService();
export default convexSocketService;