import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import theme from '../../theme/colors.js';
import { useDrawer } from '../../context/DrawerContext.js';
import { useAppNavigation } from '../../context/NavigationContext.js';

const MenuButton = () => {
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const navigationRef = useAppNavigation();
  const [shouldHide, setShouldHide] = useState(false);
  
  // Check current route to hide menu button on auth screens
  useEffect(() => {
    if (!navigationRef?.current) {
      // Navigation not ready, show button by default
      setShouldHide(false);
      return;
    }
    
    const checkRoute = () => {
      try {
        const state = navigationRef.current?.getState();
        if (state?.routes && typeof state.index === 'number') {
          const currentRoute = state.routes[state.index]?.name;
          const hideOnScreens = ['Auth', 'Login', 'SignUp'];
          setShouldHide(hideOnScreens.includes(currentRoute));
        } else {
          setShouldHide(false);
        }
      } catch (error) {
        // Navigation not ready yet or error accessing state, show button by default
        setShouldHide(false);
      }
    };
    
    // Check immediately
    checkRoute();
    
    // Check periodically to catch route changes
    const interval = setInterval(checkRoute, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [navigationRef]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <TouchableOpacity
        accessibilityLabel="Open navigation menu"
        accessibilityHint="Opens the main navigation drawer with quick access to all app features"
        onPress={openDrawer}
        style={[
          styles.button,
          {
            bottom: Math.max(insets.bottom + 90, 110),
            right: theme.spacing.lg
          }
        ]}
        activeOpacity={0.8}
      >
        <Ionicons name="menu" size={22} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    // Navy blue with transparency for menu button (Brave Warriors brand)
    backgroundColor: 'rgba(30, 58, 95, 0.9)', // Navy blue (#1E3A5F) with 90% opacity
    borderRadius: theme.borderRadius.full,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  }
});

export default MenuButton;

