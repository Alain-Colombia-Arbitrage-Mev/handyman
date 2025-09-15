/**
 * Enterprise Error Handling Middleware
 * Comprehensive error handling with monitoring, alerting, and recovery
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { createLogger } from '@/utils/logger';
import { globalMetrics } from '@/utils/metrics';
import { CustomError, isOperationalError } from '@/utils/errors';
import { ApiResponse } from '@/types';

const logger = createLogger('ErrorHandler');

export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  method?: string;
  path?: string;
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

export class ErrorHandler {
  /**
   * Main error handling middleware
   */
  static handle() {
    return (error: any, req: Request, res: Response, next: NextFunction): void => {
      const context = ErrorHandler.extractContext(req);
      const normalizedError = ErrorHandler.normalizeError(error);

      // Log the error with context
      ErrorHandler.logError(normalizedError, context);

      // Record metrics
      ErrorHandler.recordErrorMetrics(normalizedError, context);

      // Check if error should trigger alerts
      ErrorHandler.checkAlerts(normalizedError, context);

      // Send error response
      ErrorHandler.sendErrorResponse(normalizedError, res, context);
    };
  }

  /**
   * Async error wrapper for route handlers
   */
  static asyncWrapper(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validation error handler for Zod
   */
  static handleValidationError() {
    return (error: any, req: Request, res: Response, next: NextFunction): void => {
      if (error instanceof ZodError) {
        const context = ErrorHandler.extractContext(req);
        const validationError = ErrorHandler.formatZodError(error);

        ErrorHandler.logError(validationError, context);
        ErrorHandler.recordErrorMetrics(validationError, context);
        ErrorHandler.sendErrorResponse(validationError, res, context);
        return;
      }

      next(error);
    };
  }

  /**
   * Rate limiting error handler
   */
  static handleRateLimitError() {
    return (error: any, req: Request, res: Response, next: NextFunction): void => {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        const context = ErrorHandler.extractContext(req);

        // Log rate limit violation
        logger.logSecurityEvent('rate_limit_exceeded', 'medium', {
          ...context,
          error: error.message,
        });

        // Record metrics
        globalMetrics.incrementCounter('rate_limit_violations', {
          endpoint: context.path || 'unknown',
          ip: context.ipAddress || 'unknown',
        });

        // Send rate limit response
        const response: ApiResponse = {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          timestamp: Date.now(),
          correlationId: context.correlationId,
        };

        res.status(429)
          .set({
            'Retry-After': error.retryAfter || 900,
            'X-RateLimit-Limit': error.limit || 100,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': new Date(Date.now() + (error.retryAfter || 900) * 1000).toISOString(),
          })
          .json(response);

        return;
      }

      next(error);
    };
  }

  /**
   * Unhandled rejection handler
   */
  static setupGlobalHandlers(): void {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Promise Rejection', new Error(reason), {
        promise: promise.toString(),
        reason: reason?.message || reason,
        stack: reason?.stack,
      });

      globalMetrics.incrementCounter('unhandled_rejections');

      // In production, this might crash the process
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          logger.error('Shutting down due to unhandled rejection');
          process.exit(1);
        }, 1000);
      }
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', error, {
        stack: error.stack,
      });

      globalMetrics.incrementCounter('uncaught_exceptions');

      // Always exit on uncaught exceptions
      setTimeout(() => {
        logger.error('Shutting down due to uncaught exception');
        process.exit(1);
      }, 1000);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, starting graceful shutdown');
      ErrorHandler.gracefulShutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, starting graceful shutdown');
      ErrorHandler.gracefulShutdown();
    });
  }

  // Private methods

  private static extractContext(req: Request): ErrorContext {
    const context = req as any;

    return {
      correlationId: context.correlationId,
      userId: context.user?.userId,
      requestId: context.requestId,
      userAgent: req.headers['user-agent'],
      ipAddress: context.clientIP || req.ip,
      method: req.method,
      path: req.path,
      body: ErrorHandler.sanitizeData(req.body),
      params: req.params,
      query: req.query,
      headers: ErrorHandler.sanitizeHeaders(req.headers),
    };
  }

  private static normalizeError(error: any): CustomError {
    // Handle known error types
    if (error instanceof CustomError) {
      return error;
    }

    if (error instanceof ZodError) {
      return ErrorHandler.formatZodError(error);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return new CustomError('Invalid token', 'INVALID_TOKEN', 401);
    }

    if (error.name === 'TokenExpiredError') {
      return new CustomError('Token expired', 'TOKEN_EXPIRED', 401);
    }

    // Handle Stripe errors
    if (error.type && error.type.startsWith('Stripe')) {
      return new CustomError(
        error.message || 'Payment processing error',
        'PAYMENT_ERROR',
        400
      );
    }

    // Handle database errors
    if (error.code && error.code.startsWith('23')) { // PostgreSQL constraint violations
      return new CustomError(
        'Data constraint violation',
        'DATABASE_CONSTRAINT_ERROR',
        400
      );
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new CustomError(
        'External service unavailable',
        'EXTERNAL_SERVICE_ERROR',
        503
      );
    }

    // Default error handling
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'Internal server error' : error.message || 'Unknown error';

    return new CustomError(
      message,
      'INTERNAL_ERROR',
      500,
      !isOperationalError(error) // Mark as non-operational if not a known error
    );
  }

  private static formatZodError(error: ZodError): CustomError {
    const validationErrors: Record<string, string> = {};

    error.errors.forEach((err) => {
      const path = err.path.join('.');
      validationErrors[path] = err.message;
    });

    const customError = new CustomError('Validation failed', 'VALIDATION_ERROR', 400);
    (customError as any).validationErrors = validationErrors;

    return customError;
  }

  private static logError(error: CustomError, context: ErrorContext): void {
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
    const logMethod = logLevel === 'error' ? logger.error : logger.warn;

    logMethod.call(logger, `${error.name}: ${error.message}`, error, {
      ...context,
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational,
      stack: error.stack,
    });

    // Log security events for certain error types
    if (error.statusCode === 401 || error.statusCode === 403) {
      logger.logSecurityEvent('authentication_authorization_error', 'medium', {
        ...context,
        errorCode: error.code,
        errorMessage: error.message,
      });
    }
  }

  private static recordErrorMetrics(error: CustomError, context: ErrorContext): void {
    // Record general error metrics
    globalMetrics.incrementCounter('errors_total', {
      error_type: error.name,
      error_code: error.code,
      status_code: error.statusCode.toString(),
      method: context.method || 'unknown',
      endpoint: context.path || 'unknown',
    });

    // Record specific error categories
    if (error.statusCode >= 500) {
      globalMetrics.incrementCounter('server_errors');
    } else if (error.statusCode >= 400) {
      globalMetrics.incrementCounter('client_errors');
    }

    // Record security-related errors
    if (error.statusCode === 401 || error.statusCode === 403) {
      globalMetrics.incrementCounter('security_errors', {
        type: error.statusCode === 401 ? 'authentication' : 'authorization',
        ip: context.ipAddress || 'unknown',
      });
    }

    // Record validation errors
    if (error.code === 'VALIDATION_ERROR') {
      globalMetrics.incrementCounter('validation_errors', {
        endpoint: context.path || 'unknown',
      });
    }
  }

  private static checkAlerts(error: CustomError, context: ErrorContext): void {
    // Alert on critical errors
    if (error.statusCode >= 500 && !error.isOperational) {
      logger.logSecurityEvent('critical_system_error', 'critical', {
        ...context,
        errorCode: error.code,
        errorMessage: error.message,
        stack: error.stack,
      });
    }

    // Alert on high frequency of authentication errors
    const authErrorCount = globalMetrics.getMetrics().then(metrics => {
      // In a real implementation, this would check recent error rates
      // and trigger alerts if thresholds are exceeded
    });

    // Alert on external service failures
    if (error.code === 'EXTERNAL_SERVICE_ERROR') {
      logger.logSecurityEvent('external_service_failure', 'warning', {
        ...context,
        errorMessage: error.message,
      });
    }
  }

  private static sendErrorResponse(
    error: CustomError,
    res: Response,
    context: ErrorContext
  ): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const response: ApiResponse = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: Date.now(),
      correlationId: context.correlationId,
    };

    // Add validation errors if present
    if ((error as any).validationErrors) {
      (response as any).validationErrors = (error as any).validationErrors;
    }

    // Add stack trace in development
    if (isDevelopment) {
      (response as any).stack = error.stack;
      (response as any).context = context;
    }

    // Set appropriate headers
    res.set({
      'Content-Type': 'application/json',
      'X-Error-Code': error.code,
      'X-Request-ID': context.requestId || 'unknown',
    });

    res.status(error.statusCode).json(response);
  }

  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private static sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };

    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private static async gracefulShutdown(): Promise<void> {
    try {
      // Perform cleanup operations
      await globalMetrics.flush();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', error);
      process.exit(1);
    }
  }
}

/**
 * Express error handling middleware factory
 */
export const createErrorHandler = () => {
  return [
    ErrorHandler.handleValidationError(),
    ErrorHandler.handleRateLimitError(),
    ErrorHandler.handle(),
  ];
};

/**
 * Setup global error handlers
 */
export const setupGlobalErrorHandlers = (): void => {
  ErrorHandler.setupGlobalHandlers();
};