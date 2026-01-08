import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme/colors.js';

const StandingsRow = ({ rank, team }) => (
  <View style={styles.row}>
    <Text style={styles.rank}>{rank}</Text>
    <Text style={styles.team} numberOfLines={1}>
      {team.name}
    </Text>
    <Text style={styles.stat}>{team.played || 0}</Text>
    <Text style={styles.stat}>{team.won || 0}</Text>
    <Text style={styles.stat}>{team.drawn || 0}</Text>
    <Text style={styles.stat}>{team.lost || 0}</Text>
    <Text style={styles.stat}>{team.goalsFor || 0}</Text>
    <Text style={styles.stat}>{team.goalsAgainst || 0}</Text>
    <Text style={styles.stat}>{team.goalDifference >= 0 ? '+' : ''}{team.goalDifference || 0}</Text>
    <Text style={styles.points}>{team.points || 0}</Text>
  </View>
);

const StandingsPanel = ({ standings = [] }) => {
  if (!standings.length) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Standings</Text>
        <Text style={styles.subtitle}>Top performing clubs</Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.headRank}>#</Text>
        <Text style={styles.headTeam}>Team</Text>
        <Text style={styles.headStat}>P</Text>
        <Text style={styles.headStat}>W</Text>
        <Text style={styles.headStat}>D</Text>
        <Text style={styles.headStat}>L</Text>
        <Text style={styles.headStat}>GF</Text>
        <Text style={styles.headStat}>GA</Text>
        <Text style={styles.headStat}>GD</Text>
        <Text style={styles.headPoints}>Pts</Text>
      </View>
      {standings.map((team, index) => (
        <StandingsRow key={`${team.name}-${index}`} rank={index + 1} team={team} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md
  },
  header: {
    marginBottom: theme.spacing.md
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  subtitle: {
    color: theme.colors.muted,
    ...theme.typography.caption
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xs
  },
  headRank: {
    width: 32,
    color: theme.colors.muted,
    ...theme.typography.caption,
    fontWeight: '700'
  },
  headTeam: {
    flex: 1,
    color: theme.colors.muted,
    ...theme.typography.caption,
    fontWeight: '700',
    marginRight: theme.spacing.xs
  },
  headStat: {
    width: 32,
    textAlign: 'center',
    color: theme.colors.muted,
    ...theme.typography.caption,
    fontWeight: '700'
  },
  headPoints: {
    width: 40,
    textAlign: 'center',
    color: theme.colors.primary,
    ...theme.typography.caption,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  rank: {
    width: 32,
    fontWeight: '700',
    ...theme.typography.bodySmall,
    color: theme.colors.textDark
  },
  team: {
    flex: 1,
    fontWeight: '600',
    ...theme.typography.bodySmall,
    color: theme.colors.textDark,
    marginRight: theme.spacing.xs
  },
  points: {
    width: 45, // Increased to accommodate larger text
    textAlign: 'center',
    fontSize: 18, // Increased from bodySmall (14) - larger for emphasis
    fontWeight: '900', // Increased from 700 - bolder
    color: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for points
    letterSpacing: -0.2 // Tighter spacing for large numbers
  },
  stat: {
    width: 32,
    textAlign: 'center',
    fontSize: 15, // Increased from bodySmall (14) - slightly larger
    color: theme.colors.textSecondary,
    fontWeight: '700' // Increased from 600 - bolder
  }
});

export default StandingsPanel;

