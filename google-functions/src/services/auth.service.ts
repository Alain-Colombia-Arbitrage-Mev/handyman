import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/utils/config';
import { createLogger } from '@/utils/logger';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError,
  TokenExpiredError,
  InvalidTokenError
} from '@/utils/errors';
import { convexService } from './convex.service';
import { emailService } from './email.service';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '@/types';

const logger = createLogger('AuthService');

export class AuthService {
  private readonly saltRounds = 12;
  private readonly resetTokenExpiry = 15 * 60 * 1000; // 15 minutes
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 30 * 60 * 1000; // 30 minutes

  // Password hashing
  async hashPassword(password: string): Promise<string> {
    logger.debug('Hashing password');
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    logger.debug('Verifying password');
    return bcrypt.compare(password, hash);
  }

  // JWT token generation
  generateAccessToken(userId: string, role: string): string {
    logger.debug('Generating access token', { userId, role });

    const payload = {
      userId,
      role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  generateRefreshToken(userId: string): string {
    logger.debug('Generating refresh token', { userId });

    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  // Token verification
  verifyAccessToken(token: string): { userId: string; role: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      if (decoded.type !== 'access') {
        throw new InvalidTokenError('Invalid token type');
      }

      return {
        userId: decoded.userId,
        role: decoded.role,
      };
    } catch (error: any) {
      logger.error('Access token verification failed', error);

      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError('Access token has expired');
      }

      throw new InvalidTokenError('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;

      if (decoded.type !== 'refresh') {
        throw new InvalidTokenError('Invalid token type');
      }

      return {
        userId: decoded.userId,
      };
    } catch (error: any) {
      logger.error('Refresh token verification failed', error);

      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError('Refresh token has expired');
      }

      throw new InvalidTokenError('Invalid refresh token');
    }
  }

  // User registration
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    logger.info('User registration attempt', { email: registerData.email, role: registerData.role });

    try {
      // Check if user already exists
      const existingUser = await convexService.getUserByEmail(registerData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
      }

      // Hash password
      const passwordHash = await this.hashPassword(registerData.password);

      // Create user in Convex
      const userId = await convexService.createUser({
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        phone: registerData.phone,
        location: registerData.location,
        categories: registerData.categories,
        passwordHash, // Store hashed password
        isVerified: false,
        loginAttempts: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(userId, registerData.role);
      const refreshToken = this.generateRefreshToken(userId);

      // Store refresh token
      await convexService.storeRefreshToken(userId, refreshToken);

      // Send welcome email
      await emailService.sendWelcomeEmail(registerData.email, registerData.name);

      // Create notification
      await convexService.createNotification({
        userId,
        type: 'system',
        title: '¡Bienvenido a Handyman Auction!',
        message: registerData.role === 'handyman'
          ? 'Completa tu perfil y sube tus documentos para empezar a recibir trabajos'
          : 'Encuentra los mejores profesionales para tus necesidades',
        isRead: false,
        createdAt: Date.now(),
      });

      const user: User = {
        id: userId,
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        phone: registerData.phone,
        location: registerData.location,
        categories: registerData.categories,
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      logger.info('User registered successfully', { userId, email: registerData.email });

      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour in seconds
        },
      };

    } catch (error: any) {
      logger.error('Registration failed', error, { email: registerData.email });
      throw error;
    }
  }

  // User login
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    logger.info('User login attempt', { email: loginData.email });

    try {
      // Get user by email
      const user = await convexService.getUserByEmail(loginData.email);
      if (!user) {
        // Don't reveal that email doesn't exist
        await this.simulatePasswordCheck();
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / 1000 / 60);
        throw new AuthenticationError(`Account temporarily locked. Try again in ${remainingTime} minutes`);
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(loginData.password, user.passwordHash);

      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id);
        throw new AuthenticationError('Invalid credentials');
      }

      // Reset login attempts on successful login
      await this.resetLoginAttempts(user.id);

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id, user.role);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token and update last login
      await Promise.all([
        convexService.storeRefreshToken(user.id, refreshToken),
        convexService.updateUserLastLogin(user.id, {
          lastLoginAt: Date.now(),
          deviceInfo: loginData.deviceInfo,
        }),
      ]);

      logger.info('User logged in successfully', { userId: user.id, email: loginData.email });

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
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour in seconds
        },
      };

    } catch (error: any) {
      logger.error('Login failed', error, { email: loginData.email });
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    logger.info('Token refresh attempt');

    try {
      // Verify refresh token
      const { userId } = this.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const isValidToken = await convexService.validateRefreshToken(userId, refreshToken);
      if (!isValidToken) {
        throw new InvalidTokenError('Invalid refresh token');
      }

      // Get user data
      const user = await convexService.getUser(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user.id, user.role);
      const newRefreshToken = this.generateRefreshToken(user.id);

      // Update refresh token in database
      await convexService.updateRefreshToken(userId, refreshToken, newRefreshToken);

      logger.info('Token refreshed successfully', { userId });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
      };

    } catch (error: any) {
      logger.error('Token refresh failed', error);
      throw error;
    }
  }

  // Password reset request
  async requestPasswordReset(email: string): Promise<void> {
    logger.info('Password reset requested', { email });

    try {
      const user = await convexService.getUserByEmail(email);

      if (!user) {
        // Don't reveal that email doesn't exist, but don't actually send email
        logger.info('Password reset requested for non-existent email', { email });
        return;
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetTokenExpiry = Date.now() + this.resetTokenExpiry;

      // Store reset token
      await convexService.storePasswordResetToken(user.id, resetToken, resetTokenExpiry);

      // Send reset email
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);

      logger.info('Password reset email sent', { userId: user.id, email });

    } catch (error: any) {
      logger.error('Password reset request failed', error, { email });
      throw error;
    }
  }

  // Password reset completion
  async resetPassword(token: string, newPassword: string): Promise<void> {
    logger.info('Password reset completion attempt');

    try {
      // Validate reset token
      const resetData = await convexService.getPasswordResetToken(token);

      if (!resetData || resetData.expiresAt < Date.now()) {
        throw new InvalidTokenError('Invalid or expired reset token');
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update password and invalidate reset token
      await Promise.all([
        convexService.updateUserPassword(resetData.userId, passwordHash),
        convexService.invalidatePasswordResetToken(resetData.userId),
        convexService.invalidateAllRefreshTokens(resetData.userId), // Force re-login
      ]);

      // Send confirmation email
      const user = await convexService.getUser(resetData.userId);
      if (user) {
        await emailService.sendPasswordChangedEmail(user.email, user.name);
      }

      logger.info('Password reset completed successfully', { userId: resetData.userId });

    } catch (error: any) {
      logger.error('Password reset failed', error);
      throw error;
    }
  }

  // Change password (authenticated user)
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    logger.info('Password change attempt', { userId });

    try {
      // Get user data
      const user = await convexService.getUser(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update password
      await convexService.updateUserPassword(userId, passwordHash);

      // Send confirmation email
      await emailService.sendPasswordChangedEmail(user.email, user.name);

      logger.info('Password changed successfully', { userId });

    } catch (error: any) {
      logger.error('Password change failed', error, { userId });
      throw error;
    }
  }

  // Logout (invalidate refresh token)
  async logout(userId: string, refreshToken?: string): Promise<void> {
    logger.info('User logout', { userId });

    try {
      if (refreshToken) {
        await convexService.invalidateRefreshToken(userId, refreshToken);
      } else {
        await convexService.invalidateAllRefreshTokens(userId);
      }

      logger.info('User logged out successfully', { userId });

    } catch (error: any) {
      logger.error('Logout failed', error, { userId });
      throw error;
    }
  }

  // Helper methods
  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await convexService.getUser(userId);
    if (!user) return;

    const loginAttempts = (user.loginAttempts || 0) + 1;

    if (loginAttempts >= this.maxLoginAttempts) {
      // Lock account
      await convexService.updateUser(userId, {
        loginAttempts,
        lockedUntil: Date.now() + this.lockoutDuration,
      });

      logger.warn('Account locked due to failed login attempts', { userId, attempts: loginAttempts });
    } else {
      // Increment login attempts
      await convexService.updateUser(userId, { loginAttempts });
    }
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await convexService.updateUser(userId, {
      loginAttempts: 0,
      lockedUntil: null,
    });
  }

  private async simulatePasswordCheck(): Promise<void> {
    // Simulate password checking time to prevent timing attacks
    await bcrypt.hash('dummy-password', this.saltRounds);
  }

  // Token validation for middleware
  async validateToken(token: string): Promise<{ userId: string; role: string }> {
    return this.verifyAccessToken(token);
  }
}

export const authService = new AuthService();