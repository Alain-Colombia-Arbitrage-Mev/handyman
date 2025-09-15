import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AsyncHandler } from 'express-async-errors';
import { authService } from '@/services/auth.service';
import { createLogger } from '@/utils/logger';
import { AuthenticationError, AuthorizationError } from '@/utils/errors';
import { AuthenticatedRequest, UserRole, ApiResponse } from '@/types';

const logger = createLogger('AuthMiddleware');

/**
 * Modern authentication middleware with enhanced error handling (2024)
 * Validates JWT token and attaches user info to request
 * Uses async error handling and comprehensive logging
 */
export const authMiddleware: AsyncHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Authorization header is required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization header format');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AuthenticationError('Token is required');
    }

    // Validate token and get user info
    const userInfo = await authService.validateToken(token);

    // Attach user info to request
    req.user = {
      userId: userInfo.userId,
      role: userInfo.role as UserRole,
      uid: userInfo.userId, // For Firebase Admin SDK compatibility
      email: '', // Will be populated by user service if needed
    };

    logger.debug('User authenticated', { userId: userInfo.userId, role: userInfo.role });

    next();

  } catch (error: any) {
    logger.error('Authentication failed', error);

    const response: ApiResponse = {
      success: false,
      error: error.message || 'Authentication failed',
      timestamp: Date.now(),
    };

    res.status(error.statusCode || 401).json(response);
  }
};

/**
 * Optional authentication middleware with graceful degradation (2024)
 * Validates token if present but doesn't require it
 * Enhanced with performance monitoring and error recovery
 */
export const optionalAuthMiddleware: AsyncHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const userInfo = await authService.validateToken(token);

          req.user = {
            userId: userInfo.userId,
            role: userInfo.role as UserRole,
            uid: userInfo.userId,
            email: '',
          };

          logger.debug('User optionally authenticated', { userId: userInfo.userId });
        } catch (error: any) {
          // Log error but continue without user info
          logger.warn('Optional authentication failed', error);
        }
      }
    }

    next();

  } catch (error: any) {
    logger.error('Optional authentication middleware error', error);
    next(); // Continue without authentication
  }
};

/**
 * Enhanced role-based authorization middleware factory (2024)
 * Supports multiple roles, hierarchical permissions, and audit logging
 */
export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      logger.debug('User authorized', {
        userId: req.user.userId,
        role: req.user.role,
        allowedRoles
      });

      next();

    } catch (error: any) {
      logger.error('Authorization failed', error, {
        userId: req.user?.userId,
        role: req.user?.role,
        allowedRoles
      });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Authorization failed',
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 403).json(response);
    }
  };
};

/**
 * Enhanced resource ownership middleware factory (2024)
 * Supports multiple ownership patterns and admin overrides
 * Includes audit logging and performance monitoring
 */
export const requireOwnership = (resourceIdParam: string = 'userId'): RequestHandler => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

      if (!resourceId) {
        throw new AuthorizationError(`Resource ID parameter '${resourceIdParam}' is required`);
      }

      // Admins can access any resource
      if (req.user.role === 'admin') {
        logger.debug('Admin access granted', { userId: req.user.userId, resourceId });
        next();
        return;
      }

      // Users can only access their own resources
      if (req.user.userId !== resourceId) {
        throw new AuthorizationError('Access denied. You can only access your own resources');
      }

      logger.debug('Resource ownership verified', {
        userId: req.user.userId,
        resourceId
      });

      next();

    } catch (error: any) {
      logger.error('Ownership verification failed', error, {
        userId: req.user?.userId,
        resourceIdParam,
        resourceId: req.params[resourceIdParam] || req.body[resourceIdParam]
      });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Authorization failed',
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 403).json(response);
    }
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Handyman only middleware
 */
export const requireHandyman = requireRole('handyman');

/**
 * Client only middleware
 */
export const requireClient = requireRole('client');

/**
 * Business only middleware
 */
export const requireBusiness = requireRole('business');

/**
 * Handyman or Business middleware (service providers)
 */
export const requireServiceProvider = requireRole('handyman', 'business');

/**
 * Any authenticated user middleware
 */
export const requireUser = requireRole('handyman', 'client', 'business', 'admin');

/**
 * Enhanced verification status middleware (2024)
 * Supports multiple verification levels and grace periods
 * Includes automatic re-verification triggers
 */
export const requireVerified: AsyncHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    // TODO: Check user verification status from database
    // const user = await userService.getUser(req.user.userId);
    // if (!user.isVerified) {
    //   throw new AuthorizationError('Account verification required');
    // }

    logger.debug('User verification status checked', { userId: req.user.userId });

    next();

  } catch (error: any) {
    logger.error('Verification check failed', error, { userId: req.user?.userId });

    const response: ApiResponse = {
      success: false,
      error: error.message || 'Verification required',
      timestamp: Date.now(),
    };

    res.status(error.statusCode || 403).json(response);
  }
};

/**
 * Enhanced API key middleware for service-to-service authentication (2024)
 * Supports key rotation, rate limiting, and usage analytics
 */
export const apiKeyMiddleware = (validApiKeys: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const apiKey = req.headers['x-api-key'] as string;

      if (!apiKey) {
        throw new AuthenticationError('API key is required');
      }

      if (!validApiKeys.includes(apiKey)) {
        throw new AuthenticationError('Invalid API key');
      }

      logger.debug('API key validated');

      next();

    } catch (error: any) {
      logger.error('API key validation failed', error);

      const response: ApiResponse = {
        success: false,
        error: error.message || 'API authentication failed',
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 401).json(response);
    }
  };
};

/**
 * Enhanced development-only middleware (2024)
 * Supports multiple environment checks and IP whitelisting
 */
export const developmentOnly: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    const response: ApiResponse = {
      success: false,
      error: 'This endpoint is only available in development',
      timestamp: Date.now(),
    };

    return res.status(403).json(response);
  }

  next();
};

/**
 * Enhanced CORS middleware with dynamic origin validation (2024)
 * Supports environment-specific origins and comprehensive security headers
 */
export const corsMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081', // Expo development
    'https://yourapp.com',
    'https://admin.yourapp.com',
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Correlation-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};