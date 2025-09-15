import { StateCreator } from 'zustand';
import { AppSettings, SettingsActions } from '../types';
import storageUtils, { STORAGE_KEYS } from '../storage';

export interface SettingsSlice extends SettingsActions {
  settings: AppSettings;
}

// Default settings
const defaultSettings: AppSettings = {
  language: 'es',
  currency: 'USD',
  theme: 'system',
  notifications: {
    push: true,
    email: true,
    sms: false,
    jobMatches: true,
    messages: true,
    proposals: true,
  },
  location: {
    shareLocation: true,
    radius: 10, // kilometers
  },
  privacy: {
    profileVisible: true,
    showPhone: false,
    showEmail: false,
  },
};

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  // Initial state
  settings: defaultSettings,

  // Actions
  updateSettings: async (updates: Partial<AppSettings>) => {
    try {
      console.log('⚙️ Updating settings:', updates);

      const { settings } = get();
      const updatedSettings: AppSettings = {
        ...settings,
        ...updates,
        // Deep merge notifications if provided
        ...(updates.notifications && {
          notifications: {
            ...settings.notifications,
            ...updates.notifications,
          },
        }),
        // Deep merge location if provided
        ...(updates.location && {
          location: {
            ...settings.location,
            ...updates.location,
          },
        }),
        // Deep merge privacy if provided
        ...(updates.privacy && {
          privacy: {
            ...settings.privacy,
            ...updates.privacy,
          },
        }),
      };

      // Save to storage
      await storageUtils.setJSON(STORAGE_KEYS.SETTINGS, updatedSettings);

      set({ settings: updatedSettings });

      console.log('✅ Settings updated successfully');
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      throw error;
    }
  },

  resetSettings: () => {
    console.log('🔄 Resetting settings to default');

    set({ settings: defaultSettings });

    // Save to storage (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.SETTINGS, defaultSettings)
      .catch(console.error);
  },

  setLanguage: (language: AppSettings['language']) => {
    console.log('🌐 Setting language:', language);

    const { settings } = get();
    const updatedSettings = { ...settings, language };

    set({ settings: updatedSettings });

    // Save to storage (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.SETTINGS, updatedSettings)
      .catch(console.error);

    // Also save language separately for quick access
    storageUtils.setJSON(STORAGE_KEYS.LANGUAGE, language)
      .catch(console.error);
  },

  setCurrency: (currency: AppSettings['currency']) => {
    console.log('💰 Setting currency:', currency);

    const { settings } = get();
    const updatedSettings = { ...settings, currency };

    set({ settings: updatedSettings });

    // Save to storage (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.SETTINGS, updatedSettings)
      .catch(console.error);
  },

  setTheme: (theme: AppSettings['theme']) => {
    console.log('🎨 Setting theme:', theme);

    const { settings } = get();
    const updatedSettings = { ...settings, theme };

    set({ settings: updatedSettings });

    // Save to storage (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.SETTINGS, updatedSettings)
      .catch(console.error);

    // Also save theme separately for quick access
    storageUtils.setJSON(STORAGE_KEYS.THEME, theme)
      .catch(console.error);
  },

  toggleNotification: (type: keyof AppSettings['notifications']) => {
    console.log('🔔 Toggling notification setting:', type);

    const { settings } = get();
    const updatedNotifications = {
      ...settings.notifications,
      [type]: !settings.notifications[type],
    };

    const updatedSettings = {
      ...settings,
      notifications: updatedNotifications,
    };

    set({ settings: updatedSettings });

    // Save to storage (fire and forget)
    storageUtils.setJSON(STORAGE_KEYS.SETTINGS, updatedSettings)
      .catch(console.error);
  },
});