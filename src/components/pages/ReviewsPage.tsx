import React from 'react';
import { Review } from '../../types';
import { Star, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface ReviewsPageProps {
  reviews: Review[];
  onBackToProfile: () => void;
}

export function ReviewsPage({ reviews, onBackToProfile }: ReviewsPageProps) {
  const { t } = useLanguage();
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('profile.reviews')} onBack={onBackToProfile} />

      <div className="p-4 space-y-4">
        {/* Rating Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex">{renderStars(4.5)}</div>
            <span className="text-2xl font-semibold">4.5</span>
          </div>
          <p className="text-gray-600">Basado en {reviews.length} reseñas</p>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={review.handymanAvatar}
                  alt={review.handymanName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{review.handymanName}</h4>
                      <p className="text-sm text-gray-600 truncate">{review.jobTitle}</p>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {review.date.toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm font-medium">{review.rating}/5</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              
              {review.response && (
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle size={14} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Respuesta del profesional</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {review.response.date.toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.response.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-600 mb-2">
              No tienes reseñas aún
            </h3>
            <p className="text-sm text-gray-500">
              Completa trabajos para recibir reseñas de los profesionales
            </p>
          </div>
        )}
      </div>
    </div>
  );
}