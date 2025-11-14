import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import MatchesScreen from './src/screens/MatchesScreen.js';
import NewsScreen from './src/screens/NewsScreen.js';
import NewsDetailScreen from './src/screens/NewsDetailScreen.js';
import StatsScreen from './src/screens/StatsScreen.js';
import { DataProvider } from './src/context/DataContext.js';
import theme from './src/theme/colors.js';
import { DrawerProvider } from './src/context/DrawerContext.js';
import MenuButton from './src/components/MenuButton.js';
import DrawerPanel from './src/components/DrawerPanel.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.backgroundPrimary,
    card: theme.colors.primary,
    text: theme.colors.textPrimary,
    border: theme.colors.border
  }
};

const TabsNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.muted,
      tabBarStyle: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderTopWidth: 0,
        elevation: 10,
        height: 64,
        paddingBottom: 10,
        paddingTop: 8
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600'
      },
      tabBarIcon: ({ color, size }) => {
        const iconMap = {
          News: 'newspaper-outline',
          Matches: 'football-outline',
          Stats: 'stats-chart-outline'
        };
        return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="News" component={NewsScreen} />
    <Tab.Screen name="Matches" component={MatchesScreen} />
    <Tab.Screen name="Stats" component={StatsScreen} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <DrawerProvider>
        <DataProvider>
          <View style={{ flex: 1 }}>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="light" backgroundColor={theme.colors.primary} />
              <Stack.Navigator
                screenOptions={{
                  headerShown: false
                }}
              >
                <Stack.Screen name="Tabs" component={TabsNavigator} />
                <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
              </Stack.Navigator>
            </NavigationContainer>
            <MenuButton />
            <DrawerPanel />
          </View>
        </DataProvider>
      </DrawerProvider>
    </SafeAreaProvider>
  );
}
