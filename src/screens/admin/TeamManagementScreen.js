import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchTeams, createTeam, updateTeam, deleteTeam, uploadFile } from '../../api/client.js';
import { fetchLeagues, fetchCoaches } from '../../api/client.js';
import { API_BASE_URL } from '../../config/constants.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { useRefresh } from '../../context/RefreshContext.js';
import EmptyState from '../../components/ui/EmptyState.js';

const TeamManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { triggerRefresh } = useRefresh();
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    league_id: null,
    manager_id: null,
    founded_year: '',
    logo_path: '',
    status: 'pending',
    stadium_id: '',
    primary_color: '#0066CC',
    secondary_color: '#FFFFFF'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsRes, leaguesRes, coachesRes] = await Promise.all([
        fetchTeams(),
        fetchLeagues(),
        fetchCoaches()
      ]);
      setTeams(teamsRes.data?.teams || []);
      setLeagues(leaguesRes.data?.leagues || []);
      setCoaches(coachesRes.data?.coaches || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      code: '',
      league_id: null,
      manager_id: null,
      founded_year: '',
      logo_path: '',
      status: 'pending',
      stadium_id: '',
      primary_color: '#0066CC',
      secondary_color: '#FFFFFF'
    });
    setSelectedLogo(null);
    setModalVisible(true);
  };

  const pickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedLogo(asset.uri);
        setUploading(true);
        
        try {
          const uploadResult = await uploadFile(asset.uri, 'teams', `team_logo_${Date.now()}.jpg`);
          if (uploadResult.success && uploadResult.file) {
            setFormData({ ...formData, logo_path: uploadResult.file.path });
            showSuccess('Logo uploaded successfully');
          } else {
            showError('Failed to upload logo');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          showError(uploadError.userMessage || 'Failed to upload logo');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      showError('Failed to pick logo');
      setUploading(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
      code: team.code || '',
      league_id: team.league_id || null,
      manager_id: team.manager_id || null,
      founded_year: team.founded_year?.toString() || '',
      logo_path: team.logo_path || '',
      status: team.status || 'pending',
      stadium_id: team.stadium_id || '',
      primary_color: team.primary_color || '#0066CC',
      secondary_color: team.secondary_color || '#FFFFFF'
    });
    setSelectedLogo(team.logo_path ? `${API_BASE_URL}${team.logo_path}` : null);
    setModalVisible(true);
  };

  const handleDelete = (team) => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete ${team.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTeam(team.id);
              showSuccess('Team deleted successfully');
              loadData();
              // Trigger global refresh so changes appear across the app
              triggerRefresh('teams');
              triggerRefresh('matches'); // Teams affect matches
            } catch (error) {
              showError(error.userMessage || 'Failed to delete team');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Team name is required');
      return;
    }

    try {
      setSaving(true);
      const teamData = {
        ...formData,
        league_id: formData.league_id || null,
        manager_id: formData.manager_id || null,
        stadium_id: formData.stadium_id ? parseInt(formData.stadium_id) : null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null
      };

      if (editingTeam) {
        await updateTeam(editingTeam.id, teamData);
        showSuccess('Team updated successfully');
      } else {
        await createTeam(teamData);
        showSuccess('Team created successfully');
      }
      setModalVisible(false);
      loadData();
      // Trigger global refresh so changes appear across the app
      triggerRefresh('teams');
      triggerRefresh('matches'); // Teams affect matches
    } catch (error) {
      showError(error.userMessage || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const renderTeamItem = ({ item }) => {
    const assignedCoach = coaches.find(c => c.id === item.manager_id);
    const assignedLeague = leagues.find(l => l.id === item.league_id);
    
    return (
      <View style={[styles.teamItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: theme.colors.textDark }]}>{item.name}</Text>
          <Text style={[styles.teamCode, { color: theme.colors.textSecondary }]}>{item.code || 'N/A'}</Text>
          {assignedLeague && (
            <Text style={[styles.teamMeta, { color: theme.colors.textSecondary }]}>
              League: {assignedLeague.name}
            </Text>
          )}
          {assignedCoach && (
            <Text style={[styles.teamMeta, { color: theme.colors.textSecondary }]}>
              Coach: {assignedCoach.full_name || `${assignedCoach.first_name} ${assignedCoach.last_name}`}
            </Text>
          )}
          <Text style={[styles.teamStatus, { color: item.status === 'approved' ? '#10B981' : '#F59E0B' }]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.teamActions}>
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
  };

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
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Manage Teams</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {teams.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No teams found"
          subtitle="Add your first team to get started"
          messageType="default"
          illustrationTone="brand"
        />
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
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
                {editingTeam ? 'Edit Team' : 'Add Team'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Team Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter team name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Team Code</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.code}
                  onChangeText={(text) => setFormData({ ...formData, code: text })}
                  placeholder="e.g., AS"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>League *</Text>
                <View style={styles.selectContainer}>
                  {leagues.map((league) => (
                    <TouchableOpacity
                      key={`league-${league.id}`}
                      style={[
                        styles.selectOption,
                        formData.league_id === league.id && { backgroundColor: theme.colors.interactive || '#DC143C', borderColor: theme.colors.interactive || '#DC143C' },
                        { borderColor: theme.colors.border }
                      ]}
                      onPress={() => setFormData({ ...formData, league_id: league.id })}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        formData.league_id === league.id && { color: '#FFFFFF' },
                        { color: theme.colors.textDark }
                      ]}>
                        {league.name}
                      </Text>
                      {formData.league_id === league.id && (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    key="league-none"
                    style={[
                      styles.selectOption,
                      formData.league_id === null && { backgroundColor: theme.colors.interactive || '#DC143C', borderColor: theme.colors.interactive || '#DC143C' },
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setFormData({ ...formData, league_id: null })}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      formData.league_id === null && { color: '#FFFFFF' },
                      { color: theme.colors.textDark }
                    ]}>
                      No League
                    </Text>
                    {formData.league_id === null && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Assign Coach</Text>
                <View style={styles.selectContainer}>
                  {coaches.map((coach) => (
                    <TouchableOpacity
                      key={`coach-${coach.id}`}
                      style={[
                        styles.selectOption,
                        formData.manager_id === coach.id && { backgroundColor: theme.colors.interactive || '#DC143C', borderColor: theme.colors.interactive || '#DC143C' },
                        { borderColor: theme.colors.border }
                      ]}
                      onPress={() => setFormData({ ...formData, manager_id: coach.id })}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        formData.manager_id === coach.id && { color: '#FFFFFF' },
                        { color: theme.colors.textDark }
                      ]}>
                        {coach.full_name || `${coach.first_name} ${coach.last_name}`}
                        {coach.team_name && ` (${coach.team_name})`}
                      </Text>
                      {formData.manager_id === coach.id && (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    key="coach-none"
                    style={[
                      styles.selectOption,
                      formData.manager_id === null && { backgroundColor: theme.colors.interactive || '#DC143C', borderColor: theme.colors.interactive || '#DC143C' },
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setFormData({ ...formData, manager_id: null })}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      formData.manager_id === null && { color: '#FFFFFF' },
                      { color: theme.colors.textDark }
                    ]}>
                      No Coach
                    </Text>
                    {formData.manager_id === null && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Founded Year</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.founded_year}
                  onChangeText={(text) => setFormData({ ...formData, founded_year: text })}
                  placeholder="e.g., 1962"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
                <View style={styles.statusButtons}>
                  {['pending', 'approved', 'suspended'].map((status) => (
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

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Team Logo</Text>
                {selectedLogo && (
                  <View style={styles.imagePreview}>
                    <Image 
                      source={{ uri: selectedLogo }} 
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => {
                        setSelectedLogo(null);
                        setFormData({ ...formData, logo_path: '' });
                      }}
                    >
                      <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
                {formData.logo_path && !selectedLogo && (
                  <View style={styles.imagePreview}>
                    <Image 
                      source={{ uri: `${API_BASE_URL}${formData.logo_path}` }} 
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => {
                        setFormData({ ...formData, logo_path: '' });
                      }}
                    >
                      <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: theme.colors.interactive || '#DC143C', opacity: uploading ? 0.6 : 1 }]}
                  onPress={pickLogo}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Upload Logo</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textDark }]}>Cancel</Text>
              </TouchableOpacity>
              <LoadingButton
                title={editingTeam ? 'Update' : 'Create'}
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
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  teamCode: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  teamMeta: {
    ...baseTheme.typography.bodySmall,
    fontSize: 11,
    marginTop: baseTheme.spacing.xs / 2,
    fontStyle: 'italic',
  },
  teamStatus: {
    ...baseTheme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  teamActions: {
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
  selectContainer: {
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.xs,
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  selectOptionText: {
    ...baseTheme.typography.body,
    flex: 1,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: baseTheme.spacing.sm,
    alignItems: 'center',
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: baseTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...baseTheme.shadows.sm,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.sm,
  },
  uploadButtonText: {
    ...baseTheme.typography.body,
    color: baseTheme.colors.white,
    fontWeight: '600',
  },
});

export default TeamManagementScreen;

