/**
 * Enterprise-Grade Security Middleware Stack
 * Implements comprehensive security controls and threat detection
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

import { createLogger } from '@/utils/logger';
import {
  AuthenticationError,
  ValidationError,
  TooManyRequestsError,
  SecurityViolationError
} from '@/utils/errors';
import { ApiResponse } from '@/types';

const logger = createLogger('SecurityMiddleware');

// Security configuration
const SECURITY_CONFIG = {
  maxRequestSize: 1024 * 1024, // 1MB
  maxHeaderSize: 8192, // 8KB
  suspiciousPatterns: [
    /(<script|<iframe|<object|<embed)/i, // XSS patterns
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i, // SQL injection
    /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\)/i, // Path traversal
    /(\${|<%|<\?php|<\?=)/i, // Template injection
  ],
  allowedMimeTypes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
  ],
  blockedUserAgents: [
    /bot|crawler|spider|scraper/i,
    /curl|wget|httpie/i,
  ],
  blockedIPs: new Set<string>(),
  geoBlockedCountries: new Set(['CN', 'RU', 'KP']), // Example blocked countries
};

/**
 * Request sanitization middleware
 */
export const sanitizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check request size
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > SECURITY_CONFIG.maxRequestSize) {
      logger.logSecurityEvent('oversized_request', 'medium', {
        size: contentLength,
        maxSize: SECURITY_CONFIG.maxRequestSize,
        ip: req.ip,
      });
      throw new ValidationError('Request too large');
    }

    // Check header size
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > SECURITY_CONFIG.maxHeaderSize) {
      logger.logSecurityEvent('oversized_headers', 'medium', {
        size: headerSize,
        maxSize: SECURITY_CONFIG.maxHeaderSize,
        ip: req.ip,
      });
      throw new ValidationError('Headers too large');
    }

    // Sanitize query parameters and body
    sanitizeObject(req.query);
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    // Check for suspicious patterns
    const requestData = JSON.stringify({ ...req.query, ...req.body });
    for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
      if (pattern.test(requestData)) {
        logger.logSecurityEvent('suspicious_payload_detected', 'high', {
          pattern: pattern.toString(),
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          payload: requestData.substring(0, 200),
        });
        throw new SecurityViolationError('Malicious payload detected');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Content type validation middleware
 */
export const contentTypeValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type']?.split(';')[0];

    if (!contentType || !SECURITY_CONFIG.allowedMimeTypes.includes(contentType)) {
      logger.logSecurityEvent('invalid_content_type', 'medium', {
        contentType,
        allowedTypes: SECURITY_CONFIG.allowedMimeTypes,
        ip: req.ip,
      });
      throw new ValidationError('Invalid content type');
    }
  }
  next();
};

/**
 * User agent validation middleware
 */
export const userAgentValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userAgent = req.headers['user-agent'] || '';

  // Block known malicious user agents
  for (const blockedPattern of SECURITY_CONFIG.blockedUserAgents) {
    if (blockedPattern.test(userAgent)) {
      logger.logSecurityEvent('blocked_user_agent', 'high', {
        userAgent,
        ip: req.ip,
      });
      throw new AuthenticationError('Access denied');
    }
  }

  // Parse and validate user agent
  const parsed = new UAParser(userAgent);
  const result = parsed.getResult();

  // Check for suspicious patterns
  if (!result.browser.name && !result.engine.name) {
    logger.logSecurityEvent('suspicious_user_agent', 'medium', {
      userAgent,
      ip: req.ip,
    });
  }

  // Add parsed user agent to request
  (req as any).userAgentInfo = result;

  next();
};

/**
 * IP-based security middleware
 */
export const ipSecurityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIP = getClientIP(req);

  // Check if IP is blocked
  if (SECURITY_CONFIG.blockedIPs.has(clientIP)) {
    logger.logSecurityEvent('blocked_ip_access', 'high', {
      ip: clientIP,
      userAgent: req.headers['user-agent'],
    });
    throw new AuthenticationError('Access denied');
  }

  // Add client IP to request
  (req as any).clientIP = clientIP;

  next();
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers['authorization']?.split(' ')[1];

  if (!csrfToken || !sessionToken) {
    logger.logSecurityEvent('missing_csrf_token', 'medium', {
      ip: req.ip,
      method: req.method,
      path: req.path,
    });
    throw new AuthenticationError('CSRF token required');
  }

  // Validate CSRF token (simplified - in production, use proper CSRF validation)
  const expectedToken = generateCSRFToken(sessionToken);
  if (csrfToken !== expectedToken) {
    logger.logSecurityEvent('invalid_csrf_token', 'high', {
      ip: req.ip,
      method: req.method,
      path: req.path,
    });
    throw new AuthenticationError('Invalid CSRF token');
  }

  next();
};

/**
 * Request fingerprinting middleware
 */
export const fingerprintingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const fingerprint = generateRequestFingerprint(req);
  (req as any).fingerprint = fingerprint;

  // Check for fingerprint anomalies
  const requestCount = getRequestCountForFingerprint(fingerprint);
  if (requestCount > 100) { // Threshold for suspicious activity
    logger.logSecurityEvent('high_frequency_fingerprint', 'medium', {
      fingerprint: fingerprint.substring(0, 16),
      requestCount,
      ip: req.ip,
    });
  }

  next();
};

/**
 * Advanced rate limiting with multiple strategies
 */
export const advancedRateLimit = () => {
  // IP-based rate limiting
  const ipRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
      logger.logSecurityEvent('ip_rate_limit_exceeded', 'medium', {
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
      });

      const response: ApiResponse = {
        success: false,
        error: 'Too many requests from this IP',
        timestamp: Date.now(),
      };

      res.status(429).json(response);
    },
  });

  // Progressive delay for repeated requests
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above 50
    maxDelayMs: 20000, // maximum delay of 20 seconds
    keyGenerator: (req) => getClientIP(req),
  });

  return [ipRateLimit, speedLimiter];
};

/**
 * Endpoint-specific security middleware
 */
export const endpointSecurity = (config: {
  maxRequests?: number;
  windowMs?: number;
  requireHTTPS?: boolean;
  allowedMethods?: string[];
}) => {
  return [
    // HTTPS enforcement
    ...(config.requireHTTPS ? [httpsEnforcement] : []),

    // Method validation
    ...(config.allowedMethods ? [methodValidation(config.allowedMethods)] : []),

    // Custom rate limiting
    ...(config.maxRequests && config.windowMs
      ? [rateLimit({
          windowMs: config.windowMs,
          max: config.maxRequests,
          keyGenerator: (req) => `${getClientIP(req)}:${req.route?.path || req.path}`,
        })]
      : []
    ),
  ];
};

// Helper functions

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

function getClientIP(req: Request): string {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  ).split(',')[0].trim();
}

function generateCSRFToken(sessionToken: string): string {
  return crypto
    .createHash('sha256')
    .update(sessionToken + process.env.CSRF_SECRET)
    .digest('hex');
}

function generateRequestFingerprint(req: Request): string {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    getClientIP(req),
  ];

  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

function getRequestCountForFingerprint(fingerprint: string): number {
  // In production, this would query a cache/database
  // For now, return a mock value
  return Math.floor(Math.random() * 150);
}

function httpsEnforcement(req: Request, res: Response, next: NextFunction): void {
  if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    logger.logSecurityEvent('http_request_blocked', 'low', {
      ip: getClientIP(req),
      path: req.path,
    });
    throw new ValidationError('HTTPS required');
  }
  next();
}

function methodValidation(allowedMethods: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!allowedMethods.includes(req.method)) {
      logger.logSecurityEvent('invalid_http_method', 'medium', {
        method: req.method,
        allowedMethods,
        ip: getClientIP(req),
      });
      throw new ValidationError('Method not allowed');
    }
    next();
  };
}

// Security violation error class
class SecurityViolationError extends Error {
  statusCode = 403;
  code = 'SECURITY_VIOLATION';

  constructor(message: string) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}