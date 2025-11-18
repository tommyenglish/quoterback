import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUOTE_USAGE_STORAGE_KEY = '@quoterback_quote_usage';

/**
 * Quote Usage Store
 * Tracks how many times each quote has been used in notifications
 * to ensure variety and limit repetition
 */
const useQuoteUsageStore = create((set, get) => ({
  // State: Map of quoteId -> usage count
  usageMap: {},
  isLoaded: false,

  // Initialize and load usage data from AsyncStorage
  initializeUsage: async () => {
    try {
      const storedUsage = await AsyncStorage.getItem(QUOTE_USAGE_STORAGE_KEY);
      if (storedUsage) {
        const parsedUsage = JSON.parse(storedUsage);
        set({
          usageMap: parsedUsage,
          isLoaded: true
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Error loading quote usage from AsyncStorage:', error);
      set({ isLoaded: true });
    }
  },

  // Save usage data to AsyncStorage
  saveUsage: async (usageMap) => {
    try {
      await AsyncStorage.setItem(QUOTE_USAGE_STORAGE_KEY, JSON.stringify(usageMap));
    } catch (error) {
      console.error('Error saving quote usage to AsyncStorage:', error);
    }
  },

  // Increment usage count for a specific quote
  incrementUsage: (quoteId) => {
    const { usageMap, saveUsage } = get();
    const newUsageMap = {
      ...usageMap,
      [quoteId]: (usageMap[quoteId] || 0) + 1
    };

    set({ usageMap: newUsageMap });
    saveUsage(newUsageMap);
  },

  // Get usage count for a specific quote
  getUsageCount: (quoteId) => {
    const { usageMap } = get();
    return usageMap[quoteId] || 0;
  },

  // Get all usage counts
  getAllUsage: () => {
    const { usageMap } = get();
    return usageMap;
  },

  // Reset all usage counts (useful for testing or user preference)
  resetUsage: () => {
    const { saveUsage } = get();
    set({ usageMap: {} });
    saveUsage({});
  },

  // Get the least used quotes from a set
  getLeastUsedQuotes: (quotes, limit = 5) => {
    const { usageMap } = get();

    // Sort quotes by usage count (ascending)
    const sortedQuotes = [...quotes].sort((a, b) => {
      const usageA = usageMap[a.id] || 0;
      const usageB = usageMap[b.id] || 0;
      return usageA - usageB;
    });

    // Return the least used quotes up to limit
    return sortedQuotes.slice(0, limit);
  },
}));

// Initialize usage data on store creation
useQuoteUsageStore.getState().initializeUsage();

export default useQuoteUsageStore;
