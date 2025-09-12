import React from 'react';
import { Search, Bell, Menu, Zap, Wrench } from 'lucide-react';
import { ParkiingLogo } from '../ParkiingLogo';
import { CategoryDropdown } from '../CategoryDropdown';
import { JobCard } from '../JobCard';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useLanguage } from '../LanguageProvider';
import { Job, Category } from '../../types';

interface HomeTabProps {
  userType: 'client' | 'handyman';
  handymanProfile: any;
  filteredJobs: Job[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  unreadCount: number;
  onShowHamburgerMenu: () => void;
  onShowNotifications: () => void;
  onNavigateToQuickOpportunity: () => void;
  onNavigateToFlashJob: () => void;
  onNavigateToCreateProfile: () => void;
  onNavigateToSearch: () => void;
  onCategorySelect: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilter: () => void;
  onJobClick: (job: Job) => void;
}

export function HomeTab({
  userType,
  handymanProfile,
  filteredJobs,
  categories,
  selectedCategory,
  searchQuery,
  unreadCount,
  onShowHamburgerMenu,
  onShowNotifications,
  onNavigateToQuickOpportunity,
  onNavigateToFlashJob,
  onNavigateToCreateProfile,
  onNavigateToSearch,
  onCategorySelect,
  onSearchChange,
  onClearFilter,
  onJobClick
}: HomeTabProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-full min-h-screen bg-gray-50 pb-20 w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 w-full">
        {/* Logo Section with Search - Logo horizontal oficial con tamaño apropiado */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 safe-area-inset-top bg-gradient-to-b from-white to-gray-50/50">
          <div></div> {/* Spacer for centering logo */}
          <ParkiingLogo size="sm" showText={false} variant="header" animated={true} />
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-4 py-3 touch-manipulation flex-shrink-0 flex items-center gap-3" 
            onClick={onNavigateToSearch}
          >
            <Search size={22} />
            <span className="text-lg font-medium">{t('nav.search')}</span>
          </Button>
        </div>
        
        {/* Header with Menu and Notifications */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="sm" className="p-2 -ml-2 touch-manipulation flex-shrink-0" onClick={onShowHamburgerMenu}>
              <Menu size={20} />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 truncate">
                {userType === 'handyman' && !handymanProfile 
                  ? t('home.createProfile') 
                  : t('home.title')
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 relative touch-manipulation flex-shrink-0" onClick={onShowNotifications}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Flash Job CTA */}
        <div className="px-4 pb-2">
          <Button
            onClick={onNavigateToFlashJob}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white touch-manipulation shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Wrench size={18} className="mr-2" />
            {t('menu.quickJobs')}
          </Button>
        </div>

        {/* Profile Creation CTA for handymen without profile */}
        {userType === 'handyman' && !handymanProfile && (
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-r from-[#21ABF6] to-blue-600 rounded-xl p-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Wrench size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t('home.createProfileTitle')}</h3>
                  <p className="text-sm opacity-90">{t('home.createProfileDesc')}</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onNavigateToCreateProfile}
                  className="touch-manipulation shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {t('home.create')}
                </Button>
              </div>
            </div>
          </div>
        )}



        {/* Category Dropdown */}
        <div className="px-4 pb-4">
          <CategoryDropdown 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onCategorySelect={onCategorySelect} 
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 w-full">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{t('home.availableJobs')} ({filteredJobs.length})</h2>
          {selectedCategory && (
            <Button variant="outline" size="sm" onClick={onClearFilter} className="touch-manipulation">
              {t('home.clearFilter')}
            </Button>
          )}
        </div>

        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} onClick={onJobClick} />
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 w-full">
            <div className="text-gray-400 mb-2">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="font-medium text-gray-600 mb-2">{t('home.noJobsFound')}</h3>
            <p className="text-sm text-gray-500">{t('home.tryChangingFilters')}</p>
          </div>
        )}
      </div>
    </div>
  );
}