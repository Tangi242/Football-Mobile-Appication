import { createContext, useContext } from 'react';

const NavigationContext = createContext(null);

export const useAppNavigation = () => {
  const navigation = useContext(NavigationContext);
  return navigation;
};

export { NavigationContext };

