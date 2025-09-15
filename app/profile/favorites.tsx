import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const mockFavorites = [
  {
    id: '1',
    title: 'Instalación de aires acondicionados',
    category: 'Electricidad',
    price: '$250,000 - $400,000',
    location: 'Bogotá, Colombia',
    rating: 4.8,
    isUrgent: true,
  },
  {
    id: '2',
    title: 'Reparación de tuberías',
    category: 'Plomería',
    price: '$100,000 - $200,000',
    location: 'Medellín, Colombia',
    rating: 4.9,
    isUrgent: false,
  },
];

export default function FavoritesScreen() {
  const renderFavorite = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.favoriteCard}>
      <View style={styles.favoriteHeader}>
        <Text style={styles.favoriteTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.favoriteInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="folder-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{item.category}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{item.price}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.infoText}>{item.rating} ⭐</Text>
        </View>
      </View>

      {item.isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>Urgente</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={mockFavorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No tienes trabajos favoritos</Text>
            <Text style={styles.emptySubtext}>
              Guarda trabajos interesantes tocando el ❤️
            </Text>
          </View>
        }
      />
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
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: { width: 44 },
  listContent: {
    padding: 20,
  },
  favoriteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  heartButton: {
    padding: 4,
  },
  favoriteInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  urgentBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});