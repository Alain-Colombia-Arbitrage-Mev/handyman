import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Job, CommercialOffer, UserLocation } from '../types';
import { MapPin, Navigation, Zap, Store, Target, Briefcase, Users } from 'lucide-react-native';
import { GOOGLE_MAPS_CONFIG, MARKER_TYPES } from '../config/googleMaps';
import { geolocationService, GeolocationPosition } from '../services/geolocationService';
import { useGeolocation } from '../hooks/useGeolocation';
import { Badge } from './ui/badge';

// Nuevos tipos para los diferentes elementos del mapa
interface Opportunity {
  id: string;
  title: string;
  businessName: string;
  discount: number;
  coordinates: { lat: number; lng: number };
  distance?: number;
  availableUntil: Date;
}

interface FlashJob {
  id: string;
  title: string;
  fixedPrice: number;
  currency: string;
  coordinates: { lat: number; lng: number };
  distance?: number;
  urgency: 'high' | 'urgent';
  deadline: Date;
}

interface JobOffer {
  id: string;
  title: string;
  budget: { min: number; max: number; currency: string };
  coordinates: { lat: number; lng: number };
  distance?: number;
  jobType: 'fixed_price' | 'bids_allowed';
  proposalsCount?: number;
}

interface GoogleMapRealProps {
  // Nuevos tipos de elementos
  opportunities?: Opportunity[];
  flashJobs?: FlashJob[];
  jobOffers?: JobOffer[];
  // Legacy para compatibilidad
  jobs?: Job[];
  commercialOffers?: CommercialOffer[];
  userLocation?: UserLocation;
  
  // Callbacks
  onOpportunityClick?: (opportunity: Opportunity) => void;
  onFlashJobClick?: (flashJob: FlashJob) => void;
  onJobOfferClick?: (jobOffer: JobOffer) => void;
  onJobClick?: (job: Job) => void;
  onOfferClick?: (offer: CommercialOffer) => void;
  
  // Configuraciones
  zoom?: number;
  height?: string;
  showTypes?: {
    opportunities?: boolean;
    flashJobs?: boolean;
    jobOffers?: boolean;
    userLocation?: boolean;
  };
  filterRadius?: number; // Radio en km para filtrar elementos
}

export function GoogleMapReal({ 
  opportunities = [],
  flashJobs = [],
  jobOffers = [],
  jobs = [], 
  commercialOffers = [], 
  userLocation, 
  onOpportunityClick,
  onFlashJobClick,
  onJobOfferClick,
  onJobClick, 
  onOfferClick,
  zoom = GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
  height = "400px",
  showTypes = {
    opportunities: true,
    flashJobs: true,
    jobOffers: true,
    userLocation: true
  },
  filterRadius = 25
}: GoogleMapRealProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { currentLocation, getCurrentLocation } = useGeolocation();

  // Inicializar Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        await geolocationService.initializeServices();
        
        if (!mapRef.current) return;

        const mapOptions: google.maps.MapOptions = {
          ...GOOGLE_MAPS_CONFIG.MAP_OPTIONS,
          zoom,
          center: userLocation || currentLocation || GOOGLE_MAPS_CONFIG.DEFAULT_CENTER
        };

        const googleMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(googleMap);
        setIsLoaded(true);

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoaded(false);
      }
    };

    initMap();
  }, [zoom, userLocation, currentLocation]);

  // Crear marcador personalizado
  const createCustomMarker = useCallback((
    position: google.maps.LatLngLiteral,
    type: keyof typeof MARKER_TYPES,
    title: string,
    onClick?: () => void
  ) => {
    if (!map) return null;

    const markerConfig = MARKER_TYPES[type];

    const marker = new google.maps.Marker({
      position,
      map,
      title,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="${markerConfig.size.width}" height="${markerConfig.size.height}" viewBox="0 0 ${markerConfig.size.width} ${markerConfig.size.height}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${markerConfig.size.width/2}" cy="${markerConfig.size.height/2}" r="${markerConfig.size.width/2-2}" fill="${markerConfig.color}" stroke="white" stroke-width="2"/>
            <text x="${markerConfig.size.width/2}" y="${markerConfig.size.height/2+4}" font-family="Arial" font-size="16" text-anchor="middle" fill="white">${markerConfig.icon}</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(markerConfig.size.width, markerConfig.size.height),
        anchor: new google.maps.Point(markerConfig.size.width/2, markerConfig.size.height/2)
      }
    });

    if (onClick) {
      marker.addListener('click', onClick);
    }

    return marker;
  }, [map]);

  // Crear InfoWindow para mostrar detalles
  const createInfoWindow = useCallback((content: string) => {
    return new google.maps.InfoWindow({
      content: `<div class="p-2 max-w-xs">${content}</div>`
    });
  }, []);

  // Actualizar marcadores cuando cambien los datos
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Limpiar marcadores existentes
    markers.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];

    // Marcador de ubicación del usuario
    if (showTypes.userLocation && (userLocation || currentLocation)) {
      const position = userLocation || currentLocation;
      if (position) {
        const userMarker = createCustomMarker(
          { lat: position.lat, lng: position.lng },
          'USER_LOCATION',
          'Tu ubicación'
        );
        if (userMarker) newMarkers.push(userMarker as any);
      }
    }

    // Marcadores de oportunidades
    if (showTypes.opportunities && opportunities.length > 0) {
      opportunities.forEach(opportunity => {
        if (!opportunity.coordinates) return;

        const marker = createCustomMarker(
          opportunity.coordinates,
          'OPPORTUNITY',
          opportunity.title,
          () => onOpportunityClick?.(opportunity)
        );

        if (marker) {
          const infoWindow = createInfoWindow(`
            <div>
              <h4 class="font-semibold text-sm mb-1">${opportunity.businessName}</h4>
              <p class="text-xs text-gray-600 mb-2">${opportunity.title}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-orange-600">${opportunity.discount}% OFF</span>
                ${opportunity.distance ? `<span class="text-xs text-gray-500">${opportunity.distance.toFixed(1)}km</span>` : ''}
              </div>
              <div class="text-xs text-red-600 mt-1">
                ⏰ Expira: ${opportunity.availableUntil.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          `);

          marker.addListener('click', () => {
            infoWindow.open(map, marker as any);
          });

          newMarkers.push(marker as any);
        }
      });
    }

    // Marcadores de trabajos flash
    if (showTypes.flashJobs && flashJobs.length > 0) {
      flashJobs.forEach(flashJob => {
        if (!flashJob.coordinates) return;

        const marker = createCustomMarker(
          flashJob.coordinates,
          'FLASH_JOB',
          flashJob.title,
          () => onFlashJobClick?.(flashJob)
        );

        if (marker) {
          const infoWindow = createInfoWindow(`
            <div>
              <h4 class="font-semibold text-sm mb-1">${flashJob.title}</h4>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-bold text-green-600">$${flashJob.fixedPrice.toLocaleString()} ${flashJob.currency}</span>
                ${flashJob.distance ? `<span class="text-xs text-gray-500">${flashJob.distance.toFixed(1)}km</span>` : ''}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">${flashJob.urgency.toUpperCase()}</span>
                <span class="text-xs text-gray-600">⏰ ${flashJob.deadline.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          `);

          marker.addListener('click', () => {
            infoWindow.open(map, marker as any);
          });

          newMarkers.push(marker as any);
        }
      });
    }

    // Marcadores de ofertas de trabajo
    if (showTypes.jobOffers && jobOffers.length > 0) {
      jobOffers.forEach(jobOffer => {
        if (!jobOffer.coordinates) return;

        const marker = createCustomMarker(
          jobOffer.coordinates,
          'JOB_OFFER',
          jobOffer.title,
          () => onJobOfferClick?.(jobOffer)
        );

        if (marker) {
          const priceText = jobOffer.jobType === 'fixed_price' 
            ? `Precio fijo` 
            : `$${jobOffer.budget.min}-${jobOffer.budget.max} ${jobOffer.budget.currency}`;

          const infoWindow = createInfoWindow(`
            <div>
              <h4 class="font-semibold text-sm mb-1">${jobOffer.title}</h4>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-bold text-blue-600">${priceText}</span>
                ${jobOffer.distance ? `<span class="text-xs text-gray-500">${jobOffer.distance.toFixed(1)}km</span>` : ''}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${jobOffer.jobType === 'bids_allowed' ? 'Acepta pujas' : 'Precio fijo'}</span>
                ${jobOffer.proposalsCount ? `<span class="text-xs text-gray-600">${jobOffer.proposalsCount} pujas</span>` : ''}
              </div>
            </div>
          `);

          marker.addListener('click', () => {
            infoWindow.open(map, marker as any);
          });

          newMarkers.push(marker as any);
        }
      });
    }

    // Marcadores legacy para compatibilidad
    if (jobs.length > 0) {
      jobs.forEach(job => {
        if (!job.coordinates) return;

        const marker = new google.maps.Marker({
          position: job.coordinates,
          map,
          title: job.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: job.isUrgent ? '#EF4444' : '#3B82F6',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
          }
        });

        const infoWindow = createInfoWindow(`
          <div>
            <h4 class="font-semibold text-sm mb-1">${job.title}</h4>
            <p class="text-xs text-gray-600 mb-2">${job.location}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-green-600">${job.budget ? `$${job.budget.min}-${job.budget.max}` : 'N/A'}</span>
              ${job.distance ? `<span class="text-xs text-gray-500">${job.distance}m</span>` : ''}
            </div>
          </div>
        `);

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          onJobClick?.(job);
        });

        newMarkers.push(marker);
      });
    }

    setMarkers(newMarkers);
  }, [map, isLoaded, opportunities, flashJobs, jobOffers, jobs, userLocation, currentLocation, showTypes, createCustomMarker, createInfoWindow, onOpportunityClick, onFlashJobClick, onJobOfferClick, onJobClick]);

  // Ajustar vista del mapa para mostrar todos los marcadores
  useEffect(() => {
    if (!map || markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidMarkers = false;

    // Agregar ubicación del usuario
    if (userLocation || currentLocation) {
      const position = userLocation || currentLocation;
      if (position) {
        bounds.extend({ lat: position.lat, lng: position.lng });
        hasValidMarkers = true;
      }
    }

    // Agregar ubicaciones de elementos
    [...opportunities, ...flashJobs, ...jobOffers, ...jobs].forEach(item => {
      if (item.coordinates) {
        bounds.extend(item.coordinates);
        hasValidMarkers = true;
      }
    });

    if (hasValidMarkers) {
      map.fitBounds(bounds);
      
      // Asegurar zoom mínimo y máximo
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 18) {
          map.setZoom(18);
        } else if (currentZoom && currentZoom < 10) {
          map.setZoom(10);
        }
      });
    }
  }, [map, markers, opportunities, flashJobs, jobOffers, jobs, userLocation, currentLocation]);

  if (!isLoaded) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Controles personalizados */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600"
          onClick={() => getCurrentLocation(true)}
          title="Centrar en mi ubicación"
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs max-w-xs">
        <h4 className="font-semibold mb-2">Leyenda</h4>
        <div className="grid grid-cols-2 gap-2">
          {showTypes.userLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Tu ubicación</span>
            </div>
          )}
          {showTypes.opportunities && opportunities.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Oportunidades ({opportunities.length})</span>
            </div>
          )}
          {showTypes.flashJobs && flashJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Flash Jobs ({flashJobs.length})</span>
            </div>
          )}
          {showTypes.jobOffers && jobOffers.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Ofertas ({jobOffers.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Target size={12} />
            <span>{opportunities.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={12} />
            <span>{flashJobs.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={12} />
            <span>{jobOffers.length}</span>
          </div>
          {filterRadius && (
            <div className="flex items-center gap-1 text-gray-500">
              <span>📍 {filterRadius}km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}