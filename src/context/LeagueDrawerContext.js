import { createContext, useContext, useState } from 'react';

const LeagueDrawerContext = createContext();

export const LeagueDrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(prev => !prev);

  return (
    <LeagueDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </LeagueDrawerContext.Provider>
  );
};

export const useLeagueDrawer = () => {
  const context = useContext(LeagueDrawerContext);
  if (!context) {
    throw new Error('useLeagueDrawer must be used within LeagueDrawerProvider');
  }
  return context;
};

