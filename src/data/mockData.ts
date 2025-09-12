import { Job, Handyman, Category, Notification, Payment, Review, UserSettings } from '../types';

// Function to create translated categories
export const createCategoriesFromData = (t: (key: string) => string): Category[] => [
  { id: 'all', name: t('categories.all'), icon: '🔧', color: '#6B7280' },
  { id: 'plumbing', name: t('categories.plumbing'), icon: '🔧', color: '#3B82F6' },
  { id: 'electrical', name: t('categories.electrical'), icon: '⚡', color: '#F59E0B' },
  { id: 'painting', name: t('categories.painting'), icon: '🎨', color: '#8B5CF6' },
  { id: 'cleaning', name: t('categories.cleaning'), icon: '🧽', color: '#10B981' },
  { id: 'gardening', name: t('categories.gardening'), icon: '🌱', color: '#22C55E' },
  { id: 'carpentry', name: t('categories.carpentry'), icon: '🔨', color: '#92400E' },
  { id: 'appliances', name: t('categories.appliances'), icon: '📱', color: '#EF4444' },
  { id: 'moving', name: t('categories.moving'), icon: '📦', color: '#F97316' }
];

// Legacy export for backward compatibility - will be empty, should use createCategoriesFromData
export const categories: Category[] = [];

// Mock jobs with translation keys
export const jobsData = [
  {
    id: '1',
    titleKey: 'mockData.jobs.kitchenPipe.title',
    descriptionKey: 'mockData.jobs.kitchenPipe.description',
    category: 'plumbing',
    location: 'Chapinero, Bogotá',
    coordinates: { lat: 4.6097, lng: -74.0817 },
    budget: 150000,
    budgetType: 'fixed' as const,
    schedule: {
      type: 'flexible' as const,
      timeRangeKey: 'mockData.schedule.morningOrAfternoon'
    },
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
    postedByKey: 'mockData.users.mariaGonzalez',
    postedDate: new Date('2024-01-15T10:30:00'),
    deadline: new Date('2024-01-20T18:00:00'),
    status: 'open' as const,
    bids: [],
    isUrgent: true,
    distance: 2.3
  },
  {
    id: '2',
    titleKey: 'mockData.jobs.electricalInstallation.title',
    descriptionKey: 'mockData.jobs.electricalInstallation.description',
    category: 'electrical',
    location: 'Zona Rosa, Bogotá',
    coordinates: { lat: 4.6533, lng: -74.0636 },
    budget: 300000,
    budgetType: 'fixed' as const,
    schedule: {
      type: 'specific' as const,
      preferredTimeKey: 'mockData.schedule.weekend'
    },
    images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400'],
    postedByKey: 'mockData.users.carlosRuiz',
    postedDate: new Date('2024-01-15T08:15:00'),
    deadline: new Date('2024-01-25T18:00:00'),
    status: 'open' as const,
    bids: [],
    isUrgent: false,
    distance: 1.8
  },
  {
    id: '3',
    titleKey: 'mockData.jobs.roomPainting.title',
    descriptionKey: 'mockData.jobs.roomPainting.description',
    category: 'painting',
    location: 'La Candelaria, Bogotá',
    coordinates: { lat: 4.5981, lng: -74.0758 },
    budget: 200000,
    budgetType: 'average' as const,
    schedule: {
      type: 'flexible' as const,
      timeRangeKey: 'mockData.schedule.anyWeekday'
    },
    images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400'],
    postedByKey: 'mockData.users.anaLopez',
    postedDate: new Date('2024-01-15T07:45:00'),
    deadline: new Date('2024-01-30T18:00:00'),
    status: 'open' as const,
    bids: [],
    isUrgent: false,
    distance: 3.1
  },
  {
    id: '4',
    titleKey: 'mockData.jobs.officeCleaning.title',
    descriptionKey: 'mockData.jobs.officeCleaning.description',
    category: 'cleaning',
    location: 'Centro Internacional, Bogotá',
    coordinates: { lat: 4.6126, lng: -74.0705 },
    budget: 120000,
    budgetType: 'fixed' as const,
    schedule: {
      type: 'specific' as const,
      preferredTimeKey: 'mockData.schedule.saturdayWeekend'
    },
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'],
    postedByKey: 'mockData.users.empresaXYZ',
    postedDate: new Date('2024-01-15T09:20:00'),
    deadline: new Date('2024-01-18T18:00:00'),
    status: 'open' as const,
    bids: [],
    isUrgent: true,
    distance: 4.2
  },
  {
    id: '5',
    titleKey: 'mockData.jobs.gardenMaintenance.title',
    descriptionKey: 'mockData.jobs.gardenMaintenance.description',
    category: 'gardening',
    location: 'Usaquén, Bogotá',
    coordinates: { lat: 4.6944, lng: -74.0306 },
    budget: 80000,
    budgetType: 'average' as const,
    schedule: {
      type: 'flexible' as const,
      timeRangeKey: 'mockData.schedule.morningsPreferably'
    },
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
    postedByKey: 'mockData.users.jorgeMartinez',
    postedDate: new Date('2024-01-15T06:30:00'),
    deadline: new Date('2024-01-22T18:00:00'),
    status: 'open' as const,
    bids: [],
    isUrgent: false,
    distance: 5.5
  },
  {
    id: '6',
    titleKey: 'mockData.jobs.furnitureRepair.title',
    descriptionKey: 'mockData.jobs.furnitureRepair.description',
    category: 'carpentry',
    location: 'Teusaquillo, Bogotá',
    coordinates: { lat: 4.6311, lng: -74.0906 },
    budget: 180000,
    budgetType: 'fixed' as const,
    schedule: {
      type: 'flexible' as const,
      timeRangeKey: 'mockData.schedule.anyDay'
    },
    images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400'],
    postedByKey: 'mockData.users.luisHernandez',
    postedDate: new Date('2024-01-15T11:15:00'),
    deadline: new Date('2024-02-15T18:00:00'),
    status: 'open' as const,
    bids: [],
    isUrgent: false,
    distance: 2.9
  }
];

// Handymen data with translation keys
export const handymenData = [
  {
    id: '1',
    nameKey: 'mockData.handymen.pedroRamirez.name',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.9,
    reviewCount: 156,
    specialtiesKeys: ['mockData.specialties.plumbing', 'mockData.specialties.installations', 'mockData.specialties.repairs'],
    location: 'Chapinero, Bogotá',
    coordinates: { lat: 4.6097, lng: -74.0817 },
    hourlyRate: 35000,
    completedJobs: 156,
    bioKey: 'mockData.handymen.pedroRamirez.bio'
  },
  {
    id: '2',
    nameKey: 'mockData.handymen.mariaRodriguez.name',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b042?w=150',
    rating: 4.8,
    reviewCount: 203,
    specialtiesKeys: ['mockData.specialties.electrical', 'mockData.specialties.automation', 'mockData.specialties.industrialMaintenance'],
    location: 'Zona Rosa, Bogotá',
    coordinates: { lat: 4.6533, lng: -74.0636 },
    hourlyRate: 40000,
    completedJobs: 203,
    bioKey: 'mockData.handymen.mariaRodriguez.bio'
  },
  {
    id: '3',
    nameKey: 'mockData.handymen.carlosMendoza.name',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 4.7,
    reviewCount: 89,
    specialtiesKeys: ['mockData.specialties.painting', 'mockData.specialties.specialFinishes', 'mockData.specialties.restoration'],
    location: 'La Candelaria, Bogotá',
    coordinates: { lat: 4.5981, lng: -74.0758 },
    hourlyRate: 25000,
    completedJobs: 89,
    bioKey: 'mockData.handymen.carlosMendoza.bio'
  }
];

// Function to convert mock data with translation keys to actual objects
export const createJobsFromData = (t: (key: string) => string): Job[] => {
  return jobsData.map(jobData => ({
    ...jobData,
    title: t(jobData.titleKey),
    description: t(jobData.descriptionKey),
    category: t(`categories.${jobData.category}`),
    postedBy: t(jobData.postedByKey),
    schedule: {
      ...jobData.schedule,
      timeRange: jobData.schedule.timeRangeKey ? t(jobData.schedule.timeRangeKey) : undefined,
      preferredTime: jobData.schedule.preferredTimeKey ? t(jobData.schedule.preferredTimeKey) : undefined
    }
  }));
};

export const createHandymenFromData = (t: (key: string) => string): Handyman[] => {
  return handymenData.map(handymanData => ({
    ...handymanData,
    name: t(handymanData.nameKey),
    specialties: handymanData.specialtiesKeys.map(key => t(key)),
    bio: t(handymanData.bioKey)
  }));
};

// Notifications with translation keys
export const notificationsData = [
  {
    id: '1',
    titleKey: 'notifications.nearbyJob',
    messageKey: 'notifications.nearbyJobDesc',
    type: 'nearby_job',
    timestamp: new Date('2024-01-15T10:30:00'),
    isRead: false,
    action: {
      labelKey: 'notifications.viewJob',
      type: 'navigate',
      target: 'job/1'
    }
  },
  {
    id: '2',
    titleKey: 'notifications.newOffer',
    messageKey: 'notifications.newOfferDesc',
    type: 'new_bid',
    timestamp: new Date('2024-01-15T09:15:00'),
    isRead: false,
    action: {
      labelKey: 'notifications.viewOffer',
      type: 'navigate',
      target: 'job/3/bids'
    }
  },
  {
    id: '3',
    titleKey: 'notifications.jobCompleted',
    messageKey: 'notifications.jobCompletedDesc',
    type: 'job_completed',
    timestamp: new Date('2024-01-15T08:00:00'),
    isRead: true
  }
];

export const createNotificationsFromData = (t: (key: string) => string): Notification[] => {
  return notificationsData.map(notifData => ({
    ...notifData,
    title: t(notifData.titleKey),
    message: t(notifData.messageKey),
    action: notifData.action ? {
      ...notifData.action,
      label: t(notifData.action.labelKey)
    } : undefined
  }));
};

// Payments with translation keys
export const paymentsData = [
  {
    id: '1',
    amount: 150000,
    status: 'completed',
    date: new Date('2024-01-10T14:30:00'),
    jobTitleKey: 'mockData.jobs.kitchenPipe.title',
    handymanNameKey: 'mockData.handymen.pedroRamirez.name',
    paymentMethod: 'Tarjeta de crédito',
    transactionId: 'TXN-2024-001'
  },
  {
    id: '2', 
    amount: 200000,
    status: 'pending',
    date: new Date('2024-01-15T16:45:00'),
    jobTitleKey: 'mockData.jobs.roomPainting.title',
    handymanNameKey: 'mockData.handymen.carlosMendoza.name',
    paymentMethod: 'Transferencia bancaria',
    transactionId: 'TXN-2024-002'
  }
];

export const createPaymentsFromData = (t: (key: string) => string): Payment[] => {
  return paymentsData.map(paymentData => ({
    ...paymentData,
    jobTitle: t(paymentData.jobTitleKey),
    handymanName: t(paymentData.handymanNameKey),
    method: paymentData.paymentMethod.toLowerCase().includes('tarjeta') ? 'card' : 'transfer'
  }));
};

// Reviews with translation keys
export const reviewsData = [
  {
    id: '1',
    rating: 5,
    commentKey: 'mockData.reviews.excellent',
    date: new Date('2024-01-10T15:00:00'),
    jobTitleKey: 'mockData.jobs.kitchenPipe.title',
    handymanNameKey: 'mockData.handymen.pedroRamirez.name',
    clientNameKey: 'mockData.users.mariaGonzalez'
  },
  {
    id: '2',
    rating: 4,
    commentKey: 'mockData.reviews.good',
    date: new Date('2024-01-08T11:30:00'),
    jobTitleKey: 'mockData.jobs.electricalInstallation.title',
    handymanNameKey: 'mockData.handymen.mariaRodriguez.name',
    clientNameKey: 'mockData.users.carlosRuiz'
  }
];

export const createReviewsFromData = (t: (key: string) => string): Review[] => {
  return reviewsData.map(reviewData => ({
    ...reviewData,
    comment: t(reviewData.commentKey),
    jobTitle: t(reviewData.jobTitleKey),
    handymanName: t(reviewData.handymanNameKey),
    clientName: t(reviewData.clientNameKey)
  }));
};

// Legacy exports for backward compatibility - these should be replaced with create functions
export const jobs: Job[] = [];
export const handymen: Handyman[] = [];
export const notifications: Notification[] = [];
export const payments: Payment[] = [];
export const reviews: Review[] = [];

export const userSettings: UserSettings = {
  notifications: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    newBids: true,
    messages: true,
    jobUpdates: true,
    nearbyJobs: true,
    commercialOffers: false,
    surplusAuctions: true,
    internalMessages: true,
    promotions: false
  },
  privacy: {
    showLocation: true,
    showProfile: true,
    shareLocationForJobs: true,
    allowDirectContact: true
  },
  preferences: {
    radarRadius: 5,
    currency: 'COP',
    language: 'es',
    theme: 'light'
  }
};

// Daily offers with translation keys
export const dailyOffersData = [
  {
    id: '1',
    restaurantNameKey: 'mockData.restaurants.napolitana',
    restaurantImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    titleKey: 'mockData.offers.pizzaMargherita.title',
    descriptionKey: 'mockData.offers.pizzaMargherita.description',
    originalPrice: 45000,
    discountedPrice: 25000,
    discountPercentage: 44,
    itemsLeft: 3,
    totalItems: 8,
    expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
    category: 'pizza' as const,
    rating: 4.8,
    distance: 0.8,
    address: 'Calle 123 #45-67',
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400'
  },
  {
    id: '2',
    restaurantNameKey: 'mockData.restaurants.cafeCentral',
    restaurantImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    titleKey: 'mockData.offers.sandwichClub.title',
    descriptionKey: 'mockData.offers.sandwichClub.description',
    originalPrice: 28000,
    discountedPrice: 15000,
    discountPercentage: 46,
    itemsLeft: 5,
    totalItems: 10,
    expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
    category: 'sandwich' as const,
    rating: 4.6,
    distance: 1.2,
    address: 'Carrera 89 #12-34',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400'
  },
  {
    id: '3',
    restaurantNameKey: 'mockData.restaurants.dulcesPostres',
    restaurantImage: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
    titleKey: 'mockData.offers.chocolateCake.title',
    descriptionKey: 'mockData.offers.chocolateCake.description',
    originalPrice: 35000,
    discountedPrice: 20000,
    discountPercentage: 43,
    itemsLeft: 2,
    totalItems: 6,
    expiresAt: new Date(new Date().toDateString() + ' 22:00:00'),
    category: 'dessert' as const,
    rating: 4.9,
    distance: 0.5,
    address: 'Avenida 68 #34-21',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
  }
];

export const createDailyOffersFromData = (t: (key: string) => string) => {
  return dailyOffersData.map(offerData => ({
    ...offerData,
    restaurantName: t(offerData.restaurantNameKey),
    title: t(offerData.titleKey),
    description: t(offerData.descriptionKey)
  }));
};

// Commercial offers with translation keys
export const commercialOffersData = [
  {
    id: '1',
    businessNameKey: 'mockData.businesses.techStore',
    titleKey: 'mockData.commercialOffers.techDiscount.title',
    descriptionKey: 'mockData.commercialOffers.techDiscount.description',
    discount: 50,
    category: 'retail' as const,
    location: 'Centro Comercial Andino',
    distance: 2.1,
    validUntil: new Date('2024-02-15'),
    status: 'active' as const,
    originalPrice: 80000,
    discountedPrice: 40000,
    termsAndConditionsKey: 'mockData.commercialOffers.techDiscount.terms'
  },
  {
    id: '2',
    businessNameKey: 'mockData.businesses.buenSabor',
    titleKey: 'mockData.commercialOffers.lunchDiscount.title',
    descriptionKey: 'mockData.commercialOffers.lunchDiscount.description',
    discount: 30,
    category: 'food' as const,
    location: 'Zona Rosa',
    distance: 1.5,
    validUntil: new Date('2024-01-30'),
    status: 'active' as const,
    originalPrice: 25000,
    discountedPrice: 17500,
    termsAndConditionsKey: 'mockData.commercialOffers.lunchDiscount.terms'
  }
];

export const createCommercialOffersFromData = (t: (key: string) => string) => {
  return commercialOffersData.map(offerData => ({
    ...offerData,
    businessName: t(offerData.businessNameKey),
    title: t(offerData.titleKey),
    description: t(offerData.descriptionKey),
    termsAndConditions: t(offerData.termsAndConditionsKey)
  }));
};

// Legacy exports
export const dailyOffers = [];
export const commercialOffers = [];