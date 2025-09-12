import React from 'react';
import { Camera, Upload, MapPin, Clock, Info, DollarSign, Calendar, Zap } from 'lucide-react-native';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../LanguageProvider';
import { categories } from '../../data/mockData';

interface PostJobTabProps {
  onNavigateToQuickOpportunity: () => void;
  onAddNotification: (notification: any) => void;
}

export function PostJobTab({ onNavigateToQuickOpportunity, onAddNotification }: PostJobTabProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-full min-h-screen bg-gray-50 pb-20 w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 safe-area-inset-top w-full">
        <h1 className="text-xl font-semibold">{t('postJob.title')}</h1>
        <p className="text-sm text-gray-500">{t('postJob.subtitle')}</p>
      </div>

      <div className="px-4 py-4 w-full">
        {/* Flash Offer Option */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t('postJob.needSomethingUrgent')}</h3>
              <p className="text-sm opacity-90">{t('postJob.useFlashOffer')}</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            className="w-full touch-manipulation"
            onClick={onNavigateToQuickOpportunity}
          >
            <Zap size={16} />
            {t('home.flashOffer')} ⚡
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm w-full">
          <div className="p-4 space-y-6">
            <div>
              <label className="block font-medium mb-3">{t('postJob.projectPhotos')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center w-full">
                <Camera size={32} />
                <p className="text-sm text-gray-500 mb-2">{t('postJob.addPhotos')}</p>
                <Button variant="outline" size="sm" className="touch-manipulation">
                  <Upload size={16} />
                  {t('postJob.uploadPhotos')}
                </Button>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">{t('postJob.jobTitle')} *</label>
              <Input placeholder={t('postJob.jobTitlePlaceholder')} className="h-12 w-full touch-manipulation" />
            </div>

            <div>
              <label className="block font-medium mb-2">{t('flashOffer.category')} *</label>
              <select className="w-full p-3 border border-gray-300 rounded-xl h-12 touch-manipulation">
                <option value="">{t('postJob.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">{t('postJob.detailedDescription')} *</label>
              <Textarea placeholder={t('postJob.detailedDescriptionPlaceholder')} rows={4} className="resize-none w-full touch-manipulation" />
            </div>

            <div>
              <label className="block font-medium mb-2">{t('postJob.location')} *</label>
              <div className="relative w-full">
                <MapPin size={20} />
                <Input placeholder={t('postJob.locationPlaceholder')} className="pl-10 h-12 w-full touch-manipulation" />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">{t('postJob.preferredSchedule')} *</label>
              
              <div className="grid grid-cols-1 gap-3 mb-3">
                <label className="flex items-start p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
                  <input type="radio" name="scheduleType" value="flexible" className="mt-1 mr-3" defaultChecked />
                  <div className="flex-1">
                    <p className="font-medium">{t('postJob.flexibleSchedule')}</p>
                    <p className="text-sm text-gray-500">{t('postJob.flexibleScheduleDesc')}</p>
                  </div>
                </label>
                
                <label className="flex items-start p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
                  <input type="radio" name="scheduleType" value="specific" className="mt-1 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">{t('postJob.specificSchedule')}</p>
                    <p className="text-sm text-gray-500">{t('postJob.specificScheduleDesc')}</p>
                  </div>
                </label>
              </div>

              <div className="relative w-full">
                <Clock size={20} />
                <Input placeholder={t('postJob.scheduleExample')} className="pl-10 h-12 w-full touch-manipulation" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Info size={16} />
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium mb-1">{t('postJob.suggestion')}</p>
                    <p className="text-blue-700">{t('postJob.flexibleTip')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">{t('postJob.budget')} *</label>
              
              <div className="grid grid-cols-1 gap-3 mb-3">
                <label className="flex items-start p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
                  <input type="radio" name="budgetType" value="fixed" className="mt-1 mr-3" defaultChecked />
                  <div>
                    <p className="font-medium">{t('postJob.fixedBudget')}</p>
                    <p className="text-sm text-gray-500">{t('postJob.fixedBudgetDesc')}</p>
                  </div>
                </label>
                
                <label className="flex items-start p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
                  <input type="radio" name="budgetType" value="average" className="mt-1 mr-3" />
                  <div>
                    <p className="font-medium">{t('postJob.averageBudget')}</p>
                    <p className="text-sm text-gray-500">{t('postJob.averageBudgetDesc')}</p>
                  </div>
                </label>
              </div>

              <div className="relative w-full">
                <DollarSign size={20} />
                <Input type="number" placeholder={t('postJob.budgetExample')} className="pl-10 h-12 w-full touch-manipulation" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Info size={16} />
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium mb-1">{t('postJob.howItWorks')}</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• <strong>{t('postJob.fixedExplanation')}</strong></li>
                      <li>• <strong>{t('postJob.averageExplanation')}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">{t('postJob.deadline')}</label>
              <div className="relative w-full">
                <Calendar size={20} />
                <Input type="date" className="pl-10 h-12 w-full touch-manipulation" />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-3">{t('postJob.projectUrgency')}</label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="h-12 touch-manipulation">{t('postJob.notUrgent')}</Button>
                <Button variant="outline" size="sm" className="h-12 touch-manipulation">{t('postJob.moderate')}</Button>
                <Button variant="outline" size="sm" className="h-12 touch-manipulation">{t('postJob.urgent')}</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <Button 
              className="w-full h-12 touch-manipulation" 
              onClick={() => { 
                onAddNotification({ 
                  type: 'system', 
                  title: t('success.jobPublished'), 
                  message: t('success.jobPublishedDesc'), 
                  read: false 
                }); 
              }}
            >
              {t('postJob.publishJob')}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">{t('postJob.jobVisibility')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}