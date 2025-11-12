import { create } from 'zustand';

const useQuotesStore = create((set) => ({
  quotes: [],
  favorites: [],

  addQuote: (quote) => set((state) => ({
    quotes: [...state.quotes, quote]
  })),

  toggleFavorite: (quoteId) => set((state) => ({
    favorites: state.favorites.includes(quoteId)
      ? state.favorites.filter(id => id !== quoteId)
      : [...state.favorites, quoteId]
  })),

  setQuotes: (quotes) => set({ quotes }),
}));

export default useQuotesStore;
