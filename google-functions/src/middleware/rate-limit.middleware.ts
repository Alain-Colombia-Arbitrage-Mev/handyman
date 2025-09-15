import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '@/utils/errors';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

const rateLimiters = new Map<string, RateLimiterMemory>();

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  const {
    maxRequests,
    windowMs,
    message = 'Too many requests. Please try again later.',
  } = options;

  // Create a unique key for this rate limiter configuration
  const configKey = `${maxRequests}-${windowMs}`;

  if (!rateLimiters.has(configKey)) {
    rateLimiters.set(
      configKey,
      new RateLimiterMemory({
        points: maxRequests,
        duration: Math.floor(windowMs / 1000), // Convert to seconds
      })
    );
  }

  const rateLimiter = rateLimiters.get(configKey)!;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.ip || 'unknown';
      await rateLimiter.consume(key);
      next();
    } catch (rejRes: any) {
      const remainingHits = rejRes?.remainingHits || 0;
      const msBeforeNext = rejRes?.msBeforeNext || windowMs;

      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remainingHits.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      throw new TooManyRequestsError(message);
    }
  };
};

/**
 * Advanced rate limiting with burst and user-based limits (2024)
 */
export const advancedRateLimitMiddleware = (options: AdvancedRateLimitOptions): RequestHandler => {
  const {
    burst = 0,
    gracePeriod = 0,
    whitelist = [],
    blacklist = [],
    dynamicLimits = false,
  } = options;

  const baseMiddleware = rateLimitMiddleware(options);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = req.ip || 'unknown';

    // Check blacklist
    if (blacklist.includes(clientIp)) {
      logger.warn('Blocked request from blacklisted IP', { ip: clientIp });
      throw new TooManyRequestsError('Access denied');
    }

    // Skip rate limiting for whitelisted IPs
    if (whitelist.includes(clientIp)) {
      logger.debug('Skipping rate limit for whitelisted IP', { ip: clientIp });
      return next();
    }

    // Apply base rate limiting
    return baseMiddleware(req, res, next);
  };
};

/**
 * User-based rate limiting middleware
 */
export const userRateLimitMiddleware = (options: RateLimitOptions): RequestHandler => {
  return rateLimitMiddleware({
    ...options,
    keyGenerator: (req: any) => {
      // Use user ID if authenticated, fallback to IP
      const userId = req.user?.userId;
      return userId ? `user:${userId}` : `ip:${req.ip || 'unknown'}`;
    },
  });
};

/**
 * Endpoint-specific rate limiting middleware
 */
export const endpointRateLimitMiddleware = (options: RateLimitOptions): RequestHandler => {
  return rateLimitMiddleware({
    ...options,
    keyGenerator: (req: Request) => {
      const ip = req.ip || 'unknown';
      const endpoint = `${req.method}:${req.route?.path || req.path}`;
      return `${ip}:${endpoint}`;
    },
  });
};