import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme/colors.js';

const StandingsRow = ({ rank, team }) => (
  <View style={styles.row}>
    <Text style={styles.rank}>{rank}</Text>
    <Text style={styles.team} numberOfLines={1}>
      {team.name}
    </Text>
    <Text style={styles.stat}>{team.played}</Text>
    <Text style={styles.stat}>{team.points}</Text>
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
        <Text style={styles.headStat}>Pts</Text>
      </View>
      {standings.slice(0, 5).map((team, index) => (
        <StandingsRow key={team.name} rank={index + 1} team={team} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headRank: {
    width: 24,
    color: theme.colors.muted,
    fontSize: 12
  },
  headTeam: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12
  },
  headStat: {
    width: 32,
    textAlign: 'center',
    color: theme.colors.muted,
    fontSize: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  rank: {
    width: 24,
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  team: {
    flex: 1,
    fontWeight: '600',
    color: theme.colors.darkGray
  },
  stat: {
    width: 32,
    textAlign: 'center',
    color: theme.colors.darkGray,
    fontWeight: '600'
  }
});

export default StandingsPanel;

