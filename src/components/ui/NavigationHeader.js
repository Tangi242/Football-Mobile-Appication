import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useTheme } from '../../context/ThemeContext.js';
import baseTheme from '../../theme/colors.js';
import { onlineImages } from '../../assets/onlineImages.js';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useDrawer } from '../../context/DrawerContext.js';

// Helper function to get screen title from route name
const getScreenTitle = (routeName) => {
  const titleMap = {
    'NewsDetail': 'News',
    'PlayerDetail': 'Player',
    'MatchDetails': 'Match',
    'TeamProfile': 'Team',
    'TeamList': 'Teams',
    'NationalTeams': 'National Teams',
    'Standings': 'League Standings',
    'FanEngagement': 'Fan Engagement',
    'Tickets': 'Tickets',
    'TicketCheckout': 'Checkout',
    'TicketView': 'Ticket',
    'MyTickets': 'My Tickets',
    'Merchandise': 'Merchandise',
    'AllProducts': 'All Products',
    'Cart': 'Cart',
    'Venue': 'Venue',
    'Settings': 'Settings',
    'Profile': 'Profile',
    'Offline': 'Offline',
    'Analytics': 'Analytics',
    'TeamManagement': 'Manage Teams',
    'LeagueManagement': 'Manage Leagues',
    'StadiumManagement': 'Manage Stadiums',
    'CoachManagement': 'Manage Coaches',
    'UserManagement': 'Manage Users',
    'AccountApproval': 'Account Approvals',
    'NewsManagement': 'Manage News',
    'JournalistNews': 'My News',
    'TicketCreation': 'Create Ticket',
    'CoachPlayerManagement': 'Manage Players',
    'CoachNews': 'Team News',
    'LineupCreation': 'Create Lineup',
  };
  return titleMap[routeName] || routeName;
};

// This component is designed to be used as a custom header in React Navigation
export const NavigationHeader = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const [canGoBack, setCanGoBack] = useState(false);
  const [isTabScreen, setIsTabScreen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isJournalist = user?.role === 'journalist';
  const isCoach = user?.role === 'coach';

  // Determine if we're on a tab screen or inner screen
  useEffect(() => {
    const checkNavigationState = () => {
      try {
        // Check if we can go back
        const canNavigateBack = navigation.canGoBack();
        
        // Check if current route is a tab screen
        const tabScreens = ['News', 'Matches', 'Stats'];
        const isTabScreenRoute = tabScreens.includes(route.name);
        
        setCanGoBack(canNavigateBack && !isTabScreenRoute);
        setIsTabScreen(isTabScreenRoute);
      } catch (error) {
        // Default to showing back button if navigation state is unclear
        setCanGoBack(navigation.canGoBack());
        setIsTabScreen(false);
      }
    };

    checkNavigationState();
    
    // Listen for navigation state changes
    const unsubscribe = navigation.addListener('state', checkNavigationState);
    
    return unsubscribe;
  }, [navigation, route]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleHome = () => {
    // Navigate to Tabs and reset to first tab (News)
    navigation.navigate('Tabs', { screen: 'News' });
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  // Hide on auth screens
  const hideOnScreens = ['Auth', 'Login', 'SignUp'];
  if (hideOnScreens.includes(route.name)) {
    return null;
  }

  // Always show header, even on tab screens (but with logo instead of back button)

  return (
    <View 
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          backgroundColor: theme.colors.primary, // Navy blue background
        }
      ]}
    >
      <View style={styles.content}>
        {/* Left: Back button (on inner screens) or Logo/Home */}
        <View style={styles.leftSection}>
          {canGoBack ? (
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
              </TouchableOpacity>
              {/* Home button for deep navigation */}
              <TouchableOpacity
                onPress={handleHome}
                style={styles.homeButton}
                accessibilityLabel="Go to home"
                accessibilityRole="button"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="home" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleHome}
              style={styles.logoContainer}
              activeOpacity={0.8}
              accessibilityLabel="Ballr Home"
              accessibilityRole="button"
            >
              <Image
                source={{ uri: onlineImages.logos.namibia }}
                style={styles.logoImage}
                contentFit="contain"
              />
              <Text style={styles.logoText} numberOfLines={1} ellipsizeMode="tail">Ballr</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Screen title (when back button is shown) or empty */}
        <View style={styles.centerSection}>
          {canGoBack && (
            <View style={styles.titleContainer}>
              <Text style={styles.screenTitle} numberOfLines={1}>
                {getScreenTitle(route.name)}
              </Text>
            </View>
          )}
        </View>

        {/* Right: Admin/Journalist Menu or Profile and Settings (regular users) */}
        <View style={styles.rightSection}>
          {(isAdmin || isJournalist || isCoach) ? (
            <TouchableOpacity
              onPress={openDrawer}
              style={styles.iconButton}
              accessibilityLabel={isAdmin ? "Admin Menu" : isJournalist ? "Journalist Menu" : "Coach Menu"}
              accessibilityRole="button"
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleProfile}
                style={styles.iconButton}
                accessibilityLabel="Profile"
                accessibilityRole="button"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="person-circle-outline" size={24} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSettings}
                style={styles.iconButton}
                accessibilityLabel="Settings"
                accessibilityRole="button"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="settings-outline" size={22} color={theme.colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    ...baseTheme.shadows.sm,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.md,
    minHeight: 44,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    flexShrink: 1,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: baseTheme.spacing.sm,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
  },
  backButton: {
    padding: baseTheme.spacing.xs,
    marginLeft: -baseTheme.spacing.xs,
  },
  homeButton: {
    padding: baseTheme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: baseTheme.borderRadius.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: baseTheme.spacing.xs / 2,
    flexShrink: 1,
    maxWidth: '85%',
    minWidth: 0,
    paddingRight: baseTheme.spacing.xs,
  },
  logoText: {
    fontSize: 11,
    fontWeight: '700',
    color: baseTheme.colors.white,
    letterSpacing: 0.1,
    flexShrink: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  logoImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    flexShrink: 0,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: baseTheme.colors.white,
    textAlign: 'center',
  },
  iconButton: {
    padding: baseTheme.spacing.xs,
    borderRadius: baseTheme.borderRadius.sm,
  },
});

