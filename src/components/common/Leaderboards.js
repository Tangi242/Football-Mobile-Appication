import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../../theme/colors.js';
import { getPlayerImage } from '../../constants/media.js';
import { getFlagForTeam } from '../../utils/flags.js';
import { fetchLeaderboards } from '../../api/client.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useToast } from '../../hooks/useToast.js';

const LeaderRow = ({ rank, player, value, metric, onPress }) => {
  const getMedalColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return null;
  };

  const medalColor = getMedalColor();

  return (
    <TouchableOpacity style={styles.leaderRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rankContainer}>
        {medalColor ? (
          <View style={[styles.medal, { backgroundColor: medalColor }]}>
            <Ionicons name="trophy" size={12} color={theme.colors.white} />
          </View>
        ) : (
          <Text style={styles.rank}>{rank}</Text>
        )}
      </View>
      <Image
        source={player.photo_path || getPlayerImage(rank - 1)}
        style={styles.playerAvatar}
        contentFit="cover"
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>{player.player || player.name}</Text>
        <View style={styles.playerMeta}>
          <Image source={getFlagForTeam(player.team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={1}>{player.team}</Text>
        </View>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.metricLabel}>{metric}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Leaderboards = ({ navigation, type }) => {
  const { refreshKeys } = useRefresh();
  const { showError } = useToast();
  const [leaders, setLeaders] = useState({ goals: [], assists: [], yellows: [], reds: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchLeaderboards();
      setLeaders(response.data?.leaders || { goals: [], assists: [], yellows: [], reds: [] });
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      showError('Failed to load leaderboards');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboards();
    }, [loadLeaderboards, refreshKeys.matches])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboards();
  };

  // Format leaderboard data
  const formatLeaderData = (data) => {
    return (data || []).map(item => ({
      id: item.id,
      player: item.player || 'Unknown Player',
      name: item.player || 'Unknown Player',
      team: item.team || 'Unknown Team',
      value: item.value || 0,
      goals: item.value || 0,
      assists: item.value || 0,
      photo_path: null
    }));
  };

  const leaderboards = [
    {
      id: 'goals',
      title: 'Top Scorers',
      subtitle: 'Most goals scored',
      icon: 'football',
      data: formatLeaderData(leaders?.goals || []),
      metric: 'goals',
      show: !type || type === 'goals'
    },
    {
      id: 'assists',
      title: 'Top Assists',
      subtitle: 'Most assists provided',
      icon: 'hand-left',
      data: formatLeaderData(leaders?.assists || []),
      metric: 'assists',
      show: !type || type === 'assists'
    },
    {
      id: 'clean-sheets',
      title: 'Clean Sheets',
      subtitle: 'Goalkeepers & defenders',
      icon: 'shield',
      data: [], // Would come from API when available
      metric: 'clean sheets',
      show: false
    },
    {
      id: 'potm',
      title: 'Player of the Match',
      subtitle: 'Most MOTM awards',
      icon: 'star',
      data: [], // Would come from API when available
      metric: 'awards',
      show: false
    }
  ].filter(board => board.show);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {leaderboards.map((board) => (
        <View key={board.id} style={styles.boardCard}>
          <View style={styles.boardHeader}>
            <View style={styles.boardTitleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name={board.icon} size={18} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.boardTitle}>{board.title}</Text>
                <Text style={styles.boardSubtitle}>{board.subtitle}</Text>
              </View>
            </View>
          </View>

          {board.data.length > 0 ? (
            <View style={styles.leadersList}>
              {board.data.slice(0, 10).map((player, index) => (
                <LeaderRow
                  key={`${board.id}-${index}`}
                  rank={index + 1}
                  player={player}
                  value={player.value || player.goals || player.assists || 0}
                  metric={board.metric}
                  onPress={() => navigation.navigate('PlayerDetail', {
                    playerId: player.id,
                    playerName: player.player || player.name
                  })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={32} color={theme.colors.muted} />
              <Text style={styles.emptyText}>Leaderboard data will appear here</Text>
              <Text style={styles.emptySubtext}>Statistics are updated after each match</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  boardCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  boardHeader: {
    marginBottom: theme.spacing.md
  },
  boardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  boardTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  boardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.muted
  },
  leadersList: {
    gap: theme.spacing.xs
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  rankContainer: {
    width: 24,
    alignItems: 'center'
  },
  rank: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textSecondary
  },
  medal: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  teamFlag: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  teamName: {
    ...theme.typography.tiny,
    color: theme.colors.muted
  },
  valueContainer: {
    alignItems: 'flex-end'
  },
  value: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary
  },
  metricLabel: {
    ...theme.typography.tiny,
    color: theme.colors.muted
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    minHeight: 200
  }
});

export default Leaderboards;


