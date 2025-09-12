import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Clock, MapPin, Star, ShoppingBag, Plus, Utensils, Coffee, Pizza, Sandwich } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../LanguageProvider';
import { formatCurrency } from '../../utils/helpers';
import { dailyOffers } from '../../data/mockData';

interface QuickOpportunityPageProps {
  onBack: () => void;
  onPublish: (data: any) => void;
}

export function QuickOpportunityPage({ onBack, onPublish }: QuickOpportunityPageProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    type: 'daily',
    title: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    category: '',
    expirationTime: '22:00'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeLeft = (expiresAt: Date) => {
    const now = currentTime;
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return t('quickOpportunity.expired');
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getUrgencyColor = (expiresAt: Date) => {
    const now = currentTime;
    const timeLeft = expiresAt.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft <= 1) return 'text-red-600 bg-red-100';
    if (hoursLeft <= 2) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onPublish(formData);
      setIsSubmitting(false);
      setShowForm(false);
      setFormData({
        type: 'daily',
        title: '',
        description: '',
        originalPrice: '',
        discountedPrice: '',
        quantity: '',
        category: '',
        expirationTime: '22:00'
      });
    }, 2000);
  };

  const categories = [
    { value: 'pizza', label: t('quickOpportunity.pizza'), icon: Pizza },
    { value: 'sandwich', label: t('quickOpportunity.sandwich'), icon: Sandwich },
    { value: 'coffee', label: t('quickOpportunity.coffee'), icon: Coffee },
    { value: 'dessert', label: t('quickOpportunity.dessert'), icon: Utensils },
    { value: 'asian', label: t('quickOpportunity.asian'), icon: Utensils },
    { value: 'mexican', label: t('quickOpportunity.mexican'), icon: Utensils }
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 safe-area-inset-top">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="p-2 -ml-2 touch-manipulation">
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">{t('quickOpportunity.publishNew')}</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
          {/* Offer Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">{t('quickOpportunity.offerType')}</label>
            <div className="grid grid-cols-1 gap-3">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'daily' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => setFormData({...formData, type: 'daily'})}
              >
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-green-600" />
                  <div>
                    <h3 className="font-medium">{t('quickOpportunity.dailyOffer')}</h3>
                    <p className="text-sm text-gray-500">{t('quickOpportunity.dailyOfferDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('quickOpportunity.title')}</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t('quickOpportunity.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('quickOpportunity.description')}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('quickOpportunity.descriptionPlaceholder')}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('quickOpportunity.originalPrice')}</label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  placeholder="45000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('quickOpportunity.discountedPrice')}</label>
                <Input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({...formData, discountedPrice: e.target.value})}
                  placeholder="25000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('quickOpportunity.quantity')}</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="8"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('quickOpportunity.category')}</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('quickOpportunity.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon size={16} />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('quickOpportunity.expirationTime')}</label>
              <Input
                type="time"
                value={formData.expirationTime}
                onChange={(e) => setFormData({...formData, expirationTime: e.target.value})}
                max="22:00"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('quickOpportunity.publishing') : t('quickOpportunity.publish')}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 safe-area-inset-top">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2 touch-manipulation">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{t('quickOpportunity.flashOffers')}</h1>
            <p className="text-sm text-gray-500">{t('quickOpportunity.publishUrgent')}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Daily Offers Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">{t('quickOpportunity.dailyOffers')}</h2>
              <p className="text-sm text-gray-500">{t('quickOpportunity.foodExcess')}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {/* Navigate to all offers */}}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              {t('quickOpportunity.seeAll')}
            </Button>
          </div>

          {/* Featured Daily Offers */}
          <div className="space-y-3">
            {dailyOffers.slice(0, 3).map(offer => (
              <Card key={offer.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={offer.image} 
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-sm">{offer.title}</h3>
                        <p className="text-xs text-gray-600 truncate">{offer.restaurantName}</p>
                      </div>
                      <Badge className={`ml-2 text-xs ${getUrgencyColor(offer.expiresAt)}`}>
                        <Clock size={10} className="mr-1" />
                        {getTimeLeft(offer.expiresAt)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">
                          {formatCurrency(offer.discountedPrice)}
                        </span>
                        <span className="text-gray-400 line-through">
                          {formatCurrency(offer.originalPrice)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          -{offer.discountPercentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Star size={10} className="text-yellow-500 fill-current" />
                        <span>{offer.rating}</span>
                        <MapPin size={10} />
                        <span>{offer.distance}km</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-orange-600 font-medium">
                          {t('offers.itemsLeft', { count: offer.itemsLeft })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-orange-500 h-1 rounded-full transition-all" 
                          style={{ width: `${((offer.totalItems - offer.itemsLeft) / offer.totalItems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Publish New Offer Button */}
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-3">{t('quickOpportunity.haveExcess')}</h3>
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white touch-manipulation"
            >
              <Plus size={18} className="mr-2" />
              {t('quickOpportunity.publishNew')}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-1">{t('offers.dailyOffers')}</h4>
                <p className="text-sm text-green-700">
                  {t('quickOpportunity.dailyOffersDescription')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}