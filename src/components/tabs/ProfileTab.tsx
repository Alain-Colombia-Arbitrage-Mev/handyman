import React from 'react';
import { User, Bell, Settings, HelpCircle, Briefcase, MessageSquare, CreditCard, Star, Edit3, ToggleLeft, ToggleRight, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { useLanguage } from '../LanguageProvider';

interface ProfileTabProps {
  userType: 'client' | 'handyman';
  handymanProfile: any;
  unreadCount: number;
  onNavigateToPage: (page: string) => void;
  onShowNotifications: () => void;
  onSwitchUserType: (userType: 'client' | 'handyman') => void;
}

export function ProfileTab({
  userType,
  handymanProfile,
  unreadCount,
  onNavigateToPage,
  onShowNotifications,
  onSwitchUserType
}: ProfileTabProps) {
  const { t } = useLanguage();

  const profileStats = {
    completedJobs: 127,
    rating: 4.8,
    totalEarnings: 2850000,
    responseTime: '< 2 horas'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 w-full">
        <div className="flex items-center justify-between px-4 py-3 safe-area-inset-top">
          <div className="flex-1">
            <h1 className="font-semibold">{t('profile.myProfile')}</h1>
            <p className="text-sm text-gray-500">{t('profile.manageAccount')}</p>
          </div>
          <Button variant="ghost" size="sm" className="p-2 relative touch-manipulation" onClick={onShowNotifications}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
      
      <div className="px-4 py-6 space-y-6 w-full">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Juan Pérez</h2>
              <p className="text-sm text-gray-500">juan.perez@email.com</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">{t('profile.verified')}</span>
              </div>
            </div>
          </div>

          {/* User Type Switch */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit3 size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{t('profile.userMode')}</p>
                <p className="text-xs text-gray-500">
                  {userType === 'client' ? t('profile.clientMode') : t('profile.handymanMode')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchUserType(userType === 'client' ? 'handyman' : 'client')}
              className="p-2"
            >
              {userType === 'client' ? (
                <ToggleLeft size={24} className="text-gray-400" />
              ) : (
                <ToggleRight size={24} className="text-blue-600" />
              )}
            </Button>
          </div>
        </Card>

        {/* Professional Stats - Only for handymen */}
        {userType === 'handyman' && handymanProfile && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('profile.professionalStats')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{profileStats.completedJobs}</p>
                <p className="text-sm text-gray-500">{t('profile.completedJobs')}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <p className="text-2xl font-bold text-yellow-600">{profileStats.rating}</p>
                </div>
                <p className="text-sm text-gray-500">{t('profile.rating')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold mb-3">{t('profile.quickActions')}</h3>
          <div className="space-y-3">
            {/* Daily Offers - New feature */}
            <Card className="p-4">
              <button
                onClick={() => onNavigateToPage('all-offers')}
                className="w-full flex items-center gap-3 text-left touch-manipulation"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-700">{t('profile.dailyOffers')}</p>
                  <p className="text-sm text-gray-500">{t('profile.dailyOffersDesc')}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-orange-500" />
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    {t('profile.limitedTime')}
                  </Badge>
                </div>
              </button>
            </Card>

            <Card className="p-4">
              <button
                onClick={() => onNavigateToPage('my-jobs')}
                className="w-full flex items-center gap-3 text-left touch-manipulation"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('profile.myJobs')}</p>
                  <p className="text-sm text-gray-500">{t('profile.manageJobs')}</p>
                </div>
              </button>
            </Card>

            <Card className="p-4">
              <button className="w-full flex items-center gap-3 text-left touch-manipulation">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('profile.messages')}</p>
                  <p className="text-sm text-gray-500">{t('profile.chatWithClients')}</p>
                </div>
                <Badge variant="secondary" className="text-xs">3</Badge>
              </button>
            </Card>

            <Card className="p-4">
              <button
                onClick={() => onNavigateToPage('payments')}
                className="w-full flex items-center gap-3 text-left touch-manipulation"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('profile.payments')}</p>
                  <p className="text-sm text-gray-500">{t('profile.paymentsHistory')}</p>
                </div>
              </button>
            </Card>

            <Card className="p-4">
              <button
                onClick={() => onNavigateToPage('reviews')}
                className="w-full flex items-center gap-3 text-left touch-manipulation"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star size={20} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('profile.reviews')}</p>
                  <p className="text-sm text-gray-500">{t('profile.seeReviews')}</p>
                </div>
              </button>
            </Card>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <h3 className="font-semibold mb-3">{t('profile.account')}</h3>
          <Card className="divide-y divide-gray-200">
            <button
              onClick={() => onNavigateToPage('settings')}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 touch-manipulation"
            >
              <Settings size={20} className="text-gray-600" />
              <span className="flex-1">{t('profile.settings')}</span>
            </button>
            
            <button
              onClick={() => onNavigateToPage('help')}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 touch-manipulation"
            >
              <HelpCircle size={20} className="text-gray-600" />
              <span className="flex-1">{t('profile.helpSupport')}</span>
            </button>
          </Card>
        </div>

        {/* Professional Profile Creation - Only for handymen without profile */}
        {userType === 'handyman' && !handymanProfile && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit3 size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-1">{t('profile.createProfessionalProfile')}</h3>
                <p className="text-sm text-blue-600">{t('profile.startReceivingJobs')}</p>
              </div>
              <Button 
                onClick={() => onNavigateToPage('create-profile')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('profile.create')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}