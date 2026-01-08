import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { getCoachTeam, getCoachPlayers, fetchTeamPlayerStats } from '../../api/client.js';

const PlayerStatisticsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear().toString());

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [season])
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
        const [playersRes, statsRes] = await Promise.all([
          getCoachPlayers(user.id),
          fetchTeamPlayerStats(teamRes.data.team.id, season)
        ]);
        setPlayers(playersRes.data?.players || []);
        setStats(statsRes.data?.stats || []);
      } else {
        showError('No team assigned to your coach account');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = (playerId) => {
    return stats.find(s => s.player_id === playerId) || {
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0,
      minutes_played: 0,
      matches_started: 0,
      matches_substituted: 0,
      clean_sheets: 0,
      saves: 0,
      rating: 0
    };
  };

  const renderPlayerStats = ({ item }) => {
    const playerStats = getPlayerStats(item.id);
    const avgRating = playerStats.rating || 0;
    
    return (
      <TouchableOpacity
        style={[styles.statsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => setSelectedPlayer(selectedPlayer === item.id ? null : item.id)}
      >
        <View style={styles.statsHeader}>
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: theme.colors.textDark }]}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={[styles.playerPosition, { color: theme.colors.textSecondary }]}>
              {item.position || 'No position'} • #{item.jersey_number || 'N/A'}
            </Text>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: avgRating >= 7 ? '#10B981' : avgRating >= 6 ? '#F59E0B' : '#6B7280' }]}>
            <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
          </View>
        </View>
        
        {selectedPlayer === item.id && (
          <View style={styles.statsDetails}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="football" size={20} color="#10B981" />
                <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.goals || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Goals</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="hand-left" size={20} color="#3B82F6" />
                <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.assists || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Assists</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color="#6B7280" />
                <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.minutes_played || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Minutes</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="warning" size={20} color="#FBBF24" />
                <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.yellow_cards || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Yellow</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.red_cards || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Red</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.matches_started || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Starts</Text>
              </View>
            </View>
            {(playerStats.clean_sheets > 0 || playerStats.saves > 0) && (
              <View style={styles.statsRow}>
                {playerStats.clean_sheets > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="shield" size={20} color="#10B981" />
                    <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.clean_sheets || 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Clean Sheets</Text>
                  </View>
                )}
                {playerStats.saves > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="hand-right" size={20} color="#3B82F6" />
                    <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{playerStats.saves || 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Saves</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Player Statistics
          </Text>
          <View style={styles.seasonSelector}>
            <TextInput
              style={[styles.seasonInput, { backgroundColor: theme.colors.surface, color: theme.colors.textDark, borderColor: theme.colors.border }]}
              value={season}
              onChangeText={setSeason}
              placeholder="Season"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : players.length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon="stats-chart-outline"
              title="No Players"
              message="Add players to your team to view their statistics"
            />
          </View>
        ) : (
          <FlatList
            data={players}
            renderItem={renderPlayerStats}
            keyExtractor={(item) => `player-${item.id}`}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadData}
          />
        )}
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
  seasonSelector: {
    width: 100,
  },
  seasonInput: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    textAlign: 'center',
  },
  list: {
    padding: baseTheme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.sm,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  playerPosition: {
    ...baseTheme.typography.bodySmall,
  },
  ratingBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    ...baseTheme.typography.h4,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsDetails: {
    marginTop: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: baseTheme.colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: baseTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...baseTheme.typography.h4,
    fontSize: 18,
    fontWeight: '700',
    marginTop: baseTheme.spacing.xs / 2,
  },
  statLabel: {
    ...baseTheme.typography.caption,
    fontSize: 10,
    marginTop: baseTheme.spacing.xs / 2,
  },
});

export default PlayerStatisticsScreen;

