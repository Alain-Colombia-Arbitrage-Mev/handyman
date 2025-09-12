import React, { useEffect, useRef, useState } from 'react';
import { Job, CommercialOffer, UserLocation } from '../types';
import { MapPin, DollarSign, Clock, Zap } from 'lucide-react';
import { Badge } from './ui/badge';

interface GoogleMapProps {
  jobs: Job[];
  commercialOffers?: CommercialOffer[];
  userLocation?: UserLocation;
  onJobClick?: (job: Job) => void;
  onOfferClick?: (offer: CommercialOffer) => void;
  zoom?: number;
  height?: string;
  showJobsOnly?: boolean;
}

export function GoogleMap({ 
  jobs, 
  commercialOffers = [], 
  userLocation, 
  onJobClick, 
  onOfferClick,
  zoom = 13,
  height = "400px",
  showJobsOnly = false
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock implementation - En producción usar Google Maps API
  useEffect(() => {
    // Simular carga de Google Maps
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getJobMarkerColor = (job: Job) => {
    if (job.isUrgent) return 'bg-red-500';
    if (job.distance && job.distance < 500) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mudanzas': return '📦';
      case 'plomería': return '🔧';
      case 'electricidad': return '⚡';
      case 'carpintería': return '🔨';
      case 'pintura': return '🎨';
      case 'limpieza': return '🧽';
      default: return '🛠️';
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-100 rounded-lg relative overflow-hidden"
      style={{ height }}
    >
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-gray-100">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Simulated streets */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M0,50 Q150,100 300,50 T600,50" fill="none" stroke="#ddd" strokeWidth="8"/>
          <path d="M50,0 Q100,150 50,300 T50,600" fill="none" stroke="#ddd" strokeWidth="6"/>
          <path d="M0,150 Q200,120 400,150 T800,150" fill="none" stroke="#ddd" strokeWidth="4"/>
        </svg>
      </div>

      {/* User Location */}
      {userLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-30"></div>
          </div>
        </div>
      )}

      {/* Job Markers */}
      {jobs.map((job, index) => (
        <div
          key={job.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${30 + (index % 3) * 20}%`,
            left: `${20 + (index % 4) * 20}%`,
          }}
          onClick={() => onJobClick?.(job)}
        >
          <div className="relative group">
            {/* Marker */}
            <div className={`w-8 h-8 ${getJobMarkerColor(job)} rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}>
              <span className="text-xs">{getCategoryIcon(job.category)}</span>
            </div>
            
            {/* Urgency indicator */}
            {job.isUrgent && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}

            {/* Hover popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px] border">
                <h4 className="font-semibold text-sm mb-1 truncate">{job.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{job.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(job.budget)}
                  </span>
                  {job.distance && (
                    <span className="text-xs text-gray-500">
                      {job.distance < 1000 ? `${job.distance}m` : `${(job.distance/1000).toFixed(1)}km`}
                    </span>
                  )}
                </div>
                {job.isUrgent && (
                  <Badge className="mt-1 text-xs bg-red-100 text-red-800">Urgente</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Commercial Offers */}
      {!showJobsOnly && commercialOffers.map((offer, index) => (
        <div
          key={offer.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${40 + (index % 2) * 30}%`,
            right: `${15 + (index % 3) * 25}%`,
          }}
          onClick={() => onOfferClick?.(offer)}
        >
          <div className="relative group">
            {/* Offer Marker */}
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform border-2 border-white">
              <span className="text-sm">%</span>
            </div>

            {/* Hover popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-3 min-w-[180px] border">
                <h4 className="font-semibold text-sm mb-1">{offer.businessName}</h4>
                <p className="text-xs text-gray-600 mb-1">{offer.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-orange-600">
                    {offer.discount}% OFF
                  </span>
                  {offer.distance && (
                    <span className="text-xs text-gray-500">
                      {offer.distance < 1000 ? `${offer.distance}m` : `${(offer.distance/1000).toFixed(1)}km`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
          <span className="text-lg">+</span>
        </button>
        <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
          <span className="text-lg">-</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-2 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span>Tu ubicación</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Trabajo cercano</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Trabajo urgente</span>
        </div>
        {!showJobsOnly && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Oferta comercial</span>
          </div>
        )}
      </div>
    </div>
  );
}