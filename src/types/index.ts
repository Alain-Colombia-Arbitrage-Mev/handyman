export interface Handyman {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  hourlyRate: number;
  completedJobs: number;
  bio: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  budget: number;
  budgetType: 'fixed' | 'average';
  schedule: {
    type: 'flexible' | 'specific';
    preferredTime?: string; // Para horario específico
    timeRange?: string; // Para horario flexible
  };
  images: string[];
  postedBy: string;
  postedDate: Date;
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  bids: Bid[];
  isUrgent?: boolean;
  distance?: number;
}

export interface Bid {
  id: string;
  handymanId: string;
  handymanName: string;
  handymanAvatar: string;
  handymanRating: number;
  amount: number;
  message: string;
  timeline: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  submittedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export interface Notification {
  id: string;
  type: 'internal_message' | 'job_opportunity' | 'business_offer' | 'surplus_auction' | 'new_bid' | 'message' | 'job_update' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  jobId?: string;
  handymanId?: string;
  offerId?: string;
  auctionId?: string;
  avatar?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number;
  urgency?: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    type: 'navigate' | 'external';
    target: string;
  };
}

export interface CommercialOffer {
  id: string;
  businessName: string;
  businessLogo: string;
  title: string;
  description: string;
  discount: number;
  originalPrice?: number;
  discountedPrice?: number;
  category: 'food' | 'retail' | 'services' | 'entertainment';
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  validUntil: Date;
  termsAndConditions: string;
  status: 'active' | 'expired' | 'paused';
  targetRadius: number;
}

export interface SurplusAuction {
  id: string;
  businessName: string;
  businessLogo: string;
  title: string;
  description: string;
  category: 'food' | 'machinery' | 'clothing' | 'electronics' | 'furniture';
  currentBid: number;
  minimumBid: number;
  originalValue: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  endsAt: Date;
  bidders: number;
  images: string[];
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'active' | 'ended' | 'sold';
}

export interface Payment {
  id: string;
  jobId: string;
  jobTitle: string;
  handymanName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  paymentMethod: string;
  transactionId: string;
}

export interface Review {
  id: string;
  jobId: string;
  jobTitle: string;
  handymanId: string;
  handymanName: string;
  handymanAvatar: string;
  rating: number;
  comment: string;
  date: Date;
  response?: {
    message: string;
    date: Date;
  };
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface UserSettings {
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    newBids: boolean;
    messages: boolean;
    jobUpdates: boolean;
    promotions: boolean;
    nearbyJobs: boolean;
    commercialOffers: boolean;
    surplusAuctions: boolean;
    internalMessages: boolean;
  };
  privacy: {
    showProfile: boolean;
    showLocation: boolean;
    allowDirectContact: boolean;
    shareLocationForJobs: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
    radarRadius: number;
  };
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: Date;
}