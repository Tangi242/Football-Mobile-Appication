import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { Image } from 'expo-image';
import * as Calendar from 'expo-calendar';
import dayjs from '../../lib/dayjs.js';
import { useAuth } from '../../context/AuthContext.js';
import { fetchMatchEvents, fetchFixtures, fetchResults } from '../../api/client.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useToast } from '../../hooks/useToast.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import MatchCenter from '../../components/match/MatchCenter.js';
import MatchPreview from '../../components/match/MatchPreview.js';
import MediaGallery from '../../components/common/MediaGallery.js';
import VideoHighlights from '../../components/common/VideoHighlights.js';
import Tooltip from '../../components/ui/Tooltip.js';
import { shareMatch } from '../../utils/share.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';
import { placeholderImages } from '../../assets/placeholders.js';
import { onlineImages } from '../../assets/onlineImages.js';

// Statistics explanations
const STAT_EXPLANATIONS = {
  possession: 'The percentage of time a team controls the ball during the match. Higher possession often indicates better control but doesn\'t guarantee victory.',
  shots: 'Total number of attempts to score, including shots that miss the target. More shots can indicate attacking dominance.',
  shotsOnTarget: 'Shots that are on target and require the goalkeeper to make a save. A key indicator of attacking quality.',
  corners: 'Corner kicks awarded when the ball goes out of play over the goal line after touching a defender. Can lead to scoring opportunities.',
  fouls: 'Number of rule violations committed. Too many fouls can result in cards and free kicks for the opposition.',
  yellowCards: 'Cautions given for serious fouls or unsporting behavior. Two yellow cards result in a red card and player dismissal.',
  redCards: 'Direct dismissals for serious offenses. The team must play with one fewer player for the remainder of the match.',
};

const StatCard = ({ label, value, icon, color = theme.colors.primary, explanation, trend, trendValue }) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return 'arrow-up';
    if (trend === 'down') return 'arrow-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (!trend) return theme.colors.muted;
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return theme.colors.muted;
  };

  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {explanation && (
          <Tooltip text={explanation}>
            <Ionicons name="help-circle-outline" size={16} color={theme.colors.muted} />
          </Tooltip>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statLabelRow}>
        <Text style={styles.statLabel}>{label}</Text>
        {trend && trendValue && (
          <View style={styles.trendIndicator}>
            <Ionicons name={getTrendIcon()} size={12} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue > 0 ? '+' : ''}{trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const MatchDetailsScreen = ({ route, navigation }) => {
  const { matchId } = route.params || {};
  const { saveFixture, isFixtureSaved } = useAuth();
  const { showError } = useToast();
  const { refreshKeys } = useRefresh();
  const [calendarPermission, setCalendarPermission] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fixturesRes, resultsRes] = await Promise.all([
        fetchFixtures(),
        fetchResults()
      ]);
      setFixtures(fixturesRes.data?.fixtures || []);
      setResults(resultsRes.data?.results || []);
    } catch (error) {
      console.error('Error loading match data:', error);
      showError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Load data on focus and when refresh keys change
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, refreshKeys.matches])
  );

  const match = useMemo(() => {
    const allMatches = [...(fixtures || []), ...(results || [])];
    return allMatches.find(m => m.id === matchId || m.match_id === matchId);
  }, [fixtures, results, matchId]);

  const [matchEvents, setMatchEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Calculate values needed for useMemo hooks - must be done before early returns
  const matchDate = match ? dayjs(match.match_date) : null;
  const isUpcoming = matchDate ? matchDate.isAfter(dayjs()) : false;
  const isScheduled = match?.status === 'scheduled' || match?.status === 'in_progress';
  const canBuyTicket = isUpcoming || isScheduled;
  const isLive = (liveEvent?.status || match?.status)?.toLowerCase() === 'live';

  // Always call hooks at the top level - before any early returns
  const galleryImages = useMemo(() => {
    return onlineImages.matchBanners.map(url => ({ uri: url }));
  }, []);

  const videos = useMemo(() => {
    if (!isLive && !isUpcoming && match) {
      return [
        {
          title: 'Match Highlights',
          thumbnail: { uri: onlineImages.matchBanners[0] },
          url: null, // Video URL will be provided when available
          duration: '5:23',
          date: '2 days ago',
          views: '1.2K'
        }
      ];
    }
    return [];
  }, [isLive, isUpcoming, match]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!matchId) return;
      setLoadingEvents(true);
      try {
        const response = await fetchMatchEvents(matchId);
        const events = response.data?.events || [];
        if (events.length > 0) {
          setMatchEvents(events);
        } else {
          setMatchEvents([]);
        }
      } catch (error) {
        console.error('Error loading match events:', error);
        setMatchEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [matchId, liveEvent]);

  // Calculate statistics with trend indicators
  const statistics = useMemo(() => {
    if (!match) return null;

    // Get previous matches for trend comparison
    const previousMatches = (results || []).filter(m => {
      if (!m.match_date) return false;
      const matchDate = dayjs(match.match_date);
      const prevDate = dayjs(m.match_date);
      return prevDate.isBefore(matchDate) &&
        (m.home_team === match.home_team || m.away_team === match.home_team ||
          m.home_team === match.away_team || m.away_team === match.away_team);
    }).slice(0, 5); // Last 5 matches

    // Calculate average stats from previous matches
    const avgStats = previousMatches.length > 0 ? {
      possession: previousMatches.reduce((sum, m) => sum + 50, 0) / previousMatches.length, // Mock average
      shots: previousMatches.reduce((sum, m) => sum + ((m.home_score || 0) + (m.away_score || 0)), 0) / previousMatches.length,
      shotsOnTarget: 4, // Mock average
      corners: 3, // Mock average
      fouls: 9, // Mock average
      yellowCards: 1.5, // Mock average
    } : null;

    const currentStats = {
      possession: { home: 52, away: 48 },
      shots: { home: match.home_score || 0, away: match.away_score || 0 },
      shotsOnTarget: { home: 5, away: 3 },
      corners: { home: 4, away: 2 },
      fouls: { home: 8, away: 10 },
      yellowCards: { home: 2, away: 1 },
      redCards: { home: 0, away: 0 }
    };

    // Calculate trends
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return null;
      const diff = current - previous;
      if (Math.abs(diff) < 0.5) return null; // No significant change
      return {
        trend: diff > 0 ? 'up' : 'down',
        value: Math.round(diff * 10) / 10
      };
    };

    return {
      ...currentStats,
      trends: avgStats ? {
        shots: calculateTrend(currentStats.shots.home + currentStats.shots.away, avgStats.shots),
        shotsOnTarget: calculateTrend(currentStats.shotsOnTarget.home + currentStats.shotsOnTarget.away, avgStats.shotsOnTarget),
        corners: calculateTrend(currentStats.corners.home + currentStats.corners.away, avgStats.corners),
        fouls: calculateTrend(currentStats.fouls.home + currentStats.fouls.away, avgStats.fouls),
        yellowCards: calculateTrend(currentStats.yellowCards.home + currentStats.yellowCards.away, avgStats.yellowCards),
      } : null
    };
  }, [match, results]);

  const requestCalendarPermission = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setCalendarPermission(status);
      return status === 'granted';
    } catch (error) {
      console.error('Calendar permission error:', error);
      return false;
    }
  };

  const addToCalendar = async () => {
    if (!match) return;

    const hasPermission = calendarPermission === 'granted' || await requestCalendarPermission();
    if (!hasPermission) {
      alert('Calendar permission is required to save matches');
      return;
    }

    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];

      if (!defaultCalendar) {
        alert('No writable calendar found');
        return;
      }

      const matchDate = dayjs(match.match_date);
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `${match.home_team} vs ${match.away_team}`,
        startDate: matchDate.toDate(),
        endDate: matchDate.add(2, 'hours').toDate(),
        location: match.venue || '',
        notes: `Football match: ${match.competition || ''}\nVenue: ${match.venue || 'TBA'}`,
        timeZone: 'Africa/Windhoek'
      });

      alert('Match added to calendar successfully!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('Failed to add match to calendar');
    }
  };

  if (!match) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.muted} />
          <Text style={styles.errorText}>Match not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }


  const handleShare = async () => {
    if (match) {
      await shareMatch(match);
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-social" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addToCalendar} style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => match && saveFixture(match)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={match && isFixtureSaved(match.id) ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={match && isFixtureSaved(match.id) ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isUpcoming && <MatchPreview match={match} />}
        <MatchCenter match={match} liveEvent={liveEvent} events={matchEvents} />

        {statistics && (
          <View style={styles.statsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Match Statistics</Text>
              <Text style={styles.sectionSubtitle}>Tap the info icons for explanations</Text>
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="Possession"
                value={`${statistics.possession.home}%`}
                icon="pie-chart"
                explanation={STAT_EXPLANATIONS.possession}
              />
              <StatCard
                label="Shots"
                value={statistics.shots.home}
                icon="radio-button-on"
                explanation={STAT_EXPLANATIONS.shots}
                trend={statistics.trends?.shots?.trend}
                trendValue={statistics.trends?.shots?.value}
              />
              <StatCard
                label="On Target"
                value={statistics.shotsOnTarget.home}
                icon="locate"
                explanation={STAT_EXPLANATIONS.shotsOnTarget}
                trend={statistics.trends?.shotsOnTarget?.trend}
                trendValue={statistics.trends?.shotsOnTarget?.value}
              />
              <StatCard
                label="Corners"
                value={statistics.corners.home}
                icon="flag"
                explanation={STAT_EXPLANATIONS.corners}
                trend={statistics.trends?.corners?.trend}
                trendValue={statistics.trends?.corners?.value}
              />
              <StatCard
                label="Fouls"
                value={statistics.fouls.home}
                icon="warning"
                explanation={STAT_EXPLANATIONS.fouls}
                trend={statistics.trends?.fouls?.trend}
                trendValue={statistics.trends?.fouls?.value}
              />
              <StatCard
                label="Yellow Cards"
                value={statistics.yellowCards.home}
                icon="card"
                color="#F59E0B"
                explanation={STAT_EXPLANATIONS.yellowCards}
                trend={statistics.trends?.yellowCards?.trend}
                trendValue={statistics.trends?.yellowCards?.value}
              />
            </View>

            <View style={styles.comparisonSection}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonTitle}>Possession Comparison</Text>
                <Tooltip text="Shows the percentage of ball possession for each team. The longer the bar, the more time that team controlled the ball during the match.">
                  <Ionicons name="help-circle-outline" size={16} color={theme.colors.muted} />
                </Tooltip>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{match.home_team}</Text>
                <View style={styles.comparisonBar}>
                  <View style={[styles.comparisonFill, { width: `${statistics.possession.home}%` }]} />
                </View>
                <Text style={styles.comparisonValue}>{statistics.possession.home}%</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{match.away_team}</Text>
                <View style={styles.comparisonBar}>
                  <View style={[styles.comparisonFill, { width: `${statistics.possession.away}%` }]} />
                </View>
                <Text style={styles.comparisonValue}>{statistics.possession.away}%</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Match Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                {dayjs(match.match_date).format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                {dayjs(match.match_date).format('HH:mm')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>{match.venue || 'Venue TBA'}</Text>
            </View>
            {match.referee && (
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>Referee: {match.referee}</Text>
              </View>
            )}
          </View>
        </View>

        {!isUpcoming && galleryImages.length > 0 && (
          <MediaGallery images={galleryImages} title="Match Photos" />
        )}

        {!isUpcoming && videos.length > 0 && (
          <VideoHighlights videos={videos} title="Match Highlights" />
        )}
      </ScrollView>

      {/* Buy Ticket Button - Fixed at bottom */}
      {canBuyTicket && (
        <View style={styles.buyTicketContainer}>
          <LoadingButton
            title="Buy Ticket"
            onPress={() => {
              navigation.navigate('TicketCheckout', { matchId: match.id || match.match_id });
            }}
            icon="ticket"
            iconPosition="left"
            fullWidth
            style={styles.buyTicketButton}
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm
  },
  backButton: {
    padding: theme.spacing.sm
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  actionButton: {
    padding: theme.spacing.sm
  },
  calendarButton: {
    padding: theme.spacing.sm
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 80 // Extra padding for fixed button
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  backButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  statsSection: {
    marginTop: theme.spacing.md
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs / 2,
    fontStyle: 'italic',
  },
  statCard: {
    width: '30%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  statIconContainer: {
    width: 36, // Reduced from 48
    height: 36, // Reduced from 48
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs / 2,
    flexWrap: 'wrap',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: theme.spacing.xs / 2,
  },
  trendText: {
    ...theme.typography.tiny,
    fontWeight: '700',
    fontSize: 9,
  },
  statValue: {
    fontSize: 18, // Reduced from 24 for better fit
    fontWeight: '900',
    color: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for stats
    marginBottom: theme.spacing.xs / 2,
    letterSpacing: -0.3 // Tighter spacing for large numbers
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    textAlign: 'center'
  },
  comparisonSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    marginTop: theme.spacing.md
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  comparisonTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textDark,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  comparisonLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textDark,
    width: 100
  },
  comparisonBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: 4,
    marginHorizontal: theme.spacing.md,
    overflow: 'hidden'
  },
  comparisonFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4
  },
  comparisonValue: {
    fontSize: 20, // Increased from bodySmall (14) - larger for emphasis
    fontWeight: '900', // Increased from 700 - bolder
    color: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for percentages
    width: 60, // Increased to accommodate larger text
    textAlign: 'right',
    letterSpacing: -0.2 // Tighter spacing for large numbers
  },
  infoSection: {
    marginTop: theme.spacing.md
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    gap: theme.spacing.sm
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary
  },
  buyTicketContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg
  },
  buyTicketButton: {
    // LoadingButton handles its own styling
    // This allows for custom overrides if needed
  }
});

export default MatchDetailsScreen;

