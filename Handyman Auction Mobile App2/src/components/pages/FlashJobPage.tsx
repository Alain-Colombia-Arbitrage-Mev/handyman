import React, { useState } from 'react';
import { ArrowLeft, MapPin, DollarSign, Clock, Zap, Info, Camera, Send, Calendar, Wrench } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { categories } from '../../data/mockData';
import { useLanguage } from '../LanguageProvider';

interface FlashJobPageProps {
  onBack: () => void;
  onPublish: (jobData: any) => void;
}

export function FlashJobPage({ onBack, onPublish }: FlashJobPageProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    budget: '',
    urgency: 'urgent' as 'urgent' | 'medium' | 'low'
  });

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!formData.title || !formData.category || !formData.location || !formData.budget) {
      return;
    }

    setIsPublishing(true);
    
    // Simular delay de publicación
    setTimeout(() => {
      const jobData = {
        ...formData,
        id: Date.now().toString(),
        type: 'flash',
        postedAt: new Date(),
        status: 'active'
      };
      
      onPublish(jobData);
      setIsPublishing(false);
    }, 1500);
  };

  const isFormValid = formData.title && formData.category && formData.location && formData.budget;

  return (
    <div className="min-h-full min-h-screen bg-gray-50 pb-20 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 safe-area-inset-top w-full">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2 touch-manipulation">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Wrench size={20} className="text-blue-500" />
              <h1 className="font-semibold">{t('menu.quickJobs')}</h1>
            </div>
            <p className="text-sm text-gray-500">{t('menu.quickJobsDesc')}</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Wrench size={16} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{t('flashJob.quickUrgentJobs')}</p>
              <p className="text-xs opacity-90">{t('flashJob.repairsDeliveriesServices')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 w-full">
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block font-medium mb-2 text-gray-800">
                {t('flashJob.whatDoYouNeed')} *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('flashJob.titlePlaceholder')}
                className="h-12 w-full touch-manipulation"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/60 {t('flashJob.characters')}</p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block font-medium mb-2 text-gray-800">
                {t('flashOffer.category')} *
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl h-12 touch-manipulation bg-white"
              >
                <option value="">{t('postJob.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {t(`categories.${cat.id}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block font-medium mb-2 text-gray-800">
                {t('flashJob.where')} *
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={t('flashJob.locationPlaceholder')}
                  className="pl-10 h-12 w-full touch-manipulation"
                />
              </div>
            </div>

            {/* Presupuesto */}
            <div>
              <label className="block font-medium mb-2 text-gray-800">
                {t('flashJob.approximateBudget')} *
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder={t('flashJob.budgetPlaceholder')}
                  type="number"
                  className="pl-10 h-12 w-full touch-manipulation"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {['50000', '100000', '250000', '500000'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, budget: amount }))}
                    className="text-xs touch-manipulation"
                  >
                    ${parseInt(amount).toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Descripción opcional */}
            <div>
              <label className="block font-medium mb-2 text-gray-800">
                {t('flashJob.additionalDetails')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('flashJob.detailsPlaceholder')}
                rows={3}
                className="w-full touch-manipulation resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 {t('flashJob.characters')}</p>
            </div>

            {/* Urgencia */}
            <div>
              <label className="block font-medium mb-3 text-gray-800">
                {t('flashJob.urgency')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={formData.urgency === 'urgent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: 'urgent' }))}
                  className="h-12 touch-manipulation flex-col gap-1"
                >
                  <Zap size={16} />
                  <span className="text-xs">{t('postJob.urgent')}</span>
                </Button>
                <Button
                  variant={formData.urgency === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: 'medium' }))}
                  className="h-12 touch-manipulation flex-col gap-1"
                >
                  <Clock size={16} />
                  <span className="text-xs">{t('flashJob.normal')}</span>
                </Button>
                <Button
                  variant={formData.urgency === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: 'low' }))}
                  className="h-12 touch-manipulation flex-col gap-1"
                >
                  <Calendar size={16} />
                  <span className="text-xs">{t('flashJob.noRush')}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-2">
              <Wrench size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">{t('menu.quickJobs')}</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• {t('flashJob.perfectForUrgentRepairs')}</li>
                  <li>• {t('flashJob.idealForDeliveries')}</li>
                  <li>• {t('flashJob.professionalsRespondQuickly')}</li>
                  <li>• {t('flashJob.expressSolutions')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <div className="mt-6">
          <Button
            onClick={handlePublish}
            disabled={!isFormValid || isPublishing}
            className="w-full h-14 touch-manipulation bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            {isPublishing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('quickOpportunity.publishing')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send size={18} />
                <span>{t('flashJob.publishFlashJob')}</span>
              </div>
            )}
          </Button>
          
          {!isFormValid && (
            <p className="text-sm text-gray-500 text-center mt-2">
              {t('flashJob.completeRequiredFields')}
            </p>
          )}
        </div>

        {/* Optional Actions */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Navigate to full form */}}
            className="text-gray-600 touch-manipulation"
          >
            {t('flashJob.preferFullForm')}
          </Button>
        </div>
      </div>
    </div>
  );
}