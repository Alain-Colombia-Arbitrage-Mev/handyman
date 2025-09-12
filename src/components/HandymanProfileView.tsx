import React from 'react';
import { ArrowLeft, Heart, Star, MessageCircle } from 'lucide-react-native';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';
import { formatCurrency } from '../utils/helpers';

interface HandymanProfileViewProps {
  handyman: any;
  onBack: () => void;
}

export function HandymanProfileView({ handyman, onBack }: HandymanProfileViewProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-full min-h-screen bg-gray-50 pb-20 w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 w-full">
        <div className="flex items-center gap-3 px-4 py-3 safe-area-inset-top">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2 touch-manipulation">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="font-semibold flex-1 text-lg">{t('job.professionalProfile')}</h1>
          <Button variant="ghost" size="sm" className="p-2 touch-manipulation">
            <Heart size={20} />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 w-full">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center w-full">
          <img 
            src={handyman.avatar} 
            alt={handyman.name} 
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";
            }}
          />
          <h2 className="text-xl font-semibold mb-2">{handyman.name}</h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center">
              <Star size={16} />
              <span className="ml-1 font-semibold">{handyman.rating}</span>
            </div>
            <span className="text-gray-500">({handyman.reviewCount} {t('job.reviews')})</span>
          </div>
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">{handyman.bio}</p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {handyman.specialties.map((specialty: string) => (
              <Badge key={specialty} variant="secondary" className="text-xs">{specialty}</Badge>
            ))}
          </div>
          <div className="text-2xl font-semibold text-green-600 mb-4">
            {formatCurrency(handyman.hourlyRate)}/{t('common.hour')}
          </div>
          <div className="flex gap-3 w-full">
            <Button className="flex-1 h-12 touch-manipulation">
              <MessageCircle size={16} />
              {t('job.message')}
            </Button>
            <Button variant="outline" className="flex-1 h-12 touch-manipulation">
              {t('job.hire')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-semibold text-blue-600">{handyman.completedJobs}</div>
            <div className="text-sm text-gray-500">{t('job.completedJobs')}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-semibold text-purple-600">98%</div>
            <div className="text-sm text-gray-500">{t('job.successRate')}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm w-full">
          <h3 className="font-semibold mb-4">{t('job.recentWork')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <img 
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=150&fit=crop&auto=format" 
              alt="Trabajo 1" 
              className="rounded-xl object-cover w-full h-24"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop&auto=format";
              }}
            />
            <img 
              src="https://images.unsplash.com/photo-1585316949482-ce762d23f2f7?w=200&h=150&fit=crop&auto=format" 
              alt="Trabajo 2" 
              className="rounded-xl object-cover w-full h-24"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&h=150&fit=crop&auto=format";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}