import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../hooks/useSocket';
import { Message } from '../services/socketService';
import { useLanguage } from '../providers/LanguageProvider';

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
  onBack: () => void;
}

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  recipientName: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser, recipientName }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.messageContainer, isCurrentUser ? styles.sentMessage : styles.receivedMessage]}>
      <View style={[styles.messageBubble, isCurrentUser ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.messageText, isCurrentUser ? styles.sentText : styles.receivedText]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, isCurrentUser ? styles.sentTime : styles.receivedTime]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const TypingIndicator: React.FC<{ typingUsers: string[] }> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>
          {typingUsers.length === 1 ? 'Escribiendo...' : `${typingUsers.length} personas escribiendo...`}
        </Text>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
};

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversationId,
  currentUserId,
  recipientName,
  onBack,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    emitTyping,
    getMessagesForConversation,
    getUsersTypingInConversation,
  } = useSocket(currentUserId);

  const messages = getMessagesForConversation(conversationId);
  const typingUsers = getUsersTypingInConversation(conversationId);

  // Unirse a la conversación al montar el componente
  useEffect(() => {
    if (isConnected) {
      joinConversation(conversationId);
    }

    return () => {
      if (isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Scroll automático cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Manejar indicador de escritura
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.trim() && !isTyping) {
      setIsTyping(true);
      emitTyping(conversationId, true);
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Establecer nuevo timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTyping(conversationId, false);
      }
    }, 1000);
  };

  // Enviar mensaje
  const handleSendMessage = () => {
    if (inputText.trim() && isConnected) {
      // Determinar recipientId (en una app real, esto vendría de la conversación)
      const recipientId = 'other_user_id'; // Esto debería venir de props o contexto

      sendMessage({
        senderId: currentUserId,
        receiverId: recipientId,
        content: inputText.trim(),
        type: 'text',
        conversationId,
      });

      setInputText('');
      
      // Detener indicador de escritura
      if (isTyping) {
        setIsTyping(false);
        emitTyping(conversationId, false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem
      message={item}
      isCurrentUser={item.senderId === currentUserId}
      recipientName={recipientName}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{recipientName}</Text>
          <Text style={styles.headerStatus}>
            {isConnected ? 'En línea' : 'Desconectado'}
          </Text>
        </View>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Indicador de escritura */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || !isConnected}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() && isConnected ? '#ffffff' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sentBubble: {
    backgroundColor: '#3b82f6',
  },
  receivedBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: '#ffffff',
  },
  receivedText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: '#6b7280',
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typingText: {
    color: '#6b7280',
    fontSize: 14,
    marginRight: 10,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#3b82f6',
  },
});