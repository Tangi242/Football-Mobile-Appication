import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import useCountdown from '../../hooks/useCountdown.js';
import { getFlagForTeam } from '../../utils/flags.js';

const TeamBlock = ({ name }) => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      style={styles.teamBlock}
      onPress={() => name && navigation.navigate('TeamProfile', { teamName: name })}
      activeOpacity={0.7}
    >
    <Image source={getFlagForTeam(name)} style={styles.flag} contentFit="cover" cachePolicy="disk" />
    <Text style={styles.teamName} numberOfLines={1}>
      {name}
    </Text>
    </TouchableOpacity>
);
};

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
    paddingVertical: theme.spacing.xxl + 4,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.xl,
    overflow: 'hidden'
  },
  league: {
    textAlign: 'center',
    color: theme.colors.white,
    textTransform: 'uppercase',
    ...theme.typography.caption,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    letterSpacing: 1.2,
    opacity: 0.95
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  teamBlock: {
    alignItems: 'center',
    width: '30%',
    paddingHorizontal: theme.spacing.xs
  },
  flag: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3.5,
    borderColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md
  },
  teamName: {
    color: theme.colors.white,
    fontWeight: '700',
    ...theme.typography.caption,
    textAlign: 'center',
    maxWidth: '100%',
    lineHeight: 18
  },
  center: {
    alignItems: 'center',
    width: '40%',
    paddingHorizontal: theme.spacing.sm
  },
  time: {
    fontSize: 40, // Increased from 32 - larger for emphasis
    fontWeight: '900', // Increased from 800 - bolder
    color: theme.colors.white,
    letterSpacing: -0.8 // Tighter spacing for large numbers
  },
  day: {
    color: 'rgba(255,255,255,0.95)',
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.sm,
    fontWeight: '600'
  },
  countdownChip: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  countdownPast: {
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for past countdown
    borderColor: theme.colors.interactive || theme.colors.error || '#DC143C'
  },
  countdownText: {
    color: theme.colors.white,
    fontWeight: '700',
    ...theme.typography.caption,
    letterSpacing: 1
  }
});

export default MatchHero;

