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
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  budgetType?: 'fixed' | 'average'; // Mantener para compatibilidad
  schedule: {
    type: 'flexible' | 'specific';
    preferredTime?: string;
    timeRange?: string;
  };
  images: string[];
  postedBy: string;
  postedDate: Date;
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  bids: Bid[];
  isUrgent?: boolean;
  isFlashJob?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  requiredSkills: string[];
  estimatedDuration: string;
  distance?: number;
  expiresAt?: Date;
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
  type: 'job_match' | 'proposal_received' | 'job_assigned' | 'message' | 'commercial_offer' | 'flash_offer' | 'surplus_auction' | 'document_verification' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
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
  businessId?: string;
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
  images?: string[];
  maxRedemptions?: number;
  currentRedemptions: number;
  isFlashOffer: boolean;
  notificationsSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurplusAuction {
  id: string;
  businessId: string;
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
  highestBidderId?: string;
  createdAt: Date;
  updatedAt: Date;
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

// Nuevas interfaces para el sistema completo
export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: 'restaurant' | 'retail_store' | 'service_provider' | 'entertainment' | 'supermarket';
  logo?: string;
  images?: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
  };
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument {
  id: string;
  userId: string;
  documentType: 'national_id' | 'criminal_background_check' | 'professional_license' | 'certification' | 'insurance_policy' | 'tax_id';
  documentUrl: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  expirationDate?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
}

export interface ProfessionalCertification {
  id: string;
  handymanId: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  certificateUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface OfferRedemption {
  id: string;
  offerId: string;
  userId: string;
  businessId: string;
  redemptionCode: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  redeemedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

// Nuevos tipos para sistema de monedas
export type Currency = 'USD' | 'COP';

export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  source: string;
  lastUpdated: Date;
  isActive: boolean;
}

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  lastUpdated: Date;
  source: string;
}

// Nuevos tipos para sistema de pujas mejorado
export interface EnhancedBid {
  id: string;
  jobOfferId: string;
  handymanId: string;
  handymanName: string;
  handymanAvatar?: string;
  handymanRating: number;
  bidAmount: number;
  currency: Currency;
  bidAmountUSD: number;
  bidAmountCOP: number;
  exchangeRateUsed: number;
  message: string;
  estimatedDuration: string;
  proposedStartDate: Date;
  availability: string;
  status: 'active' | 'outbid' | 'accepted' | 'rejected' | 'withdrawn';
  isCurrentHighest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceRecommendation {
  jobOfferId: string;
  averageBidUSD: number;
  averageBidCOP: number;
  highestBidUSD: number;
  highestBidCOP: number;
  lowestBidUSD: number;
  lowestBidCOP: number;
  recommendedBudgetUSD: number;
  recommendedBudgetCOP: number;
  totalBids: number;
  qualityScore: number;
  marketTrend: 'low' | 'average' | 'high';
  lastCalculated: Date;
}

// Tipos actualizados para trabajos con monedas
export interface JobBudget {
  min: number;
  max: number;
  currency: Currency;
}

export interface MonetaryAmount {
  amount: number;
  currency: Currency;
  convertedAmounts?: {
    USD?: number;
    COP?: number;
  };
}