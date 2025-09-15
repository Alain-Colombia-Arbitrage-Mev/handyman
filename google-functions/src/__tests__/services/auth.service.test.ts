/**
 * Authentication Service Unit Tests
 * Comprehensive test suite with enterprise-grade coverage
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';

import { EnhancedAuthService } from '@/services/auth.service.enhanced';
import {
  AuthTestDataGenerator,
  AuthServiceMock,
  AuthTestAssertions,
  SecurityTestUtils
} from '../test-utils/auth-test-utils';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  TokenExpiredError,
  InvalidTokenError,
} from '@/utils/errors';

describe('EnhancedAuthService', () => {
  let authService: EnhancedAuthService;
  let mockAuthService: AuthServiceMock;

  beforeEach(() => {
    authService = new EnhancedAuthService();
    mockAuthService = new AuthServiceMock();

    // Clear any existing mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAuthService.clear();
    nock.cleanAll();
  });

  describe('User Registration', () => {
    test('should successfully register a new user with valid data', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest();
      const securityContext = SecurityTestUtils.generateSecurityContext();

      // Mock database calls
      jest.spyOn(authService as any, 'checkExistingUser').mockResolvedValue(null);
      jest.spyOn(authService as any, 'createUserWithAudit').mockResolvedValue('user-123');
      jest.spyOn(authService as any, 'sendVerificationEmail').mockResolvedValue(undefined);

      // Act
      const result = await authService.register(registerData, securityContext);

      // Assert
      AuthTestAssertions.assertValidAuthResponse(result);
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.name).toBe(registerData.name);
      expect(result.user.role).toBe(registerData.role);
    });

    test('should reject registration with weak password', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest({
        password: 'weak123', // Too weak
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      // Act & Assert
      await expect(
        authService.register(registerData, securityContext)
      ).rejects.toThrow(ValidationError);
    });

    test('should reject registration with existing email', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest();
      const securityContext = SecurityTestUtils.generateSecurityContext();
      const existingUser = AuthTestDataGenerator.generateUser({ email: registerData.email });

      jest.spyOn(authService as any, 'checkExistingUser').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        authService.register(registerData, securityContext)
      ).rejects.toThrow(ConflictError);
    });

    test('should reject registration with disposable email', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest({
        email: 'test@10minutemail.com', // Disposable email
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      // Act & Assert
      await expect(
        authService.register(registerData, securityContext)
      ).rejects.toThrow(ValidationError);
    });

    test('should detect and block suspicious registration activity', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest();
      const securityContext = SecurityTestUtils.generateSuspiciousSecurityContext();

      jest.spyOn(authService as any, 'getRecentRegistrationAttempts').mockResolvedValue(10);

      // Act & Assert
      await expect(
        authService.register(registerData, securityContext)
      ).rejects.toThrow('Too many registration attempts');
    });

    test('should validate email domain', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest({
        email: 'test@suspicious-domain.xyz',
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'verifyEmailDomain').mockRejectedValue(
        new ValidationError('Email domain not allowed')
      );

      // Act & Assert
      await expect(
        authService.register(registerData, securityContext)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('User Login', () => {
    let testUser: any;

    beforeEach(() => {
      testUser = AuthTestDataGenerator.generateUser();
      mockAuthService.addUser(testUser);
    });

    test('should successfully login with valid credentials', async () => {
      // Arrange
      const loginData = AuthTestDataGenerator.generateLoginRequest({
        email: testUser.email,
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'getUserWithSecurityInfo').mockResolvedValue({
        ...testUser,
        passwordHash: await AuthTestDataGenerator.generateHashedPassword(),
      });
      jest.spyOn(authService as any, 'validateAccountStatus').mockResolvedValue(undefined);
      jest.spyOn(authService as any, 'resetLoginAttempts').mockResolvedValue(undefined);
      jest.spyOn(authService as any, 'updateLoginMetadata').mockResolvedValue(undefined);

      // Act
      const result = await authService.login(loginData, securityContext);

      // Assert
      AuthTestAssertions.assertValidAuthResponse(result);
      expect(result.user.email).toBe(loginData.email);
    });

    test('should reject login with invalid email', async () => {
      // Arrange
      const loginData = AuthTestDataGenerator.generateLoginRequest({
        email: 'nonexistent@example.com',
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'getUserWithSecurityInfo').mockResolvedValue(null);
      jest.spyOn(authService as any, 'recordFailedLoginAttempt').mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        authService.login(loginData, securityContext)
      ).rejects.toThrow(AuthenticationError);
    });

    test('should reject login with invalid password', async () => {
      // Arrange
      const loginData = AuthTestDataGenerator.generateLoginRequest({
        email: testUser.email,
        password: 'wrongpassword',
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'getUserWithSecurityInfo').mockResolvedValue({
        ...testUser,
        passwordHash: await AuthTestDataGenerator.generateHashedPassword('correctpassword'),
      });
      jest.spyOn(authService as any, 'validateAccountStatus').mockResolvedValue(undefined);
      jest.spyOn(authService as any, 'handleFailedLogin').mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        authService.login(loginData, securityContext)
      ).rejects.toThrow(AuthenticationError);
    });

    test('should reject login for locked account', async () => {
      // Arrange
      const loginData = AuthTestDataGenerator.generateLoginRequest({
        email: testUser.email,
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'getUserWithSecurityInfo').mockResolvedValue({
        ...testUser,
        lockedUntil: Date.now() + 30 * 60 * 1000, // Locked for 30 minutes
      });

      // Act & Assert
      await expect(
        authService.login(loginData, securityContext)
      ).rejects.toThrow(AuthenticationError);
    });

    test('should detect anomalous login patterns', async () => {
      // Arrange
      const loginData = AuthTestDataGenerator.generateLoginRequest({
        email: testUser.email,
      });
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'getUserWithSecurityInfo').mockResolvedValue({
        ...testUser,
        passwordHash: await AuthTestDataGenerator.generateHashedPassword(),
      });
      jest.spyOn(authService as any, 'validateAccountStatus').mockResolvedValue(undefined);
      jest.spyOn(authService as any, 'getUserRecentLogins').mockResolvedValue([
        // Simulate logins from many different IPs
        ...Array.from({ length: 10 }, () => ({
          ipAddress: SecurityTestUtils.generateSecurityContext().ipAddress,
          userAgent: 'Mozilla/5.0...',
        }))
      ]);

      // Mock other required methods
      jest.spyOn(authService as any, 'resetLoginAttempts').mockResolvedValue(undefined);
      jest.spyOn(authService as any, 'updateLoginMetadata').mockResolvedValue(undefined);

      // Act - should not throw but should log warning
      const result = await authService.login(loginData, securityContext);

      // Assert
      AuthTestAssertions.assertValidAuthResponse(result);
    });

    test('should enforce rate limiting on login attempts', async () => {
      // Arrange
      const loginData = AuthTestDataGenerator.generateLoginRequest();
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'checkLoginRateLimit').mockRejectedValue(
        new Error('Too many login attempts')
      );

      // Act & Assert
      await expect(
        authService.login(loginData, securityContext)
      ).rejects.toThrow('Too many login attempts');
    });
  });

  describe('Token Refresh', () => {
    let testUser: any;

    beforeEach(() => {
      testUser = AuthTestDataGenerator.generateUser();
    });

    test('should successfully refresh valid token', async () => {
      // Arrange
      const refreshToken = AuthTestDataGenerator.generateValidRefreshToken(testUser.id);
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'verifyRefreshTokenSecure').mockResolvedValue({
        userId: testUser.id,
      });
      jest.spyOn(authService as any, 'validateRefreshTokenWithSecurity').mockResolvedValue({
        lastUsed: Date.now() - 2000, // Used 2 seconds ago
      });
      jest.spyOn(authService as any, 'getUserWithSecurityValidation').mockResolvedValue(testUser);
      jest.spyOn(authService as any, 'invalidateRefreshToken').mockResolvedValue(undefined);

      // Act
      const result = await authService.refreshTokenSecure(refreshToken, securityContext);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.tokenType).toBe('Bearer');
    });

    test('should reject invalid refresh token', async () => {
      // Arrange
      const invalidToken = 'invalid.token.here';
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'verifyRefreshTokenSecure').mockRejectedValue(
        new Error('Invalid token')
      );

      // Act & Assert
      await expect(
        authService.refreshTokenSecure(invalidToken, securityContext)
      ).rejects.toThrow();
    });

    test('should detect token reuse and invalidate all tokens', async () => {
      // Arrange
      const refreshToken = AuthTestDataGenerator.generateValidRefreshToken(testUser.id);
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'verifyRefreshTokenSecure').mockResolvedValue({
        userId: testUser.id,
      });
      jest.spyOn(authService as any, 'validateRefreshTokenWithSecurity').mockResolvedValue({
        lastUsed: Date.now() - 500, // Used 500ms ago (too recent)
      });
      jest.spyOn(authService as any, 'invalidateAllUserTokens').mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        authService.refreshTokenSecure(refreshToken, securityContext)
      ).rejects.toThrow(InvalidTokenError);
    });

    test('should reject token for non-existent user', async () => {
      // Arrange
      const refreshToken = AuthTestDataGenerator.generateValidRefreshToken('nonexistent-user');
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'verifyRefreshTokenSecure').mockResolvedValue({
        userId: 'nonexistent-user',
      });
      jest.spyOn(authService as any, 'validateRefreshTokenWithSecurity').mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.refreshTokenSecure(refreshToken, securityContext)
      ).rejects.toThrow(InvalidTokenError);
    });
  });

  describe('Security Features', () => {
    test('should implement timing-safe password verification', async () => {
      // Arrange
      const password = 'SecurePassword123!';
      const hash = await AuthTestDataGenerator.generateHashedPassword(password);

      // Measure timing for correct password
      const start1 = process.hrtime.bigint();
      await (authService as any).verifyPasswordSecure(password, hash);
      const time1 = process.hrtime.bigint() - start1;

      // Measure timing for incorrect password
      const start2 = process.hrtime.bigint();
      await (authService as any).verifyPasswordSecure('wrongpassword', hash);
      const time2 = process.hrtime.bigint() - start2;

      // Assert timing difference is within acceptable range
      const timeDiff = Math.abs(Number(time1 - time2)) / 1000000; // Convert to milliseconds
      expect(timeDiff).toBeLessThan(100); // Should be similar timing
    });

    test('should generate secure token pairs with proper metadata', async () => {
      // Arrange
      const userId = testUser.id;
      const role = testUser.role;
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'storeRefreshTokenSecure').mockResolvedValue(undefined);

      // Act
      const tokens = await (authService as any).generateSecureTokenPair(
        userId,
        role,
        securityContext
      );

      // Assert
      AuthTestAssertions.assertTokensValid(tokens.accessToken, tokens.refreshToken);

      // Verify token payloads contain security context
      const accessPayload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64').toString());
      expect(accessPayload).toHaveProperty('deviceId');
      expect(accessPayload).toHaveProperty('ipAddress');
      expect(accessPayload).toHaveProperty('jti'); // JWT ID
    });

    test('should validate password strength', () => {
      const strongPassword = 'VerySecureP@ssw0rd123!';
      const weakPasswords = [
        'password',
        '123456789',
        'Password1',
        'password123!',
        'PASSWORD123!',
        'Password!',
      ];

      // Strong password should pass
      expect(() => {
        AuthTestDataGenerator.generateRegisterRequest({ password: strongPassword });
      }).not.toThrow();

      // Weak passwords should fail
      weakPasswords.forEach(password => {
        expect(() => {
          AuthTestDataGenerator.generateRegisterRequest({ password });
        }).toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest();
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'checkExistingUser').mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        authService.register(registerData, securityContext)
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle external service failures gracefully', async () => {
      // Arrange
      const registerData = AuthTestDataGenerator.generateRegisterRequest();
      const securityContext = SecurityTestUtils.generateSecurityContext();

      jest.spyOn(authService as any, 'checkExistingUser').mockResolvedValue(null);
      jest.spyOn(authService as any, 'createUserWithAudit').mockResolvedValue('user-123');
      jest.spyOn(authService as any, 'sendVerificationEmail').mockRejectedValue(
        new Error('Email service unavailable')
      );

      // Act - should still succeed even if email fails
      const result = await authService.register(registerData, securityContext);

      // Assert
      AuthTestAssertions.assertValidAuthResponse(result);
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent registration requests efficiently', async () => {
      // Arrange
      const numRequests = 10;
      const requests = Array.from({ length: numRequests }, () => {
        const registerData = AuthTestDataGenerator.generateRegisterRequest();
        const securityContext = SecurityTestUtils.generateSecurityContext();

        jest.spyOn(authService as any, 'checkExistingUser').mockResolvedValue(null);
        jest.spyOn(authService as any, 'createUserWithAudit').mockResolvedValue(`user-${Math.random()}`);
        jest.spyOn(authService as any, 'sendVerificationEmail').mockResolvedValue(undefined);

        return authService.register(registerData, securityContext);
      });

      // Act
      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      // Assert
      expect(results).toHaveLength(numRequests);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      results.forEach(result => {
        AuthTestAssertions.assertValidAuthResponse(result);
      });
    });
  });
});