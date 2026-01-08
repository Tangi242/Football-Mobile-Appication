import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [savedFixtures, setSavedFixtures] = useState([]);
  const [savedContent, setSavedContent] = useState([]);

  const login = useCallback((userData) => {
    setUser(userData);
    // In real app, save to AsyncStorage
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFavoriteTeams([]);
    setSavedFixtures([]);
    setSavedContent([]);
  }, []);

  const toggleFavoriteTeam = useCallback((teamName) => {
    setFavoriteTeams((prev) => {
      if (prev.includes(teamName)) {
        return prev.filter((t) => t !== teamName);
      }
      return [...prev, teamName];
    });
  }, []);

  const isFavoriteTeam = useCallback((teamName) => {
    return favoriteTeams.includes(teamName);
  }, [favoriteTeams]);

  const saveFixture = useCallback((fixture) => {
    setSavedFixtures((prev) => {
      const exists = prev.find((f) => f.id === fixture.id);
      if (exists) {
        return prev.filter((f) => f.id !== fixture.id);
      }
      return [...prev, fixture];
    });
  }, []);

  const isFixtureSaved = useCallback((fixtureId) => {
    return savedFixtures.some((f) => f.id === fixtureId);
  }, [savedFixtures]);

  const saveContent = useCallback((content) => {
    setSavedContent((prev) => {
      const exists = prev.find((c) => c.id === content.id);
      if (exists) {
        return prev.filter((c) => c.id !== content.id);
      }
      return [...prev, content];
    });
  }, []);

  const isContentSaved = useCallback((contentId) => {
    return savedContent.some((c) => c.id === contentId);
  }, [savedContent]);

  const value = {
    user,
    favoriteTeams,
    savedFixtures,
    savedContent,
    login,
    updateUser,
    logout,
    toggleFavoriteTeam,
    isFavoriteTeam,
    saveFixture,
    isFixtureSaved,
    saveContent,
    isContentSaved,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


