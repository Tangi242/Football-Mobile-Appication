import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { areNotificationsSupported } from '../../utils/notifications.js';

// Lazy load notifications to avoid warnings in Expo Go
let Notifications = null;
const getNotifications = async () => {
  if (!Notifications && areNotificationsSupported()) {
    try {
      Notifications = await import('expo-notifications');
    } catch (error) {
      console.warn('Notifications not available:', error.message);
      return null;
    }
  }
  return Notifications;
};
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';

const MatchCardDetailed = ({ match, events = [], onPress }) => {
  if (!match) return null;

  const [isNotified, setIsNotified] = useState(false);
  const pulse = useState(new Animated.Value(1))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, [pulse]);
  const matchDate = dayjs(match.match_date);
  const competition = match.competition || 'Friendly';
  const time = matchDate.format('HH:mm');
  const homeScore = match.home_score ?? match.live_home_score;
  const awayScore = match.away_score ?? match.live_away_score;
  const status = match.status || 'scheduled';
  const isLive = status?.toLowerCase() === 'live' || status?.toLowerCase() === 'in_progress';
  const isFinished = status?.toLowerCase() === 'finished' || status?.toLowerCase() === 'completed';
  const isUpcoming = !isLive && !isFinished;

  // Group events by team
  const homeEvents = events.filter(e => e.team === match.home_team || e.team_side === 'home');
  const awayEvents = events.filter(e => e.team === match.away_team || e.team_side === 'away');

  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'goal':
        return 'football';
      case 'yellow card':
      case 'yellow':
        return 'warning';
      case 'red card':
      case 'red':
        return 'close-circle';
      case 'substitution':
        return 'swap-horizontal';
      default:
        return 'ellipse';
    }
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'goal':
        return '#10B981';
      case 'yellow card':
      case 'yellow':
        return '#F59E0B';
      case 'red card':
      case 'red':
        return '#EF4444';
      default:
        return theme.colors.textSecondary;
    }
  };

  const { scale: cardScale, handlePressIn, handlePressOut } = usePressAnimation(0.98);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNotificationToggle = async (e) => {
    e.stopPropagation();
    if (!areNotificationsSupported()) {
      return; // Skip in Expo Go
    }

    if (isUpcoming && matchDate.isAfter(dayjs())) {
      try {
        const Notifications = await getNotifications();
        if (!Notifications) return;

        if (!isNotified) {
          // Schedule notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${match.home_team} vs ${match.away_team}`,
              body: `Match starts at ${time}`,
              data: { matchId: match.id || match.match_id }
            },
            trigger: matchDate.subtract(15, 'minute').toDate()
          });
          setIsNotified(true);
        } else {
          // Cancel notification (simplified - in production, track notification IDs)
          setIsNotified(false);
        }
      } catch (error) {
        console.error('Notification error:', error);
      }
    }
  };

  const renderEvent = (event, isAway = false) => {
    if (!event) return null;
    const icon = getEventIcon(event.event_type);
    const color = getEventColor(event.event_type);
    const minute = event.minute_mark || event.minute || '';
    const playerName = event.player_name || event.description || event.player || '';

    if (!playerName && !minute) return null;

    return (
      <View key={`${event.id || event.minute_mark || Math.random()}-${isAway}`} style={[styles.eventRow, isAway && styles.eventRowAway]}>
        {isAway && minute && <Text style={styles.eventMinute}>{minute}'</Text>}
        <Ionicons name={icon} size={12} color={color} style={styles.eventIcon} />
        {playerName && (
          <Text style={styles.eventText} numberOfLines={1}>
            {playerName}
          </Text>
        )}
        {!isAway && minute && <Text style={styles.eventMinute}>{minute}'</Text>}
      </View>
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        {/* Live Indicator - Top Right Corner */}
        {isLive && (
          <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulse }] }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </Animated.View>
        )}

        <View style={styles.header}>
          <Text style={styles.competition}>{competition} {time}</Text>
          {isUpcoming && (
            <TouchableOpacity
              onPress={handleNotificationToggle}
              style={styles.notifyButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isNotified ? "notifications" : "notifications-outline"}
                size={18}
                color={isNotified ? (theme.colors.interactive || theme.colors.error || '#DC143C') : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.teamsSection}>
          <TouchableOpacity 
            style={styles.teamContainer}
            onPress={() => match.home_team && navigation.navigate('TeamProfile', { teamName: match.home_team })}
            activeOpacity={0.7}
          >
            <Image
              source={getFlagForTeam(match.home_team)}
              style={styles.teamLogo}
              contentFit="cover"
              cachePolicy="disk"
            />
            <Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text>
            {homeScore !== undefined && homeScore !== null && (
              <Text style={styles.score}>{homeScore}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.vs}>-</Text>

          <TouchableOpacity 
            style={styles.teamContainer}
            onPress={() => match.away_team && navigation.navigate('TeamProfile', { teamName: match.away_team })}
            activeOpacity={0.7}
          >
            <Image
              source={getFlagForTeam(match.away_team)}
              style={styles.teamLogo}
              contentFit="cover"
              cachePolicy="disk"
            />
            <Text style={styles.teamName} numberOfLines={1}>{match.away_team}</Text>
            {awayScore !== undefined && awayScore !== null && (
              <Text style={styles.score}>{awayScore}</Text>
            )}
          </TouchableOpacity>
        </View>

        {(homeEvents.length > 0 || awayEvents.length > 0) && (
          <View style={styles.eventsSection}>
            <View style={styles.eventsColumn}>
              {homeEvents.map((event, idx) => renderEvent(event, false))}
            </View>
            <View style={styles.eventsColumn}>
              {awayEvents.map((event, idx) => renderEvent(event, true))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white, // Clean white background
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2, // Stronger navy border
    borderColor: theme.colors.primary, // Navy blue border
    ...theme.shadows.md,
    position: 'relative',
    overflow: 'visible'
  },
  liveIndicator: {
    position: 'absolute',
    top: -8,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Brave Warriors red
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs / 2,
    zIndex: 10,
    ...theme.shadows.md
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white
  },
  liveText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 8,
    letterSpacing: 0.5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs
  },
  competition: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary, // Navy for competition name
    fontSize: 11,
    flex: 1
  },
  notifyButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm
  },
  teamsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    minWidth: 0
  },
  teamLogo: {
    width: 40, // Reduced from 48 for better fit
    height: 40, // Reduced from 48 for better fit
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm
  },
  teamName: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textDark,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: '100%'
  },
  score: {
    fontSize: 20, // Reduced from 24 for better fit
    fontWeight: '900',
    color: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for scores
    marginTop: theme.spacing.xs / 2,
    letterSpacing: -0.3 // Tighter spacing for large numbers
  },
  vs: {
    ...theme.typography.body,
    color: theme.colors.muted,
    marginHorizontal: theme.spacing.sm,
    fontSize: 13
  },
  eventsSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderNavy || theme.colors.primary, // Navy divider
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 20
  },
  eventsColumn: {
    flex: 1,
    gap: theme.spacing.xs / 2,
    minWidth: 0
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2
  },
  eventRowAway: {
    flexDirection: 'row-reverse'
  },
  eventIcon: {
    marginHorizontal: theme.spacing.xs / 2
  },
  eventText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 10,
    flex: 1,
    minWidth: 0
  },
  eventMinute: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '600',
    minWidth: 24
  }
});

export default MatchCardDetailed;

