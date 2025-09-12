import { useState, useEffect, useMemo } from 'react';
import { Job, Bid, Notification, CommercialOffer, UserSettings } from '../types';
import { 
  createJobsFromData, 
  createHandymenFromData, 
  createCategoriesFromData,
  createNotificationsFromData,
  createPaymentsFromData,
  createReviewsFromData,
  createCommercialOffersFromData,
  userSettings 
} from '../data/mockData';
import { useNotifications } from './useNotifications';
import { useLanguage } from '../components/LanguageProvider';
import { formatCurrency } from '../utils/helpers';

export function useAppState() {
  const { t } = useLanguage();
  
  // Generate translated data with memoization to prevent unnecessary re-calculations
  const jobs = useMemo(() => createJobsFromData(t), [t]);
  const handymen = useMemo(() => createHandymenFromData(t), [t]);
  const categories = useMemo(() => {
    try {
      return createCategoriesFromData(t);
    } catch (error) {
      // Fallback categories if translation fails
      return [
        { id: 'all', name: 'Todas', icon: '🔧', color: '#6B7280' },
        { id: 'plumbing', name: 'Plomería', icon: '🔧', color: '#3B82F6' },
        { id: 'electrical', name: 'Electricidad', icon: '⚡', color: '#F59E0B' },
        { id: 'painting', name: 'Pintura', icon: '🎨', color: '#8B5CF6' },
        { id: 'cleaning', name: 'Limpieza', icon: '🧽', color: '#10B981' },
      ];
    }
  }, [t]);
  const commercialOffers = useMemo(() => createCommercialOffersFromData(t), [t]);
  
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<CommercialOffer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobList, setJobList] = useState(jobs);
  const [searchFilterCategory, setSearchFilterCategory] = useState('');
  const [selectedHandyman, setSelectedHandyman] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [settingsData, setSettingsData] = useState<UserSettings>(userSettings);
  const [handymanProfile, setHandymanProfile] = useState<any>(null);
  const [userType, setUserType] = useState<'client' | 'handyman'>('client');

  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    addNotification
  } = useNotifications();

  // Update jobList when language changes
  useEffect(() => {
    setJobList(jobs);
  }, [jobs]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('handymanProfile');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedProfile) {
      setHandymanProfile(JSON.parse(savedProfile));
    }
    if (savedUserType) {
      setUserType(savedUserType as 'client' | 'handyman');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('hasSeenSplash', 'true');
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleOfferClick = (offer: CommercialOffer) => {
    setSelectedOffer(offer);
  };

  const handleBackToList = () => {
    setSelectedJob(null);
    setSelectedOffer(null);
  };

  const handleBackToProfile = () => {
    setCurrentPage('');
  };

  const handleHamburgerNavigate = (page: string) => {
    if (page === 'profile') {
      setActiveTab('profile');
    } else if (page === 'notifications') {
      setShowNotifications(true);
    } else if (page === 'create-profile') {
      setCurrentPage('create-profile');
    } else if (page === 'quick-opportunity') {
      setCurrentPage('quick-opportunity');
    } else if (page === 'flash-offers') {
      setCurrentPage('flash-offers');
    } else if (page === 'flash-job') {
      setCurrentPage('flash-job');
    } else if (page === 'post-job') {
      setCurrentPage('post-job');
    } else {
      setCurrentPage(page);
    }
  };

  const handleSaveProfile = (profileData: any) => {
    setHandymanProfile(profileData);
    setUserType('handyman');
    localStorage.setItem('handymanProfile', JSON.stringify(profileData));
    localStorage.setItem('userType', 'handyman');
    setCurrentPage('');
    addNotification({
      type: 'system',
      title: t('success.profileCreated'),
      message: t('success.profileCreatedDesc'),
      read: false
    });
  };

  const handleQuickOpportunityPublish = (opportunityData: any) => {
    const newJob = {
      ...opportunityData,
      id: Date.now().toString(),
      category: opportunityData.type === 'food' ? 'Venta' : 
                 opportunityData.type === 'work' ? 'Trabajo Especial' :
                 'Servicio Urgente',
      categoryId: opportunityData.type,
      postedAt: new Date(),
      urgency: opportunityData.urgencyLevel || 'urgent',
      bids: [],
      distance: Math.floor(Math.random() * 20) + 1,
      isFlashOffer: true,
      offerType: opportunityData.type
    };

    setJobList(prev => [newJob, ...prev]);
    setCurrentPage('');
    
    addNotification({
      type: 'system',
      title: t('success.flashOfferPublished'),
      message: t('success.flashOfferPublishedDesc'),
      read: false
    });

    setTimeout(() => {
      addNotification({
        type: 'new_bid',
        title: t('success.newOfferReceived'),
        message: t('success.newOfferReceivedDesc', { title: opportunityData.title }),
        read: false,
        action: {
          type: 'navigate',
          target: `job/${newJob.id}`,
          label: 'Ver respuestas'
        }
      });
    }, 3000);
  };

  const handleFlashJobPublish = (jobData: any) => {
    const newJob = {
      ...jobData,
      id: Date.now().toString(),
      category: t(`categories.${jobData.category}`) || t('categories.all'),
      coordinates: { lat: 4.6097, lng: -74.0817 }, // Default coordinates for Bogotá
      postedBy: 'Usuario',
      postedDate: new Date(),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: 'open' as const,
      bids: [],
      isUrgent: jobData.urgency === 'urgent',
      distance: Math.floor(Math.random() * 10) + 1,
      isFlashJob: true,
      budgetType: 'fixed' as const,
      schedule: {
        type: 'flexible' as const,
        timeRange: 'Lo antes posible'
      },
      images: []
    };

    setJobList(prev => [newJob, ...prev]);
    setCurrentPage('');
    
    addNotification({
      type: 'system',
      title: t('success.jobPublished'),
      message: t('success.jobPublishedDesc'),
      read: false
    });

    // Simulate getting bids after 2 seconds
    setTimeout(() => {
      addNotification({
        type: 'new_bid',
        title: 'Nueva propuesta recibida',
        message: `Has recibido una propuesta para "${jobData.title}"`,
        read: false,
        jobId: newJob.id,
        action: {
          type: 'navigate',
          target: `job/${newJob.id}`,
          label: 'Ver propuesta'
        }
      });
    }, 2000);
  };

  const handleSubmitBid = (bidData: Omit<Bid, 'id' | 'submittedAt' | 'status'>) => {
    if (!selectedJob) return;

    const newBid: Bid = {
      ...bidData,
      id: Date.now().toString(),
      submittedAt: new Date(),
      status: 'pending'
    };

    const updatedJob = {
      ...selectedJob,
      bids: [...selectedJob.bids, newBid]
    };

    setJobList(jobList.map(job => 
      job.id === selectedJob.id ? updatedJob : job
    ));
    setSelectedJob(updatedJob);

    addNotification({
      type: 'system',
      title: t('success.offerSent'),
      message: t('success.offerSentDesc', { amount: formatCurrency(bidData.amount) }),
      read: false
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action?.type === 'navigate') {
      if (notification.action.target.startsWith('job/')) {
        const jobId = notification.action.target.split('/')[1];
        const job = jobList.find(j => j.id === jobId);
        if (job) {
          setSelectedJob(job);
          setShowNotifications(false);
        }
      } else if (notification.action.target.startsWith('offer/')) {
        const offerId = notification.action.target.split('/')[1];
        const offer = commercialOffers.find(o => o.id === offerId);
        if (offer) {
          setSelectedOffer(offer);
          setShowNotifications(false);
        }
      } else if (notification.action.target === 'home') {
        setActiveTab('home');
        setShowNotifications(false);
      } else if (notification.action.target === 'radar') {
        setActiveTab('radar');
        setShowNotifications(false);
      } else if (notification.action.target.startsWith('messages')) {
        setActiveTab('messages');
        setShowNotifications(false);
      }
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Filter functions
  const filteredJobs = jobList.filter(job => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || job.category === t(`categories.${selectedCategory}`);
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredHandymen = handymen.filter(handyman => {
    const matchesSearch = !searchQuery ||
      handyman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handyman.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      handyman.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handyman.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !searchFilterCategory || 
      handyman.specialties.some(specialty => 
        specialty.toLowerCase().includes(t(`categories.${searchFilterCategory}`).toLowerCase() || '')
      );
    
    return matchesSearch && matchesCategory;
  });

  return {
    // State
    showSplash,
    activeTab,
    selectedJob,
    selectedOffer,
    selectedCategory,
    searchQuery,
    jobList,
    searchFilterCategory,
    selectedHandyman,
    showNotifications,
    showHamburgerMenu,
    currentPage,
    settingsData,
    handymanProfile,
    userType,
    filteredJobs,
    filteredHandymen,
    categories,
    
    // Notifications
    notifications,
    unreadCount,
    
    // Setters
    setActiveTab,
    setSelectedCategory,
    setSearchQuery,
    setSearchFilterCategory,
    setSelectedHandyman,
    setShowNotifications,
    setShowHamburgerMenu,
    setCurrentPage,
    
    // Handlers
    handleSplashComplete,
    handleJobClick,
    handleOfferClick,
    handleBackToList,
    handleBackToProfile,
    handleHamburgerNavigate,
    handleSaveProfile,
    handleQuickOpportunityPublish,
    handleFlashJobPublish,
    handleSubmitBid,
    handleNotificationClick,
    updateSettings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification
  };
}