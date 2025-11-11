import type { UserPreferences, RecentSearch, FavoriteService } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'user_preferences',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorite_services',
  THEME: 'theme_preference',
} as const;

export const storage = {
  getPreferences: (): UserPreferences => {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return stored ? JSON.parse(stored) : {
      theme: 'system',
      language: 'tr',
      notifications: true,
      emailUpdates: false,
    };
  },

  setPreferences: (preferences: UserPreferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  },

  getRecentSearches: (): RecentSearch[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return stored ? JSON.parse(stored) : [];
  },

  addRecentSearch: (query: string, location: string) => {
    const searches = storage.getRecentSearches();
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query,
      location,
      timestamp: Date.now(),
    };

    const filtered = searches.filter(s =>
      !(s.query === query && s.location === location)
    );

    const updated = [newSearch, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  },

  clearRecentSearches: () => {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  },

  getFavorites: (): FavoriteService[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return stored ? JSON.parse(stored) : [];
  },

  addFavorite: (service: any) => {
    const favorites = storage.getFavorites();
    const exists = favorites.find(f => f.serviceId === service.id);

    if (!exists) {
      const newFavorite: FavoriteService = {
        serviceId: service.id,
        service,
        addedAt: Date.now(),
      };
      const updated = [newFavorite, ...favorites];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    }
  },

  removeFavorite: (serviceId: number) => {
    const favorites = storage.getFavorites();
    const updated = favorites.filter(f => f.serviceId !== serviceId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  },

  isFavorite: (serviceId: number): boolean => {
    const favorites = storage.getFavorites();
    return favorites.some(f => f.serviceId === serviceId);
  },

  getTheme: (): 'light' | 'dark' | 'system' => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return (stored as 'light' | 'dark' | 'system') || 'system';
  },

  setTheme: (theme: 'light' | 'dark' | 'system') => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
};
