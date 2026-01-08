import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Platform } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Fan screens
import MatchesScreen from './src/screens/fan/MatchesScreen.js';
import NewsScreen from './src/screens/fan/NewsScreen.js';
import NewsDetailScreen from './src/screens/fan/NewsDetailScreen.js';
import StatsScreen from './src/screens/fan/StatsScreen.js';
import PlayerDetailScreen from './src/screens/fan/PlayerDetailScreen.js';
import MatchDetailsScreen from './src/screens/fan/MatchDetailsScreen.js';
import TeamProfileScreen from './src/screens/fan/TeamProfileScreen.js';
import TeamListScreen from './src/screens/fan/TeamListScreen.js';
import NationalTeamsScreen from './src/screens/fan/NationalTeamsScreen.js';
import FanEngagementScreen from './src/screens/fan/FanEngagementScreen.js';
import TicketsScreen from './src/screens/fan/TicketsScreen.js';
import TicketCheckoutScreen from './src/screens/fan/TicketCheckoutScreen.js';
import TicketViewScreen from './src/screens/fan/TicketViewScreen.js';
import MyTicketsScreen from './src/screens/fan/MyTicketsScreen.js';
import MerchandiseScreen from './src/screens/fan/MerchandiseScreen.js';
import AllProductsScreen from './src/screens/fan/AllProductsScreen.js';
import CartScreen from './src/screens/fan/CartScreen.js';
import VenueScreen from './src/screens/fan/VenueScreen.js';
import StandingsScreen from './src/screens/fan/StandingsScreen.js';

// Shared screens
import AuthScreen from './src/screens/shared/AuthScreen.js';
import LoginScreen from './src/screens/shared/LoginScreen.js';
import SignUpScreen from './src/screens/shared/SignUpScreen.js';
import RegisterScreen from './src/screens/shared/RegisterScreen.js';
import SettingsScreen from './src/screens/shared/SettingsScreen.js';
import ProfileScreen from './src/screens/shared/ProfileScreen.js';
import ProfileEditScreen from './src/screens/shared/ProfileEditScreen.js';
import OfflineScreen from './src/screens/shared/OfflineScreen.js';
import AnalyticsScreen from './src/screens/shared/AnalyticsScreen.js';

// Admin screens
import TeamManagementScreen from './src/screens/admin/TeamManagementScreen.js';
import CoachManagementScreen from './src/screens/admin/CoachManagementScreen.js';
import UserManagementScreen from './src/screens/admin/UserManagementScreen.js';
import AccountApprovalScreen from './src/screens/admin/AccountApprovalScreen.js';
import LeagueManagementScreen from './src/screens/admin/LeagueManagementScreen.js';
import StadiumManagementScreen from './src/screens/admin/StadiumManagementScreen.js';
import NewsManagementScreen from './src/screens/admin/NewsManagementScreen.js';
import JournalistNewsScreen from './src/screens/journalist/JournalistNewsScreen.js';
import JournalistFanEngagementScreen from './src/screens/journalist/JournalistFanEngagementScreen.js';
import LiveCommentaryScreen from './src/screens/journalist/LiveCommentaryScreen.js';
import InterviewManagementScreen from './src/screens/journalist/InterviewManagementScreen.js';
import CommentModerationScreen from './src/screens/journalist/CommentModerationScreen.js';
import TicketCreationScreen from './src/screens/admin/TicketCreationScreen.js';
// Coach screens
import CoachPlayerManagementScreen from './src/screens/coach/CoachPlayerManagementScreen.js';
import CoachNewsScreen from './src/screens/coach/CoachNewsScreen.js';
import LineupCreationScreen from './src/screens/coach/LineupCreationScreen.js';
import TransferRequestScreen from './src/screens/coach/TransferRequestScreen.js';
import FriendlyFixtureScreen from './src/screens/coach/FriendlyFixtureScreen.js';
import TrainingManagementScreen from './src/screens/coach/TrainingManagementScreen.js';
import PlayerStatisticsScreen from './src/screens/coach/PlayerStatisticsScreen.js';
import { initDatabase } from './src/database/ticketDatabase.js';
import { DataProvider } from './src/context/DataContext.js';
import { AuthProvider } from './src/context/AuthContext.js';
import { LanguageProvider } from './src/context/LanguageContext.js';
import { ThemeProvider, useTheme } from './src/context/ThemeContext.js';
import { DrawerProvider } from './src/context/DrawerContext.js';
import { LeagueDrawerProvider } from './src/context/LeagueDrawerContext.js';
import { FilterDrawerProvider } from './src/context/FilterDrawerContext.js';
import { RefreshProvider } from './src/context/RefreshContext.js';
import { CartProvider } from './src/context/CartContext.js';
import { RecentlyViewedProvider } from './src/context/RecentlyViewedContext.js';
import DrawerPanel from './src/components/ui/DrawerPanel.js';
import Toast from './src/components/ui/Toast.js';
import { useToast } from './src/hooks/useToast.js';
import { NavigationContext } from './src/context/NavigationContext.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const TabsNavigator = () => {
  const { theme, isDarkMode } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Active tab uses red (interactive), inactive uses white/gray
        tabBarActiveTintColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for active
        tabBarInactiveTintColor: isDarkMode ? theme.colors.textSecondary : '#94A3B8', // Muted for inactive
        tabBarStyle: {
          // Navy blue background for navigation bar (Brave Warriors brand)
          backgroundColor: theme.colors.primary, // Navy blue
          borderTopWidth: 0, // Remove border for cleaner look
          elevation: 8,
          height: 68,
          paddingBottom: 12,
          paddingTop: 10,
          ...theme.shadows.md
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '600',
          marginTop: -4,
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            News: focused ? 'newspaper' : 'newspaper-outline',
            Matches: focused ? 'football' : 'football-outline',
            Stats: focused ? 'stats-chart' : 'stats-chart-outline',
            Merchandise: focused ? 'shirt' : 'shirt-outline'
          };
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(220, 20, 60, 0.15)' : 'transparent',
              minWidth: 60,
            }}>
              <Ionicons name={iconMap[route.name]} size={focused ? 26 : 22} color={color} />
            </View>
          );
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={({ route }) => ({
          tabBarLabel: 'News',
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 11,
            marginTop: -2,
          }
        })}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={({ route }) => ({
          tabBarLabel: 'Matches',
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 11,
            marginTop: -2,
          }
        })}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={({ route }) => ({
          tabBarLabel: 'Stats',
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 11,
            marginTop: -2,
          }
        })}
      />
      <Tab.Screen
        name="Merchandise"
        component={MerchandiseScreen}
        options={({ route }) => ({
          tabBarLabel: 'Shop',
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 11,
            marginTop: -2,
          }
        })}
      />
    </Tab.Navigator>
  );
};

const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE';

const AppContent = () => {
  const navigationRef = useNavigationContainerRef();
  const { theme, isDarkMode } = useTheme();
  const { toast, hideToast } = useToast();
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  // Initialize database on app start (only on native platforms)
  useEffect(() => {
    initDatabase().catch(error => {
      // Silently handle database errors - ticket features just won't work
      if (error?.message && !error.message.includes('web')) {
        console.warn('Database initialization failed:', error.message);
      }
    });
  }, []);

  // Restore navigation state on app start
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;

        if (state) {
          setInitialState(state);
        }
      } catch (e) {
        // Ignore errors during state restoration
        console.warn('Failed to restore navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  // Save navigation state on changes
  const onStateChange = (state) => {
    try {
      // Only save state if not on auth screens
      const currentRoute = state?.routes?.[state?.index];
      const currentRouteName = currentRoute?.name;
      const authScreens = ['Auth', 'Login', 'SignUp'];

      if (currentRouteName && !authScreens.includes(currentRouteName)) {
        AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      // Ignore errors during state saving
      console.warn('Failed to save navigation state:', e);
    }
  };

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.backgroundPrimary,
      card: theme.colors.backgroundSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.border
    }
  };

  // Don't render until navigation state is restored
  if (!isReady) {
    return null;
  }

  return (
    <NavigationContext.Provider value={navigationRef}>
      <View style={{ flex: 1 }}>
        <NavigationContainer
          ref={navigationRef}
          theme={navTheme}
          initialState={initialState}
          onStateChange={onStateChange}
        >
          <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={theme.colors.backgroundPrimary} />
          <Stack.Navigator
            screenOptions={({ route, navigation }) => {
              // Determine animation based on route
              const getAnimation = () => {
                // Auth screens use fade
                if (['Auth', 'Login', 'SignUp'].includes(route.name)) {
                  return 'fade';
                }
                // Modal-like screens use slide from bottom
                if (['TicketCheckout', 'Cart', 'Settings', 'Profile', 'ProfileEdit'].includes(route.name)) {
                  return Platform.OS === 'ios' ? 'modal' : 'slide_from_bottom';
                }
                // Default slide from right
                return Platform.OS === 'ios' ? 'default' : 'slide_from_right';
              };

              return {
                headerShown: true,
                header: () => {
                  // Import NavigationHeader dynamically to avoid circular dependencies
                  const { NavigationHeader } = require('./src/components/ui/NavigationHeader.js');
                  return <NavigationHeader route={route} navigation={navigation} />;
                },
                headerStyle: {
                  height: 0, // Hide default header, we use custom one
                },
                // Smooth screen transitions
                animation: getAnimation(),
                animationDuration: 300,
                presentation: ['TicketCheckout', 'Cart'].includes(route.name) ? 'modal' : 'card',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                fullScreenGestureEnabled: Platform.OS === 'ios',
              };
            }}
            initialRouteName="Tabs"
          >
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Tabs" component={TabsNavigator} />
            <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
            <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} />
            <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
            <Stack.Screen name="TeamProfile" component={TeamProfileScreen} />
            <Stack.Screen name="TeamList" component={TeamListScreen} />
            <Stack.Screen name="Standings" component={StandingsScreen} />
            <Stack.Screen name="NationalTeams" component={NationalTeamsScreen} />
            <Stack.Screen name="FanEngagement" component={FanEngagementScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="Tickets" component={TicketsScreen} />
            <Stack.Screen name="TicketCheckout" component={TicketCheckoutScreen} />
            <Stack.Screen name="TicketView" component={TicketViewScreen} />
            <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
            <Stack.Screen name="Merchandise" component={MerchandiseScreen} />
            <Stack.Screen name="AllProducts" component={AllProductsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Venue" component={VenueScreen} />
            <Stack.Screen name="Offline" component={OfflineScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
            <Stack.Screen name="LeagueManagement" component={LeagueManagementScreen} />
            <Stack.Screen name="StadiumManagement" component={StadiumManagementScreen} />
            <Stack.Screen name="CoachManagement" component={CoachManagementScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="AccountApproval" component={AccountApprovalScreen} />
            <Stack.Screen name="NewsManagement" component={NewsManagementScreen} />
            <Stack.Screen name="JournalistNews" component={JournalistNewsScreen} />
            <Stack.Screen name="JournalistFanEngagement" component={JournalistFanEngagementScreen} />
            <Stack.Screen name="LiveCommentary" component={LiveCommentaryScreen} />
            <Stack.Screen name="InterviewManagement" component={InterviewManagementScreen} />
            <Stack.Screen name="CommentModeration" component={CommentModerationScreen} />
            <Stack.Screen name="TicketCreation" component={TicketCreationScreen} />
            <Stack.Screen name="CoachPlayerManagement" component={CoachPlayerManagementScreen} />
            <Stack.Screen name="TransferRequest" component={TransferRequestScreen} />
            <Stack.Screen name="FriendlyFixture" component={FriendlyFixtureScreen} />
            <Stack.Screen name="TrainingManagement" component={TrainingManagementScreen} />
            <Stack.Screen name="PlayerStatistics" component={PlayerStatisticsScreen} />
            <Stack.Screen name="CoachNews" component={CoachNewsScreen} />
            <Stack.Screen name="LineupCreation" component={LineupCreationScreen} />
          </Stack.Navigator>
          <DrawerPanel />
        </NavigationContainer>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </View>
    </NavigationContext.Provider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <RecentlyViewedProvider>
                <RefreshProvider>
                  <DrawerProvider>
                    <LeagueDrawerProvider>
                      <FilterDrawerProvider>
                        <DataProvider>
                          <AppContent />
                        </DataProvider>
                      </FilterDrawerProvider>
                    </LeagueDrawerProvider>
                  </DrawerProvider>
                </RefreshProvider>
              </RecentlyViewedProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
