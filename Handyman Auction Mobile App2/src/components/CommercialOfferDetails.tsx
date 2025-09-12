import React from 'react';
import { CommercialOffer } from '../types';
import { ArrowLeft, MapPin, Clock, Percent, Store, Phone, Navigation, Share } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';
import { formatCurrency } from '../utils/helpers';

interface CommercialOfferDetailsProps {
  offer: CommercialOffer;
  onBack: () => void;
}

export function CommercialOfferDetails({ offer, onBack }: CommercialOfferDetailsProps) {
  const { t } = useLanguage();
  
  const formatDistance = (distance: number) => {
    return distance < 1000 ? `${distance}m` : `${(distance/1000).toFixed(1)}km`;
  };

  const getTimeLeft = () => {
    const now = new Date();
    const timeLeft = offer.validUntil.getTime() - now.getTime();
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (daysLeft > 0) {
      return t('offers.daysLeft', { days: daysLeft });
    } else if (hoursLeft > 0) {
      return t('offers.hoursLeft', { hours: hoursLeft });
    } else {
      return t('offers.lessThanOneHour');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'retail': return '🛍️';
      case 'services': return '🔧';
      case 'entertainment': return '🎬';
      default: return '🏪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="font-semibold flex-1">{t('offers.specialOffer')}</h1>
          <Button variant="ghost" size="sm" className="p-2">
            <Share size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Business Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
              <Store size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{offer.businessName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>{getCategoryIcon(offer.category)}</span>
                <span className="capitalize">{t(`categories.${offer.category}`)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} />
                <span>{offer.location}</span>
                {offer.distance && (
                  <>
                    <span>•</span>
                    <span>{formatDistance(offer.distance)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Discount Badge */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent size={24} />
              <span className="text-3xl font-bold">{offer.discount}%</span>
            </div>
            <p className="text-orange-100">{t('offers.specialDiscount')}</p>
          </div>

          {/* Offer Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{offer.title}</h3>
            <p className="text-gray-700 leading-relaxed">{offer.description}</p>
            
            {offer.originalPrice && offer.discountedPrice && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t('offers.originalPrice')}:</span>
                  <span className="line-through text-gray-500">{formatCurrency(offer.originalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t('offers.discountedPrice')}:</span>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(offer.discountedPrice)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validity and Terms */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">{t('offers.offerInformation')}</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('offers.validUntil')}:</span>
              <div className="text-right">
                <p className="font-medium">{offer.validUntil.toLocaleDateString()}</p>
                <p className="text-sm text-orange-600">{getTimeLeft()}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('offers.status')}:</span>
              <Badge className={offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {offer.status === 'active' ? t('offers.active') : t('offers.expired')}
              </Badge>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-1">{t('offers.termsAndConditions')}</h4>
            <p className="text-sm text-yellow-700">{offer.termsAndConditions}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button variant="outline" className="h-12">
              <Phone size={16} className="mr-2" />
              {t('offers.call')}
            </Button>
            <Button variant="outline" className="h-12">
              <Navigation size={16} className="mr-2" />
              {t('offers.getDirections')}
            </Button>
          </div>
          
          <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            {t('offers.useOfferNow')}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            {t('offers.presentCoupon')}
          </p>
        </div>

        {/* Map Preview */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">{t('offers.location')}</h3>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin size={24} className="mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-500">{t('offers.locationMap')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}