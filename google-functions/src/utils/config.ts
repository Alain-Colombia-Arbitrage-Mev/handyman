import { AppConfig } from '@/types';

export const config: AppConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-for-development',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@handymanauction.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'Handyman Auction',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  },
};

export const convexConfig = {
  url: process.env.CONVEX_URL || 'https://terrific-starling-996.convex.cloud',
  deployKey: process.env.CONVEX_DEPLOY_KEY || '',
};

export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

export const googleCloudConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};

export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
  fcmServerKey: process.env.FCM_SERVER_KEY || '',
  pushNotificationIcon: process.env.PUSH_NOTIFICATION_ICON || '',
};

// Validation functions
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FIREBASE_PROJECT_ID',
    'CONVEX_URL',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
};

// Helper function to check if we're in production
export const isProduction = (): boolean => {
  return appConfig.nodeEnv === 'production';
};

// Helper function to check if we're in development
export const isDevelopment = (): boolean => {
  return appConfig.nodeEnv === 'development';
};