import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';
import { LinearGradient } from 'expo-linear-gradient';
// import { GoogleMapReal } from '../../src/components/GoogleMapReal';
import { useGeolocation } from '../../src/hooks/useGeolocation';
// import { useCurrency } from '../../src/hooks/useCurrency';

// Interfaces para los tipos de ofertas según el nuevo sistema
interface Opportunity {
  id: string;
  title: string;
  businessName: string;
  discount: number;
  coordinates: { lat: number; lng: number };
  distance?: number;
  availableUntil: Date;
  originalPrice: number;
  discountedPrice: number;
  category: 'food' | 'retail' | 'services' | 'entertainment' | 'perishables';
  quantity: number;
  remainingQuantity: number;
}

interface FlashJob {
  id: string;
  title: string;
  fixedPrice: number;
  currency: 'USD' | 'COP';
  coordinates: { lat: number; lng: number };
  distance?: number;
  urgency: 'high' | 'urgent';
  deadline: Date;
  category: string;
  description: string;
}

interface JobOffer {
  id: string;
  title: string;
  budget: { min: number; max: number; currency: 'USD' | 'COP' };
  coordinates: { lat: number; lng: number };
  distance?: number;
  jobType: 'fixed_price' | 'bids_allowed';
  proposalsCount?: number;
  category: string;
  description: string;
  deadline?: Date;
}

export default function HomeScreen() {
  const { currentLocation, getCurrentLocation, isLoading: locationLoading } = useGeolocation();
  // const { formatCurrency } = useCurrency();
  
  // Función temporal para formatear moneda
  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'USD' ? 'en-US' : 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Estados para los diferentes tipos de ofertas
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [flashJobs, setFlashJobs] = useState<FlashJob[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  
  // Estados del filtro
  const [activeFilter, setActiveFilter] = useState<'all' | 'opportunities' | 'flash' | 'jobs'>('all');
  const [filterRadius] = useState(10); // km
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Datos mockeados para demostración
  useEffect(() => {
    const mockData = async () => {
      if (!currentLocation) return;

      // Oportunidades mock
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          title: 'Pizza familiar 50% OFF',
          businessName: 'Pizzería Mario',
          discount: 50,
          coordinates: { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 },
          availableUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
          originalPrice: 40000,
          discountedPrice: 20000,
          category: 'food',
          quantity: 10,
          remainingQuantity: 7
        },
        {
          id: '2',
          title: 'Ropa de temporada 70% OFF',
          businessName: 'Boutique Moda',
          discount: 70,
          coordinates: { lat: currentLocation.lat - 0.008, lng: currentLocation.lng + 0.012 },
          availableUntil: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
          originalPrice: 80000,
          discountedPrice: 24000,
          category: 'retail',
          quantity: 15,
          remainingQuantity: 3
        }
      ];

      // Flash Jobs mock
      const mockFlashJobs: FlashJob[] = [
        {
          id: '1',
          title: 'Reparación urgente de tubería',
          fixedPrice: 150,
          currency: 'USD',
          coordinates: { lat: currentLocation.lat + 0.005, lng: currentLocation.lng - 0.01 },
          urgency: 'urgent',
          deadline: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 horas
          category: 'plomería',
          description: 'Tubería rota en baño principal, inundación activa'
        },
        {
          id: '2',
          title: 'Instalación eléctrica inmediata',
          fixedPrice: 800000,
          currency: 'COP',
          coordinates: { lat: currentLocation.lat - 0.012, lng: currentLocation.lng + 0.008 },
          urgency: 'high',
          deadline: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 horas
          category: 'electricidad',
          description: 'Sin luz en oficina, necesario para reunión mañana'
        }
      ];

      // Job Offers mock
      const mockJobOffers: JobOffer[] = [
        {
          id: '1',
          title: 'Pintura de apartamento',
          budget: { min: 300, max: 500, currency: 'USD' },
          coordinates: { lat: currentLocation.lat + 0.015, lng: currentLocation.lng - 0.005 },
          jobType: 'bids_allowed',
          proposalsCount: 5,
          category: 'pintura',
          description: 'Pintura completa de apartamento 2 habitaciones',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        },
        {
          id: '2',
          title: 'Limpieza profunda post construcción',
          budget: { min: 200, max: 200, currency: 'USD' },
          coordinates: { lat: currentLocation.lat - 0.02, lng: currentLocation.lng - 0.015 },
          jobType: 'fixed_price',
          category: 'limpieza',
          description: 'Limpieza completa después de remodelación'
        }
      ];

      setOpportunities(mockOpportunities);
      setFlashJobs(mockFlashJobs);
      setJobOffers(mockJobOffers);
    };

    mockData();
  }, [currentLocation]);

  // Filtrar elementos según el filtro activo
  const getFilteredData = () => {
    switch (activeFilter) {
      case 'opportunities':
        return { opportunities, flashJobs: [], jobOffers: [] };
      case 'flash':
        return { opportunities: [], flashJobs, jobOffers: [] };
      case 'jobs':
        return { opportunities: [], flashJobs: [], jobOffers };
      default:
        return { opportunities, flashJobs, jobOffers };
    }
  };

  const filteredData = getFilteredData();
  const totalCount = opportunities.length + flashJobs.length + jobOffers.length;

  // Handlers para clicks en el mapa
  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedItem({ type: 'opportunity', data: opportunity });
    setDetailsModalVisible(true);
  };

  const handleFlashJobClick = (flashJob: FlashJob) => {
    setSelectedItem({ type: 'flash', data: flashJob });
    setDetailsModalVisible(true);
  };

  const handleJobOfferClick = (jobOffer: JobOffer) => {
    setSelectedItem({ type: 'job', data: jobOffer });
    setDetailsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Radar de Trabajos</Text>
          <Text style={styles.subtitle}>
            {totalCount} oportunidades cerca de ti
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            Todos ({totalCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'opportunities' && styles.filterPillActive]}
          onPress={() => setActiveFilter('opportunities')}
        >
          <Text style={[styles.filterText, activeFilter === 'opportunities' && styles.filterTextActive]}>
            🎯 Oportunidades ({opportunities.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'flash' && styles.filterPillActive]}
          onPress={() => setActiveFilter('flash')}
        >
          <Text style={[styles.filterText, activeFilter === 'flash' && styles.filterTextActive]}>
            ⚡ Flash Jobs ({flashJobs.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'jobs' && styles.filterPillActive]}
          onPress={() => setActiveFilter('jobs')}
        >
          <Text style={[styles.filterText, activeFilter === 'jobs' && styles.filterTextActive]}>
            💼 Ofertas ({jobOffers.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapBackground}>
            {/* Simulated map background */}
            <LinearGradient
              colors={['#e0f2fe', '#f0f9ff', '#f8fafc']}
              style={StyleSheet.absoluteFill}
            />
            
            {/* User location dot */}
            <View style={styles.userLocationDot}>
              <View style={styles.userLocationInner} />
              <View style={styles.userLocationPulse} />
            </View>
            
            {/* Sample markers for opportunities */}
            {filteredData.opportunities.map((opp, index) => (
              <TouchableOpacity
                key={opp.id}
                style={[
                  styles.opportunityMarker,
                  { top: `${30 + index * 15}%`, left: `${25 + index * 20}%` }
                ]}
                onPress={() => handleOpportunityClick(opp)}
              >
                <Text style={styles.markerText}>🎯</Text>
              </TouchableOpacity>
            ))}
            
            {/* Sample markers for flash jobs */}
            {filteredData.flashJobs.map((job, index) => (
              <TouchableOpacity
                key={job.id}
                style={[
                  styles.flashJobMarker,
                  { top: `${45 + index * 20}%`, right: `${20 + index * 15}%` }
                ]}
                onPress={() => handleFlashJobClick(job)}
              >
                <Text style={styles.markerText}>⚡</Text>
              </TouchableOpacity>
            ))}
            
            {/* Sample markers for job offers */}
            {filteredData.jobOffers.map((offer, index) => (
              <TouchableOpacity
                key={offer.id}
                style={[
                  styles.jobOfferMarker,
                  { bottom: `${25 + index * 18}%`, left: `${30 + index * 25}%` }
                ]}
                onPress={() => handleJobOfferClick(offer)}
              >
                <Text style={styles.markerText}>💼</Text>
              </TouchableOpacity>
            ))}
            
            {/* Map info overlay */}
            <View style={styles.mapInfo}>
              <Text style={styles.mapInfoText}>Mapa de Google Maps próximamente</Text>
              <Text style={styles.mapInfoSubtext}>Mostrando ubicaciones simuladas</Text>
            </View>
          </View>
        </View>
        
        {/* Loading overlay */}
        {locationLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <Ionicons name="location-outline" size={24} color="#3B82F6" />
              <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#F59E0B" />
          <Text style={styles.statText}>
            {opportunities.filter(o => o.availableUntil.getTime() - Date.now() < 2 * 60 * 60 * 1000).length} expiran pronto
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flash-outline" size={16} color="#EF4444" />
          <Text style={styles.statText}>
            {flashJobs.filter(j => j.urgency === 'urgent').length} urgentes
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color="#10B981" />
          <Text style={styles.statText}>
            {jobOffers.reduce((sum, j) => sum + (j.proposalsCount || 0), 0)} propuestas
          </Text>
        </View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles</Text>
            <TouchableOpacity 
              onPress={() => setDetailsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          {selectedItem && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalCard}>
                <Text style={styles.itemTitle}>{selectedItem.data.title}</Text>
                {selectedItem.type === 'opportunity' && (
                  <>
                    <Text style={styles.businessName}>{selectedItem.data.businessName}</Text>
                    <Text style={styles.priceText}>
                      <Text style={styles.originalPrice}>{formatCurrency(selectedItem.data.originalPrice, 'COP')}</Text>
                      {' '}
                      <Text style={styles.discountedPrice}>{formatCurrency(selectedItem.data.discountedPrice, 'COP')}</Text>
                    </Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{selectedItem.data.discount}% OFF</Text>
                    </View>
                  </>
                )}
                {selectedItem.type === 'flash' && (
                  <>
                    <Text style={styles.categoryText}>{selectedItem.data.category}</Text>
                    <Text style={styles.priceText}>
                      {formatCurrency(selectedItem.data.fixedPrice, selectedItem.data.currency)} {selectedItem.data.currency}
                    </Text>
                    <Text style={styles.descriptionText}>{selectedItem.data.description}</Text>
                  </>
                )}
                {selectedItem.type === 'job' && (
                  <>
                    <Text style={styles.categoryText}>{selectedItem.data.category}</Text>
                    <Text style={styles.priceText}>
                      {selectedItem.data.jobType === 'fixed_price' 
                        ? `Precio fijo: ${formatCurrency(selectedItem.data.budget.min, selectedItem.data.budget.currency)}`
                        : `${formatCurrency(selectedItem.data.budget.min, selectedItem.data.budget.currency)} - ${formatCurrency(selectedItem.data.budget.max, selectedItem.data.budget.currency)}`
                      } {selectedItem.data.budget.currency}
                    </Text>
                    <Text style={styles.descriptionText}>{selectedItem.data.description}</Text>
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  userLocationDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  userLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
  },
  opportunityMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flashJobMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  jobOfferMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  markerText: {
    fontSize: 16,
  },
  mapInfo: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 6,
  },
  mapInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  mapInfoSubtext: {
    fontSize: 10,
    color: '#6B7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  discountedPrice: {
    color: '#059669',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  discountBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
});