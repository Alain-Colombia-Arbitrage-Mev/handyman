import { StateCreator } from 'zustand';
import { AuthState, AuthActions, User } from '../types';
import storageUtils, { STORAGE_KEYS } from '../storage';

export interface AuthSlice extends AuthState, AuthActions {}

export const createAuthSlice: StateCreator<
  AuthSlice,
  [],
  [],
  AuthSlice
> = (set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials: { email: string; password: string }) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      console.log('🔐 Login attempt for:', credentials.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: credentials.email,
        phone: '+57 300 123 4567',
        role: 'client',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        location: {
          lat: 4.6097,
          lng: -74.0817,
          address: 'Bogotá, Colombia'
        },
        isVerified: true,
        rating: 4.8,
        completedJobs: 15,
        createdAt: Date.now() - 86400000 * 30, // 30 days ago
        updatedAt: Date.now(),
      };

      const mockToken = 'mock-jwt-token-123';
      const mockRefreshToken = 'mock-refresh-token-456';

      // Store in secure storage
      await Promise.all([
        storageUtils.setJSON(STORAGE_KEYS.USER_DATA, mockUser),
        storageUtils.setJSON(STORAGE_KEYS.AUTH_TOKEN, mockToken),
        storageUtils.setJSON(STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken),
      ]);

      set({
        isAuthenticated: true,
        user: mockUser,
        token: mockToken,
        refreshToken: mockRefreshToken,
        isLoading: false,
        error: null,
      });

      console.log('✅ Login successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      // Clear secure storage
      await Promise.all([
        storageUtils.remove(STORAGE_KEYS.USER_DATA),
        storageUtils.remove(STORAGE_KEYS.AUTH_TOKEN),
        storageUtils.remove(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      // TODO: Invalidate token on server
      console.log('🔓 Logout successful');

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('❌ Logout failed:', error);
      throw error;
    }
  },

  register: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Registration attempt for:', userData.email);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completedJobs: 0,
        rating: 0,
      };

      const mockToken = 'mock-jwt-token-new-user';
      const mockRefreshToken = 'mock-refresh-token-new-user';

      // Store in secure storage
      await Promise.all([
        storageUtils.setJSON(STORAGE_KEYS.USER_DATA, newUser),
        storageUtils.setJSON(STORAGE_KEYS.AUTH_TOKEN, mockToken),
        storageUtils.setJSON(STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken),
      ]);

      set({
        isAuthenticated: true,
        user: newUser,
        token: mockToken,
        refreshToken: mockRefreshToken,
        isLoading: false,
        error: null,
      });

      console.log('✅ Registration successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) {
      throw new Error('No user logged in');
    }

    set({ isLoading: true, error: null });

    try {
      console.log('👤 Updating profile:', updates);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedUser: User = {
        ...user,
        ...updates,
        updatedAt: Date.now(),
      };

      // Store in secure storage
      await storageUtils.setJSON(STORAGE_KEYS.USER_DATA, updatedUser);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });

      console.log('✅ Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  },

  refreshAuth: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    set({ isLoading: true, error: null });

    try {
      console.log('🔄 Refreshing authentication');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newToken = 'mock-refreshed-jwt-token';

      // Store new token
      await storageUtils.setJSON(STORAGE_KEYS.AUTH_TOKEN, newToken);

      set({
        token: newToken,
        isLoading: false,
        error: null,
      });

      console.log('✅ Auth refreshed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auth refresh failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('❌ Auth refresh failed:', error);

      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  setToken: (token: string, refreshToken?: string) => {
    set({
      token,
      ...(refreshToken && { refreshToken }),
      isAuthenticated: true
    });
  },

  clearAuth: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      error: null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
});