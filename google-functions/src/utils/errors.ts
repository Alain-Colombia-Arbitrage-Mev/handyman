import { AppError } from '@/types';

export class CustomError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Authentication Errors
export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_FAILED') {
    super(message, code, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Authorization failed', code: string = 'AUTH_INSUFFICIENT_PERMISSIONS') {
    super(message, code, 403);
  }
}

export class TokenExpiredError extends CustomError {
  constructor(message: string = 'Token has expired', code: string = 'TOKEN_EXPIRED') {
    super(message, code, 401);
  }
}

export class InvalidTokenError extends CustomError {
  constructor(message: string = 'Invalid token', code: string = 'TOKEN_INVALID') {
    super(message, code, 401);
  }
}

// Validation Errors
export class ValidationError extends CustomError {
  public readonly validationErrors: Record<string, string>;

  constructor(message: string = 'Validation failed', validationErrors: Record<string, string> = {}, code: string = 'VALIDATION_FAILED') {
    super(message, code, 400);
    this.validationErrors = validationErrors;
  }
}

export class RequiredFieldError extends ValidationError {
  constructor(field: string) {
    super(`Required field missing: ${field}`, { [field]: 'This field is required' }, 'REQUIRED_FIELD_MISSING');
  }
}

export class InvalidFormatError extends ValidationError {
  constructor(field: string, expectedFormat: string) {
    super(`Invalid format for field: ${field}`, { [field]: `Expected format: ${expectedFormat}` }, 'INVALID_FORMAT');
  }
}

// Resource Errors
export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource', code: string = 'RESOURCE_NOT_FOUND') {
    super(`${resource} not found`, code, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict', code: string = 'RESOURCE_CONFLICT') {
    super(message, code, 409);
  }
}

export class DuplicateError extends ConflictError {
  constructor(resource: string, field: string = 'identifier') {
    super(`${resource} with this ${field} already exists`, 'DUPLICATE_RESOURCE');
  }
}

// Rate Limiting Errors
export class RateLimitError extends CustomError {
  public readonly retryAfter: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter: number = 900, code: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, code, 429);
    this.retryAfter = retryAfter;
  }
}

export class TooManyRequestsError extends RateLimitError {
  constructor(message: string = 'Too many requests. Please try again later.', retryAfter: number = 900) {
    super(message, retryAfter, 'TOO_MANY_REQUESTS');
  }
}

// Payment Errors
export class PaymentError extends CustomError {
  public readonly paymentErrorCode?: string;

  constructor(message: string, paymentErrorCode?: string, code: string = 'PAYMENT_FAILED') {
    super(message, code, 400);
    this.paymentErrorCode = paymentErrorCode;
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(message: string = 'Insufficient funds') {
    super(message, 'insufficient_funds', 'INSUFFICIENT_FUNDS');
  }
}

export class PaymentMethodError extends PaymentError {
  constructor(message: string = 'Payment method error') {
    super(message, 'payment_method_error', 'PAYMENT_METHOD_ERROR');
  }
}

// File Upload Errors
export class FileUploadError extends CustomError {
  constructor(message: string, code: string = 'FILE_UPLOAD_FAILED') {
    super(message, code, 400);
  }
}

export class FileSizeError extends FileUploadError {
  constructor(maxSize: number) {
    super(`File size exceeds maximum allowed size of ${maxSize} bytes`, 'FILE_SIZE_EXCEEDED');
  }
}

export class FileTypeError extends FileUploadError {
  constructor(allowedTypes: string[]) {
    super(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 'FILE_TYPE_NOT_ALLOWED');
  }
}

// External Service Errors
export class ExternalServiceError extends CustomError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(service: string, message: string, originalError?: Error, code: string = 'EXTERNAL_SERVICE_ERROR') {
    super(message, code, 502);
    this.service = service;
    this.originalError = originalError;
  }
}

export class ConvexError extends ExternalServiceError {
  constructor(message: string, originalError?: Error) {
    super('Convex', message, originalError, 'CONVEX_ERROR');
  }
}

export class StripeError extends ExternalServiceError {
  constructor(message: string, originalError?: Error) {
    super('Stripe', message, originalError, 'STRIPE_ERROR');
  }
}

export class SendGridError extends ExternalServiceError {
  constructor(message: string, originalError?: Error) {
    super('SendGrid', message, originalError, 'SENDGRID_ERROR');
  }
}

export class TwilioError extends ExternalServiceError {
  constructor(message: string, originalError?: Error) {
    super('Twilio', message, originalError, 'TWILIO_ERROR');
  }
}

// Business Logic Errors
export class BusinessLogicError extends CustomError {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR') {
    super(message, code, 400);
  }
}

export class JobAssignmentError extends BusinessLogicError {
  constructor(message: string = 'Job assignment failed') {
    super(message, 'JOB_ASSIGNMENT_FAILED');
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(action: string) {
    super(`Insufficient permissions to perform action: ${action}`, 'INSUFFICIENT_PERMISSIONS');
  }
}

// Helper function to check if error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof CustomError) {
    return error.isOperational;
  }
  return false;
};

// Error code mappings for common HTTP status codes
export const ERROR_CODES = {
  // Authentication & Authorization
  AUTH_FAILED: 'Authentication failed',
  AUTH_INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD_MISSING: 'Required field missing',
  INVALID_FORMAT: 'Invalid format',

  // Resources
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_CONFLICT: 'Resource conflict',
  DUPLICATE_RESOURCE: 'Duplicate resource',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',

  // Payments
  PAYMENT_FAILED: 'Payment failed',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  PAYMENT_METHOD_ERROR: 'Payment method error',

  // File Upload
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_SIZE_EXCEEDED: 'File size exceeded',
  FILE_TYPE_NOT_ALLOWED: 'File type not allowed',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'External service error',
  CONVEX_ERROR: 'Convex service error',
  STRIPE_ERROR: 'Stripe service error',
  SENDGRID_ERROR: 'SendGrid service error',
  TWILIO_ERROR: 'Twilio service error',

  // Business Logic
  BUSINESS_LOGIC_ERROR: 'Business logic error',
  JOB_ASSIGNMENT_FAILED: 'Job assignment failed',
} as const;