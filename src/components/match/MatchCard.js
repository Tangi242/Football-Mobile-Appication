import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { nfaImages } from '../../constants/media.js';

const MatchCard = ({ match, liveEvent }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const pulse = useState(new Animated.Value(1))[0];
  if (!match) return null;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();
  }, [pulse]);
  const date = dayjs(match.match_date).format('ddd, MMM D • HH:mm');

  const status = liveEvent?.status || match.status || 'scheduled';
  const homeScore = liveEvent?.home_score ?? match.home_score;
  const awayScore = liveEvent?.away_score ?? match.away_score;
  
  // Determine match status
  const isLive = status?.toLowerCase() === 'live' || status?.toLowerCase() === 'in_progress';
  const isFinished = status?.toLowerCase() === 'finished' || status?.toLowerCase() === 'completed';
  const isUpcoming = !isLive && !isFinished;
  
  const getStatusLabel = () => {
    if (isLive) return 'LIVE';
    if (isFinished) return 'FINISHED';
    return 'UPCOMING';
  };

  const handleBuyTickets = () => {
    navigation.navigate('Tickets', { matchId: match.id || match.match_id });
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

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: cardScale }] }}>
      <TouchableOpacity 
        style={[styles.card, { padding: width < 360 ? 20 : 24 }]}
        onPress={() => navigation.navigate('MatchDetails', { matchId: match.id || match.match_id })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Match: ${match.home_team} vs ${match.away_team}`}
      accessibilityHint="Double tap to view match details"
    >
      <Image
        source={nfaImages.matchBackdrop}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="disk"
        blurRadius={1}
        accessibilityLabel={`Match backdrop: ${match.home_team} vs ${match.away_team}`}
        accessibilityRole="image"
      />
      <View style={styles.backdrop} />
      <View style={styles.row}>
        <Text 
          style={styles.competition}
          allowFontScaling={true}
          maxFontSizeMultiplier={1.5}
          minimumFontSize={12}
        >
          {match.competition || 'Friendly'}
        </Text>
        <Animated.View style={[styles.statusBadge, isLive && styles.statusLive, isFinished && styles.statusFinished, isLive && { transform: [{ scale: pulse }] }]}>
          <Text 
            style={[styles.statusText, isLive && styles.statusLiveText]}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={10}
          >
            {getStatusLabel()}
          </Text>
        </Animated.View>
      </View>
      <View style={styles.teams}>
        <TouchableOpacity 
          style={styles.team}
          onPress={() => match.home_team && navigation.navigate('TeamProfile', { teamName: match.home_team })}
          activeOpacity={0.7}
        >
          <Text 
            style={styles.teamName}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={14}
            accessibilityLabel={`Home team: ${match.home_team}`}
          >
            {match.home_team}
          </Text>
          {homeScore !== undefined && (
            <Text 
              style={styles.score}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.3}
              minimumFontSize={24}
              accessibilityLabel={`Home team score: ${homeScore}`}
            >
              {homeScore}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.team}
          onPress={() => match.away_team && navigation.navigate('TeamProfile', { teamName: match.away_team })}
          activeOpacity={0.7}
        >
          <Text 
            style={styles.teamName}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={14}
            accessibilityLabel={`Away team: ${match.away_team}`}
          >
            {match.away_team}
          </Text>
          {awayScore !== undefined && (
            <Text 
              style={styles.score}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.3}
              minimumFontSize={24}
              accessibilityLabel={`Away team score: ${awayScore}`}
            >
              {awayScore}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.metaSection}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <Text 
            style={styles.meta}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={11}
            accessibilityLabel={`Match date: ${date}`}
          >
            {date}
          </Text>
        </View>
        {match.venue && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text 
              style={styles.meta}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.5}
              minimumFontSize={11}
              accessibilityLabel={`Venue: ${match.venue}`}
            >
              {match.venue}
            </Text>
          </View>
        )}
      </View>
      {isUpcoming && (
        <TouchableOpacity 
          style={styles.buyTicketsButton}
          onPress={(e) => {
            e.stopPropagation();
            handleBuyTickets();
          }}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Buy tickets for this match"
          accessibilityHint="Opens ticket purchase screen"
        >
          <Ionicons name="ticket" size={18} color={theme.colors.white} />
          <Text 
            style={styles.buyTicketsText}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={12}
          >
            Buy Tickets
          </Text>
        </TouchableOpacity>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white, // Clean white background
    width: '100%',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    borderWidth: 1.5, // Reduced from 2
    borderColor: theme.colors.primary, // Navy blue border
    minHeight: theme.touchTarget?.minHeight || 44, // Ensure proper touch target
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)' // More opaque white
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  competition: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary, // Navy for competition
    fontWeight: '700',
    fontSize: 12
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundPrimary
  },
  statusLive: {
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C' // Red for live
  },
  statusFinished: {
    backgroundColor: theme.colors.textSecondary
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.8
  },
  statusLiveText: {
    color: theme.colors.white
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md
  },
  team: {
    flex: 1,
    alignItems: 'center'
  },
  teamName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.xs
  },
  score: {
    fontSize: 28, // Reduced from 36 for better fit
    fontWeight: '900',
    color: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for scores
    marginTop: theme.spacing.xs / 2,
    letterSpacing: -0.5 // Tighter spacing for large numbers
  },
  metaSection: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs / 2
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2
  },
  meta: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 12
  },
  buyTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red accent
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
    minHeight: 44, // Ensure proper touch target
    ...theme.shadows.sm
  },
  buyTicketsText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14
  }
});

export default MatchCard;

