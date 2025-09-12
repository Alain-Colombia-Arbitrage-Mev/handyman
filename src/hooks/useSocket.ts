import { useEffect, useState, useCallback } from 'react';
import { socketService, Message, User } from '../services/socketService';

export const useSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: string[] }>({});

  // Conectar/desconectar socket
  useEffect(() => {
    if (userId) {
      const connect = async () => {
        try {
          await socketService.connect(userId);
          setIsConnected(true);
        } catch (error) {
          console.error('Error al conectar socket:', error);
          setIsConnected(false);
        }
      };

      connect();
    }

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [userId]);

  // Configurar listeners
  useEffect(() => {
    if (isConnected) {
      // Escuchar mensajes nuevos
      socketService.onNewMessage((message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Escuchar indicador de escritura
      socketService.onTyping(({ userId: typingUserId, conversationId, isTyping }) => {
        setTypingUsers(prev => {
          const conversationTyping = prev[conversationId] || [];
          
          if (isTyping) {
            if (!conversationTyping.includes(typingUserId)) {
              return {
                ...prev,
                [conversationId]: [...conversationTyping, typingUserId],
              };
            }
          } else {
            return {
              ...prev,
              [conversationId]: conversationTyping.filter(id => id !== typingUserId),
            };
          }
          
          return prev;
        });
      });

      // Escuchar cambios de estado de usuarios
      socketService.onUserStatusChange(({ userId: statusUserId, isOnline }) => {
        setOnlineUsers(prev => {
          if (isOnline) {
            return prev.includes(statusUserId) ? prev : [...prev, statusUserId];
          } else {
            return prev.filter(id => id !== statusUserId);
          }
        });
      });
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [isConnected]);

  // Funciones de utilidad
  const sendMessage = useCallback((messageData: Omit<Message, 'id' | 'timestamp'>) => {
    if (isConnected) {
      socketService.sendMessage(messageData);
    }
  }, [isConnected]);

  const joinConversation = useCallback((conversationId: string) => {
    if (isConnected) {
      socketService.joinConversation(conversationId);
    }
  }, [isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (isConnected) {
      socketService.leaveConversation(conversationId);
    }
  }, [isConnected]);

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (isConnected) {
      socketService.emitTyping(conversationId, isTyping);
    }
  }, [isConnected]);

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    if (isConnected) {
      socketService.markAsRead(conversationId, messageId);
    }
  }, [isConnected]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getMessagesForConversation = useCallback((conversationId: string) => {
    return messages.filter(message => message.conversationId === conversationId);
  }, [messages]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  const getUsersTypingInConversation = useCallback((conversationId: string) => {
    return typingUsers[conversationId] || [];
  }, [typingUsers]);

  return {
    // Estado
    isConnected,
    messages,
    onlineUsers,
    typingUsers,

    // Acciones
    sendMessage,
    joinConversation,
    leaveConversation,
    emitTyping,
    markAsRead,
    clearMessages,

    // Utilidades
    getMessagesForConversation,
    isUserOnline,
    getUsersTypingInConversation,
  };
};

export default useSocket;