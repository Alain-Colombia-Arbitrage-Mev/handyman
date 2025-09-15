import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger, generateCorrelationId } from '@/utils/logger';
import { validateSchema, schemas } from '@/utils/validation';
import { authMiddleware, rateLimitMiddleware } from '@/middleware';
import { authService } from '@/services/auth.service';
import { ApiResponse, RegisterRequest, LoginRequest } from '@/types';

// Configure global options for 2nd generation functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 100,
  concurrency: 80,
  memory: '512MiB',
  timeoutSeconds: 60,
});

// Define secrets for enhanced security
const jwtSecret = defineSecret('JWT_SECRET');
const jwtRefreshSecret = defineSecret('JWT_REFRESH_SECRET');

const logger = createLogger('AuthFunctions');
const app = express();

// Enhanced middleware stack (2024)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://yourapp.com',
    'https://admin.yourapp.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Correlation-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

app.use(express.json({
  limit: '1mb',
  strict: true,
  type: 'application/json'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '1mb',
  parameterLimit: 100
}));

// Security middleware
app.use((req: any, res: any, next: any) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });

  next();
});

// Enhanced correlation ID middleware (2024)
app.use((req: any, res: any, next: any) => {
  const correlationId = req.headers['x-correlation-id'] as string || generateCorrelationId();
  const requestId = req.headers['x-request-id'] as string || generateCorrelationId();

  // Enhanced request context
  req.correlationId = correlationId;
  req.requestId = requestId;
  req.startTime = Date.now();
  req.userAgent = req.headers['user-agent'] || 'unknown';
  req.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // Set response headers
  res.set({
    'x-correlation-id': correlationId,
    'x-request-id': requestId,
    'x-function-version': process.env.K_REVISION || 'unknown',
    'x-powered-by': 'Firebase Functions v6',
  });

  // Enhanced logger context
  logger.setContext(correlationId, undefined);

  next();
});

// Enhanced error handling middleware (2024)
app.use((error: any, req: any, res: any, next: any) => {
  const duration = Date.now() - (req.startTime || Date.now());

  // Enhanced error logging
  logger.error('Unhandled error in auth functions', error, {
    correlationId: req.correlationId,
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    userAgent: req.userAgent,
    clientIp: req.clientIp,
    duration,
    statusCode: error.statusCode || 500,
    stack: error.stack,
  });

  // Sanitized error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response: ApiResponse = {
    success: false,
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    timestamp: Date.now(),
    correlationId: req.correlationId,
    ...(isDevelopment && { stack: error.stack }),
  };

  // Log request completion
  logger.logRequest(req.method, req.path, error.statusCode || 500, duration, {
    correlationId: req.correlationId,
    error: true,
  });

  res.status(error.statusCode || 500).json(response);
});

// Routes

/**
 * POST /register
 * Register a new user account
 */
app.post('/register',
  rateLimitMiddleware({ maxRequests: 5, windowMs: 15 * 60 * 1000 }), // 5 attempts per 15 minutes
  validateSchema(schemas.register),
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('User registration request', { email: req.body.email, role: req.body.role });

    try {
      const registerData: RegisterRequest = req.body;
      const result = await authService.register(registerData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User registered successfully',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/register', 201, Date.now() - startTime, {
        correlationId: req.correlationId,
        email: registerData.email,
        role: registerData.role,
        userAgent: req.userAgent,
        clientIp: req.clientIp,
      });

      res.status(201).json(response);

    } catch (error: any) {
      logger.error('Registration failed', error, { email: req.body.email });

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 400).json(response);
    }
  }
);

/**
 * POST /login
 * Authenticate user and return JWT tokens
 */
app.post('/login',
  rateLimitMiddleware({ maxRequests: 10, windowMs: 15 * 60 * 1000 }), // 10 attempts per 15 minutes
  validateSchema(schemas.login),
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('User login request', { email: req.body.email });

    try {
      const loginData: LoginRequest = req.body;
      const result = await authService.login(loginData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/login', 200, Date.now() - startTime, {
        correlationId: req.correlationId,
        email: loginData.email,
        userId: result.user.id,
        userAgent: req.userAgent,
        clientIp: req.clientIp,
      });

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Login failed', error, { email: req.body.email });

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 401).json(response);
    }
  }
);

/**
 * POST /refresh
 * Refresh JWT access token using refresh token
 */
app.post('/refresh',
  rateLimitMiddleware({ maxRequests: 20, windowMs: 15 * 60 * 1000 }),
  validateSchema(schemas.refreshToken),
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('Token refresh request');

    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/refresh', 200, Date.now() - startTime);

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Token refresh failed', error);

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 401).json(response);
    }
  }
);

/**
 * POST /forgot-password
 * Request password reset email
 */
app.post('/forgot-password',
  rateLimitMiddleware({ maxRequests: 3, windowMs: 15 * 60 * 1000 }), // 3 attempts per 15 minutes
  validateSchema(schemas.forgotPassword),
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('Password reset request', { email: req.body.email });

    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);

      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/forgot-password', 200, Date.now() - startTime, { email });

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Password reset request failed', error, { email: req.body.email });

      // Don't reveal whether email exists or not
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        timestamp: Date.now(),
      };

      res.status(200).json(response);
    }
  }
);

/**
 * POST /reset-password
 * Complete password reset using reset token
 */
app.post('/reset-password',
  rateLimitMiddleware({ maxRequests: 5, windowMs: 15 * 60 * 1000 }),
  validateSchema(schemas.resetPassword),
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('Password reset completion request');

    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/reset-password', 200, Date.now() - startTime);

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Password reset failed', error);

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 400).json(response);
    }
  }
);

/**
 * POST /change-password
 * Change password for authenticated user
 */
app.post('/change-password',
  authMiddleware,
  validateSchema(schemas.changePassword),
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('Password change request', { userId: req.user.userId });

    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/change-password', 200, Date.now() - startTime, {
        userId: req.user.userId,
      });

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Password change failed', error, { userId: req.user.userId });

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 400).json(response);
    }
  }
);

/**
 * POST /logout
 * Logout user and invalidate refresh token
 */
app.post('/logout',
  authMiddleware,
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('User logout request', { userId: req.user.userId });

    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user.userId, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/logout', 200, Date.now() - startTime, {
        userId: req.user.userId,
      });

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Logout failed', error, { userId: req.user.userId });

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 400).json(response);
    }
  }
);

/**
 * GET /me
 * Get current user profile
 */
app.get('/me',
  authMiddleware,
  async (req: any, res: any) => {
    const startTime = Date.now();
    logger.info('Get current user profile', { userId: req.user.userId });

    try {
      // This would typically fetch user data from your database
      const response: ApiResponse = {
        success: true,
        data: {
          userId: req.user.userId,
          role: req.user.role,
        },
        message: 'User profile retrieved successfully',
        timestamp: Date.now(),
      };

      logger.logRequest('GET', '/me', 200, Date.now() - startTime, {
        userId: req.user.userId,
      });

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Failed to get user profile', error, { userId: req.user.userId });

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 400).json(response);
    }
  }
);

/**
 * POST /validate-token
 * Validate JWT token (for internal use)
 */
app.post('/validate-token',
  async (req: any, res: any) => {
    const startTime = Date.now();

    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token is required',
          timestamp: Date.now(),
        });
      }

      const result = await authService.validateToken(token);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token is valid',
        timestamp: Date.now(),
      };

      logger.logRequest('POST', '/validate-token', 200, Date.now() - startTime);

      res.status(200).json(response);

    } catch (error: any) {
      logger.error('Token validation failed', error);

      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      res.status(error.statusCode || 401).json(response);
    }
  }
);

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: Date.now(),
  });
});

// Export Firebase Functions v6 (2nd Generation)
export const authRegister = onRequest(
  {
    memory: '512MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 10,
    concurrency: 50,
    secrets: [jwtSecret, jwtRefreshSecret],
    cors: true,
  },
  app
);

export const authLogin = onRequest(
  {
    memory: '256MiB',
    timeoutSeconds: 30,
    minInstances: 1, // Keep warm for critical auth
    maxInstances: 20,
    concurrency: 80,
    secrets: [jwtSecret, jwtRefreshSecret],
    cors: true,
  },
  app
);

export const authRefresh = onRequest(
  {
    memory: '256MiB',
    timeoutSeconds: 10,
    minInstances: 0,
    maxInstances: 15,
    concurrency: 100,
    secrets: [jwtSecret, jwtRefreshSecret],
    cors: true,
  },
  app
);

export const authForgotPassword = onRequest(
  {
    memory: '256MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 5,
    concurrency: 10,
    secrets: [jwtSecret],
    cors: true,
  },
  app
);

export const authResetPassword = onRequest(
  {
    memory: '256MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 5,
    concurrency: 10,
    secrets: [jwtSecret, jwtRefreshSecret],
    cors: true,
  },
  app
);

// Main auth function with enhanced 2nd gen configuration
export const auth = onRequest(
  {
    memory: '512MiB',
    timeoutSeconds: 60,
    minInstances: 1, // Keep warm for critical auth operations
    maxInstances: 50,
    concurrency: 80,
    secrets: [jwtSecret, jwtRefreshSecret],
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:8081',
        'https://yourapp.com',
        'https://admin.yourapp.com'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Correlation-ID'],
      credentials: true,
    },
    invoker: 'public',
  },
  app
);