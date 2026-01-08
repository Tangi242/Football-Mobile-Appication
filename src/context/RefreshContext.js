import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refreshKeys, setRefreshKeys] = useState({
    news: 0,
    teams: 0,
    coaches: 0,
    users: 0,
    leagues: 0,
    stadiums: 0,
    products: 0,
    matches: 0,
    standings: 0,
    all: 0
  });

  // Trigger refresh for specific data type
  const triggerRefresh = useCallback((dataType) => {
    setRefreshKeys((prev) => ({
      ...prev,
      [dataType]: (prev[dataType] || 0) + 1,
      all: prev.all + 1 // Also increment global refresh key
    }));
  }, []);

  // Trigger refresh for all data
  const triggerGlobalRefresh = useCallback(() => {
    setRefreshKeys((prev) => ({
      news: prev.news + 1,
      teams: prev.teams + 1,
      coaches: prev.coaches + 1,
      users: prev.users + 1,
      leagues: prev.leagues + 1,
      stadiums: prev.stadiums + 1,
      products: prev.products + 1,
      matches: prev.matches + 1,
      standings: prev.standings + 1,
      all: prev.all + 1
    }));
  }, []);

  const value = {
    refreshKeys,
    triggerRefresh,
    triggerGlobalRefresh
  };

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
};

