import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';

const categories = [
  { id: 'all', name: 'Todos', icon: 'apps-outline' },
  { id: 'plumbing', name: 'Plomería', icon: 'water-outline' },
  { id: 'electrical', name: 'Electricidad', icon: 'flash-outline' },
  { id: 'carpentry', name: 'Carpintería', icon: 'hammer-outline' },
  { id: 'painting', name: 'Pintura', icon: 'brush-outline' },
  { id: 'cleaning', name: 'Limpieza', icon: 'sparkles-outline' },
];

const searchResults = [
  {
    id: '1',
    title: 'Reparación de lavadora',
    description: 'Necesito reparar mi lavadora que no está funcionando correctamente',
    category: 'Plomería',
    price: '$60',
    location: 'Centro, Ciudad',
    time: '1 hora ago',
    rating: 4.8,
    urgent: true,
  },
  {
    id: '2',
    title: 'Instalación de luminarias',
    description: 'Instalar 3 luminarias en el living y comedor',
    category: 'Electricidad',
    price: '$120',
    location: 'Norte, Ciudad',
    time: '3 horas ago',
    rating: 4.9,
    urgent: false,
  },
  {
    id: '3',
    title: 'Limpieza profunda',
    description: 'Limpieza completa de casa de 3 habitaciones',
    category: 'Limpieza',
    price: '$80',
    location: 'Sur, Ciudad',
    time: '5 horas ago',
    rating: 4.7,
    urgent: false,
  },
];

export default function SearchScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar trabajos..."
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
        
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Category Filter */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={selectedCategory === category.id ? '#ffffff' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextActive
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchResults.length} trabajos encontrados
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Ordenar por</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        <View style={styles.section}>
          {searchResults.map((job) => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  {job.urgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENTE</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                  <Ionicons name="heart-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.jobDescription}>{job.description}</Text>
              
              <View style={styles.jobMeta}>
                <View style={styles.jobMetaLeft}>
                  <Text style={styles.jobCategory}>{job.category}</Text>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                    <Text style={styles.jobLocation}>{job.location}</Text>
                  </View>
                </View>
                <Text style={styles.jobPrice}>{job.price}</Text>
              </View>
              
              <View style={styles.jobFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.rating}>{job.rating}</Text>
                </View>
                <Text style={styles.jobTime}>{job.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More Button */}
        <TouchableOpacity style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Cargar más resultados</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  favoriteButton: {
    padding: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobMetaLeft: {
    flex: 1,
  },
  jobCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  jobTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadMoreButton: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
});