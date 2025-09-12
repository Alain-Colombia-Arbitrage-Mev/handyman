import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  { id: '1', name: 'Plomería', icon: 'water-outline', color: '#3b82f6' },
  { id: '2', name: 'Electricidad', icon: 'flash-outline', color: '#f59e0b' },
  { id: '3', name: 'Carpintería', icon: 'hammer-outline', color: '#8b5cf6' },
  { id: '4', name: 'Pintura', icon: 'brush-outline', color: '#06d6a0' },
  { id: '5', name: 'Limpieza', icon: 'sparkles-outline', color: '#f97316' },
  { id: '6', name: 'Jardinería', icon: 'leaf-outline', color: '#22c55e' },
];

const recentJobs = [
  {
    id: '1',
    title: 'Reparación de grifo',
    category: 'Plomería',
    price: '$45',
    location: 'Centro, Ciudad',
    time: '2 horas ago',
    urgent: true
  },
  {
    id: '2',
    title: 'Instalación de ventilador',
    category: 'Electricidad',
    price: '$80',
    location: 'Norte, Ciudad',
    time: '4 horas ago',
    urgent: false
  },
  {
    id: '3',
    title: 'Pintura de habitación',
    category: 'Pintura',
    price: '$120',
    location: 'Sur, Ciudad',
    time: '1 día ago',
    urgent: false
  }
];

export default function HomeScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.subtitle}>¿Qué necesitas hoy?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.actionGradient}
              >
                <Ionicons name="add-outline" size={28} color="#ffffff" />
                <Text style={styles.actionText}>Publicar Trabajo</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.actionGradient}
              >
                <Ionicons name="flash-outline" size={28} color="#ffffff" />
                <Text style={styles.actionText}>Trabajo Urgente</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons 
                    name={category.icon as any} 
                    size={24} 
                    color={category.color} 
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajos Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {recentJobs.map((job) => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  {job.urgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENTE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.jobPrice}>{job.price}</Text>
              </View>
              
              <View style={styles.jobDetails}>
                <Text style={styles.jobCategory}>{job.category}</Text>
                <Text style={styles.jobLocation}>
                  <Ionicons name="location-outline" size={12} color="#6b7280" />
                  {' '}{job.location}
                </Text>
              </View>
              
              <Text style={styles.jobTime}>{job.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  jobInfo: {
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
  jobPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  jobLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});