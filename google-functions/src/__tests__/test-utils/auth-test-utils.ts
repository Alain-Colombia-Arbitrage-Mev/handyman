/**
 * Authentication Testing Utilities
 * Comprehensive helpers for testing authentication flows
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

import { User, RegisterRequest, LoginRequest, AuthResponse } from '@/types';
import { config } from '@/utils/config';

// Mock data generators
export class AuthTestDataGenerator {
  static generateUser(overrides: Partial<User> = {}): User {
    return {
      id: faker.database.mongodbObjectId(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement(['handyman', 'client', 'business']),
      phone: faker.phone.number(),
      location: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        address: faker.location.streetAddress(),
      },
      skills: faker.helpers.arrayElements(['plumbing', 'electrical', 'carpentry'], 2),
      categories: faker.helpers.arrayElements(['home_repair', 'maintenance'], 1),
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      isVerified: faker.datatype.boolean(),
      createdAt: faker.date.past().getTime(),
      updatedAt: Date.now(),
      ...overrides,
    };
  }

  static generateRegisterRequest(overrides: Partial<RegisterRequest> = {}): RegisterRequest {
    return {
      email: faker.internet.email(),
      password: 'SecurePassword123!',
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement(['handyman', 'client', 'business']),
      phone: faker.phone.number(),
      location: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        address: faker.location.streetAddress(),
      },
      categories: faker.helpers.arrayElements(['home_repair', 'maintenance'], 1),
      ...overrides,
    };
  }

  static generateLoginRequest(overrides: Partial<LoginRequest> = {}): LoginRequest {
    return {
      email: faker.internet.email(),
      password: 'SecurePassword123!',
      deviceInfo: {
        deviceId: faker.string.uuid(),
        platform: faker.helpers.arrayElement(['ios', 'android', 'web']),
        version: faker.system.semver(),
      },
      ...overrides,
    };
  }

  static generateAuthResponse(user?: User): AuthResponse {
    const testUser = user || this.generateUser();
    return {
      user: testUser,
      tokens: {
        accessToken: this.generateValidJWT(testUser.id, testUser.role),
        refreshToken: this.generateValidRefreshToken(testUser.id),
        expiresIn: 3600,
      },
    };
  }

  static generateValidJWT(userId: string, role: string): string {
    return jwt.sign(
      {
        userId,
        role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }

  static generateExpiredJWT(userId: string, role: string): string {
    return jwt.sign(
      {
        userId,
        role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }

  static generateValidRefreshToken(userId: string): string {
    return jwt.sign(
      {
        userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.refreshSecret,
      { expiresIn: '30d' }
    );
  }

  static generateInvalidJWT(): string {
    return jwt.sign(
      {
        userId: faker.database.mongodbObjectId(),
        role: 'user',
        type: 'access',
      },
      'invalid-secret'
    );
  }

  static async generateHashedPassword(password: string = 'SecurePassword123!'): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

// Mock implementations
export class AuthServiceMock {
  private users: Map<string, any> = new Map();
  private refreshTokens: Map<string, string> = new Map();

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === registerData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = AuthTestDataGenerator.generateUser({
      email: registerData.email,
      name: registerData.name,
      role: registerData.role,
      phone: registerData.phone,
      location: registerData.location,
      categories: registerData.categories,
    });

    this.users.set(user.id, {
      ...user,
      passwordHash: await AuthTestDataGenerator.generateHashedPassword(registerData.password),
    });

    return AuthTestDataGenerator.generateAuthResponse(user);
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const user = Array.from(this.users.values()).find(u => u.email === loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return AuthTestDataGenerator.generateAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      const user = this.users.get(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        accessToken: AuthTestDataGenerator.generateValidJWT(user.id, user.role),
        refreshToken: AuthTestDataGenerator.generateValidRefreshToken(user.id),
        expiresIn: 3600,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async validateToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Test helpers
  addUser(user: User, password: string = 'SecurePassword123!'): void {
    this.users.set(user.id, {
      ...user,
      passwordHash: bcrypt.hashSync(password, 12),
    });
  }

  getUser(userId: string): any {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): any {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  clear(): void {
    this.users.clear();
    this.refreshTokens.clear();
  }
}

// Test assertion helpers
export class AuthTestAssertions {
  static assertValidAuthResponse(response: AuthResponse): void {
    expect(response).toHaveProperty('user');
    expect(response).toHaveProperty('tokens');

    expect(response.user).toHaveProperty('id');
    expect(response.user).toHaveProperty('email');
    expect(response.user).toHaveProperty('name');
    expect(response.user).toHaveProperty('role');

    expect(response.tokens).toHaveProperty('accessToken');
    expect(response.tokens).toHaveProperty('refreshToken');
    expect(response.tokens).toHaveProperty('expiresIn');

    // Validate JWT structure
    expect(response.tokens.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(response.tokens.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(response.tokens.expiresIn).toBeGreaterThan(0);
  }

  static assertValidUser(user: User): void {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('isVerified');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');

    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(['handyman', 'client', 'business', 'admin']).toContain(user.role);
    expect(typeof user.isVerified).toBe('boolean');
  }

  static assertTokensValid(accessToken: string, refreshToken: string): void {
    // Verify tokens can be decoded
    expect(() => jwt.decode(accessToken)).not.toThrow();
    expect(() => jwt.decode(refreshToken)).not.toThrow();

    // Verify token structure
    const accessPayload = jwt.decode(accessToken) as any;
    const refreshPayload = jwt.decode(refreshToken) as any;

    expect(accessPayload).toHaveProperty('userId');
    expect(accessPayload).toHaveProperty('role');
    expect(accessPayload.type).toBe('access');

    expect(refreshPayload).toHaveProperty('userId');
    expect(refreshPayload.type).toBe('refresh');

    // Verify same user
    expect(accessPayload.userId).toBe(refreshPayload.userId);
  }
}

// Express request/response mocks for middleware testing
export class ExpressTestUtils {
  static mockRequest(overrides: any = {}): any {
    return {
      headers: {},
      body: {},
      params: {},
      query: {},
      method: 'GET',
      path: '/',
      ip: '127.0.0.1',
      ...overrides,
    };
  }

  static mockResponse(): any {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      removeHeader: jest.fn().mockReturnThis(),
    };

    return res;
  }

  static mockNext(): any {
    return jest.fn();
  }

  static mockAuthenticatedRequest(user: User, overrides: any = {}): any {
    return this.mockRequest({
      user,
      headers: {
        authorization: `Bearer ${AuthTestDataGenerator.generateValidJWT(user.id, user.role)}`,
      },
      ...overrides,
    });
  }
}

// Security context for testing
export class SecurityTestUtils {
  static generateSecurityContext(overrides: any = {}): any {
    return {
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      deviceFingerprint: faker.string.uuid(),
      correlationId: faker.string.uuid(),
      ...overrides,
    };
  }

  static generateSuspiciousSecurityContext(): any {
    return {
      ipAddress: '192.168.1.1', // Known suspicious IP
      userAgent: 'curl/7.68.0', // Automated tool
      deviceFingerprint: 'suspicious-device',
      correlationId: faker.string.uuid(),
    };
  }
}