import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@quoterback_settings';

// Default settings
const DEFAULT_SETTINGS = {
  notificationTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // 9:00 AM
  notificationCadence: 'daily', // 'daily', 'everyOtherDay', 'weekly'
  themeBackground: 'nature', // 'nature', 'space', 'architecture', 'abstract', 'solid', 'gradient'
};

const useSettingsStore = create((set, get) => ({
  // Settings state
  notificationTime: DEFAULT_SETTINGS.notificationTime,
  notificationCadence: DEFAULT_SETTINGS.notificationCadence,
  themeBackground: DEFAULT_SETTINGS.themeBackground,
  isLoaded: false,

  // Initialize and load settings from AsyncStorage
  initializeSettings: async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        set({
          ...parsedSettings,
          isLoaded: true
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Error loading settings from AsyncStorage:', error);
      set({ isLoaded: true });
    }
  },

  // Save settings to AsyncStorage
  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to AsyncStorage:', error);
    }
  },

  // Update notification time
  setNotificationTime: (time) => {
    const { saveSettings } = get();
    const currentSettings = get();

    const updatedSettings = {
      notificationTime: time,
      notificationCadence: currentSettings.notificationCadence,
      themeBackground: currentSettings.themeBackground,
    };

    set({ notificationTime: time });
    saveSettings(updatedSettings);
  },

  // Update notification cadence
  setNotificationCadence: (cadence) => {
    const { saveSettings } = get();
    const currentSettings = get();

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: cadence,
      themeBackground: currentSettings.themeBackground,
    };

    set({ notificationCadence: cadence });
    saveSettings(updatedSettings);
  },

  // Update theme background
  setThemeBackground: (theme) => {
    const { saveSettings } = get();
    const currentSettings = get();

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: currentSettings.notificationCadence,
      themeBackground: theme,
    };

    set({ themeBackground: theme });
    saveSettings(updatedSettings);
  },

  // Reset to default settings
  resetSettings: () => {
    const { saveSettings } = get();
    set({
      notificationTime: DEFAULT_SETTINGS.notificationTime,
      notificationCadence: DEFAULT_SETTINGS.notificationCadence,
      themeBackground: DEFAULT_SETTINGS.themeBackground,
    });
    saveSettings(DEFAULT_SETTINGS);
  },
}));

// Initialize settings on store creation
useSettingsStore.getState().initializeSettings();

export default useSettingsStore;
