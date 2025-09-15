import Joi from 'joi';
import { z } from 'zod';
import { ValidationError } from './errors';
import { UserRole, DocumentType, NotificationType } from '@/types';

// Migration from Joi to Zod for better TypeScript integration
// Keep Joi for backward compatibility but prefer Zod for new schemas

// Zod schemas (recommended for new code)
export const ZodSchemas = {
  // Common field validations
  email: z.string().email('Please provide a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number')
    .optional(),

  userRole: z.enum(['handyman', 'client', 'business', 'admin'] as const),

  documentType: z.enum([
    'profile_photo',
    'id_front',
    'id_back',
    'criminal_record',
    'certification',
    'business_license',
    'tax_certificate',
    'insurance',
    'other'
  ] as const),

  notificationType: z.enum([
    'job_match',
    'proposal_received',
    'job_assigned',
    'message',
    'payment',
    'system'
  ] as const),

  objectId: z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid ID'),

  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(5).max(500),
  }),

  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
  }),

  // Authentication schemas
  register: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
    name: z.string().min(2).max(100),
    role: z.enum(['handyman', 'client', 'business'] as const),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: z.string().min(5).max(500),
    }).optional(),
    categories: z.array(z.string()).optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    deviceInfo: z.object({
      deviceId: z.string(),
      platform: z.enum(['ios', 'android', 'web']),
      version: z.string(),
    }).optional(),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1),
  }),

  forgotPassword: z.object({
    email: z.string().email(),
  }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
  }),

  // Job schemas
  createJob: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(2000),
    category: z.string().min(1),
    budget: z.object({
      min: z.number().positive(),
      max: z.number().positive(),
      currency: z.string().length(3).toUpperCase(),
    }).refine(data => data.max > data.min, {
      message: 'Maximum budget must be greater than minimum',
      path: ['max'],
    }),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: z.string().min(5).max(500),
    }),
    isUrgent: z.boolean().default(false),
    deadline: z.date().min(new Date()).optional(),
  }),

  updateJobStatus: z.object({
    status: z.enum(['draft', 'open', 'assigned', 'in_progress', 'completed', 'cancelled']),
    handymanId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    completedAt: z.date().optional(),
    finalPrice: z.number().positive().optional(),
  }),

  // Payment schemas
  createPaymentIntent: z.object({
    jobId: z.string().regex(/^[a-f\d]{24}$/i),
    amount: z.number().positive(),
    currency: z.string().length(3).toUpperCase(),
    paymentMethodId: z.string().min(1),
    metadata: z.record(z.any()).optional(),
  }),

  refundPayment: z.object({
    paymentIntentId: z.string().min(1),
    amount: z.number().positive().optional(),
    reason: z.string().max(500),
    metadata: z.record(z.any()).optional(),
  }),

  // Notification schemas
  sendPushNotification: z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i),
    title: z.string().max(100),
    body: z.string().max(500),
    data: z.record(z.any()).optional(),
    type: z.enum([
      'job_match',
      'proposal_received',
      'job_assigned',
      'message',
      'payment',
      'system'
    ]),
    imageUrl: z.string().url().optional(),
    actionUrl: z.string().url().optional(),
  }),

  sendEmail: z.object({
    to: z.string().email(),
    templateId: z.string().min(1),
    templateData: z.record(z.any()),
    subject: z.string().max(200),
    attachments: z.array(z.object({
      filename: z.string(),
      content: z.string(),
      type: z.string(),
    })).optional(),
  }),

  sendSMS: z.object({
    to: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
    body: z.string().max(1600),
    mediaUrl: z.string().url().optional(),
  }),

  // Profile schemas
  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
    bio: z.string().max(1000).optional(),
    hourlyRate: z.number().positive().optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    availability: z.string().max(500).optional(),
    skills: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: z.string().min(5).max(500),
    }).optional(),
  }),

  // Document processing schemas
  uploadDocument: z.object({
    documentType: z.enum([
      'profile_photo',
      'id_front',
      'id_back',
      'criminal_record',
      'certification',
      'business_license',
      'tax_certificate',
      'insurance',
      'other'
    ]),
    fileName: z.string().min(1),
    fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB limit
    mimeType: z.enum([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]),
  }),

  // Analytics schemas
  trackEvent: z.object({
    eventType: z.string().min(1),
    userId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    sessionId: z.string().optional(),
    properties: z.record(z.any()),
  }),

  // Search and filtering schemas
  searchJobs: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: z.string().min(5).max(500),
    }).optional(),
    radius: z.number().positive().max(100).optional(), // Max 100km
    budget: z.object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
    }).optional(),
    isUrgent: z.boolean().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
  }),

  searchHandymen: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: z.string().min(5).max(500),
    }).optional(),
    radius: z.number().positive().max(100).optional(),
    minRating: z.number().min(0).max(5).optional(),
    isVerified: z.boolean().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
  }),
} as const;

// Legacy Joi schemas (kept for backward compatibility)
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  objectId: /^[a-f\d]{24}$/i,
};

const customJoi = Joi.extend({
  type: 'objectId',
  base: Joi.string(),
  messages: {
    'objectId.base': '{{#label}} must be a valid ObjectId',
  },
  validate(value, helpers) {
    if (!patterns.objectId.test(value)) {
      return { value, errors: helpers.error('objectId.base') };
    }
    return { value };
  },
});

export const schemas = {
  email: Joi.string().email().pattern(patterns.email).required().messages({
    'string.email': 'Please provide a valid email address',
    'string.pattern.base': 'Email format is invalid',
  }),

  password: Joi.string().min(8).pattern(patterns.password).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  }),

  phone: Joi.string().pattern(patterns.phone).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),

  userRole: Joi.string().valid('handyman', 'client', 'business', 'admin').required(),

  documentType: Joi.string().valid(
    'profile_photo',
    'id_front',
    'id_back',
    'criminal_record',
    'certification',
    'business_license',
    'tax_certificate',
    'insurance',
    'other'
  ).required(),

  notificationType: Joi.string().valid(
    'job_match',
    'proposal_received',
    'job_assigned',
    'message',
    'payment',
    'system'
  ).required(),

  objectId: customJoi.objectId().required().messages({
    'objectId.base': 'Must be a valid ID',
  }),

  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().min(5).max(500).required(),
  }).required(),

  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),

  // Authentication schemas
  register: Joi.object({
    email: Joi.string().email().pattern(patterns.email).required(),
    password: Joi.string().min(8).pattern(patterns.password).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(patterns.phone).optional(),
    role: Joi.string().valid('handyman', 'client', 'business', 'admin').required(),
  }),

  login: Joi.object({
    email: Joi.string().email().pattern(patterns.email).required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().pattern(patterns.email).required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).pattern(patterns.password).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(patterns.password).required(),
  }),

  // Add other Joi schemas as needed for backward compatibility...
};

// Zod validation middleware factory (recommended)
export const validateZodSchema = <T>(schema: z.ZodSchema<T>, target: 'body' | 'params' | 'query' = 'body') => {
  return (req: any, res: any, next: any): void => {
    try {
      const dataToValidate = req[target];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const validationErrors: Record<string, string> = {};

        result.error.errors.forEach((error) => {
          const path = error.path.join('.');
          validationErrors[path] = error.message;
        });

        throw new ValidationError('Validation failed', validationErrors);
      }

      // Replace the original data with validated and sanitized data
      req[target] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Legacy Joi validation middleware (kept for backward compatibility)
export const validateSchema = (schema: Joi.Schema, target: 'body' | 'params' | 'query' = 'body') => {
  return (req: any, res: any, next: any): void => {
    const dataToValidate = req[target];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: target === 'query',
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: Record<string, string> = {};

      error.details.forEach((detail) => {
        const key = detail.path.join('.');
        validationErrors[key] = detail.message;
      });

      throw new ValidationError('Validation failed', validationErrors);
    }

    req[target] = value;
    next();
  };
};

// Utility functions
export const validateObjectId = (id: string): boolean => {
  return patterns.objectId.test(id);
};

export const validateEmail = (email: string): boolean => {
  return patterns.email.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return patterns.phone.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return patterns.password.test(password);
};

// Custom validation functions
export const validateFileType = (mimeType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimeType.toLowerCase());
};

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate < endDate;
};

// Sanitization functions
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
};

export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Type inference helpers for Zod
export type RegisterData = z.infer<typeof ZodSchemas.register>;
export type LoginData = z.infer<typeof ZodSchemas.login>;
export type CreateJobData = z.infer<typeof ZodSchemas.createJob>;
export type UpdateProfileData = z.infer<typeof ZodSchemas.updateProfile>;
export type SearchJobsData = z.infer<typeof ZodSchemas.searchJobs>;
export type PushNotificationData = z.infer<typeof ZodSchemas.sendPushNotification>;