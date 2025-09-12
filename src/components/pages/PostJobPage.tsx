import React, { useState } from 'react';
import { ArrowLeft, Plus, MapPin, DollarSign, Clock, Image, FileText, AlertCircle } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { CategoryDropdown } from '../CategoryDropdown';
import { Header, BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';
import { categories } from '../../data/mockData';

interface PostJobPageProps {
  onBack: () => void;
  onShowMenu: () => void;
  onShowNotifications: () => void;
  onPublishJob: (jobData: any) => void;
  unreadCount: number;
}

export function PostJobPage({ 
  onBack, 
  onShowMenu, 
  onShowNotifications, 
  onPublishJob,
  unreadCount 
}: PostJobPageProps) {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    urgency: 'normal',
    images: [] as File[]
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePublish = () => {
    onPublishJob(formData);
    onBack();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.location && formData.budget;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.title')}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('postJob.titlePlaceholder')}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.category')}
              </label>
              <CategoryDropdown
                categories={categories}
                selectedCategory={formData.category}
                onCategorySelect={(categoryId) => handleInputChange('category', categoryId)}
                placeholder={t('postJob.selectCategory')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('postJob.descriptionPlaceholder')}
                rows={4}
                className="w-full"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.location')}
              </label>
              <div className="relative">
                <MapPin size={20} />
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('postJob.locationPlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.budget')}
              </label>
              <div className="relative">
                <DollarSign size={20} />
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('postJob.budgetHint')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.urgency')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'normal', 'high'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleInputChange('urgency', level)}
                    className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                      formData.urgency === level
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Clock size={16} />
                    <span className="text-xs font-medium">
                      {t(`postJob.urgency.${level}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.images')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image size={32} />
                <p className="text-sm text-gray-500 mb-2">
                  {t('postJob.imagesHint')}
                </p>
                <Button variant="outline" size="sm">
                  <Plus size={16} />
                  {t('postJob.addImages')}
                </Button>
              </div>
            </div>

            {/* Resumen del trabajo */}
            <Card className="p-4 bg-gray-50">
              <h3 className="font-medium mb-3">{t('postJob.summary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('postJob.title')}:</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('postJob.category')}:</span>
                  <span className="font-medium">
                    {categories.find(c => c.id === formData.category)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('postJob.location')}:</span>
                  <span className="font-medium">{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('postJob.budget')}:</span>
                  <span className="font-medium">${formData.budget} COP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('postJob.urgency')}:</span>
                  <Badge variant={formData.urgency === 'high' ? 'destructive' : 'secondary'}>
                    {t(`postJob.urgency.${formData.urgency}`)}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">{t('postJob.publishInfo')}</p>
                  <p>{t('postJob.publishDescription')}</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <BackHeader title={t('menu.publishJob')} onBack={onBack} />

      {/* Progress Steps */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 <= currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  index + 1 < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          {t('postJob.step')} {currentStep} {t('postJob.of')} {totalSteps}
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {renderStepContent()}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1"
            >
              {t('common.previous')}
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNextStep}
              disabled={!isStepValid()}
              className="flex-1"
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={!isStepValid()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {t('postJob.publish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}