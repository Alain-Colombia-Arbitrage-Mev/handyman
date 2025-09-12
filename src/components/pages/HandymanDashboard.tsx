import React from 'react';
import { Bell, Menu, Search, MapPin, Clock, Star, TrendingUp, Users, DollarSign, Briefcase, User, MessageSquare, Zap } from 'lucide-react';
import { ParkiingLogo } from '../ParkiingLogo';
import { JobCard } from '../JobCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useLanguage } from '../LanguageProvider';
import { Job } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface HandymanDashboardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onShowNotifications: () => void;
  onShowMenu: () => void;
  onNavigateToSearch: () => void;
  unreadCount: number;
  handymanProfile: any;
}

export function HandymanDashboard({ 
  jobs, 
  onJobClick, 
  onShowNotifications, 
  onShowMenu, 
  onNavigateToSearch,
  unreadCount, 
  handymanProfile 
}: HandymanDashboardProps) {
  const { t } = useLanguage();

  const urgentJobs = jobs.filter(job => job.isUrgent).slice(0, 3);
  const recommendedJobs = jobs.slice(0, 4);
  
  const stats = {
    newThisWeek: jobs.filter(job => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return job.postedDate > weekAgo;
    }).length,
    averageBudget: Math.round(jobs.reduce((sum, job) => sum + job.budget, 0) / jobs.length),
    urgentCount: urgentJobs.length,
    totalJobs: jobs.length
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 w-full">
        {/* Logo Section with Search - Logo horizontal oficial con tamaño apropiado */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 safe-area-inset-top bg-gradient-to-b from-white to-gray-50/50">
          <div></div> {/* Spacer for centering logo */}
          <ParkiingLogo size="sm" showText={false} variant="header" animated={true} />
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 touch-manipulation flex-shrink-0" 
            onClick={onNavigateToSearch}
          >
            <Search size={20} />
          </Button>
        </div>

        {/* Header with Menu and Notifications */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <Button variant="ghost" size="sm" className="p-2 -ml-2 touch-manipulation" onClick={onShowMenu}>
              <Menu size={20} />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">{t('dashboard.hello', { name: handymanProfile?.name || 'Profesional' })}</h1>
              <p className="text-sm text-gray-500">{t('dashboard.perfectJobs')}</p>
            </div>
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

      <div className="px-4 py-4 space-y-6 w-full">
        {/* Profile Status Card */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-green-800">{t('dashboard.profileVerified')}</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-sm text-green-700">{t('dashboard.profileComplete', { count: stats.totalJobs })}</p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.newThisWeek')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.averageBudget')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageBudget)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.urgentJobs')}</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgentCount}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.availableJobs')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase size={20} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold mb-3">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 justify-start gap-2 touch-manipulation">
              <User size={16} />
              {t('dashboard.myProfile')}
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-2 touch-manipulation">
              <Briefcase size={16} />
              {t('dashboard.myJobs')}
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-2 touch-manipulation">
              <MessageSquare size={16} />
              {t('messages.title')}
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-2 touch-manipulation">
              <Star size={16} />
              {t('dashboard.myReviews')}
            </Button>
          </div>
        </div>

        {/* Urgent Jobs */}
        {urgentJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-red-600">{t('dashboard.urgentJobs')}</h2>
              <Badge variant="destructive" className="text-xs">{urgentJobs.length}</Badge>
            </div>
            <div className="space-y-3">
              {urgentJobs.map(job => (
                <JobCard key={job.id} job={job} onClick={onJobClick} showUrgent />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Jobs */}
        <div>
          <h2 className="font-semibold mb-3">{t('dashboard.recommendedForYou')}</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button size="sm" variant="default" className="whitespace-nowrap">{t('dashboard.bestPaying')}</Button>
            <Button size="sm" variant="outline" className="whitespace-nowrap">{t('dashboard.closest')}</Button>
            <Button size="sm" variant="outline" className="whitespace-nowrap">{t('dashboard.newest')}</Button>
          </div>
          <div className="space-y-3">
            {recommendedJobs.map(job => (
              <JobCard key={job.id} job={job} onClick={onJobClick} showMatch />
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">{t('dashboard.tipsForMoreJobs')}</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            {(t('dashboard.tips') as string[]).map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}