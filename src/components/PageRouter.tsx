import React from 'react';
import { useLanguage } from './LanguageProvider';
import { QuickOpportunityPage } from './pages/QuickOpportunityPage';
import { AllOffersPage } from './pages/AllOffersPage';
import { FlashOffersPage } from './pages/FlashOffersPage';
import { FlashJobPage } from './pages/FlashJobPage';
import { ProfileCreationPage } from './pages/ProfileCreationPage';
import { MyJobsPage } from './pages/MyJobsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PostJobPage } from './pages/PostJobPage';
import { payments, reviews } from '../data/mockData';
import { formatCurrency } from '../utils/helpers';
import { Job, UserSettings } from '../types';

interface PageRouterProps {
  currentPage: string;
  filteredJobs: Job[];
  settingsData: UserSettings;
  handymanProfile: any;
  unreadCount: number;
  onBackToProfile: () => void;
  onJobClick: (job: Job) => void;
  onSetActiveTab: (tab: string) => void;
  onSaveProfile: (profileData: any) => void;
  onQuickOpportunityPublish: (data: any) => void;
  onFlashJobPublish: (data: any) => void;
  onUpdateSettings: (section: keyof UserSettings, key: string, value: any) => void;
  onShowHamburgerMenu: () => void;
  onShowNotifications: () => void;
  onPublishJob: (jobData: any) => void;
}

export function PageRouter({
  currentPage,
  filteredJobs,
  settingsData,
  handymanProfile,
  unreadCount,
  onBackToProfile,
  onJobClick,
  onSetActiveTab,
  onSaveProfile,
  onQuickOpportunityPublish,
  onFlashJobPublish,
  onUpdateSettings,
  onShowHamburgerMenu,
  onShowNotifications,
  onPublishJob
}: PageRouterProps) {
  const { t } = useLanguage();

  switch (currentPage) {
    case 'quick-opportunity':
      return (
        <QuickOpportunityPage
          onBack={onBackToProfile}
          onPublish={onQuickOpportunityPublish}
        />
      );

    case 'all-offers':
      return (
        <AllOffersPage
          onBackToProfile={onBackToProfile}
        />
      );

    case 'flash-offers':
      return (
        <FlashOffersPage
          onBack={onBackToProfile}
          jobs={filteredJobs}
          onJobClick={onJobClick}
        />
      );

    case 'flash-job':
      return (
        <FlashJobPage
          onBack={onBackToProfile}
          onPublish={onFlashJobPublish}
        />
      );

    case 'create-profile':
      return (
        <ProfileCreationPage
          onBack={onBackToProfile}
          onSave={onSaveProfile}
          initialData={handymanProfile}
        />
      );

    case 'my-jobs':
      return (
        <MyJobsPage
          jobList={filteredJobs}
          onJobClick={onJobClick}
          onBackToProfile={onBackToProfile}
          onSetActiveTab={onSetActiveTab}
        />
      );

    case 'payments':
      return (
        <PaymentsPage
          payments={payments}
          onBackToProfile={onBackToProfile}
          formatCurrency={formatCurrency}
        />
      );

    case 'reviews':
      return (
        <ReviewsPage
          reviews={reviews}
          onBackToProfile={onBackToProfile}
        />
      );

    case 'settings':
      return (
        <SettingsPage
          settingsData={settingsData}
          onBackToProfile={onBackToProfile}
          onUpdateSettings={onUpdateSettings}
        />
      );

    case 'help':
      return (
        <HelpPage
          onBackToProfile={onBackToProfile}
        />
      );

    case 'contact':
      return (
        <ContactPage
          onBackToProfile={onBackToProfile}
        />
      );

    case 'terms':
      return (
        <TermsPage
          onBackToProfile={onBackToProfile}
        />
      );

    case 'privacy':
      return (
        <PrivacyPage
          onBackToProfile={onBackToProfile}
        />
      );

    case 'post-job':
      return (
        <PostJobPage
          onBack={onBackToProfile}
          onShowMenu={onShowHamburgerMenu}
          onShowNotifications={onShowNotifications}
          onPublishJob={onPublishJob}
          unreadCount={unreadCount}
        />
      );

    default:
      return null;
  }
}