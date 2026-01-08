import { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../context/NavigationContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useDrawer } from '../../context/DrawerContext.js';
import { useAuth } from '../../context/AuthContext.js';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.85, 360);

const baseMenuItems = [
  { label: 'Teams', icon: 'people-outline', screen: 'TeamList' },
  { label: 'National Teams', icon: 'flag-outline', screen: 'NationalTeams' },
  { label: 'Fan Engagement', icon: 'trophy-outline', screen: 'FanEngagement' },
  { label: 'Tickets', icon: 'ticket-outline', screen: 'Tickets' },
  { label: 'My Tickets', icon: 'ticket', screen: 'MyTickets' },
  { label: 'Merchandise', icon: 'shirt-outline', screen: 'Merchandise' },
  { label: 'Offline', icon: 'cloud-download-outline', screen: 'Offline' },
  { label: 'Analytics', icon: 'stats-chart-outline', screen: 'Analytics' },
  { label: 'Profile', icon: 'person-outline', screen: 'Profile' },
  { label: 'Settings', icon: 'settings-outline', screen: 'Settings' }
];

const adminMenuItems = [
  { label: 'Manage Teams', icon: 'people', screen: 'TeamManagement', adminOnly: true },
  { label: 'Manage Leagues', icon: 'trophy', screen: 'LeagueManagement', adminOnly: true },
  { label: 'Manage Stadiums', icon: 'location', screen: 'StadiumManagement', adminOnly: true },
  { label: 'Manage Coaches', icon: 'person', screen: 'CoachManagement', adminOnly: true },
  { label: 'Manage Users', icon: 'people-circle', screen: 'UserManagement', adminOnly: true },
  { label: 'Account Approvals', icon: 'checkmark-circle', screen: 'AccountApproval', adminOnly: true },
  { label: 'Manage News', icon: 'newspaper', screen: 'NewsManagement', adminOnly: true },
  { label: 'Create Ticket', icon: 'ticket', screen: 'TicketCreation', adminOnly: true },
  { label: 'Profile', icon: 'person-outline', screen: 'Profile', adminOnly: false },
  { label: 'Settings', icon: 'settings-outline', screen: 'Settings', adminOnly: false }
];

const journalistMenuItems = [
  { label: 'My News', icon: 'newspaper', screen: 'JournalistNews', journalistOnly: true },
  { label: 'Live Commentary', icon: 'radio', screen: 'LiveCommentary', journalistOnly: true },
  { label: 'Interviews', icon: 'mic', screen: 'InterviewManagement', journalistOnly: true },
  { label: 'Fan Engagement', icon: 'trophy-outline', screen: 'JournalistFanEngagement', journalistOnly: true },
  { label: 'Comment Moderation', icon: 'chatbubbles', screen: 'CommentModeration', journalistOnly: true },
  { label: 'Profile', icon: 'person-outline', screen: 'Profile', journalistOnly: false },
  { label: 'Settings', icon: 'settings-outline', screen: 'Settings', journalistOnly: false }
];

const coachMenuItems = [
  { label: 'Manage Players', icon: 'people', screen: 'CoachPlayerManagement', coachOnly: true },
  { label: 'Transfer Requests', icon: 'swap-horizontal', screen: 'TransferRequest', coachOnly: true },
  { label: 'Friendly Fixtures', icon: 'calendar', screen: 'FriendlyFixture', coachOnly: true },
  { label: 'Training Sessions', icon: 'fitness', screen: 'TrainingManagement', coachOnly: true },
  { label: 'Player Statistics', icon: 'stats-chart', screen: 'PlayerStatistics', coachOnly: true },
  { label: 'Team News', icon: 'newspaper', screen: 'CoachNews', coachOnly: true },
  { label: 'Create Lineup', icon: 'football', screen: 'LineupCreation', coachOnly: true },
  { label: 'Profile', icon: 'person-outline', screen: 'Profile', coachOnly: false },
  { label: 'Settings', icon: 'settings-outline', screen: 'Settings', coachOnly: false }
];

const DrawerPanel = () => {
  const { theme } = useTheme();
  const { isOpen, closeDrawer } = useDrawer();
  const navigationRef = useAppNavigation();
  const { user } = useAuth();
  const translate = useRef(new Animated.Value(PANEL_WIDTH)).current;
  
  const isAdmin = user?.role === 'admin';
  const isJournalist = user?.role === 'journalist';
  const isCoach = user?.role === 'coach';
  
  const menuItems = useMemo(() => {
    if (isAdmin) {
      // For admin, show only admin items (no fan engagement)
      return adminMenuItems;
    }
    if (isJournalist) {
      // For journalist, show journalist-specific items
      return journalistMenuItems;
    }
    if (isCoach) {
      // For coach, show coach-specific items
      return coachMenuItems;
    }
    return baseMenuItems;
  }, [isAdmin, isJournalist, isCoach]);

  useEffect(() => {
    Animated.spring(translate, {
      toValue: isOpen ? 0 : PANEL_WIDTH,
      useNativeDriver: true,
      bounciness: 6
    }).start();
  }, [isOpen, translate]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => isOpen && gesture.dx > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          translate.setValue(Math.min(gesture.dx, PANEL_WIDTH));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > PANEL_WIDTH / 3) {
          closeDrawer();
        } else {
          Animated.spring(translate, {
            toValue: 0,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  // Only show drawer for admin, journalist, or coach users
  if (!isAdmin && !isJournalist && !isCoach) {
    return null;
  }

  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={closeDrawer} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            transform: [{ translateX: translate }],
            backgroundColor: theme.colors.surface,
            borderLeftColor: theme.colors.border,
            ...theme.shadows.xl
          }
        ]}
      >
        <View style={[styles.drawerHeader, { borderBottomColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.heading, { color: theme.colors.textDark }]}>
              {isAdmin ? 'Admin Menu' : isJournalist ? 'Journalist Menu' : 'Coach Menu'}
            </Text>
            <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
              {isAdmin ? 'Manage your content' : isJournalist ? 'Manage your articles' : 'Manage your team'}
            </Text>
          </View>
          <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.menu, { borderTopColor: (theme.colors.interactive || theme.colors.error || '#DC143C') + '40' }]}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, { borderBottomColor: (theme.colors.interactive || theme.colors.error || '#DC143C') + '20' }]}
                onPress={() => {
                  closeDrawer();
                  if (item.screen && navigationRef?.current) {
                    navigationRef.current.navigate(item.screen);
                  }
                }}
              >
                <View style={[styles.iconBubble, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}>
                  <Ionicons name={item.icon} size={20} color={theme.colors.textPrimary} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.colors.textDark }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    paddingTop: 60,
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    flex: 1
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
    marginTop: -4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
  },
  menu: {
    borderTopWidth: 1,
    paddingTop: 16
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    fontSize: 13
  }
});

export default DrawerPanel;

