import React from 'react';
import { HomeTab } from './tabs/HomeTab';
import { SearchTab } from './tabs/SearchTab';
import { PostJobTab } from './tabs/PostJobTab';
import { MessagesTab } from './tabs/MessagesTab';
import { ProfileTab } from './tabs/ProfileTab';
import { RadarView } from './RadarView';
import { HandymanDashboard } from './pages/HandymanDashboard';
import { commercialOffers } from '../data/mockData';
import { Job, Category } from '../types';

interface TabRouterProps {
  activeTab: string;
  userType: 'client' | 'handyman';
  handymanProfile: any;
  filteredJobs: Job[];
  filteredHandymen: any[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  searchFilterCategory: string;
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
  onSetActiveTab: (tab: string) => void;
  onCategoryFilterChange: (category: string) => void;
  onHandymanClick: (handyman: any) => void;
  onNavigateToPage: (page: string) => void;
  onSwitchUserType: (userType: 'client' | 'handyman') => void;
  onAddNotification: (notification: any) => void;
}

export function TabRouter({
  activeTab,
  userType,
  handymanProfile,
  filteredJobs,
  filteredHandymen,
  categories,
  selectedCategory,
  searchQuery,
  searchFilterCategory,
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
  onJobClick,
  onSetActiveTab,
  onCategoryFilterChange,
  onHandymanClick,
  onNavigateToPage,
  onSwitchUserType,
  onAddNotification
}: TabRouterProps) {
  // If it's a professional with profile, show dashboard for home
  if (userType === 'handyman' && handymanProfile && activeTab === 'home') {
    return (
      <HandymanDashboard
        jobs={filteredJobs}
        onJobClick={onJobClick}
        onShowNotifications={onShowNotifications}
        onShowMenu={onShowHamburgerMenu}
        onNavigateToSearch={onNavigateToSearch}
        unreadCount={unreadCount}
        handymanProfile={handymanProfile}
      />
    );
  }

  // Normal content for clients or professionals without profile
  switch (activeTab) {
    case 'home':
      return (
        <HomeTab
          userType={userType}
          handymanProfile={handymanProfile}
          filteredJobs={filteredJobs}
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          unreadCount={unreadCount}
          onShowHamburgerMenu={onShowHamburgerMenu}
          onShowNotifications={onShowNotifications}
          onNavigateToQuickOpportunity={onNavigateToQuickOpportunity}
          onNavigateToFlashJob={onNavigateToFlashJob}
          onNavigateToCreateProfile={onNavigateToCreateProfile}
          onNavigateToSearch={onNavigateToSearch}
          onCategorySelect={onCategorySelect}
          onSearchChange={onSearchChange}
          onClearFilter={onClearFilter}
          onJobClick={onJobClick}
        />
      );

    case 'search':
      return (
        <SearchTab
          searchQuery={searchQuery}
          searchFilterCategory={searchFilterCategory}
          filteredHandymen={filteredHandymen}
          categories={categories}
          onSearchChange={onSearchChange}
          onCategoryFilterChange={onCategoryFilterChange}
          onHandymanClick={onHandymanClick}
          onBack={() => onSetActiveTab('home')}
        />
      );

    case 'radar':
      return (
        <RadarView 
          jobs={filteredJobs} 
          commercialOffers={commercialOffers} 
          unreadCount={unreadCount}
          onJobClick={onJobClick} 
          onOfferClick={() => {}} 
          onAddNotification={onAddNotification}
          onShowHamburgerMenu={onShowHamburgerMenu}
          onShowNotifications={onShowNotifications}
        />
      );

    case 'post':
      return (
        <PostJobTab
          onNavigateToQuickOpportunity={onNavigateToQuickOpportunity}
          onAddNotification={onAddNotification}
        />
      );

    case 'messages':
      return <MessagesTab onSetActiveTab={onSetActiveTab} />;

    case 'profile':
      return (
        <ProfileTab
          userType={userType}
          handymanProfile={handymanProfile}
          unreadCount={unreadCount}
          onNavigateToPage={onNavigateToPage}
          onShowNotifications={onShowNotifications}
          onSwitchUserType={onSwitchUserType}
        />
      );

    default:
      return null;
  }
}