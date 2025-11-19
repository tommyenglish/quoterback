import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@quoterback_settings';

// Default settings
const DEFAULT_SETTINGS = {
  notificationTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // 9:00 AM
  notificationCadence: 'daily', // 'daily', 'everyOtherDay', 'weekly'
  themeBackgrounds: ['nature', 'space'], // Array of selected themes
  notificationAuthors: [], // Array of preferred authors for notifications (empty = all)
  notificationTopics: [], // Array of preferred topics for notifications (empty = all)
  notificationMoods: [], // Array of preferred moods for notifications (empty = all)
};

const useSettingsStore = create((set, get) => ({
  // Settings state
  notificationTime: DEFAULT_SETTINGS.notificationTime,
  notificationCadence: DEFAULT_SETTINGS.notificationCadence,
  themeBackgrounds: DEFAULT_SETTINGS.themeBackgrounds,
  notificationAuthors: DEFAULT_SETTINGS.notificationAuthors,
  notificationTopics: DEFAULT_SETTINGS.notificationTopics,
  notificationMoods: DEFAULT_SETTINGS.notificationMoods,
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

        // Ensure notification filter arrays exist (default to empty arrays)
        if (!parsedSettings.notificationAuthors) {
          parsedSettings.notificationAuthors = DEFAULT_SETTINGS.notificationAuthors;
        }
        if (!parsedSettings.notificationTopics) {
          parsedSettings.notificationTopics = DEFAULT_SETTINGS.notificationTopics;
        }
        if (!parsedSettings.notificationMoods) {
          parsedSettings.notificationMoods = DEFAULT_SETTINGS.notificationMoods;
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
      notificationAuthors: currentSettings.notificationAuthors,
      notificationTopics: currentSettings.notificationTopics,
      notificationMoods: currentSettings.notificationMoods,
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
      notificationAuthors: currentSettings.notificationAuthors,
      notificationTopics: currentSettings.notificationTopics,
      notificationMoods: currentSettings.notificationMoods,
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
      notificationAuthors: currentSettings.notificationAuthors,
      notificationTopics: currentSettings.notificationTopics,
      notificationMoods: currentSettings.notificationMoods,
    };

    set({ themeBackgrounds: updatedThemes });
    saveSettings(updatedSettings);
  },

  // Check if a theme is selected
  isThemeSelected: (theme) => {
    const { themeBackgrounds } = get();
    return themeBackgrounds.includes(theme);
  },

  // Toggle notification author filter
  toggleNotificationAuthor: (author) => {
    const { saveSettings, notificationAuthors } = get();
    const currentSettings = get();

    let updatedAuthors;
    if (notificationAuthors.includes(author)) {
      updatedAuthors = notificationAuthors.filter((a) => a !== author);
    } else {
      updatedAuthors = [...notificationAuthors, author];
    }

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: currentSettings.notificationCadence,
      themeBackgrounds: currentSettings.themeBackgrounds,
      notificationAuthors: updatedAuthors,
      notificationTopics: currentSettings.notificationTopics,
      notificationMoods: currentSettings.notificationMoods,
    };

    set({ notificationAuthors: updatedAuthors });
    saveSettings(updatedSettings);
  },

  // Toggle notification topic filter
  toggleNotificationTopic: (topic) => {
    const { saveSettings, notificationTopics } = get();
    const currentSettings = get();

    let updatedTopics;
    if (notificationTopics.includes(topic)) {
      updatedTopics = notificationTopics.filter((t) => t !== topic);
    } else {
      updatedTopics = [...notificationTopics, topic];
    }

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: currentSettings.notificationCadence,
      themeBackgrounds: currentSettings.themeBackgrounds,
      notificationAuthors: currentSettings.notificationAuthors,
      notificationTopics: updatedTopics,
      notificationMoods: currentSettings.notificationMoods,
    };

    set({ notificationTopics: updatedTopics });
    saveSettings(updatedSettings);
  },

  // Toggle notification mood filter
  toggleNotificationMood: (mood) => {
    const { saveSettings, notificationMoods } = get();
    const currentSettings = get();

    let updatedMoods;
    if (notificationMoods.includes(mood)) {
      updatedMoods = notificationMoods.filter((m) => m !== mood);
    } else {
      updatedMoods = [...notificationMoods, mood];
    }

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: currentSettings.notificationCadence,
      themeBackgrounds: currentSettings.themeBackgrounds,
      notificationAuthors: currentSettings.notificationAuthors,
      notificationTopics: currentSettings.notificationTopics,
      notificationMoods: updatedMoods,
    };

    set({ notificationMoods: updatedMoods });
    saveSettings(updatedSettings);
  },

  // Clear all notification filters
  clearNotificationFilters: () => {
    const { saveSettings } = get();
    const currentSettings = get();

    const updatedSettings = {
      notificationTime: currentSettings.notificationTime,
      notificationCadence: currentSettings.notificationCadence,
      themeBackgrounds: currentSettings.themeBackgrounds,
      notificationAuthors: [],
      notificationTopics: [],
      notificationMoods: [],
    };

    set({
      notificationAuthors: [],
      notificationTopics: [],
      notificationMoods: [],
    });
    saveSettings(updatedSettings);
  },

  // Reset to default settings
  resetSettings: () => {
    const { saveSettings } = get();
    set({
      notificationTime: DEFAULT_SETTINGS.notificationTime,
      notificationCadence: DEFAULT_SETTINGS.notificationCadence,
      themeBackgrounds: DEFAULT_SETTINGS.themeBackgrounds,
      notificationAuthors: DEFAULT_SETTINGS.notificationAuthors,
      notificationTopics: DEFAULT_SETTINGS.notificationTopics,
      notificationMoods: DEFAULT_SETTINGS.notificationMoods,
    });
    saveSettings(DEFAULT_SETTINGS);
  },
}));

// Initialize settings on store creation
useSettingsStore.getState().initializeSettings();

export default useSettingsStore;
