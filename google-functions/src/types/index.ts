import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

// Base types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken & {
    userId: string;
    role: UserRole;
  };
}

export type UserRole = 'handyman' | 'client' | 'business' | 'admin';

export type JobStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type DocumentType =
  | 'profile_photo'
  | 'id_front'
  | 'id_back'
  | 'criminal_record'
  | 'certification'
  | 'business_license'
  | 'tax_certificate'
  | 'insurance'
  | 'other';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type NotificationType =
  | 'job_match'
  | 'proposal_received'
  | 'job_assigned'
  | 'message'
  | 'payment'
  | 'system';

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  skills?: string[];
  categories?: string[];
  rating?: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile extends User {
  bio?: string;
  hourlyRate?: number;
  currency?: string;
  availability?: string;
  completedJobs: number;
  totalReviews: number;
  averageRating: number;
}

// Authentication types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  categories?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: {
    deviceId: string;
    platform: string;
    version: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Job related types
export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  clientId: string;
  handymanId?: string;
  status: JobStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  isUrgent: boolean;
  deadline?: number;
  completedAt?: number;
  finalPrice?: number;
  createdAt: number;
  updatedAt: number;
}

// Payment related types
export interface PaymentIntent {
  id: string;
  jobId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  clientSecret: string;
  status: PaymentStatus;
  metadata: {
    handymanId: string;
    clientId: string;
    jobTitle: string;
  };
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason: string;
  metadata?: Record<string, any>;
}

// Notification types
export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
  imageUrl?: string;
  actionUrl?: string;
}

export interface EmailNotification {
  to: string;
  templateId: string;
  templateData: Record<string, any>;
  subject: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
}

export interface SMSNotification {
  to: string;
  body: string;
  mediaUrl?: string;
}

// Document processing types
export interface DocumentProcessingResult {
  documentId: string;
  extractedText?: string;
  documentType: DocumentType;
  confidence: number;
  flags: string[];
  metadata: {
    pageCount?: number;
    dimensions?: {
      width: number;
      height: number;
    };
    fileSize: number;
    processedAt: number;
  };
}

// Analytics types
export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: number;
}

export interface KPIMetrics {
  dau: number;
  mau: number;
  jobCompletionRate: number;
  averageJobValue: number;
  userRetentionRate: number;
  revenue: {
    total: number;
    platformFees: number;
    payouts: number;
  };
  period: {
    start: number;
    end: number;
  };
}

// Matching algorithm types
export interface MatchingCriteria {
  jobId: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
  skills: string[];
  urgency: boolean;
  budget: {
    min: number;
    max: number;
  };
}

export interface HandymanMatch {
  handymanId: string;
  score: number;
  factors: {
    distance: number;
    skillsMatch: number;
    rating: number;
    availability: number;
    priceCompatibility: number;
  };
  estimatedResponseTime: number;
}

// Error types
export interface AppError extends Error {
  code: string;
  statusCode: number;
  isOperational: boolean;
}

// Validation schemas
export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

// Rate limiting types
export interface RateLimit {
  windowMs: number;
  maxRequests: number;
  identifier: string;
}

// Database types (for Convex integration)
export interface ConvexDocument {
  _id: string;
  _creationTime: number;
}

export interface ConvexQuery<T = any> {
  args: Record<string, any>;
  handler: (ctx: any, args: any) => Promise<T>;
}

export interface ConvexMutation<T = any> {
  args: Record<string, any>;
  handler: (ctx: any, args: any) => Promise<T>;
}

// Configuration types
export interface AppConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  redis: {
    url: string;
    password?: string;
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

// Utility types
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Partial<T> = {
  [P in keyof T]?: T[P];
};
export type Required<T> = {
  [P in keyof T]-?: T[P];
};