import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import { getCoachTeam, getCoachPlayers, getCoachMatches, getLineup, createLineup, submitLineup } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const LineupCreationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [lineup, setLineup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formation, setFormation] = useState('4-4-2');
  const [notes, setNotes] = useState('');
  const [startingXI, setStartingXI] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);

  const formations = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadLineup();
    }
  }, [selectedMatch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const teamRes = await getCoachTeam(user?.id);
      if (teamRes.data?.team) {
        setTeam(teamRes.data.team);
        const [playersRes, matchesRes] = await Promise.all([
          getCoachPlayers(user?.id),
          getCoachMatches(user?.id)
        ]);
        setPlayers(playersRes.data?.players || []);
        setMatches(matchesRes.data?.matches || []);
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

  const loadLineup = async () => {
    if (!selectedMatch) return;
    try {
      const response = await getLineup(selectedMatch.id, user?.id);
      if (response.data?.lineup) {
        const loadedLineup = response.data.lineup;
        setLineup(loadedLineup);
        setFormation(loadedLineup.formation || '4-4-2');
        setNotes(loadedLineup.notes || '');
        const starting = (loadedLineup.players || []).filter(p => p.is_starting);
        const subs = (loadedLineup.players || []).filter(p => !p.is_starting);
        setStartingXI(starting);
        setSubstitutes(subs);
      } else {
        setLineup(null);
        setStartingXI([]);
        setSubstitutes([]);
      }
    } catch (error) {
      console.error('Error loading lineup:', error);
    }
  };

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
  };

  const handleAddToStarting = (player) => {
    if (startingXI.length >= 11) {
      showError('Starting XI can only have 11 players');
      return;
    }
    if (startingXI.find(p => p.player_id === player.id)) {
      showError('Player already in starting XI');
      return;
    }
    setStartingXI([...startingXI, {
      player_id: player.id,
      position: player.position || 'Midfielder',
      is_starting: 1,
      is_captain: startingXI.length === 0 ? 1 : 0,
      jersey_number: player.jersey_number,
      order: startingXI.length + 1
    }]);
  };

  const handleAddToSubstitutes = (player) => {
    if (substitutes.length >= 7) {
      showError('Substitutes can only have 7 players');
      return;
    }
    if (substitutes.find(p => p.player_id === player.id)) {
      showError('Player already in substitutes');
      return;
    }
    setSubstitutes([...substitutes, {
      player_id: player.id,
      position: player.position || 'Midfielder',
      is_starting: 0,
      is_captain: 0,
      jersey_number: player.jersey_number,
      order: substitutes.length + 1
    }]);
  };

  const handleRemoveFromStarting = (playerId) => {
    setStartingXI(startingXI.filter(p => p.player_id !== playerId));
  };

  const handleRemoveFromSubstitutes = (playerId) => {
    setSubstitutes(substitutes.filter(p => p.player_id !== playerId));
  };

  const handleSave = async () => {
    if (!selectedMatch) {
      showError('Please select a match first');
      return;
    }
    if (startingXI.length < 11) {
      showError('Starting XI must have 11 players');
      return;
    }

    try {
      setSaving(true);
      const lineupData = {
        match_id: selectedMatch.id,
        formation,
        notes,
        players: [...startingXI, ...substitutes]
      };
      const response = await createLineup(user?.id, lineupData);
      setLineup(response.data?.lineup);
      showSuccess('Lineup saved successfully');
      triggerRefresh('matches');
    } catch (error) {
      showError(error.userMessage || 'Failed to save lineup');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!lineup) {
      showError('Please save the lineup first');
      return;
    }
    if (startingXI.length < 11) {
      showError('Starting XI must have 11 players');
      return;
    }

    // Check if lineup can be submitted (30 minutes before kickoff)
    if (selectedMatch && selectedMatch.match_date) {
      const matchDate = new Date(selectedMatch.match_date);
      const now = new Date();
      const minutesUntilMatch = (matchDate - now) / (1000 * 60);
      
      if (minutesUntilMatch < 30) {
        showError('Lineup must be submitted at least 30 minutes before kickoff');
        return;
      }
    }

    Alert.alert(
      'Submit Lineup',
      'Are you sure you want to submit this lineup? Once submitted, you cannot make changes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);
              await submitLineup(lineup.id, user?.id);
              showSuccess('Lineup submitted successfully');
              loadLineup();
              triggerRefresh('matches');
            } catch (error) {
              showError(error.userMessage || 'Failed to submit lineup');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const getAvailablePlayers = () => {
    const usedPlayerIds = [...startingXI, ...substitutes].map(p => p.player_id);
    return players.filter(p => !usedPlayerIds.includes(p.id) && p.status === 'active');
  };

  const renderMatchItem = ({ item }) => {
    const isSelected = selectedMatch?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.matchItem,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}
        onPress={() => handleSelectMatch(item)}
      >
        <View style={styles.matchInfo}>
          <Text style={[styles.matchTeams, { color: theme.colors.textDark }]}>
            {item.home_team_name} vs {item.away_team_name}
          </Text>
          <Text style={[styles.matchDate, { color: theme.colors.textSecondary }]}>
            {new Date(item.match_date).toLocaleString()}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderPlayerItem = ({ item }) => (
    <View style={[styles.playerItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: theme.colors.textDark }]}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={[styles.playerDetails, { color: theme.colors.textSecondary }]}>
          {item.position || 'No position'} • #{item.jersey_number || 'N/A'}
        </Text>
      </View>
      <View style={styles.playerActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleAddToStarting(item)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => handleAddToSubstitutes(item)}
        >
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
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
          icon="football-outline"
          title="No Team Assigned"
          message="You don't have a team assigned to your coach account. Please contact an administrator."
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Create Lineup</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Select a match and create your team lineup
          </Text>
        </View>

        {/* Match Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>Select Match</Text>
          {matches.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No Upcoming Matches"
              message="You don't have any upcoming matches scheduled."
            />
          ) : (
            <FlatList
              data={matches}
              renderItem={renderMatchItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesList}
            />
          )}
        </View>

        {selectedMatch && (
          <>
            {/* Formation Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>Formation</Text>
              <View style={styles.formationButtons}>
                {formations.map((form) => (
                  <TouchableOpacity
                    key={form}
                    style={[
                      styles.formationButton,
                      { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border },
                      formation === form && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                    onPress={() => setFormation(form)}
                  >
                    <Text style={[
                      styles.formationButtonText,
                      { color: formation === form ? '#FFFFFF' : theme.colors.textDark }
                    ]}>
                      {form}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Starting XI */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>
                Starting XI ({startingXI.length}/11)
              </Text>
              {startingXI.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No players selected. Add players from available players below.
                </Text>
              ) : (
                <View style={styles.lineupList}>
                  {startingXI.map((player, index) => {
                    const playerInfo = players.find(p => p.id === player.player_id);
                    return (
                      <View key={index} style={[styles.lineupPlayerItem, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.lineupPlayerInfo}>
                          <Text style={[styles.lineupPlayerName, { color: theme.colors.textDark }]}>
                            {playerInfo ? `${playerInfo.first_name} ${playerInfo.last_name}` : `Player ${player.player_id}`}
                          </Text>
                          <Text style={[styles.lineupPlayerDetails, { color: theme.colors.textSecondary }]}>
                            {player.position} {player.is_captain ? '• Captain' : ''}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveFromStarting(player.player_id)}
                        >
                          <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Substitutes */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>
                Substitutes ({substitutes.length}/7)
              </Text>
              {substitutes.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No substitutes selected. Add players from available players below.
                </Text>
              ) : (
                <View style={styles.lineupList}>
                  {substitutes.map((player, index) => {
                    const playerInfo = players.find(p => p.id === player.player_id);
                    return (
                      <View key={index} style={[styles.lineupPlayerItem, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.lineupPlayerInfo}>
                          <Text style={[styles.lineupPlayerName, { color: theme.colors.textDark }]}>
                            {playerInfo ? `${playerInfo.first_name} ${playerInfo.last_name}` : `Player ${player.player_id}`}
                          </Text>
                          <Text style={[styles.lineupPlayerDetails, { color: theme.colors.textSecondary }]}>
                            {player.position}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveFromSubstitutes(player.player_id)}
                        >
                          <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Available Players */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>Available Players</Text>
              {getAvailablePlayers().length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  All players have been added to the lineup.
                </Text>
              ) : (
                <FlatList
                  data={getAvailablePlayers()}
                  renderItem={renderPlayerItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark }]}>Notes</Text>
              <TextInput
                style={[styles.notesInput, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about the lineup..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <LoadingButton
                title={lineup?.status === 'submitted' ? 'Lineup Submitted' : 'Save Lineup'}
                onPress={handleSave}
                loading={saving}
                disabled={lineup?.status === 'submitted'}
                style={styles.saveButton}
              />
              {lineup && lineup.status !== 'submitted' && (
                <LoadingButton
                  title="Submit Lineup"
                  onPress={handleSubmit}
                  loading={submitting}
                  style={[styles.submitButton, { backgroundColor: theme.colors.secondary }]}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  section: {
    marginBottom: baseTheme.spacing.xl,
  },
  sectionTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.md,
  },
  matchesList: {
    paddingRight: baseTheme.spacing.lg,
  },
  matchItem: {
    padding: baseTheme.spacing.md,
    marginRight: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    minWidth: 200,
    ...baseTheme.shadows.sm,
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  matchDate: {
    ...baseTheme.typography.caption,
  },
  formationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
  },
  formationButton: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  formationButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  lineupList: {
    gap: baseTheme.spacing.sm,
  },
  lineupPlayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  lineupPlayerInfo: {
    flex: 1,
  },
  lineupPlayerName: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  lineupPlayerDetails: {
    ...baseTheme.typography.caption,
  },
  emptyText: {
    ...baseTheme.typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: baseTheme.spacing.lg,
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
  notesInput: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    gap: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.xl,
  },
  saveButton: {
    marginBottom: baseTheme.spacing.md,
  },
  submitButton: {
    marginBottom: baseTheme.spacing.xl,
  },
});

export default LineupCreationScreen;

