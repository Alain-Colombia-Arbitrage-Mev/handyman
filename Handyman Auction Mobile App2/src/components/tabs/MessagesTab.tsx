import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useLanguage } from '../LanguageProvider';

interface MessagesTabProps {
  onSetActiveTab: (tab: string) => void;
}

export function MessagesTab({ onSetActiveTab }: MessagesTabProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-full min-h-screen bg-gray-50 pb-20 w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 safe-area-inset-top w-full">
        <h1 className="text-xl font-semibold">{t('messages.title')}</h1>
        <p className="text-sm text-gray-500">{t('profile.chatWithClients')}</p>
      </div>

      <div className="px-4 py-4 space-y-3 w-full">
        <div className="bg-white rounded-2xl shadow-sm w-full">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide">{t('common.active')}</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
              <div className="relative flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format" 
                  alt="Carlos Rodriguez" 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format";
                  }}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium truncate pr-2">Carlos Rodriguez</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">2:30 PM</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{t('messages.canStartTomorrow')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{t('categories.plumbing')}</Badge>
                </div>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            </div>

            <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
              <div className="relative flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format" 
                  alt="Ana Martinez" 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium truncate pr-2">Ana Martinez</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">1:15 PM</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{t('messages.willSendPhotos')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{t('categories.painting')}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm w-full">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide">{t('common.recent')}</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format" 
                alt="Miguel Santos" 
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium truncate pr-2">Miguel Santos</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{t('common.yesterday')}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{t('messages.thankYouOffer')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{t('categories.carpentry')}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12 w-full">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium text-gray-600 mb-2">{t('messages.noMessages')}</h3>
          <p className="text-sm text-gray-500 mb-4">{t('messages.startConversation')}</p>
          <Button onClick={() => onSetActiveTab('post')} className="touch-manipulation">{t('postJob.publishJob')}</Button>
        </div>
      </div>
    </div>
  );
}