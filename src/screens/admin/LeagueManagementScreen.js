import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchLeaguesAdmin, createLeague, updateLeague, deleteLeague } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const LeagueManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { triggerRefresh } = useRefresh();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLeague, setEditingLeague] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    start_date: '',
    end_date: '',
    description: '',
    logo_path: '',
    image_path: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchLeaguesAdmin();
      setLeagues(response.data?.leagues || []);
    } catch (error) {
      console.error('Error loading leagues:', error);
      showError('Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLeague(null);
    setFormData({
      name: '',
      season: '',
      start_date: '',
      end_date: '',
      description: '',
      logo_path: '',
      image_path: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (league) => {
    setEditingLeague(league);
    setFormData({
      name: league.name || '',
      season: league.season || '',
      start_date: league.start_date || '',
      end_date: league.end_date || '',
      description: league.description || '',
      logo_path: league.logo_path || '',
      image_path: league.image_path || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (league) => {
    Alert.alert(
      'Delete League',
      `Are you sure you want to delete ${league.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLeague(league.id);
              showSuccess('League deleted successfully');
              loadData();
              // Trigger global refresh so changes appear across the app
              triggerRefresh('leagues');
              triggerRefresh('matches'); // Leagues affect matches
            } catch (error) {
              showError(error.userMessage || 'Failed to delete league');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('League name is required');
      return;
    }

    try {
      setSaving(true);
      const leagueData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingLeague) {
        await updateLeague(editingLeague.id, leagueData);
        showSuccess('League updated successfully');
      } else {
        await createLeague(leagueData);
        showSuccess('League created successfully');
      }
      setModalVisible(false);
      loadData();
      // Trigger global refresh so changes appear across the app
      triggerRefresh('leagues');
      triggerRefresh('matches'); // Leagues affect matches
    } catch (error) {
      showError(error.userMessage || 'Failed to save league');
    } finally {
      setSaving(false);
    }
  };

  const renderLeagueItem = ({ item }) => (
    <View style={[styles.leagueItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.leagueInfo}>
        <Text style={[styles.leagueName, { color: theme.colors.textDark }]}>{item.name}</Text>
        {item.season && (
          <Text style={[styles.leagueSeason, { color: theme.colors.textSecondary }]}>{item.season}</Text>
        )}
        {item.start_date && item.end_date && (
          <Text style={[styles.leagueDates, { color: theme.colors.textSecondary }]}>
            {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.leagueActions}>
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
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Manage Leagues</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {leagues.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title="No leagues found"
          subtitle="Add your first league to get started"
          messageType="default"
          illustrationTone="brand"
        />
      ) : (
        <FlatList
          data={leagues}
          renderItem={renderLeagueItem}
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
                {editingLeague ? 'Edit League' : 'Add League'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>League Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter league name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Season</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.season}
                  onChangeText={(text) => setFormData({ ...formData, season: text })}
                  placeholder="e.g., 2024/2025"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Start Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.start_date}
                  onChangeText={(text) => setFormData({ ...formData, start_date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>End Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.end_date}
                  onChangeText={(text) => setFormData({ ...formData, end_date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="League description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Logo Path</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.logo_path}
                  onChangeText={(text) => setFormData({ ...formData, logo_path: text })}
                  placeholder="/images/leagues/logo.png"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Image Path</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.image_path}
                  onChangeText={(text) => setFormData({ ...formData, image_path: text })}
                  placeholder="/images/leagues/image.png"
                />
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
                title={editingLeague ? 'Update' : 'Create'}
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
  leagueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  leagueSeason: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  leagueDates: {
    ...baseTheme.typography.caption,
  },
  leagueActions: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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

export default LeagueManagementScreen;

