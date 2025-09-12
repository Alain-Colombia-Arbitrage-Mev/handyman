import React, { useState, useEffect } from 'react';
import { GoogleMap } from './GoogleMap';
import { Job, CommercialOffer, UserLocation } from '../types';
import { Radar, MapPin, DollarSign, Clock, Filter, Zap, Store, Percent, Menu, Bell } from 'lucide-react-native';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from './LanguageProvider';
import { formatCurrency } from '../utils/helpers';

interface RadarViewProps {
  jobs: Job[];
  commercialOffers: CommercialOffer[];
  unreadCount?: number;
  onJobClick: (job: Job) => void;
  onOfferClick: (offer: CommercialOffer) => void;
  onAddNotification: (notification: any) => void;
  onShowHamburgerMenu?: () => void;
  onShowNotifications?: () => void;
}

export function RadarView({ 
  jobs, 
  commercialOffers, 
  unreadCount = 0,
  onJobClick, 
  onOfferClick, 
  onAddNotification,
  onShowHamburgerMenu,
  onShowNotifications 
}: RadarViewProps) {
  const { t } = useLanguage();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [radarRadius, setRadarRadius] = useState(1000); // metros
  const [showJobsOnly, setShowJobsOnly] = useState(false);
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
  const [nearbyOffers, setNearbyOffers] = useState<CommercialOffer[]>([]);

  // Simular ubicación del usuario (Bogotá)
  useEffect(() => {
    setUserLocation({
      lat: 4.6097,
      lng: -74.0817,
      accuracy: 10,
      timestamp: new Date()
    });
  }, []);

  // Simular radar scanning
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        // Simular encontrar trabajos cercanos
        const randomJobs = jobs.filter(() => Math.random() > 0.7);
        if (randomJobs.length > 0) {
          randomJobs.forEach(job => {
            const distance = Math.floor(Math.random() * radarRadius);
            onAddNotification({
              type: 'nearby_job',
              title: `🎯 ${t('radar.jobNearYou')}`,
              message: `${job.title} - ${distance}m. ${t('radar.pays')} ${formatCurrency(job.budget)}`,
              distance,
              jobId: job.id,
              urgency: job.isUrgent ? 'high' : 'medium',
              coordinates: job.coordinates,
              read: false,
              action: {
                label: t('radar.viewJob'),
                type: 'navigate',
                target: `job/${job.id}`
              }
            });
          });
        }
      }, 10000); // Cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [isScanning, jobs, radarRadius, onAddNotification, t]);

  // Filtrar trabajos y ofertas por proximidad
  useEffect(() => {
    if (userLocation) {
      const jobsWithDistance = jobs.map(job => ({
        ...job,
        distance: Math.floor(Math.random() * 2000) // Simular distancia
      })).filter(job => job.distance <= radarRadius);

      const offersWithDistance = commercialOffers.map(offer => ({
        ...offer,
        distance: Math.floor(Math.random() * 1500) // Simular distancia
      })).filter(offer => offer.distance <= radarRadius);

      setNearbyJobs(jobsWithDistance);
      setNearbyOffers(offersWithDistance);
    }
  }, [userLocation, jobs, commercialOffers, radarRadius]);

  const formatDistance = (distance: number) => {
    return distance < 1000 ? `${distance}m` : `${(distance/1000).toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 safe-area-inset-top">
        <div className="p-4">
          {/* Top section with menu, title and notifications */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 -ml-2 touch-manipulation" 
                onClick={onShowHamburgerMenu}
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <Radar size={24} />
                <h1 className="text-xl font-semibold">{t('radar.title')}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isScanning}
                  onCheckedChange={setIsScanning}
                  className="data-[state=checked]:bg-green-500"
                />
                <span className="text-sm font-medium">
                  {isScanning ? t('radar.active') : t('radar.inactive')}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 relative touch-manipulation" 
                onClick={onShowNotifications}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Radar Status */}
          <div className={`p-3 rounded-lg border ${isScanning ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isScanning ? t('radar.scanningJobs') : t('radar.radarPaused')}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {t('radar.radius')}: {radarRadius < 1000 ? `${radarRadius}m` : `${radarRadius/1000}km`} • 
              {nearbyJobs.length} {t('radar.jobs')} • {nearbyOffers.length} {t('radar.offers')}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="p-4">
        <GoogleMap
          jobs={showJobsOnly ? nearbyJobs : nearbyJobs}
          commercialOffers={showJobsOnly ? [] : nearbyOffers}
          userLocation={userLocation || undefined}
          onJobClick={onJobClick}
          onOfferClick={onOfferClick}
          height="300px"
          showJobsOnly={showJobsOnly}
        />
      </div>

      {/* Controls */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">{t('radar.radarConfig')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('radar.searchRadius')}</label>
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map(radius => (
                  <Button
                    key={radius}
                    variant={radarRadius === radius ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRadarRadius(radius)}
                    className="text-xs touch-manipulation"
                  >
                    {radius < 1000 ? `${radius}m` : `${radius/1000}km`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('radar.jobsOnly')}</p>
                <p className="text-sm text-gray-500">{t('radar.hideCommercialOffers')}</p>
              </div>
              <Switch
                checked={showJobsOnly}
                onCheckedChange={setShowJobsOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="jobs">{t('radar.jobs')} ({nearbyJobs.length})</TabsTrigger>
            <TabsTrigger value="offers">{t('radar.offers')} ({nearbyOffers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-3">
            {nearbyJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow touch-manipulation"
                onClick={() => onJobClick(job)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={12} />
                      {job.location} • {formatDistance(job.distance || 0)}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-green-600">{formatCurrency(job.budget)}</p>
                    {job.isUrgent && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        <Zap size={10} />
                        {t('postJob.urgent')}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>📦 {job.category}</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{t('radar.published')} {Math.floor(Math.random() * 24)}h</span>
                  </div>
                </div>
              </div>
            ))}

            {nearbyJobs.length === 0 && (
              <div className="text-center py-8">
                <Radar size={48} />
                <h3 className="font-medium text-gray-600 mb-2">{t('radar.noNearbyJobs')}</h3>
                <p className="text-sm text-gray-500">
                  {t('radar.activateRadarDesc')}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="offers" className="space-y-3">
            {nearbyOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow touch-manipulation"
                onClick={() => onOfferClick(offer)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Store size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold">{offer.businessName}</h3>
                        <p className="text-sm text-gray-600">{offer.title}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Percent size={14} />
                          <span className="font-semibold">{offer.discount}% OFF</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{formatDistance(offer.distance || 0)}</span>
                      </div>
                      <span>{t('radar.validUntil')} {offer.validUntil.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {nearbyOffers.length === 0 && (
              <div className="text-center py-8">
                <Store size={48} />
                <h3 className="font-medium text-gray-600 mb-2">{t('radar.noNearbyOffers')}</h3>
                <p className="text-sm text-gray-500">
                  {t('radar.commercialOffersDesc')}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}