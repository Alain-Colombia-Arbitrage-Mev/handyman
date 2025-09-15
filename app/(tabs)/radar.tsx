import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';

// Mock data for nearby jobs with coordinates - will be replaced with real Convex data
const mockNearbyJobs = [
  {
    id: '1',
    title: 'Reparar grifo de cocina',
    category: 'Plomería',
    distance: 500, // meters
    budget: '$200 - $300',
    postedTime: '15 min',
    isUrgent: true,
    location: 'Villa Crespo',
    coordinate: {
      latitude: -34.5989,
      longitude: -58.4310,
    },
  },
  {
    id: '2',
    title: 'Pintar habitación',
    category: 'Pintura',
    distance: 1200, // meters
    budget: '$800 - $1200',
    postedTime: '45 min',
    isUrgent: false,
    location: 'Palermo',
    coordinate: {
      latitude: -34.5735,
      longitude: -58.4269,
    },
  },
  {
    id: '3',
    title: 'Instalación eléctrica',
    category: 'Electricidad',
    distance: 2100, // meters
    budget: '$500 - $700',
    postedTime: '1 hora',
    isUrgent: false,
    location: 'Belgrano',
    coordinate: {
      latitude: -34.5627,
      longitude: -58.4558,
    },
  },
];

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function RadarScreen() {
  const { t } = useLanguage();
  const mapRef = useRef<MapView>(null);
  const [radarRadius, setRadarRadius] = useState(5); // km
  const [nearbyJobs, setNearbyJobs] = useState(mockNearbyJobs);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [filteredJobs, setFilteredJobs] = useState(mockNearbyJobs);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'plumbing', name: 'Plomería', icon: 'water-outline' },
    { id: 'electrical', name: 'Electricidad', icon: 'flash-outline' },
    { id: 'carpentry', name: 'Carpintería', icon: 'hammer-outline' },
    { id: 'painting', name: 'Pintura', icon: 'brush-outline' },
    { id: 'cleaning', name: 'Limpieza', icon: 'sparkles-outline' },
    { id: 'gardening', name: 'Jardinería', icon: 'leaf-outline' },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Default to Buenos Aires coordinates
      setUserLocation({
        latitude: -34.6118,
        longitude: -58.3960,
      });
    }
  };

  const filterJobsByRadius = () => {
    if (!userLocation) return;
    
    const filtered = nearbyJobs.filter(job => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        job.coordinate.latitude,
        job.coordinate.longitude
      );
      return distance <= radarRadius * 1000; // Convert km to meters
    });

    setFilteredJobs(filtered);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    filterJobsByRadius();
  }, [radarRadius, userLocation]);

  const handleJobPress = (job: any) => {
    Alert.alert('Job Details', `${job.title}\nLocation: ${job.location}\nBudget: ${job.budget}`);
  };

  const getMarkerColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plomería':
        return '#3b82f6';
      case 'electricidad':
        return '#eab308';
      case 'pintura':
        return '#10b981';
      default:
        return '#6366f1';
    }
  };

  if (!userLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={48} color="#21ABF6" />
          <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de Trabajos</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.radiusControl}>
            <Text style={styles.radiusLabel}>Radio: {radarRadius}km</Text>
            <View style={styles.radiusButtons}>
              {[1, 5, 10, 20].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    radarRadius === radius && styles.radiusButtonActive
                  ]}
                  onPress={() => setRadarRadius(radius)}
                >
                  <Text style={[
                    styles.radiusButtonText,
                    radarRadius === radius && styles.radiusButtonTextActive
                  ]}>
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Radius Circle */}
          <Circle
            center={userLocation}
            radius={radarRadius * 1000} // Convert km to meters
            strokeColor="rgba(33, 171, 246, 0.5)"
            fillColor="rgba(33, 171, 246, 0.1)"
            strokeWidth={2}
          />

          {/* Job Markers */}
          {filteredJobs.map((job) => (
            <Marker
              key={job.id}
              coordinate={job.coordinate}
              onPress={() => handleJobPress(job)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getMarkerColor(job.category) }
              ]}>
                <Ionicons 
                  name={job.isUrgent ? "flash" : "briefcase"} 
                  size={16} 
                  color="#ffffff" 
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Jobs Count Overlay */}
        <View style={styles.jobsCountOverlay}>
          <Text style={styles.jobsCountText}>
            {filteredJobs.length} trabajos encontrados
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  radiusControl: {
    alignItems: 'center',
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  radiusButtonActive: {
    backgroundColor: '#21ABF6',
    borderColor: '#21ABF6',
  },
  radiusButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  radiusButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  jobsCountOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobsCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});