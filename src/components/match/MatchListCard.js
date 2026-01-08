import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';

const TeamRow = ({ name, score, isWinner, onTeamPress }) => {
  const navigation = useNavigation();
  
  const handleTeamPress = (e) => {
    e?.stopPropagation();
    if (name && onTeamPress) {
      onTeamPress(name);
    } else if (name) {
      navigation.navigate('TeamProfile', { teamName: name });
    }
  };

  return (
  <View style={styles.teamRow}>
      <TouchableOpacity 
        style={styles.teamLeft} 
        onPress={handleTeamPress}
        activeOpacity={0.7}
      >
      <Image source={getFlagForTeam(name)} style={styles.teamFlag} contentFit="cover" cachePolicy="disk" />
      <Text style={[styles.teamLabel, isWinner && styles.teamWinner]} numberOfLines={1}>
        {name}
      </Text>
      </TouchableOpacity>
    {score !== undefined && score !== null ? <Text style={[styles.teamScore, isWinner && styles.teamWinner]}>{score}</Text> : null}
  </View>
);
};

const MatchListCard = ({ match, onPress }) => {
  const navigation = useNavigation();
  if (!match) return null;
  const kickoff = dayjs(match.match_date).format('ddd, MMM D • HH:mm');
  const status = match.status || 'scheduled';
  const live = status?.toLowerCase() === 'live' || status?.toLowerCase() === 'in_progress';
  const isFinished = status?.toLowerCase() === 'finished' || status?.toLowerCase() === 'completed';
  const isUpcoming = !live && !isFinished;
  const homeScore = match.home_score ?? match.live_home_score;
  const awayScore = match.away_score ?? match.live_away_score;

  const homeWinner = homeScore > awayScore;
  const awayWinner = awayScore > homeScore;

  const getStatusLabel = () => {
    if (live) return 'LIVE';
    if (isFinished) return 'FINISHED';
    return 'UPCOMING';
  };

  const handleBuyTickets = (e) => {
    e?.stopPropagation();
    navigation.navigate('Tickets', { matchId: match.id || match.match_id });
  };

  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <CardWrapper style={styles.card} {...cardProps}>
      <View style={styles.header}>
        <Text style={styles.competition}>{match.competition || 'Friendly'}</Text>
        <View style={[styles.statusChip, live && styles.statusLive, isFinished && styles.statusFinished]}>
          <Text style={[styles.statusText, live && styles.statusLiveText]}>{getStatusLabel()}</Text>
        </View>
      </View>
      <Text style={styles.kickoff}>{kickoff}</Text>
      {match.venue && (
        <View style={styles.venueRow}>
          <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.venue}>{match.venue}</Text>
        </View>
      )}
      <View style={styles.teams}>
        <TeamRow 
          name={match.home_team} 
          score={homeScore} 
          isWinner={homeWinner}
          onTeamPress={(teamName) => navigation.navigate('TeamProfile', { teamName })}
        />
        <View style={styles.divider} />
        <TeamRow 
          name={match.away_team} 
          score={awayScore} 
          isWinner={awayWinner}
          onTeamPress={(teamName) => navigation.navigate('TeamProfile', { teamName })}
        />
      </View>
      {isUpcoming && (
        <TouchableOpacity 
          style={styles.buyTicketsButton}
          onPress={handleBuyTickets}
          activeOpacity={0.8}
        >
          <Ionicons name="ticket" size={16} color={theme.colors.white} />
          <Text style={styles.buyTicketsText}>Buy Tickets</Text>
        </TouchableOpacity>
      )}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white, // Clean white background
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, // Reduced from xl for better fit
    marginBottom: theme.spacing.sm,
    borderWidth: 1.5, // Reduced from 2
    borderColor: theme.colors.primary, // Navy blue border
    ...theme.shadows.sm
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  competition: {
    color: theme.colors.primary, // Navy for competition
    fontWeight: '700',
    fontSize: 11,
    flex: 1,
    marginRight: theme.spacing.sm,
    letterSpacing: 0.5
  },
  statusChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundPrimary
  },
  statusLive: {
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C' // Red for live status
  },
  statusFinished: {
    backgroundColor: theme.colors.textSecondary
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8
  },
  statusLiveText: {
    color: theme.colors.white
  },
  kickoff: {
    color: theme.colors.muted,
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
    fontWeight: '600'
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    marginBottom: theme.spacing.md
  },
  venue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11
  },
  teams: {
    gap: theme.spacing.sm // Reduced from md
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs // Reduced from sm
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm
  },
  teamFlag: {
    width: 32, // Reduced from 40 for better fit
    height: 32, // Reduced from 40 for better fit
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  teamLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.darkGray,
    flexShrink: 1
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red divider
    marginVertical: theme.spacing.xs,
    opacity: 0.3
  },
  teamWinner: {
    color: theme.colors.interactive || theme.colors.error || '#DC143C' // Red for winner
  },
  teamScore: {
    fontSize: 18, // Reduced from 24 for better fit
    fontWeight: '900',
    color: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for scores
    minWidth: 32,
    textAlign: 'right',
    letterSpacing: -0.3 // Tighter spacing for large numbers
  },
  buyTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red accent
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs / 2,
    ...theme.shadows.sm
  },
  buyTicketsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12
  }
});

export default MatchListCard;

