import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Picker } from 'react-native';
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
import { fetchFixtures, fetchResults } from '../../api/client.js';

const LiveCommentaryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [eventData, setEventData] = useState({
    event_type: 'goal',
    minute_mark: '',
    player_id: null,
    assisting_player_id: null,
    description: '',
    commentary: ''
  });

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = async () => {
    try {
      setLoading(true);
      const [fixturesRes, resultsRes] = await Promise.all([
        fetchFixtures(),
        fetchResults()
      ]);
      const allMatches = [
        ...(fixturesRes.data?.fixtures || []),
        ...(resultsRes.data?.results || [])
      ].filter(m => m.status === 'live' || m.status === 'in_progress' || m.status === 'scheduled');
      setMatches(allMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      showError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const loadMatchEvents = async (matchId) => {
    try {
      const response = await fetchMatchEvents(matchId);
      setEvents(response.data?.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (selectedMatch) {
      loadMatchEvents(selectedMatch.id);
    }
  }, [selectedMatch]);

  const handleAddEvent = () => {
    if (!selectedMatch) {
      showError('Please select a match first');
      return;
    }
    setEventData({
      event_type: 'goal',
      minute_mark: '',
      player_id: null,
      assisting_player_id: null,
      description: '',
      commentary: ''
    });
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!eventData.minute_mark) {
      showError('Minute mark is required');
      return;
    }
    if (!eventData.description.trim()) {
      showError('Description is required');
      return;
    }

    try {
      setSaving(true);
      await createMatchEvent(selectedMatch.id, {
        ...eventData,
        journalist_id: user?.id
      });
      showSuccess('Event added successfully');
      setModalVisible(false);
      loadMatchEvents(selectedMatch.id);
      triggerRefresh('matches');
    } catch (error) {
      showError('Failed to add event');
    } finally {
      setSaving(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'goal': return 'football';
      case 'yellow_card': return 'warning';
      case 'red_card': return 'close-circle';
      case 'substitution': return 'swap-horizontal';
      default: return 'ellipse';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'goal': return '#10B981';
      case 'yellow_card': return '#FBBF24';
      case 'red_card': return '#EF4444';
      case 'substitution': return '#3B82F6';
      default: return theme.colors.textSecondary;
    }
  };

  const renderEvent = ({ item }) => (
    <View style={[styles.eventItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.eventIcon, { backgroundColor: getEventColor(item.event_type) + '20' }]}>
        <Ionicons name={getEventIcon(item.event_type)} size={20} color={getEventColor(item.event_type)} />
      </View>
      <View style={styles.eventInfo}>
        <Text style={[styles.eventMinute, { color: theme.colors.textDark }]}>
          {item.minute_mark}'
        </Text>
        <Text style={[styles.eventDescription, { color: theme.colors.textDark }]}>
          {item.description}
        </Text>
        {item.commentary && (
          <Text style={[styles.eventCommentary, { color: theme.colors.textSecondary }]}>
            {item.commentary}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Live Match Commentary
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddEvent}
            disabled={!selectedMatch}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.matchSelector}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Select Match</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                style={[
                  styles.matchCard,
                  selectedMatch?.id === match.id && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                ]}
                onPress={() => setSelectedMatch(match)}
              >
                <Text style={[styles.matchText, { color: theme.colors.textDark }]} numberOfLines={2}>
                  {match.home_team} vs {match.away_team}
                </Text>
                <Text style={[styles.matchDate, { color: theme.colors.textSecondary }]}>
                  {new Date(match.match_date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedMatch ? (
          <View style={styles.eventsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>
              Match Events
            </Text>
            {events.length === 0 ? (
              <EmptyState
                icon="football-outline"
                title="No events yet"
                message="Add match events like goals, cards, and substitutions"
              />
            ) : (
              <FlatList
                data={events}
                renderItem={renderEvent}
                keyExtractor={(item) => `event-${item.id}`}
                contentContainerStyle={styles.eventsList}
              />
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="football-outline"
              title="Select a match"
              message="Choose a match from above to start adding live commentary and events"
            />
          </View>
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
                Add Match Event
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Event Type *</Text>
                <View style={styles.eventTypeButtons}>
                  {['goal', 'yellow_card', 'red_card', 'substitution'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.eventTypeButton,
                        eventData.event_type === type && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setEventData({ ...eventData, event_type: type })}
                    >
                      <Ionicons 
                        name={getEventIcon(type)} 
                        size={20} 
                        color={eventData.event_type === type ? '#FFFFFF' : theme.colors.textDark} 
                      />
                      <Text style={[
                        styles.eventTypeText,
                        { color: eventData.event_type === type ? '#FFFFFF' : theme.colors.textDark }
                      ]}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Minute *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={eventData.minute_mark}
                  onChangeText={(text) => setEventData({ ...eventData, minute_mark: text })}
                  placeholder="e.g., 23"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={eventData.description}
                  onChangeText={(text) => setEventData({ ...eventData, description: text })}
                  placeholder="e.g., Goal scored by Player Name"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Commentary (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={eventData.commentary}
                  onChangeText={(text) => setEventData({ ...eventData, commentary: text })}
                  placeholder="Add detailed commentary about this event"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <LoadingButton
                title="Add Event"
                onPress={handleSaveEvent}
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
  matchSelector: {
    padding: baseTheme.spacing.md,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  matchCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    marginRight: baseTheme.spacing.sm,
    minWidth: 150,
  },
  matchText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  matchDate: {
    ...baseTheme.typography.caption,
  },
  eventsContainer: {
    flex: 1,
    padding: baseTheme.spacing.md,
  },
  sectionTitle: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.md,
  },
  eventsList: {
    gap: baseTheme.spacing.sm,
  },
  eventItem: {
    flexDirection: 'row',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    gap: baseTheme.spacing.md,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventMinute: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  eventDescription: {
    ...baseTheme.typography.body,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  eventCommentary: {
    ...baseTheme.typography.bodySmall,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: baseTheme.spacing.xl,
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
  eventTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
  },
  eventTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    gap: baseTheme.spacing.xs,
    minWidth: 120,
  },
  eventTypeText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.xl,
  },
});

export default LiveCommentaryScreen;

