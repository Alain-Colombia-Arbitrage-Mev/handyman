import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location';
  conversationId: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:3000'; // Cambiar por tu servidor
  private userId: string | null = null;

  // Conectar al servidor Socket.io
  connect(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      
      this.socket = io(this.serverUrl, {
        auth: {
          userId: userId,
        },
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Conectado a Socket.io:', this.socket?.id);
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Desconectado:', reason);
      });
    });
  }

  // Desconectar del servidor
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  // Unirse a una conversación
  joinConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  // Salir de una conversación
  leaveConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Enviar un mensaje
  sendMessage(message: Omit<Message, 'id' | 'timestamp'>): void {
    if (this.socket) {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date(),
      };
      
      this.socket.emit('send_message', messageWithTimestamp);
    }
  }

  // Escuchar mensajes nuevos
  onNewMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Escuchar cuando alguien está escribiendo
  onTyping(callback: (data: { userId: string; conversationId: string; isTyping: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  // Indicar que se está escribiendo
  emitTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket && this.userId) {
      this.socket.emit('typing', {
        userId: this.userId,
        conversationId,
        isTyping,
      });
    }
  }

  // Escuchar cambios de estado online/offline
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('user_status_change', callback);
    }
  }

  // Marcar mensaje como leído
  markAsRead(conversationId: string, messageId: string): void {
    if (this.socket) {
      this.socket.emit('mark_as_read', {
        conversationId,
        messageId,
        userId: this.userId,
      });
    }
  }

  // Escuchar mensajes leídos
  onMessageRead(callback: (data: { conversationId: string; messageId: string; readBy: string }) => void): void {
    if (this.socket) {
      this.socket.on('message_read', callback);
    }
  }

  // Obtener estado de conexión
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtener ID del socket
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Remover todos los listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Exportar instancia singleton
export const socketService = new SocketService();
export type { Message, User };
export default socketService;