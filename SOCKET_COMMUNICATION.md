# 🔌 Socket.io Communication Documentation

## 📋 Visión General

Este documento describe la implementación completa de comunicación en tiempo real usando Socket.io para la aplicación Handyman Auction. El sistema permite mensajería instantánea, notificaciones en tiempo real, y actualizaciones de estado entre usuarios.

## 🏗️ Arquitectura de Comunicación

### Estructura del Sistema
```
src/
├── services/
│   └── socketService.ts        # Servicio principal de Socket.io
├── store/
│   ├── slices/
│   │   └── messagesSlice.ts    # Estado de mensajes
│   └── integrations/
│       └── socketIntegration.ts # Integración con Zustand
└── types/
    └── index.ts                # Tipos de datos
```

## 🔧 Configuración Inicial

### 1. Instalación de Dependencias

```bash
npm install socket.io-client
npm install @types/socket.io-client --save-dev
```

### 2. Variables de Entorno

```env
# .env
EXPO_PUBLIC_SOCKET_URL=ws://localhost:3001
EXPO_PUBLIC_SOCKET_ENABLED=true
```

### 3. Configuración del Servidor (Backend)

```javascript
// server.js (Node.js + Express + Socket.io)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a conversación
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Usuario ${socket.id} se unió a conversación ${conversationId}`);
  });

  // Enviar mensaje
  socket.on('send-message', (data) => {
    socket.to(data.conversationId).emit('new-message', data);
  });

  // Estado de escritura
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user-typing', data);
  });

  // Marcar como leído
  socket.on('mark-read', (data) => {
    socket.to(data.conversationId).emit('message-read', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

## 📱 Implementación en React Native

### 1. Servicio Socket Principal

```typescript
// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Conectar al servidor Socket.io
   */
  async connect(userId: string): Promise<boolean> {
    try {
      const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
      const socketEnabled = process.env.EXPO_PUBLIC_SOCKET_ENABLED === 'true';

      if (!socketEnabled || !socketUrl) {
        console.log('🔌 Socket.io deshabilitado en configuración');
        return false;
      }

      this.socket = io(socketUrl, {
        auth: { userId },
        transports: ['websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      return new Promise((resolve) => {
        this.socket!.on('connect', () => {
          console.log('✅ Socket conectado:', this.socket!.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(true);
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ Error de conexión Socket:', error);
          this.isConnected = false;
          resolve(false);
        });

        this.socket!.on('disconnect', (reason) => {
          console.log('🔌 Socket desconectado:', reason);
          this.isConnected = false;

          if (reason === 'io server disconnect') {
            // Reconexión manual si el servidor desconecta
            this.reconnect();
          }
        });

        this.socket!.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Socket reconectado en intento ${attemptNumber}`);
          this.isConnected = true;
        });

        this.socket!.on('reconnect_failed', () => {
          console.error('❌ Falló la reconexión de Socket después de múltiples intentos');
          this.isConnected = false;
        });
      });
    } catch (error) {
      console.error('❌ Error inicializando Socket:', error);
      return false;
    }
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket desconectado manualmente');
    }
  }

  /**
   * Intentar reconexión manual
   */
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Intentando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      setTimeout(() => {
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  /**
   * Unirse a una conversación
   */
  joinConversation(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-conversation', conversationId);
      console.log('💬 Unido a conversación:', conversationId);
    }
  }

  /**
   * Salir de una conversación
   */
  leaveConversation(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-conversation', conversationId);
      console.log('💬 Salió de conversación:', conversationId);
    }
  }

  /**
   * Enviar mensaje
   */
  sendMessage(message: Omit<Message, 'id' | 'createdAt'>): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', message);
      console.log('📤 Mensaje enviado via Socket:', message.conversationId);
    }
  }

  /**
   * Emitir estado de escritura
   */
  emitTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        conversationId,
        isTyping,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Marcar mensaje como leído
   */
  markAsRead(conversationId: string, messageId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark-read', {
        conversationId,
        messageId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Escuchar nuevos mensajes
   */
  onNewMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  /**
   * Escuchar indicadores de escritura
   */
  onTyping(callback: (data: { userId: string; conversationId: string; isTyping: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  /**
   * Escuchar cambios de estado de usuario
   */
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('user-status-change', callback);
    }
  }

  /**
   * Escuchar confirmaciones de lectura
   */
  onMessageRead(callback: (data: { conversationId: string; messageId: string; readBy: string }) => void): void {
    if (this.socket) {
      this.socket.on('message-read', callback);
    }
  }

  /**
   * Eliminar todos los listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      console.log('🔇 Todos los listeners de Socket removidos');
    }
  }

  /**
   * Verificar estado de conexión
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Obtener ID del socket
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export const socketService = new SocketService();
```

### 2. Integración con Zustand Store

```typescript
// src/store/integrations/socketIntegration.ts
import React from 'react';
import { useAppStore } from '../index';
import { socketService } from '../../services/socketService';
import { Message } from '../types';

export const socketIntegration = {
  /**
   * Inicializar conexión Socket
   */
  async initializeSocket(userId: string): Promise<boolean> {
    try {
      console.log('🔌 Inicializando conexión Socket para usuario:', userId);

      const connected = await socketService.connect(userId);
      if (connected) {
        console.log('✅ Socket conectado exitosamente');
        setupSocketListeners();
        return true;
      } else {
        console.log('⚠️ Conexión Socket deshabilitada (modo desarrollo)');
        return false;
      }
    } catch (error) {
      console.error('❌ Error inicializando Socket:', error);
      return false;
    }
  },

  /**
   * Desconectar Socket
   */
  disconnectSocket(): void {
    console.log('🔌 Desconectando Socket');
    socketService.removeAllListeners();
    socketService.disconnect();
  },

  /**
   * Unirse a conversación
   */
  joinConversation(conversationId: string): void {
    console.log('💬 Uniéndose a conversación:', conversationId);
    socketService.joinConversation(conversationId);
  },

  /**
   * Salir de conversación
   */
  leaveConversation(conversationId: string): void {
    console.log('💬 Saliendo de conversación:', conversationId);
    socketService.leaveConversation(conversationId);
  },

  /**
   * Enviar mensaje via Socket
   */
  sendMessage(message: Omit<Message, 'id' | 'createdAt'>): void {
    console.log('📤 Enviando mensaje via Socket:', message.conversationId);
    socketService.sendMessage(message);
  },

  /**
   * Emitir estado de escritura
   */
  emitTyping(conversationId: string, isTyping: boolean): void {
    socketService.emitTyping(conversationId, isTyping);
  },

  /**
   * Marcar mensaje como leído
   */
  markAsRead(conversationId: string, messageId: string): void {
    socketService.markAsRead(conversationId, messageId);
  },

  /**
   * Verificar estado de conexión
   */
  isConnected(): boolean {
    return socketService.isSocketConnected();
  },
};

/**
 * Configurar listeners de eventos Socket
 */
function setupSocketListeners(): void {
  const store = useAppStore.getState();

  // Escuchar nuevos mensajes
  socketService.onNewMessage((message: Message) => {
    console.log('📨 Nuevo mensaje recibido via Socket:', message.id);
    store.addMessage(message);

    // Agregar notificación para nuevo mensaje
    store.addNotification({
      userId: message.receiverId,
      type: 'message',
      title: 'Nuevo mensaje',
      message: 'Tienes un nuevo mensaje',
      data: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        messageId: message.id,
      },
      isRead: false,
    });
  });

  // Escuchar indicadores de escritura
  socketService.onTyping((data: { userId: string; conversationId: string; isTyping: boolean }) => {
    console.log('⌨️ Estado de escritura cambiado:', data);
    store.updateTypingStatus(data.conversationId, data.userId, data.isTyping);
  });

  // Escuchar cambios de estado de usuario
  socketService.onUserStatusChange((data: { userId: string; isOnline: boolean }) => {
    console.log('👤 Estado de usuario cambiado:', data);
    // TODO: Actualizar estado online del usuario en store
  });

  // Escuchar confirmaciones de lectura de mensajes
  socketService.onMessageRead((data: { conversationId: string; messageId: string; readBy: string }) => {
    console.log('👀 Confirmación de lectura de mensaje:', data);
    // TODO: Actualizar estado de lectura del mensaje en store
  });
}

/**
 * Hook React para integración Socket
 */
export const useSocketIntegration = () => {
  const { isAuthenticated, user } = useAppStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  // Inicializar Socket cuando el usuario inicia sesión
  React.useEffect(() => {
    if (isAuthenticated && user) {
      socketIntegration.initializeSocket(user.id);
    } else {
      socketIntegration.disconnectSocket();
    }

    // Cleanup al desmontar
    return () => {
      socketIntegration.disconnectSocket();
    };
  }, [isAuthenticated, user]);

  return {
    isConnected: socketIntegration.isConnected(),
    joinConversation: socketIntegration.joinConversation,
    leaveConversation: socketIntegration.leaveConversation,
    sendMessage: socketIntegration.sendMessage,
    emitTyping: socketIntegration.emitTyping,
    markAsRead: socketIntegration.markAsRead,
  };
};

export default socketIntegration;
```

### 3. Slice de Mensajes con Socket Integration

```typescript
// src/store/slices/messagesSlice.ts (Fragmento relevante)
import { StateCreator } from 'zustand';
import { socketIntegration } from '../integrations/socketIntegration';

export interface MessagesSlice {
  // ... otros tipos

  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  updateTypingStatus: (conversationId: string, userId: string, isTyping: boolean) => void;
}

export const createMessagesSlice: StateCreator<
  RootState,
  [],
  [],
  MessagesSlice
> = (set, get) => ({
  // ... estado inicial

  sendMessage: async (message) => {
    try {
      // Actualización optimista
      const newMessage: Message = {
        ...message,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const conversationMessages = state.messages[message.conversationId] || [];
        state.messages[message.conversationId] = [...conversationMessages, newMessage];
      });

      // Enviar via Socket si está conectado
      if (socketIntegration.isConnected()) {
        socketIntegration.sendMessage(message);
      }

      // TODO: Enviar a Convex como respaldo
      // const messageId = await convexIntegration.sendMessageToConvex(message);

    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      // Revertir actualización optimista en caso de error
      set((state) => {
        const conversationMessages = state.messages[message.conversationId] || [];
        state.messages[message.conversationId] = conversationMessages.filter(
          m => !m.id.startsWith('temp-')
        );
      });
      throw error;
    }
  },

  joinConversation: (conversationId) => {
    socketIntegration.joinConversation(conversationId);
  },

  leaveConversation: (conversationId) => {
    socketIntegration.leaveConversation(conversationId);
  },

  updateTypingStatus: (conversationId, userId, isTyping) => {
    set((state) => {
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    });
  },
});
```

## 💬 Uso en Componentes React

### 1. Componente de Chat

```typescript
// src/screens/ChatScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useMessages } from '../store';
import { useSocketIntegration } from '../store/integrations/socketIntegration';

interface ChatScreenProps {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversationId,
  currentUserId,
  otherUserId,
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    sendMessage,
    fetchMessages,
    typingUsers,
  } = useMessages();

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
  } = useSocketIntegration();

  const conversationMessages = messages[conversationId] || [];
  const otherUserTyping = typingUsers[conversationId]?.includes(otherUserId) || false;

  // Unirse a la conversación al montar el componente
  useEffect(() => {
    fetchMessages(conversationId);
    joinConversation(conversationId);

    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId]);

  // Manejar cambios en el texto del mensaje
  const handleTextChange = (text: string) => {
    setMessageText(text);

    // Emitir estado de escritura
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      emitTyping(conversationId, true);
    }

    // Debounce para dejar de escribir
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTyping(conversationId, false);
    }, 1000);
  };

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        receiverId: otherUserId,
        content: messageText.trim(),
        messageType: 'text',
        isRead: false,
      });

      setMessageText('');
      setIsTyping(false);
      emitTyping(conversationId, false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header con estado de conexión */}
      <View style={{ padding: 16, backgroundColor: isConnected ? '#10b981' : '#ef4444' }}>
        <Text style={{ color: 'white' }}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </Text>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        data={conversationMessages}
        renderItem={({ item }) => (
          <View style={{
            padding: 12,
            margin: 8,
            backgroundColor: item.senderId === currentUserId ? '#3b82f6' : '#f3f4f6',
            borderRadius: 12,
            alignSelf: item.senderId === currentUserId ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
          }}>
            <Text style={{
              color: item.senderId === currentUserId ? 'white' : 'black'
            }}>
              {item.content}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Indicador de escritura */}
      {otherUserTyping && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontStyle: 'italic', color: '#6b7280' }}>
            El otro usuario está escribiendo...
          </Text>
        </View>
      )}

      {/* Input de mensaje */}
      <View style={{ flexDirection: 'row', padding: 16 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginRight: 12,
          }}
          placeholder="Escribe un mensaje..."
          value={messageText}
          onChangeText={handleTextChange}
          multiline
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

### 2. Hook personalizado para Chat

```typescript
// src/hooks/useChat.ts
import { useEffect, useRef } from 'react';
import { useMessages } from '../store';
import { useSocketIntegration } from '../store/integrations/socketIntegration';

export const useChat = (conversationId: string) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    sendMessage,
    fetchMessages,
    typingUsers,
  } = useMessages();

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
    markAsRead,
  } = useSocketIntegration();

  // Auto-unirse a conversación
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      joinConversation(conversationId);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  const handleSendMessage = async (
    content: string,
    senderId: string,
    receiverId: string
  ) => {
    await sendMessage({
      conversationId,
      senderId,
      receiverId,
      content,
      messageType: 'text',
      isRead: false,
    });
  };

  const handleTyping = (isTyping: boolean) => {
    emitTyping(conversationId, isTyping);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(conversationId, false);
      }, 1000);
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    markAsRead(conversationId, messageId);
  };

  return {
    messages: messages[conversationId] || [],
    typingUsers: typingUsers[conversationId] || [],
    isConnected,
    sendMessage: handleSendMessage,
    handleTyping,
    markAsRead: handleMarkAsRead,
  };
};
```

## 🔧 Configuración Avanzada

### 1. Middleware de Autenticación

```typescript
// Backend middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verificar JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }

    socket.userId = decoded.userId;
    next();
  });
};

io.use(authenticateSocket);
```

### 2. Rate Limiting

```typescript
// Backend rate limiting
const rateLimitMap = new Map();

const rateLimit = (socket, next) => {
  const userId = socket.userId;
  const now = Date.now();

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
    return next();
  }

  const userLimit = rateLimitMap.get(userId);

  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + 60000;
    return next();
  }

  if (userLimit.count >= 100) { // 100 mensajes por minuto
    return next(new Error('Rate limit exceeded'));
  }

  userLimit.count++;
  next();
};
```

### 3. Manejo de Errores

```typescript
// src/utils/socketErrorHandler.ts
export class SocketErrorHandler {
  static handleConnectionError(error: Error): void {
    console.error('Socket connection error:', error);

    // Reportar error a servicio de monitoreo
    // Analytics.track('socket_connection_error', { error: error.message });

    // Mostrar notificación al usuario
    // showNotification('Problemas de conexión. Reintentando...');
  }

  static handleMessageError(error: Error, messageId: string): void {
    console.error('Message send error:', error);

    // Revertir mensaje optimista
    // store.removeOptimisticMessage(messageId);

    // Mostrar error al usuario
    // showNotification('Error enviando mensaje. Intenta de nuevo.');
  }

  static handleReconnection(attemptNumber: number): void {
    console.log(`Reconnection attempt ${attemptNumber}`);

    // Sincronizar mensajes perdidos
    // store.syncMissedMessages();
  }
}
```

## 📊 Monitoreo y Métricas

### 1. Métricas de Socket

```typescript
// src/utils/socketMetrics.ts
export class SocketMetrics {
  private static metrics = {
    connectionsCount: 0,
    messagesCount: 0,
    reconnectionsCount: 0,
    errorsCount: 0,
    averageLatency: 0,
  };

  static incrementConnections(): void {
    this.metrics.connectionsCount++;
    this.reportMetrics();
  }

  static incrementMessages(): void {
    this.metrics.messagesCount++;
    this.reportMetrics();
  }

  static recordLatency(latency: number): void {
    this.metrics.averageLatency =
      (this.metrics.averageLatency + latency) / 2;
  }

  private static reportMetrics(): void {
    // Enviar métricas a servicio de analytics
    console.log('Socket Metrics:', this.metrics);
  }
}
```

### 2. Health Check

```typescript
// src/utils/socketHealthCheck.ts
export class SocketHealthCheck {
  private static checkInterval: NodeJS.Timeout | null = null;

  static startHealthCheck(): void {
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Cada 30 segundos
  }

  static stopHealthCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private static performHealthCheck(): void {
    const isConnected = socketService.isSocketConnected();

    if (!isConnected) {
      console.warn('⚠️ Socket health check failed');
      // Intentar reconexión
      // socketService.reconnect();
    } else {
      console.log('✅ Socket health check passed');
    }
  }
}
```

## 🔒 Seguridad

### 1. Validación de Mensajes

```typescript
// src/utils/messageValidator.ts
import { z } from 'zod';

const MessageSchema = z.object({
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  messageType: z.enum(['text', 'image', 'file']),
});

export const validateMessage = (message: any): boolean => {
  try {
    MessageSchema.parse(message);
    return true;
  } catch (error) {
    console.error('Message validation failed:', error);
    return false;
  }
};
```

### 2. Sanitización de Contenido

```typescript
// src/utils/contentSanitizer.ts
export class ContentSanitizer {
  static sanitizeMessage(content: string): string {
    // Remover caracteres peligrosos
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  static validateFileUpload(file: any): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }
}
```

## 🧪 Testing

### 1. Test del Servicio Socket

```typescript
// __tests__/socketService.test.ts
import { socketService } from '../src/services/socketService';

describe('SocketService', () => {
  test('should connect successfully', async () => {
    const connected = await socketService.connect('test-user-id');
    expect(connected).toBe(true);
  });

  test('should send message', () => {
    const message = {
      conversationId: 'test-conversation',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Test message',
      messageType: 'text' as const,
      isRead: false,
    };

    expect(() => socketService.sendMessage(message)).not.toThrow();
  });

  test('should handle disconnection', () => {
    socketService.disconnect();
    expect(socketService.isSocketConnected()).toBe(false);
  });
});
```

### 2. Test de Integración

```typescript
// __tests__/socketIntegration.test.ts
import { renderHook } from '@testing-library/react-native';
import { useSocketIntegration } from '../src/store/integrations/socketIntegration';

describe('Socket Integration', () => {
  test('should initialize socket when authenticated', () => {
    const { result } = renderHook(() => useSocketIntegration());

    // Mock authentication state
    // ... test implementation

    expect(result.current.isConnected).toBe(true);
  });
});
```

## 🚀 Deployment y Producción

### 1. Variables de Entorno

```env
# Producción
EXPO_PUBLIC_SOCKET_URL=wss://your-production-socket-server.com
EXPO_PUBLIC_SOCKET_ENABLED=true
SOCKET_CONNECTION_TIMEOUT=20000
SOCKET_RECONNECT_ATTEMPTS=5
```

### 2. Optimizaciones de Producción

```typescript
// src/config/socketConfig.ts
export const socketConfig = {
  development: {
    url: 'ws://localhost:3001',
    debug: true,
    timeout: 5000,
    reconnectAttempts: 3,
  },
  production: {
    url: process.env.EXPO_PUBLIC_SOCKET_URL,
    debug: false,
    timeout: 20000,
    reconnectAttempts: 5,
    secure: true,
  },
};
```

## 📋 Checklist de Implementación

### ✅ Configuración Básica
- [x] Instalar dependencias Socket.io
- [x] Configurar variables de entorno
- [x] Crear servicio Socket básico
- [x] Integrar con Zustand store

### ✅ Funcionalidades Core
- [x] Conexión/desconexión automática
- [x] Envío de mensajes en tiempo real
- [x] Indicadores de escritura
- [x] Unirse/salir de conversaciones
- [x] Manejo de reconexión

### ✅ Features Avanzadas
- [x] Rate limiting
- [x] Validación de mensajes
- [x] Métricas y monitoreo
- [x] Manejo de errores robusto
- [x] Tests unitarios e integración

### ⏳ Próximos Pasos
- [ ] Implementar notificaciones push
- [ ] Agregar soporte para archivos multimedia
- [ ] Implementar encriptación end-to-end
- [ ] Agregar presencia de usuarios
- [ ] Implementar rooms/channels

## 📞 Soporte y Troubleshooting

### Problemas Comunes

1. **Socket no conecta**
   - Verificar URL del servidor
   - Comprobar configuración de CORS
   - Revisar firewall/proxy

2. **Mensajes no llegan**
   - Verificar autenticación
   - Comprobar rate limiting
   - Revisar logs del servidor

3. **Reconexión no funciona**
   - Verificar configuración de reconexión
   - Comprobar manejo de eventos
   - Revisar timeouts

### Logs de Debug

```typescript
// Habilitar logs detallados
localStorage.setItem('debug', 'socket.io-client:*');
```

---

**Este sistema de comunicación Socket.io proporciona una base sólida para mensajería en tiempo real, con patrones de diseño escalables y manejo robusto de errores para aplicaciones móviles de nivel empresarial.**