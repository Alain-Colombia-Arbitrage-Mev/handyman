/**
 * Google Cloud Functions Entry Point
 * Handyman Auction App Backend Services
 */

import { validateConfig } from '@/utils/config';
import { logger } from '@/utils/logger';

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error: any) {
  logger.error('Configuration validation failed', error);
  process.exit(1);
}

// Authentication Functions
export {
  auth,
  authRegister,
  authLogin,
  authRefresh,
  authForgotPassword,
  authResetPassword,
} from './functions/auth';

logger.info('All Cloud Functions exported successfully');

// Export services for reuse
export { authService } from './services/auth.service';
export { paymentService } from './services/payment.service';
export { notificationService } from './services/notification.service';

// Export utilities
export { logger, createLogger } from '@/utils/logger';
export { validateSchema, schemas } from '@/utils/validation';
export * from '@/utils/errors';

// Export types
export * from '@/types';