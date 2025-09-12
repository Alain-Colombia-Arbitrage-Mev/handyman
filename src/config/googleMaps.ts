// Configuración de Google Maps API
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: 'AIzaSyC9AuRcpbHrUNzjq5gxzxEmIBQ7dj_joHw',
  
  // URLs de las APIs de Google
  MAPS_API_URL: 'https://maps.googleapis.com/maps/api/js',
  GEOCODING_API_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
  PLACES_API_URL: 'https://maps.googleapis.com/maps/api/place',
  
  // Configuraciones por defecto
  DEFAULT_ZOOM: 15,
  DEFAULT_CENTER: {
    lat: 4.6097, // Bogotá, Colombia
    lng: -74.0817
  },
  
  // Configuraciones de geolocalización
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 600000 // 10 minutos
  },
  
  // Tipos de lugares para autocompletado
  PLACE_TYPES: [
    'address',
    'establishment',
    'geocode'
  ],
  
  // Restricciones de país (Colombia)
  COUNTRY_RESTRICTION: 'co',
  
  // Radio de búsqueda por defecto (en metros)
  DEFAULT_SEARCH_RADIUS: 50000, // 50km
  
  // Configuraciones del mapa
  MAP_OPTIONS: {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }
};

// Tipos de marcadores para diferentes categorías
export const MARKER_TYPES = {
  USER_LOCATION: {
    icon: '📍',
    color: '#3B82F6', // Blue
    size: { width: 32, height: 32 }
  },
  OPPORTUNITY: {
    icon: '🎯',
    color: '#F59E0B', // Amber
    size: { width: 28, height: 28 }
  },
  FLASH_JOB: {
    icon: '⚡',
    color: '#EF4444', // Red
    size: { width: 28, height: 28 }
  },
  JOB_OFFER: {
    icon: '💼',
    color: '#10B981', // Green
    size: { width: 28, height: 28 }
  },
  HANDYMAN: {
    icon: '🔧',
    color: '#8B5CF6', // Purple
    size: { width: 24, height: 24 }
  },
  BUSINESS: {
    icon: '🏢',
    color: '#6B7280', // Gray
    size: { width: 24, height: 24 }
  }
};

// Configuraciones para diferentes tipos de búsqueda
export const SEARCH_CONFIGS = {
  OPPORTUNITIES: {
    radius: 10000, // 10km
    types: ['store', 'restaurant', 'food'],
  },
  FLASH_JOBS: {
    radius: 15000, // 15km
    types: ['establishment'],
  },
  JOB_OFFERS: {
    radius: 25000, // 25km
    types: ['establishment', 'point_of_interest'],
  },
  HANDYMEN: {
    radius: 30000, // 30km
    types: ['establishment'],
  }
};