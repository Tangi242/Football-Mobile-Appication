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
import { getCoachTeam, fetchTeams, fetchStadiums, fetchFriendlyFixtures, createFriendlyFixture, updateFriendlyFixture, deleteFriendlyFixture } from '../../api/client.js';
import dayjs from '../../lib/dayjs.js';

const FriendlyFixtureScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    away_team_id: null,
    match_date: '',
    match_time: '',
    venue_id: null,
    venue_name: '',
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
        const [teamsRes, stadiumsRes, fixturesRes] = await Promise.all([
          fetchTeams(),
          fetchStadiums(),
          fetchFriendlyFixtures(user.id)
        ]);
        setTeams(teamsRes.data?.teams || []);
        setStadiums(stadiumsRes.data?.stadiums || []);
        setFixtures(fixturesRes.data?.fixtures || []);
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

  const handleAdd = () => {
    setEditingFixture(null);
    setFormData({
      away_team_id: null,
      match_date: '',
      match_time: '',
      venue_id: null,
      venue_name: '',
      notes: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (fixture) => {
    setEditingFixture(fixture);
    const matchDate = fixture.match_date ? new Date(fixture.match_date) : new Date();
    setFormData({
      away_team_id: fixture.away_team_id,
      match_date: dayjs(matchDate).format('YYYY-MM-DD'),
      match_time: dayjs(matchDate).format('HH:mm'),
      venue_id: fixture.venue_id || null,
      venue_name: fixture.venue_name || '',
      notes: fixture.notes || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (fixture) => {
    Alert.alert(
      'Delete Friendly Fixture',
      'Are you sure you want to delete this friendly fixture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFriendlyFixture(fixture.id);
              showSuccess('Friendly fixture deleted');
              loadData();
              triggerRefresh('matches');
            } catch (error) {
              showError('Failed to delete fixture');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.away_team_id) {
      showError('Please select an opponent team');
      return;
    }
    if (!formData.match_date || !formData.match_time) {
      showError('Match date and time are required');
      return;
    }

    try {
      setSaving(true);
      const matchDateTime = `${formData.match_date}T${formData.match_time}:00`;
      const fixtureData = {
        ...formData,
        home_team_id: team.id,
        match_date: matchDateTime,
        created_by_coach_id: user?.id,
        venue_id: formData.venue_id || null,
        venue_name: formData.venue_name || null
      };

      if (editingFixture) {
        await updateFriendlyFixture(editingFixture.id, fixtureData);
        showSuccess('Friendly fixture updated');
      } else {
        await createFriendlyFixture(fixtureData);
        showSuccess('Friendly fixture created');
      }
      setModalVisible(false);
      loadData();
      triggerRefresh('matches');
    } catch (error) {
      showError(error.userMessage || 'Failed to save fixture');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  const renderFixtureItem = ({ item }) => {
    const awayTeam = teams.find(t => t.id === item.away_team_id);
    const matchDate = item.match_date ? new Date(item.match_date) : null;
    
    return (
      <View style={[styles.fixtureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.fixtureHeader}>
          <View style={styles.fixtureInfo}>
            <Text style={[styles.fixtureTitle, { color: theme.colors.textDark }]}>
              {team?.name} vs {awayTeam?.name || 'Unknown Team'}
            </Text>
            <Text style={[styles.fixtureSubtitle, { color: theme.colors.textSecondary }]}>
              {matchDate ? dayjs(matchDate).format('MMM D, YYYY HH:mm') : 'Date TBD'}
            </Text>
            {item.venue_name && (
              <Text style={[styles.venueText, { color: theme.colors.textSecondary }]}>
                📍 {item.venue_name}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>
        {item.home_score !== null && item.away_score !== null && (
          <Text style={[styles.scoreText, { color: theme.colors.textDark }]}>
            {item.home_score} - {item.away_score}
          </Text>
        )}
        {item.notes && (
          <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
            {item.notes}
          </Text>
        )}
        <View style={styles.fixtureActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF4444' + '20' }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Friendly Fixtures
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>New Fixture</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : fixtures.length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon="calendar-outline"
              title="No Friendly Fixtures"
              message="Create friendly matches with other teams to prepare for competitions"
            />
          </View>
        ) : (
          <FlatList
            data={fixtures}
            renderItem={renderFixtureItem}
            keyExtractor={(item) => `fixture-${item.id}`}
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
                {editingFixture ? 'Edit' : 'Create'} Friendly Fixture
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Opponent Team *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {teams.filter(t => t.id !== team?.id).map((teamItem) => (
                    <TouchableOpacity
                      key={teamItem.id}
                      style={[
                        styles.teamCard,
                        formData.away_team_id === teamItem.id && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                      ]}
                      onPress={() => setFormData({ ...formData, away_team_id: teamItem.id })}
                    >
                      <Text style={[styles.teamCardText, { color: theme.colors.textDark }]}>
                        {teamItem.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Match Date *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.match_date}
                  onChangeText={(text) => setFormData({ ...formData, match_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Match Time *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.match_time}
                  onChangeText={(text) => setFormData({ ...formData, match_time: text })}
                  placeholder="HH:MM (e.g., 15:00)"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Venue (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.venue_name}
                  onChangeText={(text) => setFormData({ ...formData, venue_name: text })}
                  placeholder="Enter venue name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Add any additional notes"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <LoadingButton
                title={editingFixture ? 'Update' : 'Create'}
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
  fixtureCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  fixtureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.sm,
  },
  fixtureInfo: {
    flex: 1,
  },
  fixtureTitle: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  fixtureSubtitle: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  venueText: {
    ...baseTheme.typography.bodySmall,
    fontSize: 12,
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
  scoreText: {
    ...baseTheme.typography.h3,
    fontSize: 24,
    fontWeight: '700',
    marginVertical: baseTheme.spacing.sm,
    textAlign: 'center',
  },
  notesText: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.sm,
    fontStyle: 'italic',
  },
  fixtureActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.sm,
    paddingTop: baseTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: baseTheme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  actionText: {
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
    minHeight: 80,
    textAlignVertical: 'top',
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
  saveButton: {
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.xl,
  },
});

export default FriendlyFixtureScreen;

