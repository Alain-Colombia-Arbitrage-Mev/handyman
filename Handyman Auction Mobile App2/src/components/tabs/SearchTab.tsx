import React from 'react';
import { Search, Star, ChevronRight, MessageCircle, ArrowLeft, Award, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useLanguage } from '../LanguageProvider';
import { formatCurrency } from '../../utils/helpers';
import { Category } from '../../types';

interface SearchTabProps {
  searchQuery: string;
  searchFilterCategory: string;
  filteredHandymen: any[];
  categories: Category[];
  onSearchChange: (query: string) => void;
  onCategoryFilterChange: (category: string) => void;
  onHandymanClick: (handyman: any) => void;
  onBack?: () => void;
}

export function SearchTab({
  searchQuery,
  searchFilterCategory,
  filteredHandymen,
  categories,
  onSearchChange,
  onCategoryFilterChange,
  onHandymanClick,
  onBack
}: SearchTabProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-full min-h-screen bg-gray-50 pb-20 w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 safe-area-inset-top w-full">
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <Button variant="ghost" size="sm" className="p-2 -ml-2 touch-manipulation" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{t('search.title')}</h1>
        </div>
        
        <div className="relative mb-4 w-full">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
            placeholder={t('search.searchPlaceholder')}
            className="pl-10 h-12 w-full touch-manipulation" 
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <Button 
            variant={searchFilterCategory === '' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => onCategoryFilterChange('')} 
            className="whitespace-nowrap touch-manipulation"
          >
            {t('categories.all')}
          </Button>
          {categories.filter(c => c.id !== 'all').map((category) => (
            <Button 
              key={category.id} 
              variant={searchFilterCategory === category.id ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => onCategoryFilterChange(searchFilterCategory === category.id ? '' : category.id)} 
              className="whitespace-nowrap touch-manipulation"
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {t('search.professionalsFound', { count: filteredHandymen.length })}
          </div>
          {filteredHandymen.length > 0 && (
            <div className="text-xs text-gray-400">
              {t('quickOpportunity.from')} {formatCurrency(Math.min(...filteredHandymen.map(h => h.hourlyRate)))}/{t('common.hour')}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {filteredHandymen.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mb-1">
                <Award size={12} />
                {t('dashboard.bestPaying')}
              </div>
              <div className="text-blue-900 font-semibold">
                ⭐ {Math.max(...filteredHandymen.map(h => h.rating)).toFixed(1)}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium mb-1">
                <TrendingUp size={12} />
                {t('search.mostJobs')}
              </div>
              <div className="text-green-900 font-semibold">
                🏆 {Math.max(...filteredHandymen.map(h => h.completedJobs))} {t('search.jobs')}
              </div>
            </div>
          </div>
        )}

        {filteredHandymen.map((handyman) => (
          <div 
            key={handyman.id} 
            className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md active:shadow-lg transition-shadow touch-manipulation w-full" 
            onClick={() => onHandymanClick(handyman)}
          >
            <div className="flex items-start gap-3">
              <img 
                src={handyman.avatar} 
                alt={handyman.name} 
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold truncate pr-2">{handyman.name}</h3>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </div>
                
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-medium">{handyman.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({handyman.reviewCount} {t('job.reviews')})</span>
                  <Badge variant="secondary" className="text-xs">
                    {handyman.completedJobs} {t('search.jobs')}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{handyman.bio}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {handyman.specialties.slice(0, 2).map((specialty) => (
                    <span key={specialty} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {specialty}
                    </span>
                  ))}
                  {handyman.specialties.length > 2 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{handyman.specialties.length - 2} {t('search.more')}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-green-600 text-sm">
                    {formatCurrency(handyman.hourlyRate)}/{t('common.hour')}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="touch-manipulation">
                      <MessageCircle size={14} className="mr-1" />
                      {t('job.message')}
                    </Button>
                    <Button size="sm" className="touch-manipulation">{t('job.viewProfile')}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredHandymen.length === 0 && (
          <div className="text-center py-12 w-full">
            <div className="text-gray-400 mb-2">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="font-medium text-gray-600 mb-2">{t('search.noProfessionalsFound')}</h3>
            <p className="text-sm text-gray-500">{t('search.tryChangingFilters')}</p>
          </div>
        )}
      </div>
    </div>
  );
}