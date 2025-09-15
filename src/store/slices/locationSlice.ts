import { StateCreator } from 'zustand';
import { GeolocationPosition, LocationActions } from '../types';
import storageUtils, { STORAGE_KEYS } from '../storage';
import * as Location from 'expo-location';

export interface LocationSlice extends LocationActions {
  currentLocation: GeolocationPosition | null;
  hasLocationPermission: boolean;
  locationLoading: boolean;
  locationError: string | null;
}

// Distance calculation helper (Haversine formula)
const calculateHaversineDistance = (
  pos1: GeolocationPosition,
  pos2: GeolocationPosition
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createLocationSlice: StateCreator<
  LocationSlice,
  [],
  [],
  LocationSlice
> = (set, get) => ({
  // Initial state
  currentLocation: null,
  hasLocationPermission: false,
  locationLoading: false,
  locationError: null,

  // Actions
  getCurrentLocation: async (force: boolean = false) => {
    const { currentLocation, locationLoading } = get();

    // If already loading, return null
    if (locationLoading) {
      return null;
    }

    // If we have a recent location and not forcing refresh, return it
    if (currentLocation && !force) {
      const timeDiff = Date.now() - currentLocation.timestamp;
      if (timeDiff < 5 * 60 * 1000) { // 5 minutes
        return currentLocation;
      }
    }

    set({ locationLoading: true, locationError: null });

    try {
      console.log('📍 Getting current location...');

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        set({ hasLocationPermission: false });
        throw new Error('Location permission denied');
      }

      set({ hasLocationPermission: true });

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        distanceInterval: 10,
      });

      const position: GeolocationPosition = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: Date.now(),
      };

      // Cache location
      await storageUtils.setJSON(STORAGE_KEYS.LOCATION, position);

      set({
        currentLocation: position,
        locationLoading: false,
        locationError: null,
      });

      console.log('✅ Location obtained:', position);
      return position;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      console.error('❌ Location error:', error);

      set({
        locationLoading: false,
        locationError: errorMessage,
      });

      // Try to load from cache
      const cachedLocation = await storageUtils.getJSON<GeolocationPosition>(STORAGE_KEYS.LOCATION);
      if (cachedLocation) {
        set({ currentLocation: cachedLocation });
        console.log('📦 Using cached location');
        return cachedLocation;
      }

      // Return default location (Bogotá, Colombia)
      const defaultLocation: GeolocationPosition = {
        lat: 4.6097,
        lng: -74.0817,
        timestamp: Date.now(),
      };

      set({ currentLocation: defaultLocation });
      console.log('🏠 Using default location (Bogotá)');
      return defaultLocation;
    }
  },

  setCurrentLocation: (location: GeolocationPosition) => {
    set({ currentLocation: location });

    // Cache location (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.LOCATION, location).catch(console.error);
  },

  updateLocationPermission: (hasPermission: boolean) => {
    set({ hasLocationPermission: hasPermission });
  },

  calculateDistance: (destination: GeolocationPosition) => {
    const { currentLocation } = get();

    if (!currentLocation) {
      return null;
    }

    return calculateHaversineDistance(currentLocation, destination);
  },

  setLocationLoading: (loading: boolean) => {
    set({ locationLoading: loading });
  },

  setLocationError: (error: string | null) => {
    set({ locationError: error });
  },
});