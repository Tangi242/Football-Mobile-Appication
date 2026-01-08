import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchCoaches, createCoach, updateCoach, deleteCoach } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const CoachManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { triggerRefresh } = useRefresh();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_photo_path: '',
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchCoaches();
      setCoaches(response.data?.coaches || []);
    } catch (error) {
      console.error('Error loading coaches:', error);
      showError('Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCoach(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      profile_photo_path: '',
      status: 'active'
    });
    setModalVisible(true);
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      first_name: coach.first_name || '',
      last_name: coach.last_name || '',
      email: coach.email || '',
      phone: coach.phone || '',
      profile_photo_path: coach.profile_photo_path || '',
      status: coach.status || 'active'
    });
    setModalVisible(true);
  };

  const handleDelete = (coach) => {
    Alert.alert(
      'Delete Coach',
      `Are you sure you want to delete ${coach.full_name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCoach(coach.id);
              showSuccess('Coach deleted successfully');
              loadData();
              // Trigger global refresh so changes appear across the app
              triggerRefresh('coaches');
              triggerRefresh('users'); // Coaches are users
            } catch (error) {
              showError(error.userMessage || 'Failed to delete coach');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      showError('First name, last name, and email are required');
      return;
    }

    try {
      setSaving(true);
      if (editingCoach) {
        await updateCoach(editingCoach.id, formData);
        showSuccess('Coach updated successfully');
      } else {
        await createCoach(formData);
        showSuccess('Coach created successfully');
      }
      setModalVisible(false);
      loadData();
      // Trigger global refresh so changes appear across the app
      triggerRefresh('coaches');
      triggerRefresh('users'); // Coaches are users
    } catch (error) {
      showError(error.userMessage || 'Failed to save coach');
    } finally {
      setSaving(false);
    }
  };

  const renderCoachItem = ({ item }) => (
    <View style={[styles.coachItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.coachInfo}>
        <Text style={[styles.coachName, { color: theme.colors.textDark }]}>{item.full_name}</Text>
        <Text style={[styles.coachEmail, { color: theme.colors.textSecondary }]}>{item.email}</Text>
        <Text style={[styles.coachPhone, { color: theme.colors.textSecondary }]}>{item.phone || 'No phone'}</Text>
        {item.team_name && (
          <Text style={[styles.coachTeam, { color: theme.colors.interactive || '#DC143C' }]}>
            Team: {item.team_name}
          </Text>
        )}
        <Text style={[styles.coachStatus, { color: item.status === 'active' ? '#10B981' : '#EF4444' }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.coachActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Manage Coaches</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {coaches.length === 0 ? (
        <EmptyState
          icon="person-outline"
          title="No coaches found"
          subtitle="Add your first coach to get started"
          messageType="default"
          illustrationTone="brand"
        />
      ) : (
        <FlatList
          data={coaches}
          renderItem={renderCoachItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadData}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                {editingCoach ? 'Edit Coach' : 'Add Coach'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>First Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.first_name}
                  onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                  placeholder="Enter first name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Last Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.last_name}
                  onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                  placeholder="Enter last name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Email *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Phone</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Profile Photo Path</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.profile_photo_path}
                  onChangeText={(text) => setFormData({ ...formData, profile_photo_path: text })}
                  placeholder="/images/users/coach.jpg"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
                <View style={styles.statusButtons}>
                  {['active', 'suspended'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        formData.status === status && { backgroundColor: theme.colors.interactive || '#DC143C' }
                      ]}
                      onPress={() => setFormData({ ...formData, status })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        formData.status === status && { color: '#FFFFFF' }
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textDark }]}>Cancel</Text>
              </TouchableOpacity>
              <LoadingButton
                title={editingCoach ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: baseTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: baseTheme.spacing.md,
  },
  coachItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  coachEmail: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  coachPhone: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  coachTeam: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  coachStatus: {
    ...baseTheme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  coachActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: baseTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: baseTheme.borderRadius.xl,
    borderTopRightRadius: baseTheme.borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: baseTheme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  form: {
    padding: baseTheme.spacing.lg,
  },
  inputGroup: {
    marginBottom: baseTheme.spacing.md,
  },
  label: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  input: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  statusButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.md,
    paddingHorizontal: baseTheme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
  },
});

export default CoachManagementScreen;

