import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const FAVORITES_STORAGE_KEY = '@quoterback_favorites';

const useFavoritesStore = create((set, get) => ({
  favorites: [],
  isLoaded: false,

  // Initialize and load favorites from AsyncStorage
  initializeFavorites: async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        // Validate that parsedFavorites is an array
        if (Array.isArray(parsedFavorites)) {
          set({ favorites: parsedFavorites, isLoaded: true });
        } else {
          console.error('Favorites data is not an array, using empty array');
          set({ favorites: [], isLoaded: true });
        }
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Error loading favorites from AsyncStorage:', error);
      set({ isLoaded: true });
      // Show user-friendly error message
      Alert.alert(
        'Favorites Load Error',
        'Unable to load your favorite quotes. Your favorites list will be empty.',
        [{ text: 'OK' }]
      );
    }
  },

  // Save favorites to AsyncStorage
  saveFavorites: async (favorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error saving favorites to AsyncStorage:', error);
      // Show user-friendly error message
      Alert.alert(
        'Favorites Save Error',
        'Unable to save your favorites. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  },

  // Add a quote to favorites
  addFavorite: (quoteId) => {
    const { favorites, saveFavorites } = get();

    // Check if already in favorites
    if (favorites.includes(quoteId)) {
      return;
    }

    const updatedFavorites = [...favorites, quoteId];
    set({ favorites: updatedFavorites });
    saveFavorites(updatedFavorites);
  },

  // Remove a quote from favorites
  removeFavorite: (quoteId) => {
    const { favorites, saveFavorites } = get();

    const updatedFavorites = favorites.filter((id) => id !== quoteId);
    set({ favorites: updatedFavorites });
    saveFavorites(updatedFavorites);
  },

  // Check if a quote is in favorites
  isFavorite: (quoteId) => {
    const { favorites } = get();
    return favorites.includes(quoteId);
  },

  // Get all favorite quote IDs
  getAllFavorites: () => {
    const { favorites } = get();
    return favorites;
  },
}));

// Initialize favorites on store creation
useFavoritesStore.getState().initializeFavorites();

export default useFavoritesStore;
