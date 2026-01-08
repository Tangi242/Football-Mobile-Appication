import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchUsers, updateUserStatus } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import EmptyState from '../../components/ui/EmptyState.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { useRefresh } from '../../context/RefreshContext.js';

const UserManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { triggerRefresh } = useRefresh();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = selectedRole !== 'all' ? { role: selectedRole } : {};
      const response = await fetchUsers(params);
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspend' : 'unsuspend';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus === 'suspended' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setUpdatingStatus(user.id);
              await updateUserStatus(user.id, newStatus);
              showSuccess(`User ${action}ed successfully`);
              loadData();
              // Trigger global refresh so changes appear across the app
              triggerRefresh('users');
            } catch (error) {
              showError(error.userMessage || `Failed to ${action} user`);
            } finally {
              setUpdatingStatus(null);
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={[styles.userItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.textDark }]}>{item.full_name}</Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{item.email || 'No email'}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          {item.team_name && (
            <Text style={[styles.teamName, { color: theme.colors.textSecondary }]}>
              {item.team_name}
            </Text>
          )}
        </View>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'active' ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        {updatingStatus === item.id ? (
          <ActivityIndicator size="small" color={theme.colors.interactive || '#DC143C'} />
        ) : (
          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor: item.status === 'active' ? '#EF4444' : '#10B981'
              }
            ]}
            onPress={() => handleStatusChange(item)}
          >
            <Ionicons
              name={item.status === 'active' ? 'ban' : 'checkmark-circle'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.statusButtonText}>
              {item.status === 'active' ? 'Suspend' : 'Unsuspend'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getRoleColor = (role) => {
    const colors = {
      admin: '#DC143C',
      coach: '#0066CC',
      referee: '#FF6600',
      club_manager: '#800080',
      player: '#008000',
      fan: '#94A3B8',
      journalist: '#F59E0B'
    };
    return colors[role] || '#94A3B8';
  };

  const roles = [
    { id: 'all', label: 'All Users' },
    { id: 'admin', label: 'Admins' },
    { id: 'coach', label: 'Coaches' },
    { id: 'referee', label: 'Referees' },
    { id: 'club_manager', label: 'Managers' },
    { id: 'player', label: 'Players' },
    { id: 'fan', label: 'Fans' },
    { id: 'journalist', label: 'Journalists' }
  ];

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.interactive || '#DC143C'} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Manage Users</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={roles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedRole === item.id && { backgroundColor: theme.colors.interactive || '#DC143C' }
              ]}
              onPress={() => setSelectedRole(item.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedRole === item.id && { color: '#FFFFFF' }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {users.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No users found"
          subtitle={selectedRole !== 'all' ? `No ${selectedRole} users found` : 'No users found'}
          messageType="default"
          illustrationTone="brand"
        />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadData}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  backButton: {
    padding: baseTheme.spacing.xs,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  filterList: {
    paddingHorizontal: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.full,
    backgroundColor: baseTheme.colors.surface,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
  },
  filterChipText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
  },
  listContent: {
    padding: baseTheme.spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  userEmail: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: baseTheme.borderRadius.sm,
  },
  roleText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  teamName: {
    ...baseTheme.typography.caption,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: baseTheme.borderRadius.sm,
  },
  statusText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userActions: {
    marginLeft: baseTheme.spacing.md,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.xs / 2,
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
  },
  statusButtonText: {
    ...baseTheme.typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default UserManagementScreen;

