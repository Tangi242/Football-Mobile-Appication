import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecentlyViewedContext = createContext(null);

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const MAX_RECENT_ITEMS = 10;

  // Load recently viewed from storage on mount
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const stored = await AsyncStorage.getItem('recentlyViewed');
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load recently viewed', e);
      }
    };
    loadRecentlyViewed();
  }, []);

  // Save recently viewed to storage whenever it changes
  const saveRecentlyViewed = useCallback(async (items) => {
    try {
      await AsyncStorage.setItem('recentlyViewed', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save recently viewed', e);
    }
  }, []);

  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.id !== product.id);
      // Add to beginning
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered];
      // Keep only MAX_RECENT_ITEMS
      const limited = updated.slice(0, MAX_RECENT_ITEMS);
      saveRecentlyViewed(limited);
      return limited;
    });
  }, [saveRecentlyViewed]);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    saveRecentlyViewed([]);
  }, [saveRecentlyViewed]);

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};










