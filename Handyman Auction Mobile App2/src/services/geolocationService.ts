import { GOOGLE_MAPS_CONFIG } from '../config/googleMaps';

// Interfaces para geolocalización
export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
  rating?: number;
  vicinity?: string;
}

export interface GeocodingResult {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  location: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
}

export interface DistanceResult {
  distance: number; // en kilómetros
  duration: string; // tiempo estimado
  distanceText: string; // "5.2 km"
  durationText: string; // "15 mins"
}

class GeolocationService {
  private apiKey: string;
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private distanceService: google.maps.DistanceMatrixService | null = null;

  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.API_KEY;
  }

  // Inicializar servicios de Google Maps
  async initializeServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined' && window.google.maps) {
        this.geocoder = new google.maps.Geocoder();
        this.distanceService = new google.maps.DistanceMatrixService();
        
        // PlacesService necesita un mapa o div
        const div = document.createElement('div');
        const map = new google.maps.Map(div);
        this.placesService = new google.maps.places.PlacesService(map);
        
        resolve();
        return;
      }

      // Cargar Google Maps API
      const script = document.createElement('script');
      script.src = `${GOOGLE_MAPS_CONFIG.MAPS_API_URL}?key=${this.apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.geocoder = new google.maps.Geocoder();
        this.distanceService = new google.maps.DistanceMatrixService();
        
        const div = document.createElement('div');
        const map = new google.maps.Map(div);
        this.placesService = new google.maps.places.PlacesService(map);
        
        resolve();
      };
      
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      document.head.appendChild(script);
    });
  }

  // Obtener ubicación actual del usuario
  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        GOOGLE_MAPS_CONFIG.GEOLOCATION_OPTIONS
      );
    });
  }

  // Geocodificación: dirección a coordenadas
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    await this.initializeServices();
    
    if (!this.geocoder) {
      throw new Error('Geocoder service not available');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { 
          address,
          componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION }
        },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            const location = result.geometry.location;
            
            // Extraer componentes de la dirección
            const addressComponents = result.address_components;
            let city = '', state = '', country = '', postalCode = '';
            
            addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              } else if (types.includes('country')) {
                country = component.long_name;
              } else if (types.includes('postal_code')) {
                postalCode = component.long_name;
              }
            });

            resolve({
              address: result.formatted_address,
              city: city || 'Desconocida',
              state: state || 'Desconocido',
              country: country || 'Colombia',
              postalCode,
              location: {
                lat: location.lat(),
                lng: location.lng()
              },
              formattedAddress: result.formatted_address
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  // Geocodificación inversa: coordenadas a dirección
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    await this.initializeServices();
    
    if (!this.geocoder) {
      throw new Error('Geocoder service not available');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            
            // Extraer componentes de la dirección
            const addressComponents = result.address_components;
            let city = '', state = '', country = '', postalCode = '';
            
            addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              } else if (types.includes('country')) {
                country = component.long_name;
              } else if (types.includes('postal_code')) {
                postalCode = component.long_name;
              }
            });

            resolve({
              address: result.formatted_address,
              city: city || 'Desconocida',
              state: state || 'Desconocido',
              country: country || 'Colombia',
              postalCode,
              location: { lat, lng },
              formattedAddress: result.formatted_address
            });
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  // Buscar lugares cercanos
  async findNearbyPlaces(
    center: GeolocationPosition,
    keyword: string,
    type?: string,
    radius: number = GOOGLE_MAPS_CONFIG.DEFAULT_SEARCH_RADIUS
  ): Promise<PlaceResult[]> {
    await this.initializeServices();
    
    if (!this.placesService) {
      throw new Error('Places service not available');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(center.lat, center.lng),
        radius,
        keyword,
        type: type as any
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map(place => ({
            placeId: place.place_id!,
            name: place.name!,
            address: place.vicinity!,
            location: {
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng()
            },
            types: place.types!,
            rating: place.rating,
            vicinity: place.vicinity
          }));
          
          resolve(places);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  // Autocomplete de direcciones
  async getPlacePredictions(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
    await this.initializeServices();

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input,
        componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION },
        types: GOOGLE_MAPS_CONFIG.PLACE_TYPES
      }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          reject(new Error(`Autocomplete failed: ${status}`));
        }
      });
    });
  }

  // Calcular distancia y tiempo entre dos puntos
  async calculateDistance(
    origin: GeolocationPosition,
    destination: GeolocationPosition
  ): Promise<DistanceResult> {
    await this.initializeServices();
    
    if (!this.distanceService) {
      throw new Error('Distance service not available');
    }

    return new Promise((resolve, reject) => {
      this.distanceService!.getDistanceMatrix({
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0].elements[0];
          
          if (element.status === 'OK') {
            resolve({
              distance: element.distance.value / 1000, // convertir a km
              duration: element.duration.text,
              distanceText: element.distance.text,
              durationText: element.duration.text
            });
          } else {
            reject(new Error(`Distance calculation failed: ${element.status}`));
          }
        } else {
          reject(new Error(`Distance matrix failed: ${status}`));
        }
      });
    });
  }

  // Calcular distancia simple (sin rutas)
  calculateStraightLineDistance(
    point1: GeolocationPosition,
    point2: GeolocationPosition
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Verificar si un punto está dentro de un radio
  isWithinRadius(
    center: GeolocationPosition,
    point: GeolocationPosition,
    radiusKm: number
  ): boolean {
    const distance = this.calculateStraightLineDistance(center, point);
    return distance <= radiusKm;
  }

  // Obtener ubicación por defecto (Bogotá)
  getDefaultLocation(): GeolocationPosition {
    return {
      lat: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.lat,
      lng: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.lng,
      timestamp: Date.now()
    };
  }

  // Formatear dirección para mostrar
  formatAddress(address: string): string {
    // Remover duplicados y limpiar formato
    const parts = address.split(',').map(part => part.trim());
    const uniqueParts = [...new Set(parts)];
    return uniqueParts.join(', ');
  }
}

// Exportar instancia singleton
export const geolocationService = new GeolocationService();