import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../lib/dayjs.js';
import theme from '../theme/colors.js';
import { nfaImages } from '../constants/media.js';

const MatchCard = ({ match, liveEvent }) => {
  const { width } = useWindowDimensions();
  if (!match) return null;
  const date = dayjs(match.match_date).format('ddd, MMM D • HH:mm');

  const status = liveEvent?.status || match.status;
  const homeScore = liveEvent?.home_score ?? match.home_score;
  const awayScore = liveEvent?.away_score ?? match.away_score;

  return (
    <View style={[styles.card, { padding: width < 360 ? 14 : 16 }]}>
      <Image
        source={nfaImages.matchBackdrop}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="disk"
        blurRadius={1}
      />
      <View style={styles.backdrop} />
      <View style={styles.row}>
        <Text style={styles.label}>{match.competition}</Text>
        <Text style={[styles.badge, status === 'LIVE' && styles.liveBadge]}>{status}</Text>
      </View>
      <View style={styles.teams}>
        <View style={styles.team}>
          <Text style={styles.teamName}>{match.home_team}</Text>
          {homeScore !== undefined && <Text style={styles.score}>{homeScore}</Text>}
        </View>
        <View style={styles.team}>
          <Text style={styles.teamName}>{match.away_team}</Text>
          {awayScore !== undefined && <Text style={styles.score}>{awayScore}</Text>}
        </View>
      </View>
      <Text style={styles.meta}>{date}</Text>
      <Text style={styles.meta}>Venue: {match.venue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    width: '100%',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600'
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary
  },
  liveBadge: {
    color: theme.colors.accent
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  team: {
    flex: 1
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.highlight
  },
  meta: {
    fontSize: 14,
    color: '#e2e8f0'
  }
});

export default MatchCard;

