import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

const PredictionLeaderboard = ({ leaderboard = [], currentUserId = null }) => {
  const { theme: appTheme } = useTheme();

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return { name: 'trophy', color: '#F59E0B' };
      case 2:
        return { name: 'medal', color: '#94A3B8' };
      case 3:
        return { name: 'medal', color: '#CD7F32' };
      default:
        return null;
    }
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const rank = index + 1;
    const rankIcon = getRankIcon(rank);
    const isCurrentUser = currentUserId && item.userId === currentUserId;

    return (
      <View
        style={[
          styles.leaderboardItem,
          {
            backgroundColor: isCurrentUser
              ? (appTheme.colors.interactive || '#DC143C') + '10'
              : appTheme.colors.surface,
            borderColor: isCurrentUser
              ? appTheme.colors.interactive || '#DC143C'
              : appTheme.colors.border,
          },
        ]}
      >
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
          ) : (
            <Text style={[styles.rankText, { color: appTheme.colors.textSecondary }]}>{rank}</Text>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[
              styles.userName,
              { color: isCurrentUser ? appTheme.colors.interactive || '#DC143C' : appTheme.colors.textDark },
              isCurrentUser && styles.currentUserText,
            ]}
          >
            {item.userName}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={[styles.userStats, { color: appTheme.colors.textSecondary }]}>
            {item.correctPredictions} correct • {item.totalPredictions} total
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreText,
              { color: appTheme.colors.interactive || '#DC143C' },
            ]}
          >
            {item.points}
          </Text>
          <Text style={[styles.scoreLabel, { color: appTheme.colors.muted }]}>pts</Text>
        </View>
      </View>
    );
  };

  if (leaderboard.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trophy-outline" size={48} color={appTheme.colors.muted} />
        <Text style={[styles.emptyText, { color: appTheme.colors.textSecondary }]}>
          No predictions yet
        </Text>
        <Text style={[styles.emptySubtext, { color: appTheme.colors.muted }]}>
          Be the first to make a prediction and climb the leaderboard!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#F59E0B" />
        <Text style={[styles.title, { color: appTheme.colors.textDark }]}>Prediction Leaderboard</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: appTheme.colors.textDark }]}>{leaderboard.length}</Text>
          <Text style={[styles.statLabel, { color: appTheme.colors.textSecondary }]}>Participants</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: appTheme.colors.textDark }]}>
            {leaderboard.reduce((sum, item) => sum + item.totalPredictions, 0)}
          </Text>
          <Text style={[styles.statLabel, { color: appTheme.colors.textSecondary }]}>Total Predictions</Text>
        </View>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item, index) => `leader-${item.userId || index}`}
        renderItem={renderLeaderboardItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h3,
    fontWeight: '800',
    marginBottom: theme.spacing.xs / 2,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  listContent: {
    gap: theme.spacing.xs,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.xs,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...theme.typography.body,
    fontWeight: '700',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  userName: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentUserText: {
    fontWeight: '700',
  },
  userStats: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    ...theme.typography.h4,
    fontWeight: '800',
  },
  scoreLabel: {
    ...theme.typography.tiny,
    fontSize: 9,
    marginTop: -2,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    fontWeight: '600',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
  },
});

export default PredictionLeaderboard;










