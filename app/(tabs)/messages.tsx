import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';

const conversations = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    profession: 'Plomero',
    lastMessage: 'Perfecto, estaré allí a las 3 PM',
    time: '10:30 AM',
    unread: 2,
    online: true,
    avatar: '👨‍🔧',
  },
  {
    id: '2',
    name: 'Ana González',
    profession: 'Electricista',
    lastMessage: 'Necesito ver las fotos del problema',
    time: '9:15 AM',
    unread: 0,
    online: false,
    avatar: '👩‍🔧',
  },
  {
    id: '3',
    name: 'Miguel Torres',
    profession: 'Carpintero',
    lastMessage: 'El trabajo quedó excelente 👍',
    time: 'Ayer',
    unread: 0,
    online: true,
    avatar: '👨‍🏭',
  },
  {
    id: '4',
    name: 'Laura Mendez',
    profession: 'Pintora',
    lastMessage: 'Puedo empezar el lunes que viene',
    time: 'Ayer',
    unread: 1,
    online: false,
    avatar: '👩‍🎨',
  },
  {
    id: '5',
    name: 'Roberto Silva',
    profession: 'Limpieza',
    lastMessage: 'Gracias por contratar nuestros servicios',
    time: '2 días',
    unread: 0,
    online: false,
    avatar: '👨‍💼',
  },
];

export default function MessagesScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.profession.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="create-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversaciones..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <TouchableOpacity key={conversation.id} style={styles.conversationItem}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{conversation.avatar}</Text>
                </View>
                {conversation.online && <View style={styles.onlineIndicator} />}
              </View>
              
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{conversation.name}</Text>
                  <Text style={styles.conversationTime}>{conversation.time}</Text>
                </View>
                
                <View style={styles.conversationMeta}>
                  <Text style={styles.profession}>{conversation.profession}</Text>
                  {conversation.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{conversation.unread}</Text>
                    </View>
                  )}
                </View>
                
                <Text
                  style={[
                    styles.lastMessage,
                    conversation.unread > 0 && styles.unreadMessage
                  ]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay mensajes'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Cuando tengas conversaciones aparecerán aquí'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="people-outline" size={20} color="#3b82f6" />
          <Text style={styles.quickActionText}>Contactos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
          <Text style={styles.quickActionText}>Solicitudes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profession: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#111827',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
});