import { StateCreator } from 'zustand';
import { Message, Conversation, MessagesActions } from '../types';
import storageUtils, { STORAGE_KEYS } from '../storage';

export interface MessagesSlice extends MessagesActions {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
}

export const createMessagesSlice: StateCreator<
  MessagesSlice,
  [],
  [],
  MessagesSlice
> = (set, get) => ({
  // Initial state
  conversations: [],
  messages: {},
  typingUsers: {},

  // Actions
  fetchConversations: async () => {
    try {
      console.log('💬 Fetching conversations');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock conversations data
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          participants: ['user-123', 'handyman-1'],
          lastMessageId: 'msg-3',
          lastMessageAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
          jobId: 'job-1',
          isActive: true,
          createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          updatedAt: Date.now() - 10 * 60 * 1000,
        },
        {
          id: 'conv-2',
          participants: ['user-123', 'handyman-2'],
          lastMessageId: 'msg-6',
          lastMessageAt: Date.now() - 45 * 60 * 1000, // 45 minutes ago
          jobId: 'job-2',
          isActive: true,
          createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          updatedAt: Date.now() - 45 * 60 * 1000,
        },
        {
          id: 'conv-3',
          participants: ['user-123', 'client-1'],
          lastMessageId: 'msg-9',
          lastMessageAt: Date.now() - 90 * 60 * 1000, // 1.5 hours ago
          isActive: true,
          createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          updatedAt: Date.now() - 90 * 60 * 1000,
        },
      ];

      // Sort by last message time (newest first)
      mockConversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

      // Cache conversations
      await storageUtils.setJSON(`${STORAGE_KEYS.CONVERSATIONS}_cache`, {
        data: mockConversations,
        timestamp: Date.now()
      });

      set({ conversations: mockConversations });
      console.log(`✅ Fetched ${mockConversations.length} conversations`);
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error);

      // Try to load from cache
      const cached = await storageUtils.getJSON<{
        data: Conversation[];
        timestamp: number;
      }>(`${STORAGE_KEYS.CONVERSATIONS}_cache`);

      if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 minutes
        set({ conversations: cached.data });
        console.log('📦 Loaded conversations from cache');
      }

      throw error;
    }
  },

  fetchMessages: async (conversationId: string) => {
    try {
      console.log('💬 Fetching messages for conversation:', conversationId);

      // Check if messages are already loaded
      const { messages } = get();
      if (messages[conversationId] && messages[conversationId].length > 0) {
        console.log('📦 Messages already loaded from state');
        return;
      }

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 400));

      // Mock messages data
      let mockMessages: Message[] = [];

      if (conversationId === 'conv-1') {
        mockMessages = [
          {
            id: 'msg-1',
            conversationId,
            senderId: 'user-123',
            receiverId: 'handyman-1',
            content: 'Hola Juan Carlos, vi tu propuesta para el trabajo de plomería. ¿Cuándo podrías empezar?',
            messageType: 'text',
            isRead: true,
            createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          },
          {
            id: 'msg-2',
            conversationId,
            senderId: 'handyman-1',
            receiverId: 'user-123',
            content: 'Hola! Podría ir mañana en la mañana, ¿te parece bien a las 9 AM?',
            messageType: 'text',
            isRead: true,
            createdAt: Date.now() - 90 * 60 * 1000, // 1.5 hours ago
          },
          {
            id: 'msg-3',
            conversationId,
            senderId: 'user-123',
            receiverId: 'handyman-1',
            content: 'Perfecto, te espero a las 9 AM. ¿Necesitas que tenga algún material específico?',
            messageType: 'text',
            isRead: false,
            createdAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
          },
        ];
      } else if (conversationId === 'conv-2') {
        mockMessages = [
          {
            id: 'msg-4',
            conversationId,
            senderId: 'handyman-2',
            receiverId: 'user-123',
            content: '¿Podrías enviarme más detalles sobre el trabajo de instalación eléctrica?',
            messageType: 'text',
            isRead: true,
            createdAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
          },
          {
            id: 'msg-5',
            conversationId,
            senderId: 'user-123',
            receiverId: 'handyman-2',
            content: 'Claro, es para instalar un aire acondicionado de 12.000 BTU en el cuarto principal',
            messageType: 'text',
            isRead: true,
            createdAt: Date.now() - 50 * 60 * 1000, // 50 minutes ago
          },
          {
            id: 'msg-6',
            conversationId,
            senderId: 'handyman-2',
            receiverId: 'user-123',
            content: 'Entendido. ¿El cableado está listo o también necesita instalación eléctrica nueva?',
            messageType: 'text',
            isRead: false,
            createdAt: Date.now() - 45 * 60 * 1000, // 45 minutes ago
          },
        ];
      } else if (conversationId === 'conv-3') {
        mockMessages = [
          {
            id: 'msg-7',
            conversationId,
            senderId: 'client-1',
            receiverId: 'user-123',
            content: 'Hola, necesito contratar un electricista para mi oficina',
            messageType: 'text',
            isRead: true,
            createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          },
          {
            id: 'msg-8',
            conversationId,
            senderId: 'user-123',
            receiverId: 'client-1',
            content: 'Hola! Con gusto te ayudo. ¿Qué tipo de trabajo eléctrico necesitas?',
            messageType: 'text',
            isRead: true,
            createdAt: Date.now() - 100 * 60 * 1000, // 1 hour 40 minutes ago
          },
          {
            id: 'msg-9',
            conversationId,
            senderId: 'client-1',
            receiverId: 'user-123',
            content: 'Necesito instalar varias tomas adicionales y mejorar la iluminación',
            messageType: 'text',
            isRead: false,
            createdAt: Date.now() - 90 * 60 * 1000, // 1.5 hours ago
          },
        ];
      }

      // Sort messages by creation time (oldest first)
      mockMessages.sort((a, b) => a.createdAt - b.createdAt);

      // Cache messages
      await storageUtils.setJSON(`messages_${conversationId}`, {
        data: mockMessages,
        timestamp: Date.now()
      });

      set({
        messages: {
          ...messages,
          [conversationId]: mockMessages
        }
      });

      console.log(`✅ Fetched ${mockMessages.length} messages for conversation ${conversationId}`);
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);

      // Try to load from cache
      const cached = await storageUtils.getJSON<{
        data: Message[];
        timestamp: number;
      }>(`messages_${conversationId}`);

      if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) { // 1 hour
        const { messages } = get();
        set({
          messages: {
            ...messages,
            [conversationId]: cached.data
          }
        });
        console.log('📦 Loaded messages from cache');
      }

      throw error;
    }
  },

  sendMessage: async (message: Omit<Message, 'id' | 'createdAt'>) => {
    try {
      console.log('📤 Sending message to conversation:', message.conversationId);

      // Optimistic update - add message immediately
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}`,
        createdAt: Date.now()
      };

      const { messages, conversations } = get();
      const conversationMessages = messages[message.conversationId] || [];

      set({
        messages: {
          ...messages,
          [message.conversationId]: [...conversationMessages, newMessage]
        }
      });

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update conversation's last message
      const updatedConversations = conversations.map(conv =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessageId: newMessage.id,
              lastMessageAt: newMessage.createdAt,
              updatedAt: newMessage.createdAt
            }
          : conv
      );

      set({ conversations: updatedConversations });

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);

      // Remove optimistic update on error
      const { messages } = get();
      const conversationMessages = messages[message.conversationId] || [];
      const filteredMessages = conversationMessages.slice(0, -1);

      set({
        messages: {
          ...messages,
          [message.conversationId]: filteredMessages
        }
      });

      throw error;
    }
  },

  markMessageAsRead: async (messageId: string) => {
    try {
      console.log('👀 Marking message as read:', messageId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 200));

      const { messages } = get();
      const updatedMessages = { ...messages };

      // Find and update the message
      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        );
      });

      set({ messages: updatedMessages });
      console.log('✅ Message marked as read');
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
      throw error;
    }
  },

  createConversation: async (participants: string[], jobId?: string) => {
    try {
      console.log('➕ Creating new conversation with participants:', participants);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        participants,
        lastMessageAt: Date.now(),
        jobId,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { conversations } = get();
      set({
        conversations: [newConversation, ...conversations]
      });

      console.log('✅ Conversation created successfully');
      return newConversation.id;
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      throw error;
    }
  },

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  setMessages: (conversationId: string, messages: Message[]) => {
    const { messages: currentMessages } = get();
    set({
      messages: {
        ...currentMessages,
        [conversationId]: messages
      }
    });
  },

  addMessage: (message: Message) => {
    const { messages } = get();
    const conversationMessages = messages[message.conversationId] || [];

    set({
      messages: {
        ...messages,
        [message.conversationId]: [...conversationMessages, message]
      }
    });
  },

  updateTypingStatus: (conversationId: string, userId: string, isTyping: boolean) => {
    const { typingUsers } = get();
    const currentTyping = typingUsers[conversationId] || [];

    let updatedTyping: string[];
    if (isTyping) {
      updatedTyping = currentTyping.includes(userId)
        ? currentTyping
        : [...currentTyping, userId];
    } else {
      updatedTyping = currentTyping.filter(id => id !== userId);
    }

    set({
      typingUsers: {
        ...typingUsers,
        [conversationId]: updatedTyping
      }
    });
  },
});