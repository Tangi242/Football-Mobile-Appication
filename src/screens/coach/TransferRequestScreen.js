import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { getCoachTeam, getCoachPlayers, fetchTeams, createTransferRequest, fetchTransferRequests, cancelTransferRequest } from '../../api/client.js';

const TransferRequestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    player_id: null,
    to_team_id: null,
    request_type: 'permanent',
    transfer_fee: '',
    notes: ''
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const teamRes = await getCoachTeam(user.id);
      if (teamRes.data?.team) {
        setTeam(teamRes.data.team);
        const [playersRes, teamsRes, requestsRes] = await Promise.all([
          getCoachPlayers(user.id),
          fetchTeams(),
          fetchTransferRequests(user.id)
        ]);
        setPlayers(playersRes.data?.players || []);
        setTeams(teamsRes.data?.teams || []);
        setTransferRequests(requestsRes.data?.requests || []);
      } else {
        showError('No team assigned to your coach account');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransfer = () => {
    if (!formData.player_id) {
      showError('Please select a player');
      return;
    }
    if (!formData.to_team_id) {
      showError('Please select a destination team');
      return;
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.player_id || !formData.to_team_id) {
      showError('Player and destination team are required');
      return;
    }

    try {
      setSaving(true);
      await createTransferRequest({
        ...formData,
        from_team_id: team.id,
        requested_by_coach_id: user?.id,
        transfer_fee: formData.transfer_fee ? parseFloat(formData.transfer_fee) : null
      });
      showSuccess('Transfer request submitted successfully');
      setModalVisible(false);
      setFormData({
        player_id: null,
        to_team_id: null,
        request_type: 'permanent',
        transfer_fee: '',
        notes: ''
      });
      loadData();
      triggerRefresh('teams');
    } catch (error) {
      showError(error.userMessage || 'Failed to submit transfer request');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (requestId) => {
    Alert.alert(
      'Cancel Transfer Request',
      'Are you sure you want to cancel this transfer request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelTransferRequest(requestId, user.id);
              showSuccess('Transfer request cancelled');
              loadData();
            } catch (error) {
              showError('Failed to cancel request');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#F59E0B';
    }
  };

  const renderRequestItem = ({ item }) => {
    const player = players.find(p => p.id === item.player_id);
    const toTeam = teams.find(t => t.id === item.to_team_id);
    
    return (
      <View style={[styles.requestCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text style={[styles.requestTitle, { color: theme.colors.textDark }]}>
              {player ? `${player.first_name} ${player.last_name}` : 'Unknown Player'}
            </Text>
            <Text style={[styles.requestSubtitle, { color: theme.colors.textSecondary }]}>
              To: {toTeam?.name || 'Unknown Team'} • {item.request_type}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>
        {item.transfer_fee && (
          <Text style={[styles.feeText, { color: theme.colors.textSecondary }]}>
            Transfer Fee: N${item.transfer_fee}
          </Text>
        )}
        {item.notes && (
          <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
            {item.notes}
          </Text>
        )}
        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
          Requested: {new Date(item.requested_at).toLocaleDateString()}
        </Text>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#EF4444' + '20' }]}
            onPress={() => handleCancel(item.id)}
          >
            <Ionicons name="close-circle" size={18} color="#EF4444" />
            <Text style={[styles.cancelButtonText, { color: '#EF4444' }]}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Transfer Requests
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleRequestTransfer}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Request Transfer</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : transferRequests.length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon="swap-horizontal-outline"
              title="No Transfer Requests"
              message="Request player transfers to other teams. Administrators will review and approve requests."
            />
          </View>
        ) : (
          <FlatList
            data={transferRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => `request-${item.id}`}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadData}
          />
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <ScreenWrapper>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                Request Player Transfer
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Player *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {players.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={[
                        styles.playerCard,
                        formData.player_id === player.id && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                      ]}
                      onPress={() => setFormData({ ...formData, player_id: player.id })}
                    >
                      <Text style={[styles.playerCardText, { color: theme.colors.textDark }]}>
                        {player.first_name} {player.last_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Destination Team *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {teams.filter(t => t.id !== team?.id).map((teamItem) => (
                    <TouchableOpacity
                      key={teamItem.id}
                      style={[
                        styles.teamCard,
                        formData.to_team_id === teamItem.id && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                      ]}
                      onPress={() => setFormData({ ...formData, to_team_id: teamItem.id })}
                    >
                      <Text style={[styles.teamCardText, { color: theme.colors.textDark }]}>
                        {teamItem.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Transfer Type</Text>
                <View style={styles.typeButtons}>
                  {['permanent', 'loan', 'trial'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.request_type === type && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setFormData({ ...formData, request_type: type })}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        { color: formData.request_type === type ? '#FFFFFF' : theme.colors.textDark }
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Transfer Fee (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.transfer_fee}
                  onChangeText={(text) => setFormData({ ...formData, transfer_fee: text })}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Add any additional notes about this transfer request"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <LoadingButton
                title="Submit Request"
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </ScrollView>
          </ScreenWrapper>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  addButtonText: {
    ...baseTheme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    padding: baseTheme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.sm,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  requestSubtitle: {
    ...baseTheme.typography.bodySmall,
  },
  statusBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
  },
  statusText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
  },
  feeText: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  notesText: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs,
    fontStyle: 'italic',
  },
  dateText: {
    ...baseTheme.typography.caption,
    fontSize: 11,
    marginBottom: baseTheme.spacing.sm,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
    marginTop: baseTheme.spacing.sm,
  },
  cancelButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: baseTheme.spacing.md,
  },
  formGroup: {
    marginBottom: baseTheme.spacing.lg,
  },
  label: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  input: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  playerCard: {
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    marginRight: baseTheme.spacing.sm,
    minWidth: 120,
  },
  playerCardText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  teamCard: {
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    marginRight: baseTheme.spacing.sm,
    minWidth: 120,
  },
  teamCardText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  typeButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.xl,
  },
});

export default TransferRequestScreen;

