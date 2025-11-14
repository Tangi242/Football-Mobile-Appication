import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../lib/dayjs.js';
import theme from '../theme/colors.js';
import useCountdown from '../hooks/useCountdown.js';
import { getFlagForTeam } from '../utils/flags.js';

const TeamBlock = ({ name }) => (
  <View style={styles.teamBlock}>
    <Image source={getFlagForTeam(name)} style={styles.flag} contentFit="cover" cachePolicy="disk" />
    <Text style={styles.teamName} numberOfLines={1}>
      {name}
    </Text>
  </View>
);

const MatchHero = ({ match, leagueName }) => {
  if (!match) return null;
  const countdown = useCountdown(match.match_date);
  const kickoff = dayjs(match.match_date).format('HH:mm');
  const kickoffDay = dayjs(match.match_date).calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'ddd, MMM D',
    sameElse: 'ddd, MMM D'
  });

  return (
    <View style={styles.container}>
      <Text style={styles.league}>{leagueName || match.competition || 'Upcoming Match'}</Text>
      <View style={styles.row}>
        <TeamBlock name={match.home_team} />
        <View style={styles.center}>
          <Text style={styles.time}>{kickoff}</Text>
          <Text style={styles.day}>{kickoffDay}</Text>
          <View style={[styles.countdownChip, countdown.isPast && styles.countdownPast]}>
            <Text style={styles.countdownText}>{countdown.formatted}</Text>
          </View>
        </View>
        <TeamBlock name={match.away_team} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  league: {
    textAlign: 'center',
    color: theme.colors.highlight,
    textTransform: 'uppercase',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  teamBlock: {
    alignItems: 'center',
    width: '30%'
  },
  flag: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: theme.colors.white,
    marginBottom: 10
  },
  teamName: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center'
  },
  center: {
    alignItems: 'center',
    width: '40%'
  },
  time: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.white
  },
  day: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: 8
  },
  countdownChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  countdownPast: {
    backgroundColor: theme.colors.accent
  },
  countdownText: {
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: 1
  }
});

export default MatchHero;

