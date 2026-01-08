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
import { getCoachTeam, fetchTrainingSessions, createTrainingSession, updateTrainingSession, deleteTrainingSession } from '../../api/client.js';
import dayjs from '../../lib/dayjs.js';

const TrainingManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    session_date: '',
    session_time: '',
    session_type: 'regular',
    duration_minutes: '90',
    location: '',
    focus_areas: '',
    attendance: '',
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
        const sessionsRes = await fetchTrainingSessions(user.id);
        setSessions(sessionsRes.data?.sessions || []);
      } else {
        showError('No team assigned to your coach account');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load training sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSession(null);
    setFormData({
      session_date: '',
      session_time: '',
      session_type: 'regular',
      duration_minutes: '90',
      location: '',
      focus_areas: '',
      attendance: '',
      notes: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    const sessionDate = session.session_date ? new Date(session.session_date) : new Date();
    setFormData({
      session_date: dayjs(sessionDate).format('YYYY-MM-DD'),
      session_time: dayjs(sessionDate).format('HH:mm'),
      session_type: session.session_type || 'regular',
      duration_minutes: String(session.duration_minutes || 90),
      location: session.location || '',
      focus_areas: session.focus_areas || '',
      attendance: session.attendance || '',
      notes: session.notes || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (session) => {
    Alert.alert(
      'Delete Training Session',
      'Are you sure you want to delete this training session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrainingSession(session.id);
              showSuccess('Training session deleted');
              loadData();
            } catch (error) {
              showError('Failed to delete session');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.session_date || !formData.session_time) {
      showError('Session date and time are required');
      return;
    }

    try {
      setSaving(true);
      const sessionDateTime = `${formData.session_date}T${formData.session_time}:00`;
      const sessionData = {
        ...formData,
        team_id: team.id,
        coach_id: user?.id,
        session_date: sessionDateTime,
        duration_minutes: parseInt(formData.duration_minutes) || 90
      };

      if (editingSession) {
        await updateTrainingSession(editingSession.id, sessionData);
        showSuccess('Training session updated');
      } else {
        await createTrainingSession(sessionData);
        showSuccess('Training session created');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      showError(error.userMessage || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'tactical': return '#3B82F6';
      case 'fitness': return '#10B981';
      case 'recovery': return '#8B5CF6';
      case 'match_preparation': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderSessionItem = ({ item }) => {
    const sessionDate = item.session_date ? new Date(item.session_date) : null;
    
    return (
      <View style={[styles.sessionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionTitle, { color: theme.colors.textDark }]}>
              {item.session_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Training
            </Text>
            <Text style={[styles.sessionSubtitle, { color: theme.colors.textSecondary }]}>
              {sessionDate ? dayjs(sessionDate).format('MMM D, YYYY HH:mm') : 'Date TBD'}
            </Text>
            {item.location && (
              <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                📍 {item.location}
              </Text>
            )}
            <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
              ⏱ {item.duration_minutes} minutes
            </Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.session_type) }]}>
            <Text style={styles.typeText}>
              {item.session_type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        {item.focus_areas && (
          <Text style={[styles.focusText, { color: theme.colors.textDark }]}>
            Focus: {item.focus_areas}
          </Text>
        )}
        {item.notes && (
          <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
            {item.notes}
          </Text>
        )}
        <View style={styles.sessionActions}>
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
            Training Sessions
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>New Session</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon="fitness-outline"
              title="No Training Sessions"
              message="Schedule training sessions to improve your team's performance"
            />
          </View>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSessionItem}
            keyExtractor={(item) => `session-${item.id}`}
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
                {editingSession ? 'Edit' : 'Create'} Training Session
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Session Type</Text>
                <View style={styles.typeButtons}>
                  {['regular', 'tactical', 'fitness', 'recovery', 'match_preparation'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.session_type === type && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setFormData({ ...formData, session_type: type })}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        { color: formData.session_type === type ? '#FFFFFF' : theme.colors.textDark }
                      ]}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Session Date *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.session_date}
                  onChangeText={(text) => setFormData({ ...formData, session_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Session Time *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.session_time}
                  onChangeText={(text) => setFormData({ ...formData, session_time: text })}
                  placeholder="HH:MM (e.g., 10:00)"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Duration (minutes)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.duration_minutes}
                  onChangeText={(text) => setFormData({ ...formData, duration_minutes: text })}
                  placeholder="90"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Location</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="Training ground, stadium, etc."
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Focus Areas</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.focus_areas}
                  onChangeText={(text) => setFormData({ ...formData, focus_areas: text })}
                  placeholder="e.g., Passing, Shooting, Defensive positioning"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Attendance (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.attendance}
                  onChangeText={(text) => setFormData({ ...formData, attendance: text })}
                  placeholder="List players who attended"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Additional notes about the session"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <LoadingButton
                title={editingSession ? 'Update' : 'Create'}
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
  sessionCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  sessionSubtitle: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  locationText: {
    ...baseTheme.typography.bodySmall,
    fontSize: 12,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  durationText: {
    ...baseTheme.typography.bodySmall,
    fontSize: 12,
  },
  typeBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
  },
  typeText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
  },
  focusText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  notesText: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.sm,
    fontStyle: 'italic',
  },
  sessionActions: {
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
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  typeButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    fontSize: 11,
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.xl,
  },
});

export default TrainingManagementScreen;

