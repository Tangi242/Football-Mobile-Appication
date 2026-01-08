import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';

const EventItem = ({ event, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true
    }).start();
  }, []);

  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'goal':
        return 'football';
      case 'substitution':
        return 'swap-horizontal';
      case 'yellow':
      case 'yellow card':
        return 'warning';
      case 'red':
      case 'red card':
        return 'close-circle';
      case 'injury':
        return 'medical';
      default:
        return 'ellipse';
    }
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'goal':
        return '#10B981';
      case 'yellow':
      case 'yellow card':
        return '#F59E0B';
      case 'red':
      case 'red card':
        return '#EF4444';
      case 'injury':
        return '#8B5CF6';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View style={[styles.eventItem, { opacity: fadeAnim }]}>
      <View style={[styles.eventIcon, { backgroundColor: getEventColor(event.event_type) + '20' }]}>
        <Ionicons name={getEventIcon(event.event_type)} size={18} color={getEventColor(event.event_type)} />
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventDescription}>{event.description || event.last_event || 'Match event'}</Text>
        {event.minute_mark !== undefined && (
          <Text style={styles.eventMinute}>{event.minute_mark}'</Text>
        )}
      </View>
    </Animated.View>
  );
};

const MatchCenter = ({ match, liveEvent, events = [] }) => {
  const navigation = useNavigation();
  if (!match) return null;

  const status = liveEvent?.status || match.status;
  const isLive = status?.toLowerCase() === 'live' || status?.toLowerCase() === 'in_progress';
  const homeScore = liveEvent?.home_score ?? match.home_score ?? 0;
  const awayScore = liveEvent?.away_score ?? match.away_score ?? 0;
  const minute = liveEvent?.minute || liveEvent?.minute_mark || null;
  const matchDate = dayjs(match.match_date);
  const isUpcoming = matchDate.isAfter(dayjs());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.competitionRow}>
          <Text style={styles.competition}>{match.competition || 'Match'}</Text>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={styles.venue}>
          <Ionicons name="location" size={14} color={theme.colors.muted} /> {match.venue || 'TBA'}
        </Text>
        <Text style={styles.date}>
          {matchDate.format('ddd, MMM D, YYYY • HH:mm')}
        </Text>
      </View>

      <View style={styles.scoreSection}>
        <TouchableOpacity 
          style={styles.teamSection}
          onPress={() => match.home_team && navigation.navigate('TeamProfile', { teamName: match.home_team })}
          activeOpacity={0.7}
        >
          <Image source={getFlagForTeam(match.home_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={2}>{match.home_team}</Text>
        </TouchableOpacity>

        <View style={styles.scoreContainer}>
          {isUpcoming && !isLive ? (
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{matchDate.format('HH:mm')}</Text>
              <Text style={styles.dateText}>{matchDate.calendar(null, {
                sameDay: '[Today]',
                nextDay: '[Tomorrow]',
                nextWeek: 'ddd',
                sameElse: 'MMM D'
              })}</Text>
            </View>
          ) : (
            <>
              <View style={styles.scoreRow}>
                <Text style={styles.score}>{homeScore}</Text>
                <Text style={styles.separator}>-</Text>
                <Text style={styles.score}>{awayScore}</Text>
              </View>
              {isLive && minute !== null && (
                <Text style={styles.minute}>{minute}'</Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.teamSection}
          onPress={() => match.away_team && navigation.navigate('TeamProfile', { teamName: match.away_team })}
          activeOpacity={0.7}
        >
          <Image source={getFlagForTeam(match.away_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={2}>{match.away_team}</Text>
        </TouchableOpacity>
      </View>

      {isLive && events.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>Live Events</Text>
          <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
            {events.map((event, index) => (
              <EventItem key={`${event.id || index}-${event.minute_mark}`} event={event} index={index} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg
  },
  header: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  competitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs
  },
  competition: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white
  },
  liveText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  venue: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs / 2
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs / 2
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  teamFlag: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.border
  },
  teamName: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textDark,
    textAlign: 'center',
    maxWidth: 100
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  score: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primary
  },
  separator: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.muted
  },
  timeContainer: {
    alignItems: 'center'
  },
  time: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textDark
  },
  dateText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs
  },
  minute: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '700',
    marginTop: theme.spacing.xs
  },
  eventsSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  eventsTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  eventsList: {
    maxHeight: 200
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  eventDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1
  },
  eventMinute: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontWeight: '700',
    marginLeft: theme.spacing.sm
  }
});

export default MatchCenter;


