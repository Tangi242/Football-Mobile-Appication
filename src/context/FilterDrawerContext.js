import { createContext, useContext, useState } from 'react';

const FilterDrawerContext = createContext();

export const FilterDrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(prev => !prev);

  return (
    <FilterDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </FilterDrawerContext.Provider>
  );
};

export const useFilterDrawer = () => {
  const context = useContext(FilterDrawerContext);
  if (!context) {
    throw new Error('useFilterDrawer must be used within FilterDrawerProvider');
  }
  return context;
};

