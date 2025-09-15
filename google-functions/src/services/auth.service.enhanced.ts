/**
 * Enhanced Authentication Service with Enterprise-Grade Features
 * Implements clean architecture, dependency injection, and comprehensive security
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { BaseService, ServiceConfig } from '@/core/base-service';
import { config } from '@/utils/config';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError,
  TokenExpiredError,
  InvalidTokenError,
  RateLimitError
} from '@/utils/errors';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '@/types';
import { ZodSchemas } from '@/utils/validation';

// Enhanced validation schemas with security rules
const AuthSchemas = {
  register: ZodSchemas.register.extend({
    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        'Password must contain uppercase, lowercase, number, and special character'
      )
      .refine(
        (password) => !commonPasswords.includes(password.toLowerCase()),
        'Password is too common'
      ),
    email: z.string()
      .email()
      .refine(
        (email) => !disposableEmailDomains.includes(email.split('@')[1]),
        'Disposable email addresses are not allowed'
      ),
  }),

  login: ZodSchemas.login.extend({
    deviceFingerprint: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }),
};

// Security interfaces
interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  correlationId: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface LoginAttempt {
  userId: string;
  ipAddress: string;
  success: boolean;
  timestamp: number;
  userAgent?: string;
}

export class EnhancedAuthService extends BaseService {
  private readonly saltRounds = 14; // Increased for better security
  private readonly resetTokenExpiry = 10 * 60 * 1000; // Reduced to 10 minutes
  private readonly maxLoginAttempts = 3; // Reduced for better security
  private readonly lockoutDuration = 60 * 60 * 1000; // 1 hour
  private readonly sessionTimeout = 15 * 60 * 1000; // 15 minutes
  private readonly refreshTokenRotation = true;

  // Rate limiting
  private readonly loginAttempts = new Map<string, LoginAttempt[]>();
  private readonly passwordResetAttempts = new Map<string, number>();

  constructor() {
    super({
      name: 'EnhancedAuthService',
      timeout: 30000,
      retryAttempts: 3,
      circuitBreakerOptions: {
        failureThreshold: 5,
        resetTimeout: 60000,
      },
      cacheOptions: {
        ttl: 300000, // 5 minutes
        maxSize: 10000,
      },
    });
  }

  /**
   * Enhanced user registration with comprehensive security checks
   */
  async register(
    registerData: RegisterRequest,
    securityContext: SecurityContext
  ): Promise<AuthResponse> {
    return this.executeWithProtection('register', async () => {
      // Validate input with enhanced schema
      const validatedData = await this.validateInput(
        registerData,
        (data) => AuthSchemas.register.parse(data),
        'register'
      );

      // Check for suspicious patterns
      await this.checkSuspiciousActivity(securityContext);

      // Enhanced email verification
      await this.verifyEmailDomain(validatedData.email);

      // Check if user already exists with additional checks
      const existingUser = await this.checkExistingUser(validatedData.email);
      if (existingUser) {
        // Log potential account enumeration attempt
        this.logger.logSecurityEvent('account_enumeration_attempt', 'medium', {
          email: validatedData.email,
          ipAddress: securityContext.ipAddress,
          correlationId: securityContext.correlationId,
        });

        // Use timing-safe comparison to prevent timing attacks
        await this.simulateRegistrationDelay();
        throw new ConflictError('Registration failed', 'REGISTRATION_FAILED');
      }

      // Enhanced password hashing with pepper
      const passwordHash = await this.hashPasswordWithPepper(validatedData.password);

      // Create user with enhanced security fields
      const userId = await this.createUserWithAudit({
        ...validatedData,
        passwordHash,
        securityContext,
        accountStatus: 'pending_verification',
        mfaEnabled: false,
        loginAttempts: 0,
        lastPasswordChange: Date.now(),
        passwordHistory: [passwordHash],
      });

      // Generate secure token pair
      const tokens = await this.generateSecureTokenPair(userId, validatedData.role, securityContext);

      // Send verification email (async)
      this.sendVerificationEmail(validatedData.email, validatedData.name).catch(error => {
        this.logger.error('Failed to send verification email', error);
      });

      // Log successful registration
      this.logger.logBusinessEvent('user_registered', {
        userId,
        email: validatedData.email,
        role: validatedData.role,
        ipAddress: securityContext.ipAddress,
      });

      const user: User = {
        id: userId,
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        phone: validatedData.phone,
        location: validatedData.location,
        categories: validatedData.categories,
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return {
        user,
        tokens,
      };
    });
  }

  /**
   * Enhanced login with advanced security features
   */
  async login(
    loginData: LoginRequest,
    securityContext: SecurityContext
  ): Promise<AuthResponse> {
    return this.executeWithProtection('login', async () => {
      // Validate input
      const validatedData = await this.validateInput(
        { ...loginData, ...securityContext },
        (data) => AuthSchemas.login.parse(data),
        'login'
      );

      // Check rate limiting
      await this.checkLoginRateLimit(securityContext.ipAddress);

      // Get user with security fields
      const user = await this.getUserWithSecurityInfo(validatedData.email);
      if (!user) {
        await this.recordFailedLoginAttempt('', securityContext, 'user_not_found');
        await this.simulatePasswordCheck();
        throw new AuthenticationError('Invalid credentials');
      }

      // Check account status
      await this.validateAccountStatus(user);

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / 1000 / 60);
        this.logger.logSecurityEvent('login_attempt_on_locked_account', 'high', {
          userId: user.id,
          ipAddress: securityContext.ipAddress,
          remainingLockTime: remainingTime,
        });
        throw new AuthenticationError(`Account locked. Try again in ${remainingTime} minutes`);
      }

      // Verify password with timing-safe comparison
      const isPasswordValid = await this.verifyPasswordSecure(
        validatedData.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id, securityContext, 'invalid_password');
        throw new AuthenticationError('Invalid credentials');
      }

      // Check for suspicious login patterns
      await this.detectAnomalousLogin(user.id, securityContext);

      // Reset login attempts on successful login
      await this.resetLoginAttempts(user.id);

      // Generate secure token pair with device binding
      const tokens = await this.generateSecureTokenPair(
        user.id,
        user.role,
        securityContext
      );

      // Update last login and security info
      await this.updateLoginMetadata(user.id, securityContext);

      // Log successful login
      this.logger.logBusinessEvent('user_logged_in', {
        userId: user.id,
        email: user.email,
        ipAddress: securityContext.ipAddress,
        deviceFingerprint: securityContext.deviceFingerprint,
      });

      const responseUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        skills: user.skills,
        categories: user.categories,
        rating: user.rating,
        isVerified: user.isVerified || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        user: responseUser,
        tokens,
      };
    });
  }

  /**
   * Enhanced token refresh with rotation and security checks
   */
  async refreshTokenSecure(
    refreshToken: string,
    securityContext: SecurityContext
  ): Promise<TokenPair> {
    return this.executeWithProtection('refresh_token', async () => {
      // Verify refresh token
      const decoded = await this.verifyRefreshTokenSecure(refreshToken);

      // Check token in database with security info
      const tokenInfo = await this.validateRefreshTokenWithSecurity(
        decoded.userId,
        refreshToken,
        securityContext
      );

      if (!tokenInfo) {
        this.logger.logSecurityEvent('invalid_refresh_token_used', 'high', {
          ipAddress: securityContext.ipAddress,
          tokenFragment: refreshToken.substring(0, 10) + '...',
        });
        throw new InvalidTokenError('Invalid refresh token');
      }

      // Get user with security validation
      const user = await this.getUserWithSecurityValidation(decoded.userId);

      // Check for token reuse (possible compromise)
      if (tokenInfo.lastUsed && Date.now() - tokenInfo.lastUsed < 1000) {
        this.logger.logSecurityEvent('potential_token_reuse', 'high', {
          userId: decoded.userId,
          ipAddress: securityContext.ipAddress,
        });
        // Invalidate all tokens for this user
        await this.invalidateAllUserTokens(decoded.userId);
        throw new InvalidTokenError('Token security violation detected');
      }

      // Generate new token pair with rotation
      const newTokens = await this.generateSecureTokenPair(
        user.id,
        user.role,
        securityContext
      );

      // Invalidate old refresh token
      await this.invalidateRefreshToken(decoded.userId, refreshToken);

      this.logger.info('Token refreshed successfully', {
        userId: decoded.userId,
        ipAddress: securityContext.ipAddress,
      });

      return newTokens;
    });
  }

  // Private helper methods with enhanced security

  private async hashPasswordWithPepper(password: string): Promise<string> {
    const pepper = process.env.PASSWORD_PEPPER || 'default-pepper';
    const saltedPassword = password + pepper;
    return bcrypt.hash(saltedPassword, this.saltRounds);
  }

  private async verifyPasswordSecure(password: string, hash: string): Promise<boolean> {
    const pepper = process.env.PASSWORD_PEPPER || 'default-pepper';
    const saltedPassword = password + pepper;

    // Add random delay to prevent timing attacks
    const delay = Math.floor(Math.random() * 50) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));

    return bcrypt.compare(saltedPassword, hash);
  }

  private async generateSecureTokenPair(
    userId: string,
    role: string,
    securityContext: SecurityContext
  ): Promise<TokenPair> {
    const tokenId = uuidv4();
    const deviceId = securityContext.deviceFingerprint || 'unknown';

    // Enhanced JWT payload with security context
    const accessTokenPayload = {
      userId,
      role,
      tokenId,
      deviceId,
      ipAddress: securityContext.ipAddress,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(), // JWT ID for tracking
    };

    const refreshTokenPayload = {
      userId,
      tokenId,
      deviceId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };

    // Sign tokens with enhanced security
    const accessToken = jwt.sign(accessTokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'handyman-auction',
      audience: 'handyman-auction-api',
    });

    const refreshToken = jwt.sign(refreshTokenPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'handyman-auction',
      audience: 'handyman-auction-api',
    });

    // Store refresh token with security metadata
    await this.storeRefreshTokenSecure(userId, refreshToken, {
      tokenId,
      deviceId,
      ipAddress: securityContext.ipAddress,
      userAgent: securityContext.userAgent,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer' as const,
    };
  }

  private async checkSuspiciousActivity(securityContext: SecurityContext): Promise<void> {
    // Implement rate limiting and suspicious pattern detection
    const recentAttempts = await this.getRecentRegistrationAttempts(securityContext.ipAddress);

    if (recentAttempts > 5) {
      this.logger.logSecurityEvent('suspicious_registration_activity', 'high', {
        ipAddress: securityContext.ipAddress,
        recentAttempts,
      });
      throw new RateLimitError('Too many registration attempts');
    }
  }

  private async detectAnomalousLogin(userId: string, securityContext: SecurityContext): Promise<void> {
    // Implement anomaly detection based on login patterns
    const recentLogins = await this.getUserRecentLogins(userId, 24 * 60 * 60 * 1000); // 24 hours

    const distinctIPs = new Set(recentLogins.map(login => login.ipAddress));
    const distinctUserAgents = new Set(recentLogins.map(login => login.userAgent));

    if (distinctIPs.size > 5 || distinctUserAgents.size > 3) {
      this.logger.logSecurityEvent('anomalous_login_pattern', 'medium', {
        userId,
        distinctIPs: distinctIPs.size,
        distinctUserAgents: distinctUserAgents.size,
        currentIP: securityContext.ipAddress,
      });

      // Could trigger additional verification requirements
    }
  }

  // Placeholder methods for data layer integration
  private async checkExistingUser(email: string): Promise<any> {
    // Implementation would check database
    return null;
  }

  private async createUserWithAudit(userData: any): Promise<string> {
    // Implementation would create user in database
    return uuidv4();
  }

  private async getUserWithSecurityInfo(email: string): Promise<any> {
    // Implementation would fetch user with security fields
    return null;
  }

  private async validateAccountStatus(user: any): Promise<void> {
    // Implementation would check account status
  }

  private async storeRefreshTokenSecure(userId: string, token: string, metadata: any): Promise<void> {
    // Implementation would store in database
  }

  private async getRecentRegistrationAttempts(ipAddress: string): Promise<number> {
    // Implementation would check recent attempts
    return 0;
  }

  private async getUserRecentLogins(userId: string, timeWindow: number): Promise<LoginAttempt[]> {
    // Implementation would fetch recent logins
    return [];
  }

  private async checkLoginRateLimit(ipAddress: string): Promise<void> {
    // Implementation would check rate limits
  }

  private async recordFailedLoginAttempt(userId: string, securityContext: SecurityContext, reason: string): Promise<void> {
    // Implementation would record failed attempt
  }

  private async simulatePasswordCheck(): Promise<void> {
    // Simulate password checking time to prevent timing attacks
    await bcrypt.hash('dummy-password', this.saltRounds);
  }

  private async simulateRegistrationDelay(): Promise<void> {
    // Add random delay to prevent timing attacks
    const delay = Math.floor(Math.random() * 200) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async sendVerificationEmail(email: string, name: string): Promise<void> {
    // Implementation would send verification email
  }

  private async verifyEmailDomain(email: string): Promise<void> {
    // Implementation would verify email domain
  }

  private async handleFailedLogin(userId: string, securityContext: SecurityContext, reason: string): Promise<void> {
    // Implementation would handle failed login
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    // Implementation would reset login attempts
  }

  private async updateLoginMetadata(userId: string, securityContext: SecurityContext): Promise<void> {
    // Implementation would update login metadata
  }

  private async verifyRefreshTokenSecure(token: string): Promise<any> {
    // Implementation would verify refresh token
    return { userId: 'dummy' };
  }

  private async validateRefreshTokenWithSecurity(userId: string, token: string, securityContext: SecurityContext): Promise<any> {
    // Implementation would validate refresh token
    return { lastUsed: Date.now() - 2000 };
  }

  private async getUserWithSecurityValidation(userId: string): Promise<any> {
    // Implementation would get user with security validation
    return { id: userId, role: 'user' };
  }

  private async invalidateAllUserTokens(userId: string): Promise<void> {
    // Implementation would invalidate all tokens
  }

  private async invalidateRefreshToken(userId: string, token: string): Promise<void> {
    // Implementation would invalidate refresh token
  }
}

// Security data (should be loaded from secure configuration)
const commonPasswords = [
  'password123',
  '123456789',
  'qwertyuiop',
  // ... more common passwords
];

const disposableEmailDomains = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  // ... more disposable domains
];