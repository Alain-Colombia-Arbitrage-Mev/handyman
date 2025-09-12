import { useState, useEffect, useCallback } from 'react';
import { geolocationService, GeolocationPosition, GeocodingResult, PlaceResult } from '../services/geolocationService';

// Hook principal para geolocalización
export function useGeolocation() {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Solicitar ubicación actual
  const getCurrentLocation = useCallback(async (forceRefresh: boolean = false) => {
    // Si ya tenemos ubicación y no forzamos actualización, usar caché
    if (currentLocation && !forceRefresh && Date.now() - currentLocation.timestamp < 10 * 60 * 1000) {
      return currentLocation;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentLocation(position);
      setHasPermission(true);
      return position;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error getting location';
      setError(errorMessage);
      setHasPermission(false);
      
      // Usar ubicación por defecto (Bogotá)
      const defaultLocation = geolocationService.getDefaultLocation();
      setCurrentLocation(defaultLocation);
      return defaultLocation;
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  // Verificar permisos de geolocalización
  const checkPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setHasPermission(false);
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setHasPermission(permission.state === 'granted');
      return permission.state === 'granted';
    } catch (err) {
      // Fallback para navegadores que no soportan permissions API
      try {
        await geolocationService.getCurrentPosition();
        setHasPermission(true);
        return true;
      } catch (error) {
        setHasPermission(false);
        return false;
      }
    }
  }, []);

  // Calcular distancia entre dos puntos
  const calculateDistance = useCallback((destination: GeolocationPosition) => {
    if (!currentLocation) return null;
    return geolocationService.calculateStraightLineDistance(currentLocation, destination);
  }, [currentLocation]);

  // Verificar si un punto está dentro del radio
  const isWithinRadius = useCallback((point: GeolocationPosition, radiusKm: number) => {
    if (!currentLocation) return false;
    return geolocationService.isWithinRadius(currentLocation, point, radiusKm);
  }, [currentLocation]);

  // Inicialización automática
  useEffect(() => {
    checkPermission().then(hasPermission => {
      if (hasPermission) {
        getCurrentLocation();
      } else {
        // Usar ubicación por defecto
        const defaultLocation = geolocationService.getDefaultLocation();
        setCurrentLocation(defaultLocation);
      }
    });
  }, [checkPermission, getCurrentLocation]);

  return {
    currentLocation,
    isLoading,
    error,
    hasPermission,
    getCurrentLocation,
    checkPermission,
    calculateDistance,
    isWithinRadius
  };
}

// Hook para geocodificación
export function useGeocoding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convertir dirección a coordenadas
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    if (!address.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.geocodeAddress(address);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Geocoding error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convertir coordenadas a dirección
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<GeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.reverseGeocode(lat, lng);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Reverse geocoding error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    geocodeAddress,
    reverseGeocode
  };
}

// Hook para autocompletado de lugares
export function usePlaceAutocomplete() {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener sugerencias de autocompletado
  const getSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const predictions = await geolocationService.getPlacePredictions(input);
      setSuggestions(predictions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Autocomplete error';
      setError(errorMessage);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpiar sugerencias
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
}

// Hook para buscar lugares cercanos
export function useNearbyPlaces() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar lugares cercanos
  const searchNearbyPlaces = useCallback(async (
    center: GeolocationPosition,
    keyword: string,
    type?: string,
    radius?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await geolocationService.findNearbyPlaces(center, keyword, type, radius);
      setPlaces(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Places search error';
      setError(errorMessage);
      setPlaces([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpiar resultados
  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  return {
    places,
    isLoading,
    error,
    searchNearbyPlaces,
    clearPlaces
  };
}

// Hook para calcular rutas y distancias
export function useDistanceMatrix() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular distancia y tiempo entre dos puntos
  const calculateRoute = useCallback(async (
    origin: GeolocationPosition,
    destination: GeolocationPosition
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.calculateDistance(origin, destination);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Distance calculation error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    calculateRoute
  };
}

// Hook personalizado para ubicaciones de trabajos/oportunidades
export function useJobLocations(jobs: any[]) {
  const { currentLocation, calculateDistance } = useGeolocation();
  const [jobsWithDistance, setJobsWithDistance] = useState<any[]>([]);

  useEffect(() => {
    if (!currentLocation || !jobs.length) {
      setJobsWithDistance(jobs);
      return;
    }

    const jobsWithDistanceCalculated = jobs.map(job => {
      if (job.coordinates) {
        const distance = calculateDistance({
          lat: job.coordinates.lat,
          lng: job.coordinates.lng,
          timestamp: Date.now()
        });
        
        return {
          ...job,
          distance: distance ? Math.round(distance * 10) / 10 : null // Redondear a 1 decimal
        };
      }
      return job;
    });

    // Ordenar por distancia (más cerca primero)
    jobsWithDistanceCalculated.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    setJobsWithDistance(jobsWithDistanceCalculated);
  }, [currentLocation, jobs, calculateDistance]);

  return jobsWithDistance;
}