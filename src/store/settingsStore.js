import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@quoterback_settings';

// Default settings
const DEFAULT_SETTINGS = {
  notificationTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // 9:00 AM
  notificationCadence: 'daily', // 'daily', 'everyOtherDay', 'weekly'
  themeBackgrounds: ['nature', 'space'], // Array of selected themes
};

const useSettingsStore = create((set, get) => ({
  // Settings state
  notificationTime: DEFAULT_SETTINGS.notificationTime,
  notificationCadence: DEFAULT_SETTINGS.notificationCadence,
  themeBackgrounds: DEFAULT_SETTINGS.themeBackgrounds,
  isLoaded: false,

  // Initialize and load settings from AsyncStorage
  initializeSettings: async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);

        // Migrate old single theme to new array format
        if (parsedSettings.themeBackground && !parsedSettings.themeBackgrounds) {
          parsedSettings.themeBackgrounds = [parsedSettings.themeBackground];
          delete parsedSettings.themeBackground;
        }

        // Ensure themeBackgrounds is an array with at least one theme
        if (!parsedSettings.themeBackgrounds || parsedSettings.themeBackgrounds.length === 0) {
          parsedSettings.themeBackgrounds = DEFAULT_SETTINGS.themeBackgrounds;
        }

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
      themeBackgrounds: currentSettings.themeBackgrounds,
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
      themeBackgrounds: currentSettings.themeBackgrounds,
    };

    set({ notificationCadence: cadence });
    saveSettings(updatedSettings);
  },

  // Toggle theme background (add or remove from selected themes)
  toggleThemeBackground: (theme) => {
    const { saveSettings, themeBackgrounds } = get();
    const currentSettings = get();

    let updatedThemes;
    if (themeBackgrounds.includes(theme)) {
      // Don't allow deselecting if it's the only theme
      if (themeBackgrounds.length === 1) {
        return;
      }
      updatedThemes = themeBackgrounds.filter((t) => t !== theme);
    } else {
      updatedThemes = [...themeBackgrounds, theme];
    }

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: currentSettings.notificationCadence,
      themeBackgrounds: updatedThemes,
    };

    set({ themeBackgrounds: updatedThemes });
    saveSettings(updatedSettings);
  },

  // Check if a theme is selected
  isThemeSelected: (theme) => {
    const { themeBackgrounds } = get();
    return themeBackgrounds.includes(theme);
  },

  // Reset to default settings
  resetSettings: () => {
    const { saveSettings } = get();
    set({
      notificationTime: DEFAULT_SETTINGS.notificationTime,
      notificationCadence: DEFAULT_SETTINGS.notificationCadence,
      themeBackgrounds: DEFAULT_SETTINGS.themeBackgrounds,
    });
    saveSettings(DEFAULT_SETTINGS);
  },
}));

// Initialize settings on store creation
useSettingsStore.getState().initializeSettings();

export default useSettingsStore;
