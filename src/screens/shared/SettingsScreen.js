import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { lightTheme } from '../../theme/colors.js';
import baseTheme from '../../theme/colors.js';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Tabs');
          }
        }
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDarkMode ? 'moon' : 'sunny',
          label: 'Dark Mode',
          value: isDarkMode,
          type: 'toggle',
          onPress: toggleTheme
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Profile',
          type: 'navigate',
          screen: 'Profile',
          showArrow: true
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          type: 'navigate',
          screen: 'Alerts',
          showArrow: true
        }
      ]
    },
    {
      title: 'General',
      items: [
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          type: 'navigate',
          screen: 'Language',
          showArrow: true
        },
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          type: 'action',
          onPress: () => Alert.alert('Help', 'Contact support at support@football.com')
        },
        {
          icon: 'information-circle-outline',
          label: 'About',
          type: 'action',
          onPress: () => Alert.alert('About', 'Ballr v1.0.0\n\nFootball Application\n\nDeveloped by S four trading enterprise')
        }
      ]
    }
  ];

  const renderSettingItem = (item) => {
    if (item.type === 'toggle') {
      return (
        <View
          key={item.label}
          style={[
            styles.settingItem,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
          ]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.colors.textDark }]}>
              {item.label}
            </Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
            thumbColor={item.value ? theme.colors.primary : theme.colors.muted}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.label}
        style={[
          styles.settingItem,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
        ]}
        onPress={() => {
          if (item.type === 'navigate' && item.screen) {
            navigation.navigate(item.screen);
          } else if (item.onPress) {
            item.onPress();
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.textDark }]}>
              {item.label}
            </Text>
            {item.value && (
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                {item.value}
              </Text>
            )}
          </View>
        </View>
        {item.showArrow && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Info */}
          {user && (
            <View style={[styles.userCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.userAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="person" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.colors.textDark }]}>
                  {user.name || 'User'}
                </Text>
                {user.email && (
                  <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                    {user.email}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                {section.title}
              </Text>
              <View style={styles.sectionContent}>
                {section.items.map((item) => renderSettingItem(item))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          {user && (
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: theme.colors.surface, borderColor: '#EF4444' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.logoutText, { color: '#EF4444' }]}>Logout</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.sm,
    paddingBottom: baseTheme.spacing.lg
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: baseTheme.spacing.sm,
    ...lightTheme.shadows.md
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 13
  },
  section: {
    marginBottom: baseTheme.spacing.sm
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4
  },
  sectionContent: {
    gap: 6
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    ...lightTheme.shadows.sm
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  settingTextContainer: {
    flex: 1
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2
  },
  settingValue: {
    fontSize: 12
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: baseTheme.spacing.sm,
    gap: baseTheme.spacing.xs,
    ...lightTheme.shadows.sm
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700'
  }
});

export default SettingsScreen;

