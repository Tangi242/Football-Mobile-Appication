import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { t } from '../../i18n/locales.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog.js';
import { getUserTickets } from '../../database/ticketDatabase.js';
import theme from '../../theme/colors.js';
import dayjs from '../../lib/dayjs.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, favoriteTeams, savedFixtures, savedContent } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { theme: appTheme } = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [merchandiseOrders, setMerchandiseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Preferences state
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    matchReminders: true,
    favoriteTeamUpdates: true,
    newsUpdates: true,
    offlineMode: false,
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'ng', name: 'Oshiwambo', flag: '🇳🇦' }
  ];

  // Load preferences and order history
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load preferences
      const storedPrefs = await AsyncStorage.getItem(`preferences_${user.id}`);
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }

      // Load tickets
      try {
        const userTickets = await getUserTickets(user.id?.toString() || '1');
        setTickets(userTickets || []);
      } catch (error) {
        console.warn('Could not load tickets:', error);
        setTickets([]);
      }

      // Load merchandise orders (from AsyncStorage)
      try {
        const storedOrders = await AsyncStorage.getItem(`orders_${user.id}`);
        if (storedOrders) {
          setMerchandiseOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.warn('Could not load orders:', error);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;

    let completed = 0;
    let total = 6; // Total fields to check

    if (user.name) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.avatar || user.photo) completed++;
    if (favoriteTeams.length > 0) completed++;
    if (user.bio || user.about) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Save preferences
  const updatePreference = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    try {
      await AsyncStorage.setItem(`preferences_${user.id}`, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigation.replace('Tabs');
  };

  // Handle account deletion with confirmation
  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteDialog(false);
    try {
      // Clear user data
      await AsyncStorage.removeItem(`preferences_${user.id}`);
      await AsyncStorage.removeItem(`orders_${user.id}`);
      logout();
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      navigation.replace('Tabs');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  if (!user) {
    return (
      <ScreenWrapper>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={64} color={theme.colors.muted} />
          <Text style={styles.loginPromptText}>Please login to access your profile</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>{t('login', language)}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: appTheme.colors.textDark }]}>
          {t('profile', language)}
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          accessibilityLabel="Logout"
          accessibilityHint="Double tap to logout"
        >
          <Ionicons name="log-out-outline" size={20} color={appTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card with Completion Indicator */}
        <View style={[styles.profileCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={styles.avatarContainer}>
            {user.avatar || user.photo ? (
              <Image
                source={{ uri: user.avatar || user.photo }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <Ionicons name="person-circle" size={64} color={appTheme.colors.primary} />
            )}
          </View>
          <Text style={[styles.userName, { color: appTheme.colors.textDark }]}>
            {user.name || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: appTheme.colors.textSecondary }]}>
            {user.email}
          </Text>

          {/* Profile Completion Indicator */}
          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text style={[styles.completionLabel, { color: appTheme.colors.textSecondary }]}>
                Profile Completion
              </Text>
              <Text style={[styles.completionPercentage, { color: appTheme.colors.primary }]}>
                {profileCompletion}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: appTheme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${profileCompletion}%`,
                    backgroundColor: profileCompletion === 100
                      ? theme.colors.special || '#10B981'
                      : appTheme.colors.primary
                  }
                ]}
              />
            </View>
            {profileCompletion < 100 && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => navigation.navigate('ProfileEdit')}
                activeOpacity={0.7}
              >
                <Text style={[styles.completeButtonText, { color: appTheme.colors.primary }]}>
                  Complete Profile
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.editButton, { borderColor: appTheme.colors.border }]}
              onPress={() => navigation.navigate('ProfileEdit')}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color={appTheme.colors.primary} />
              <Text style={[styles.editButtonText, { color: appTheme.colors.primary }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Favorites Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>
            {t('favorites', language)}
          </Text>
          <View style={styles.statRow}>
            <TouchableOpacity
              style={[styles.statBox, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'Teams' })}
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={24} color={appTheme.colors.primary} />
              <Text style={[styles.statValue, { color: appTheme.colors.primary }]}>
                {favoriteTeams.length}
              </Text>
              <Text style={[styles.statLabel, { color: appTheme.colors.textSecondary }]}>
                Favorite Teams
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statBox, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'Matches' })}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar" size={24} color={appTheme.colors.primary} />
              <Text style={[styles.statValue, { color: appTheme.colors.primary }]}>
                {savedFixtures.length}
              </Text>
              <Text style={[styles.statLabel, { color: appTheme.colors.textSecondary }]}>
                Saved Fixtures
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statBox, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'News' })}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark" size={24} color={appTheme.colors.primary} />
              <Text style={[styles.statValue, { color: appTheme.colors.primary }]}>
                {savedContent.length}
              </Text>
              <Text style={[styles.statLabel, { color: appTheme.colors.textSecondary }]}>
                Saved Content
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>
              Order History
            </Text>
            {(tickets.length > 0 || merchandiseOrders.length > 0) && (
              <TouchableOpacity
                onPress={() => {
                  // Navigate to full order history screen if needed
                  Alert.alert('Order History', 'View all your orders');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.seeAllText, { color: appTheme.colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tickets */}
          {tickets.length > 0 && (
            <View style={[styles.orderCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <View style={styles.orderHeader}>
                <Ionicons name="ticket" size={20} color={appTheme.colors.primary} />
                <Text style={[styles.orderType, { color: appTheme.colors.textDark }]}>
                  Tickets ({tickets.length})
                </Text>
              </View>
              {tickets.slice(0, 3).map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={styles.orderItem}
                  onPress={() => navigation.navigate('TicketView', { ticketId: ticket.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderItemContent}>
                    <Text style={[styles.orderItemTitle, { color: appTheme.colors.textDark }]} numberOfLines={1}>
                      {ticket.match_name || 'Match Ticket'}
                    </Text>
                    <Text style={[styles.orderItemDate, { color: appTheme.colors.textSecondary }]}>
                      {dayjs(ticket.purchase_date).format('MMM D, YYYY')}
                    </Text>
                  </View>
                  <View style={styles.orderItemRight}>
                    <Text style={[styles.orderItemPrice, { color: appTheme.colors.primary }]}>
                      N${ticket.price?.toFixed(2) || '0.00'}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={appTheme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
              {tickets.length > 3 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => navigation.navigate('MyTickets')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewMoreText, { color: appTheme.colors.primary }]}>
                    View All Tickets
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Merchandise Orders */}
          {merchandiseOrders.length > 0 && (
            <View style={[styles.orderCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <View style={styles.orderHeader}>
                <Ionicons name="bag" size={20} color={appTheme.colors.primary} />
                <Text style={[styles.orderType, { color: appTheme.colors.textDark }]}>
                  Merchandise ({merchandiseOrders.length})
                </Text>
              </View>
              {merchandiseOrders.slice(0, 3).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderItem}
                  onPress={() => Alert.alert('Order Details', `Order #${order.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderItemContent}>
                    <Text style={[styles.orderItemTitle, { color: appTheme.colors.textDark }]} numberOfLines={1}>
                      Order #{order.id?.slice(-8) || order.id?.toString() || 'New'}
                    </Text>
                    <Text style={[styles.orderItemDate, { color: appTheme.colors.textSecondary }]}>
                      {dayjs(order.date).format('MMM D, YYYY')}
                    </Text>
                  </View>
                  <View style={styles.orderItemRight}>
                    <Text style={[styles.orderItemPrice, { color: appTheme.colors.primary }]}>
                      N${order.total?.toFixed(2) || '0.00'}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={appTheme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {tickets.length === 0 && merchandiseOrders.length === 0 && (
            <View style={[styles.emptyOrderCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <Ionicons name="receipt-outline" size={48} color={appTheme.colors.muted} />
              <Text style={[styles.emptyOrderText, { color: appTheme.colors.textSecondary }]}>
                No orders yet
              </Text>
              <Text style={[styles.emptyOrderSubtext, { color: appTheme.colors.textSecondary }]}>
                Your ticket and merchandise orders will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>
            Notification Preferences
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={1}
              onPress={() => updatePreference('pushNotifications', !preferences.pushNotifications)}
            >
              <Ionicons name="notifications-outline" size={20} color={appTheme.colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: appTheme.colors.textDark }]}>
                Push Notifications
              </Text>
              <Switch
                value={preferences.pushNotifications}
                onValueChange={(value) => updatePreference('pushNotifications', value)}
                trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={1}
              onPress={() => updatePreference('emailNotifications', !preferences.emailNotifications)}
            >
              <Ionicons name="mail-outline" size={20} color={appTheme.colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: appTheme.colors.textDark }]}>
                Email Notifications
              </Text>
              <Switch
                value={preferences.emailNotifications}
                onValueChange={(value) => updatePreference('emailNotifications', value)}
                trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={1}
              onPress={() => updatePreference('matchReminders', !preferences.matchReminders)}
            >
              <Ionicons name="calendar-outline" size={20} color={appTheme.colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: appTheme.colors.textDark }]}>
                Match Reminders
              </Text>
              <Switch
                value={preferences.matchReminders}
                onValueChange={(value) => updatePreference('matchReminders', value)}
                trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={1}
              onPress={() => updatePreference('favoriteTeamUpdates', !preferences.favoriteTeamUpdates)}
            >
              <Ionicons name="star-outline" size={20} color={appTheme.colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: appTheme.colors.textDark }]}>
                Favorite Team Updates
              </Text>
              <Switch
                value={preferences.favoriteTeamUpdates}
                onValueChange={(value) => updatePreference('favoriteTeamUpdates', value)}
                trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={1}
              onPress={() => updatePreference('newsUpdates', !preferences.newsUpdates)}
            >
              <Ionicons name="newspaper-outline" size={20} color={appTheme.colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: appTheme.colors.textDark }]}>
                News Updates
              </Text>
              <Switch
                value={preferences.newsUpdates}
                onValueChange={(value) => updatePreference('newsUpdates', value)}
                trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>
            Language
          </Text>
          <View style={[styles.languageCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && { backgroundColor: appTheme.colors.backgroundPrimary }
                ]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  { color: appTheme.colors.textDark },
                  language === lang.code && { fontWeight: '700', color: appTheme.colors.primary }
                ]}>
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={18} color={appTheme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>
            Other Settings
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={1}
              onPress={() => updatePreference('offlineMode', !preferences.offlineMode)}
            >
              <Ionicons name="download-outline" size={20} color={appTheme.colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: appTheme.colors.textDark }]}>
                Offline Mode
              </Text>
              <Switch
                value={preferences.offlineMode}
                onValueChange={(value) => updatePreference('offlineMode', value)}
                trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: theme.colors.error || '#EF4444' }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.error || '#EF4444'} />
            <Text style={[styles.dangerButtonText, { color: theme.colors.error || '#EF4444' }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to login again to access your profile and saved content."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />

      <ConfirmationDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="This action cannot be undone. All your data, including tickets, favorites, and preferences will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        confirmColor={theme.colors.error || '#EF4444'}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  title: {
    ...theme.typography.h2,
  },
  logoutButton: {
    padding: theme.spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: theme.spacing.lg
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  loginPromptText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center'
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minHeight: 44,
    ...theme.shadows.sm
  },
  loginButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700'
  },
  profileCard: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm
  },
  avatarContainer: {
    marginBottom: theme.spacing.md
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userName: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs
  },
  userEmail: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.md
  },
  completionContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  completionLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  completionPercentage: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completeButton: {
    paddingVertical: theme.spacing.xs,
  },
  completeButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  editButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md
  },
  seeAllText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  statBox: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    ...theme.shadows.sm,
    minHeight: 100,
  },
  statValue: {
    ...theme.typography.h3,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs / 2
  },
  statLabel: {
    ...theme.typography.tiny,
    textAlign: 'center'
  },
  orderCard: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  orderType: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    minHeight: 44,
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  orderItemDate: {
    ...theme.typography.bodySmall,
  },
  orderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  orderItemPrice: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  viewMoreButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  viewMoreText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  emptyOrderCard: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyOrderText: {
    ...theme.typography.body,
    fontWeight: '600',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyOrderSubtext: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
  },
  languageCard: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    ...theme.shadows.sm,
    overflow: 'hidden'
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 44,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: theme.spacing.sm
  },
  languageName: {
    ...theme.typography.body,
    flex: 1
  },
  settingsCard: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    ...theme.shadows.sm,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
    minHeight: 44,
  },
  settingLabel: {
    ...theme.typography.body,
    flex: 1
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    minHeight: 44,
  },
  dangerButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
});

export default ProfileScreen;
