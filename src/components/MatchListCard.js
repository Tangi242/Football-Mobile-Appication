import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../lib/dayjs.js';
import theme from '../theme/colors.js';
import { getFlagForTeam } from '../utils/flags.js';

const TeamRow = ({ name, score, isWinner }) => (
  <View style={styles.teamRow}>
    <View style={styles.teamLeft}>
      <Image source={getFlagForTeam(name)} style={styles.teamFlag} contentFit="cover" cachePolicy="disk" />
      <Text style={[styles.teamLabel, isWinner && styles.teamWinner]} numberOfLines={1}>
        {name}
      </Text>
    </View>
    {score !== undefined && score !== null ? <Text style={[styles.teamScore, isWinner && styles.teamWinner]}>{score}</Text> : null}
  </View>
);

const MatchListCard = ({ match }) => {
  if (!match) return null;
  const kickoff = dayjs(match.match_date).format('ddd, MMM D • HH:mm');
  const status = match.status || 'scheduled';
  const live = status?.toLowerCase() === 'live' || status?.toLowerCase() === 'in_progress';
  const homeScore = match.home_score ?? match.live_home_score;
  const awayScore = match.away_score ?? match.live_away_score;

  const homeWinner = homeScore > awayScore;
  const awayWinner = awayScore > homeScore;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.competition}>{match.competition || 'Friendly'}</Text>
        <View style={[styles.statusChip, live && styles.statusLive]}>
          <Text style={[styles.statusText, live && styles.statusLiveText]}>{status?.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.kickoff}>{kickoff}</Text>
      <View style={styles.teams}>
        <TeamRow name={match.home_team} score={homeScore} isWinner={homeWinner} />
        <View style={styles.divider} />
        <TeamRow name={match.away_team} score={awayScore} isWinner={awayWinner} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  competition: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.backgroundPrimary
  },
  statusLive: {
    backgroundColor: theme.colors.accent
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  statusLiveText: {
    color: theme.colors.white
  },
  kickoff: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: 12
  },
  teams: {
    gap: 8
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  teamFlag: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  teamLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.darkGray,
    flexShrink: 1
  },
  teamScore: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 6
  },
  teamWinner: {
    color: theme.colors.primary
  }
});

export default MatchListCard;

