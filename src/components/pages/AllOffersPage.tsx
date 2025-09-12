import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Star, ShoppingBag, Filter, Search, Utensils, Coffee, Pizza, Sandwich } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useLanguage } from '../LanguageProvider';
import { formatCurrency } from '../../utils/helpers';

interface DailyOffer {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  itemsLeft: number;
  totalItems: number;
  expiresAt: Date;
  category: 'pizza' | 'sandwich' | 'coffee' | 'dessert' | 'asian' | 'mexican';
  rating: number;
  distance: number;
  address: string;
  image: string;
}

interface AllOffersPageProps {
  onBackToProfile: () => void;
}

export function AllOffersPage({ onBackToProfile }: AllOffersPageProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data for daily offers
  const [dailyOffers] = useState<DailyOffer[]>([
    {
      id: '1',
      restaurantName: 'Pizzería Napolitana',
      restaurantImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      title: 'Pizza Margherita Familiar',
      description: 'Pizza familiar recién horneada con ingredientes frescos',
      originalPrice: 45000,
      discountedPrice: 25000,
      discountPercentage: 44,
      itemsLeft: 3,
      totalItems: 8,
      expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
      category: 'pizza',
      rating: 4.8,
      distance: 0.8,
      address: 'Calle 123 #45-67',
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400'
    },
    {
      id: '2',
      restaurantName: 'Café Central',
      restaurantImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
      title: 'Sandwich Club + Café',
      description: 'Combo perfecto: sandwich club gigante + café americano',
      originalPrice: 28000,
      discountedPrice: 15000,
      discountPercentage: 46,
      itemsLeft: 5,
      totalItems: 10,
      expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
      category: 'sandwich',
      rating: 4.6,
      distance: 1.2,
      address: 'Carrera 89 #12-34',
      image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400'
    },
    {
      id: '3',
      restaurantName: 'Dulces & Postres',
      restaurantImage: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
      title: 'Torta de Chocolate',
      description: 'Deliciosa torta de chocolate con cobertura de fresa',
      originalPrice: 35000,
      discountedPrice: 20000,
      discountPercentage: 43,
      itemsLeft: 2,
      totalItems: 6,
      expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
      category: 'dessert',
      rating: 4.9,
      distance: 0.5,
      address: 'Avenida 68 #34-21',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
    },
    {
      id: '4',
      restaurantName: 'Wok Express',
      restaurantImage: 'https://images.unsplash.com/photo-1556909411-f5335e2e4b58?w=400',
      title: 'Arroz Chino Especial',
      description: 'Arroz chino con pollo, cerdo y vegetales frescos',
      originalPrice: 32000,
      discountedPrice: 18000,
      discountPercentage: 44,
      itemsLeft: 4,
      totalItems: 12,
      expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
      category: 'asian',
      rating: 4.7,
      distance: 1.5,
      address: 'Centro Comercial Plaza',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'
    }
  ]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'pizza', name: t('quickOpportunity.pizza'), icon: Pizza },
    { id: 'sandwich', name: t('quickOpportunity.sandwich'), icon: Sandwich },
    { id: 'coffee', name: t('quickOpportunity.coffee'), icon: Coffee },
    { id: 'dessert', name: t('quickOpportunity.dessert'), icon: Utensils },
    { id: 'asian', name: t('quickOpportunity.asian'), icon: Utensils },
    { id: 'mexican', name: t('quickOpportunity.mexican'), icon: Utensils }
  ];

  const filteredOffers = dailyOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.restaurantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || offer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 safe-area-inset-top">
          <Button variant="ghost" size="sm" onClick={onBackToProfile} className="p-2 -ml-2 touch-manipulation">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{t('offers.dailyOffers')}</h1>
            <p className="text-sm text-gray-500">{t('offers.beforeTenPM')}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredOffers.length} {t('offers.available')}
          </Badge>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('offers.searchOffers')}
              className="pl-10 pr-4 h-12"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className="whitespace-nowrap"
            >
              {t('categories.all')}
            </Button>
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap flex items-center gap-2"
                >
                  <IconComponent size={16} />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="px-4 py-4 space-y-4">
        {filteredOffers.map(offer => (
          <Card key={offer.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={offer.image} 
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{offer.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{offer.restaurantName}</p>
                  </div>
                  <Badge className={`ml-2 text-xs ${getUrgencyColor(offer.expiresAt)}`}>
                    <Clock size={12} />
                    {getTimeLeft(offer.expiresAt)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{offer.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(offer.discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(offer.originalPrice)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      -{offer.discountPercentage}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star size={12} />
                      <span>{offer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{offer.distance}km</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-medium">
                      {t('offers.itemsLeft', { count: offer.itemsLeft })}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-orange-500 h-1 rounded-full transition-all" 
                      style={{ width: `${((offer.totalItems - offer.itemsLeft) / offer.totalItems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4">
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                <ShoppingBag size={16} />
                {t('offers.orderNow')}
              </Button>
            </div>
          </Card>
        ))}

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <ShoppingBag size={48} />
            </div>
            <h3 className="font-medium text-gray-600 mb-2">{t('offers.noOffersFound')}</h3>
            <p className="text-sm text-gray-500">{t('offers.tryDifferentSearch')}</p>
          </div>
        )}
      </div>
    </div>
  );
}