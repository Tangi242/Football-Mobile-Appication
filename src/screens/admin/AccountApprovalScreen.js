import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import { getPendingRegistrations, approveRegistration, rejectRegistration } from '../../api/client.js';
import { API_BASE_URL } from '../../config/constants.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { useRefresh } from '../../context/RefreshContext.js';
import EmptyState from '../../components/ui/EmptyState.js';

const AccountApprovalScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh, refreshKeys } = useRefresh();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPendingRegistrations();
      setRegistrations(response.data?.registrations || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      showError('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations, refreshKeys.users]);

  const handleApprove = async (registration) => {
    if (!user?.id) {
      showError('Admin authentication required');
      return;
    }

    Alert.alert(
      'Approve Account',
      `Are you sure you want to approve ${registration.full_name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessing(true);
              await approveRegistration(registration.id, user.id);
              showSuccess('Account approved successfully');
              loadRegistrations();
              triggerRefresh('users');
            } catch (error) {
              showError(error.userMessage || 'Failed to approve account');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = (registration) => {
    setSelectedRegistration(registration);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    if (!user?.id) {
      showError('Admin authentication required');
      return;
    }

    try {
      setProcessing(true);
      await rejectRegistration(selectedRegistration.id, user.id, rejectionReason.trim());
      showSuccess('Account rejected');
      setRejectModalVisible(false);
      setSelectedRegistration(null);
      setRejectionReason('');
      loadRegistrations();
      triggerRefresh('users');
    } catch (error) {
      showError(error.userMessage || 'Failed to reject account');
    } finally {
      setProcessing(false);
    }
  };

  const openDocument = (path) => {
    if (path) {
      const url = `${API_BASE_URL}${path}`;
      Linking.openURL(url).catch(err => {
        console.error('Error opening document:', err);
        showError('Failed to open document');
      });
    }
  };

  const renderRegistrationItem = ({ item }) => {
    const roleLabel = item.role === 'referee' ? 'Referee' : 'Club Manager';
    const roleIcon = item.role === 'referee' ? 'flag-outline' : 'people-outline';

    return (
      <View style={[styles.registrationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.registrationHeader}>
          <View style={[styles.roleIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name={roleIcon} size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.registrationInfo}>
            <Text style={[styles.registrationName, { color: theme.colors.textDark }]}>{item.full_name}</Text>
            <Text style={[styles.registrationRole, { color: theme.colors.textSecondary }]}>{roleLabel}</Text>
            <Text style={[styles.registrationEmail, { color: theme.colors.textSecondary }]}>{item.email}</Text>
            {item.phone && (
              <Text style={[styles.registrationPhone, { color: theme.colors.textSecondary }]}>{item.phone}</Text>
            )}
            <Text style={[styles.registrationDate, { color: theme.colors.textMuted }]}>
              Registered: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.documentsSection}>
          <Text style={[styles.documentsTitle, { color: theme.colors.textDark }]}>Documents:</Text>
          
          {item.id_document_path && (
            <TouchableOpacity
              style={[styles.documentButton, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}
              onPress={() => openDocument(item.id_document_path)}
            >
              <Ionicons name="document-text" size={20} color={theme.colors.primary} />
              <Text style={[styles.documentText, { color: theme.colors.textDark }]}>View ID Document</Text>
              <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {item.role === 'referee' && item.referee_license_path && (
            <TouchableOpacity
              style={[styles.documentButton, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}
              onPress={() => openDocument(item.referee_license_path)}
            >
              <Ionicons name="document-text" size={20} color={theme.colors.primary} />
              <Text style={[styles.documentText, { color: theme.colors.textDark }]}>View Referee License</Text>
              <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.approveButton, { backgroundColor: theme.colors.success || '#10B981' }]}
            onPress={() => handleApprove(item)}
            disabled={processing}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: theme.colors.error }]}
            onPress={() => handleReject(item)}
            disabled={processing}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Account Approvals</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Review and approve pending account registrations
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : registrations.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="No Pending Approvals"
            message="All account registrations have been processed."
          />
        ) : (
          <FlatList
            data={registrations}
            renderItem={renderRegistrationItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={loadRegistrations}
          />
        )}

        {/* Rejection Modal */}
        <Modal
          visible={rejectModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>Reject Account</Text>
                <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textDark} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                Please provide a reason for rejecting {selectedRegistration?.full_name}'s account:
              </Text>

              <TextInput
                style={[styles.reasonInput, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                placeholder="Enter rejection reason..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                value={rejectionReason}
                onChangeText={setRejectionReason}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setRejectModalVisible(false);
                    setRejectionReason('');
                    setSelectedRegistration(null);
                  }}
                >
                  <Text style={[styles.modalCancelText, { color: theme.colors.textDark }]}>Cancel</Text>
                </TouchableOpacity>
                <LoadingButton
                  title="Reject Account"
                  onPress={submitRejection}
                  loading={processing}
                  style={[styles.modalRejectButton, { backgroundColor: theme.colors.error }]}
                  textStyle={{ color: '#FFFFFF' }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseTheme.colors.backgroundLight,
  },
  header: {
    padding: baseTheme.spacing.lg,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
    ...baseTheme.shadows.sm,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  headerSubtitle: {
    ...baseTheme.typography.bodySmall,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: baseTheme.spacing.md,
  },
  registrationCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  registrationHeader: {
    flexDirection: 'row',
    marginBottom: baseTheme.spacing.md,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: baseTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: baseTheme.spacing.md,
  },
  registrationInfo: {
    flex: 1,
  },
  registrationName: {
    ...baseTheme.typography.h4,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  registrationRole: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  registrationEmail: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  registrationPhone: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  registrationDate: {
    ...baseTheme.typography.caption,
    fontSize: 11,
    marginTop: baseTheme.spacing.xs / 2,
  },
  documentsSection: {
    marginTop: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: baseTheme.colors.border,
  },
  documentsTitle: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.sm,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    marginBottom: baseTheme.spacing.sm,
    gap: baseTheme.spacing.sm,
  },
  documentText: {
    ...baseTheme.typography.bodySmall,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.md,
    marginTop: baseTheme.spacing.md,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.sm,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.sm,
  },
  actionButtonText: {
    ...baseTheme.typography.body,
    color: baseTheme.colors.white,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: baseTheme.borderRadius.lg,
    padding: baseTheme.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.lg,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    ...baseTheme.typography.body,
    marginBottom: baseTheme.spacing.md,
  },
  reasonInput: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: baseTheme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  modalRejectButton: {
    flex: 1,
  },
});

export default AccountApprovalScreen;

