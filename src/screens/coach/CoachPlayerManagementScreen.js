import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import { getCoachTeam, getCoachPlayers, createCoachPlayer, updateCoachPlayer, deleteCoachPlayer } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const CoachPlayerManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    nationality: '',
    position: '',
    jersey_number: '',
    status: 'active',
    availability_status: 'available',
    injury_details: '',
    suspension_end_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const teamRes = await getCoachTeam(user?.id);
      if (teamRes.data?.team) {
        setTeam(teamRes.data.team);
        const playersRes = await getCoachPlayers(user?.id);
        setPlayers(playersRes.data?.players || []);
      } else {
        showError('No team assigned to your coach account');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load team and players');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPlayer(null);
    setFormData({
      first_name: '',
      last_name: '',
      dob: '',
      nationality: '',
      position: '',
      jersey_number: '',
      status: 'active',
      availability_status: 'available',
      injury_details: '',
      suspension_end_date: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      first_name: player.first_name || '',
      last_name: player.last_name || '',
      dob: player.dob ? player.dob.split('T')[0] : '',
      nationality: player.nationality || '',
      position: player.position || '',
      jersey_number: player.jersey_number || '',
      status: player.status || 'active',
      availability_status: player.availability_status || 'available',
      injury_details: player.injury_details || '',
      suspension_end_date: player.suspension_end_date ? player.suspension_end_date.split('T')[0] : ''
    });
    setModalVisible(true);
  };

  const handleDelete = (player) => {
    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete ${player.first_name} ${player.last_name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCoachPlayer(player.id, user?.id);
              showSuccess('Player deleted successfully');
              loadData();
              triggerRefresh('teams');
            } catch (error) {
              showError(error.userMessage || 'Failed to delete player');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showError('First name and last name are required');
      return;
    }

    try {
      setSaving(true);
      if (editingPlayer) {
        await updateCoachPlayer(editingPlayer.id, user?.id, formData);
        showSuccess('Player updated successfully');
      } else {
        await createCoachPlayer(user?.id, formData);
        showSuccess('Player added successfully');
      }
      setModalVisible(false);
      loadData();
      triggerRefresh('teams');
    } catch (error) {
      showError(error.userMessage || 'Failed to save player');
    } finally {
      setSaving(false);
    }
  };

  const renderPlayerItem = ({ item }) => (
    <View style={[styles.playerItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: theme.colors.textDark }]}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={[styles.playerDetails, { color: theme.colors.textSecondary }]}>
          {item.position || 'No position'} • #{item.jersey_number || 'N/A'} • {item.status}
        </Text>
        {item.availability_status && item.availability_status !== 'available' && (
          <View style={[styles.availabilityBadge, { 
            backgroundColor: item.availability_status === 'injured' ? '#F59E0B' : 
                           item.availability_status === 'suspended' ? '#EF4444' : '#6B7280'
          }]}>
            <Text style={styles.availabilityText}>
              {item.availability_status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.playerActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!team) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="people-outline"
          title="No Team Assigned"
          message="You don't have a team assigned to your coach account. Please contact an administrator."
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>{team.name} Players</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Manage your team's players
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {players.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Players"
            message="You haven't added any players to your team yet. Tap the + button to add your first player."
          />
        ) : (
          <FlatList
            data={players}
            renderItem={renderPlayerItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadData}
          />
        )}

        {/* Add/Edit Player Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                    {editingPlayer ? 'Edit Player' : 'Add Player'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.textDark} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>First Name *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.first_name}
                      onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                      placeholder="Enter first name"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Last Name *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.last_name}
                      onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                      placeholder="Enter last name"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Date of Birth</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.dob}
                      onChangeText={(text) => setFormData({ ...formData, dob: text })}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Nationality</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.nationality}
                      onChangeText={(text) => setFormData({ ...formData, nationality: text })}
                      placeholder="Enter nationality"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Position</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.position}
                      onChangeText={(text) => setFormData({ ...formData, position: text })}
                      placeholder="e.g., Forward, Midfielder, Defender, Goalkeeper"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Jersey Number</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.jersey_number}
                      onChangeText={(text) => setFormData({ ...formData, jersey_number: text })}
                      placeholder="Enter jersey number"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
                    <View style={styles.statusButtons}>
                      {['active', 'injured', 'suspended'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            formData.status === status && { backgroundColor: theme.colors.primary }
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

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Availability Status</Text>
                    <View style={styles.statusButtons}>
                      {['available', 'injured', 'suspended', 'unavailable'].map((avail) => (
                        <TouchableOpacity
                          key={avail}
                          style={[
                            styles.statusButton,
                            formData.availability_status === avail && { backgroundColor: theme.colors.primary }
                          ]}
                          onPress={() => setFormData({ ...formData, availability_status: avail })}
                        >
                          <Text style={[
                            styles.statusButtonText,
                            formData.availability_status === avail && { color: '#FFFFFF' }
                          ]}>
                            {avail.charAt(0).toUpperCase() + avail.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {formData.availability_status === 'injured' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Injury Details</Text>
                      <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                        value={formData.injury_details}
                        onChangeText={(text) => setFormData({ ...formData, injury_details: text })}
                        placeholder="Describe the injury"
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  )}

                  {formData.availability_status === 'suspended' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Suspension End Date</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                        value={formData.suspension_end_date}
                        onChangeText={(text) => setFormData({ ...formData, suspension_end_date: text })}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  )}

                  <LoadingButton
                    title={editingPlayer ? 'Update Player' : 'Add Player'}
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
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
    padding: baseTheme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: baseTheme.spacing.lg,
  },
  headerTitle: {
    ...baseTheme.typography.h2,
    fontWeight: '800',
    marginBottom: baseTheme.spacing.xs,
  },
  headerSubtitle: {
    ...baseTheme.typography.bodySmall,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...baseTheme.shadows.md,
  },
  list: {
    paddingBottom: baseTheme.spacing.lg,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  playerInfo: {
    flex: 1,
    marginRight: baseTheme.spacing.md,
  },
  playerName: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  playerDetails: {
    ...baseTheme.typography.caption,
  },
  playerActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: baseTheme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.lg,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '800',
  },
  form: {
    gap: baseTheme.spacing.md,
  },
  inputGroup: {
    marginBottom: baseTheme.spacing.md,
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
  statusButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  statusButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
  },
  availabilityBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
    marginTop: baseTheme.spacing.xs / 2,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default CoachPlayerManagementScreen;

