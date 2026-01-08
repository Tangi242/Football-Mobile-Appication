import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from '../../lib/dayjs.js';
import baseTheme from '../../theme/colors.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useData } from '../../context/DataContext.js';
import { fetchPlayerById, fetchPlayerByName } from '../../api/client.js';
import { getPlayerImage } from '../../constants/media.js';
import { getFlagForTeam } from '../../utils/flags.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';

const StarRating = ({ rating = 3, theme }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={16}
          color={star <= rating ? '#FFC72C' : theme.colors.muted}
        />
      ))}
    </View>
  );
};

const StatRow = ({ label, value, icon, theme }) => (
  <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
    <View style={styles.statLeft}>
      {icon && <Ionicons name={icon} size={18} color={theme.colors.primary} style={styles.statIcon} />}
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color: theme.colors.primary }]}>{value}</Text>
  </View>
);

const PlayerDetailScreen = ({ route, navigation }) => {
  const { playerId, playerName } = route.params || {};
  const { theme: currentTheme } = useTheme();
  const { fixtures, results, users } = useData();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setLoading(true);
        let response;
        if (playerId) {
          response = await fetchPlayerById(playerId);
        } else if (playerName) {
          response = await fetchPlayerByName(playerName);
        } else {
          // Try to find player from users data
          const foundPlayer = (users || []).find(u =>
            u.full_name === playerName || u.id === playerId
          );
          if (foundPlayer) {
            setPlayer(foundPlayer);
            setLoading(false);
            return;
          }
          navigation.goBack();
          return;
        }
        setPlayer(response.data.player);
      } catch (error) {
        console.error('Failed to load player:', error);
        // Fallback to users data
        const foundPlayer = (users || []).find(u =>
          u.full_name === playerName || u.id === playerId
        );
        if (foundPlayer) {
          setPlayer(foundPlayer);
        }
      } finally {
        setLoading(false);
      }
    };
    loadPlayer();
  }, [playerId, playerName, navigation, users]);

  // Get player matches
  const playerMatches = useMemo(() => {
    const displayPlayer = player || fallbackPlayer;
    if (!displayPlayer || !displayPlayer.team_name) return [];
    const allMatches = [...(fixtures || []), ...(results || [])];
    // Filter matches where player's team played
    return allMatches
      .filter(m => m.home_team === displayPlayer.team_name || m.away_team === displayPlayer.team_name)
      .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
      .slice(0, 10);
  }, [player, fallbackPlayer, fixtures, results]);

  // Mock achievements
  const achievements = useMemo(() => {
    const displayPlayer = player || fallbackPlayer;
    if (!displayPlayer) return [];
    const achievementsList = [];
    if ((displayPlayer.total_goals || 0) > 20) achievementsList.push('Top Scorer');
    if ((displayPlayer.total_assists || 0) > 15) achievementsList.push('Assist Leader');
    if ((displayPlayer.matches_played || 0) > 50) achievementsList.push('50+ Appearances');
    if ((displayPlayer.total_goals || 0) > 50) achievementsList.push('50+ Goals');
    return achievementsList.length > 0 ? achievementsList : ['Rising Star'];
  }, [player, fallbackPlayer]);

  // Fallback player data if API fails
  const fallbackPlayer = useMemo(() => {
    return (users || []).find(u =>
      u.full_name === playerName || u.id === playerId
    );
  }, [playerName, playerId, users]);

  const displayPlayer = player || fallbackPlayer;

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (error && !displayPlayer) {
    return (
      <ScreenWrapper>
        <View style={[styles.errorContainer, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
          <Ionicons name="alert-circle" size={48} color={currentTheme.colors.error || currentTheme.colors.interactive || '#DC143C'} />
          <Text style={[styles.errorText, { color: currentTheme.colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: currentTheme.colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  if (!displayPlayer) {
    return (
      <ScreenWrapper>
        <View style={[styles.errorContainer, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
          <Ionicons name="person-remove" size={48} color={currentTheme.colors.muted} />
          <Text style={[styles.errorText, { color: currentTheme.colors.textSecondary }]}>Player not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: currentTheme.colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const age = displayPlayer.age || (displayPlayer.dob ? Math.floor(dayjs().diff(dayjs(displayPlayer.dob), 'year')) : 25);
  const dobFormatted = displayPlayer.dob ? dayjs(displayPlayer.dob).format('DD/MM/YYYY') : null;
  const fullName = displayPlayer.full_name || displayPlayer.name || playerName || 'Player';
  const firstName = fullName.split(' ')[0] || '';
  const lastName = fullName.split(' ').slice(1).join(' ') || fullName;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            <View style={[styles.detailsSection, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <View style={styles.detailsRow}>
                <View style={styles.detailColumn}>
                  <Text style={[styles.detailValue, { color: currentTheme.colors.textDark }]}>{age} yrs</Text>
                  {dobFormatted && (
                    <Text style={[styles.detailSubtext, { color: currentTheme.colors.muted }]}>{dobFormatted}</Text>
                  )}
                </View>
                <View style={styles.detailColumn}>
                  <Text style={[styles.detailValue, { color: currentTheme.colors.textDark }]}>{displayPlayer.nationality || 'Namibia'}</Text>
                  <Text style={[styles.detailSubtext, { color: currentTheme.colors.muted }]}>Nationality</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={[styles.detailValue, { color: currentTheme.colors.textDark }]}>N${((displayPlayer.total_goals || 0) * 2.5).toFixed(1)}M</Text>
                  <Text style={[styles.detailSubtext, { color: currentTheme.colors.muted }]}>Value</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailColumn}>
                  <Text style={[styles.detailValue, { color: currentTheme.colors.textDark }]}>N${((displayPlayer.total_goals || 0) * 0.5).toFixed(0)}K</Text>
                  <Text style={[styles.detailSubtext, { color: currentTheme.colors.muted }]}>Wage</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={[styles.detailValue, { color: currentTheme.colors.textDark }]}>{dayjs().add(5, 'year').format('DD/MM/YYYY')}</Text>
                  <Text style={[styles.detailSubtext, { color: currentTheme.colors.muted }]}>Contract Expiry</Text>
                </View>
                <View style={styles.detailColumn}>
                  <View style={[styles.statusBadge, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={[styles.statusText, { color: '#10B981' }]}>Active</Text>
                  </View>
                  <Text style={[styles.detailSubtext, { color: currentTheme.colors.muted }]}>Squad Status</Text>
                </View>
              </View>

              <View style={[styles.teamInfo, { borderTopColor: currentTheme.colors.border }]}>
                <TouchableOpacity
                  onPress={() => displayPlayer.team_name && navigation.navigate('TeamProfile', { teamName: displayPlayer.team_name })}
                  activeOpacity={0.7}
                >
                  {displayPlayer.team_name && (
                    <Text style={[styles.teamName, { color: currentTheme.colors.textDark }]}>{displayPlayer.team_name}</Text>
                  )}
                  {displayPlayer.league_name && (
                    <Text style={[styles.leagueName, { color: currentTheme.colors.textSecondary }]}>{displayPlayer.league_name}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {achievements.length > 0 && (
              <View style={styles.achievementsSection}>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Achievements</Text>
                <View style={[styles.achievementsCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
                  {achievements.map((achievement, index) => (
                    <View key={index} style={[styles.achievementItem, { borderBottomColor: currentTheme.colors.border }]}>
                      <Ionicons name="trophy" size={16} color="#F59E0B" />
                      <Text style={[styles.achievementText, { color: currentTheme.colors.textDark }]}>{achievement}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      case 'stats':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Career Statistics</Text>
            <View style={[styles.statsCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <StatRow label="Goals" value={displayPlayer.total_goals || 0} icon="football" theme={currentTheme} />
              <StatRow label="Assists" value={displayPlayer.total_assists || 0} icon="hand-left" theme={currentTheme} />
              <StatRow label="Appearances" value={displayPlayer.matches_played || 0} icon="calendar" theme={currentTheme} />
              <StatRow label="Yellow Cards" value={displayPlayer.total_yellow_cards || 0} icon="warning" theme={currentTheme} />
              <StatRow label="Red Cards" value={displayPlayer.total_red_cards || 0} icon="close-circle" theme={currentTheme} />
              <StatRow
                label="Goals/Game"
                value={displayPlayer.matches_played ? ((displayPlayer.total_goals || 0) / displayPlayer.matches_played).toFixed(2) : '0.00'}
                icon="trending-up"
                theme={currentTheme}
              />
              <StatRow
                label="Assists/Game"
                value={displayPlayer.matches_played ? ((displayPlayer.total_assists || 0) / displayPlayer.matches_played).toFixed(2) : '0.00'}
                icon="arrow-up"
                theme={currentTheme}
              />
            </View>
          </View>
        );
      case 'matches':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Recent Matches</Text>
            {playerMatches.length > 0 ? (
              playerMatches.map((match, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.matchCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}
                  onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.matchHeader}>
                    <Text style={[styles.matchCompetition, { color: currentTheme.colors.textSecondary }]}>
                      {match.competition || 'League Match'}
                    </Text>
                    <Text style={[styles.matchDate, { color: currentTheme.colors.muted }]}>
                      {dayjs(match.match_date).format('MMM D, YYYY')}
                    </Text>
                  </View>
                  <View style={styles.matchTeams}>
                    <Text style={[styles.matchTeam, { color: currentTheme.colors.textDark }]}>{match.home_team}</Text>
                    {match.home_score !== undefined && (
                      <Text style={[styles.matchScore, { color: currentTheme.colors.primary }]}>
                        {match.home_score} - {match.away_score}
                      </Text>
                    )}
                    <Text style={[styles.matchTeam, { color: currentTheme.colors.textDark }]}>{match.away_team}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: currentTheme.colors.muted }]}>No matches found</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={[styles.container, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: currentTheme.colors.surface, borderBottomColor: currentTheme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={currentTheme.colors.textDark} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.colors.textDark }]}>Player Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={[styles.portraitContainer, { borderColor: currentTheme.colors.primary }]}>
              <Image
                source={displayPlayer.photo_path || displayPlayer.avatar_url || getPlayerImage(0)}
                style={styles.portrait}
                contentFit="cover"
                cachePolicy="disk"
              />
              {displayPlayer.jersey_number && (
                <View style={[styles.jerseyNumber, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                  <Text style={styles.jerseyNumberText}>#{displayPlayer.jersey_number}</Text>
                </View>
              )}
              {displayPlayer.team_name && (
                <View style={[styles.teamLogo, { borderColor: currentTheme.colors.white }]}>
                  <Image source={getFlagForTeam(displayPlayer.team_name)} style={styles.logoImage} contentFit="cover" />
                </View>
              )}
            </View>
            <View style={[styles.nameBanner, { backgroundColor: currentTheme.colors.primary }]}>
              <Text style={styles.lastName}>{lastName.toUpperCase()}</Text>
            </View>
            <Text style={[styles.firstName, { color: currentTheme.colors.textDark }]}>{firstName}</Text>
            <Text style={[styles.position, { color: currentTheme.colors.textSecondary }]}>{displayPlayer.position || 'Player'}</Text>
            <StarRating rating={4} theme={currentTheme} />
          </View>

          <View style={[styles.tabs, { backgroundColor: currentTheme.colors.backgroundSecondary }]}>
            {['overview', 'stats', 'matches'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && [styles.tabActive, { backgroundColor: currentTheme.colors.primary }]
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab ? currentTheme.colors.white : currentTheme.colors.textSecondary },
                  activeTab === tab && styles.tabTextActive
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderContent()}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.lg,
    paddingBottom: baseTheme.spacing.md,
    borderBottomWidth: 1,
    ...baseTheme.shadows.sm
  },
  backButton: {
    padding: baseTheme.spacing.sm
  },
  headerTitle: {
    ...baseTheme.typography.h4
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: baseTheme.spacing.xl
  },
  errorText: {
    ...baseTheme.typography.body,
    marginBottom: baseTheme.spacing.md
  },
  backButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600'
  },
  scrollContent: {
    padding: baseTheme.spacing.md,
    paddingBottom: baseTheme.spacing.lg
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: baseTheme.spacing.md
  },
  portraitContainer: {
    width: 160,
    height: 160,
    borderRadius: baseTheme.borderRadius.lg,
    borderWidth: 4,
    marginBottom: baseTheme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: baseTheme.colors.surface,
    ...baseTheme.shadows.lg
  },
  portrait: {
    width: '100%',
    height: '100%'
  },
  jerseyNumber: {
    position: 'absolute',
    top: baseTheme.spacing.sm,
    left: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.sm,
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs
  },
  jerseyNumberText: {
    color: baseTheme.colors.white,
    fontWeight: '700',
    ...baseTheme.typography.bodySmall
  },
  teamLogo: {
    position: 'absolute',
    bottom: baseTheme.spacing.sm,
    right: baseTheme.spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    overflow: 'hidden',
    backgroundColor: baseTheme.colors.surface,
    ...baseTheme.shadows.md
  },
  logoImage: {
    width: '100%',
    height: '100%'
  },
  nameBanner: {
    paddingVertical: baseTheme.spacing.sm,
    paddingHorizontal: baseTheme.spacing.lg,
    borderRadius: baseTheme.borderRadius.sm,
    marginBottom: baseTheme.spacing.sm,
    ...baseTheme.shadows.md
  },
  lastName: {
    color: baseTheme.colors.white,
    ...baseTheme.typography.h4,
    fontWeight: '800',
    letterSpacing: 1.2
  },
  firstName: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs
  },
  position: {
    ...baseTheme.typography.body,
    marginBottom: baseTheme.spacing.md
  },
  starContainer: {
    flexDirection: 'row',
    gap: baseTheme.spacing.xs
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.xs,
    marginBottom: baseTheme.spacing.lg,
    ...baseTheme.shadows.sm
  },
  tab: {
    flex: 1,
    paddingVertical: baseTheme.spacing.sm,
    alignItems: 'center',
    borderRadius: baseTheme.borderRadius.sm
  },
  tabActive: {
    // backgroundColor set inline
  },
  tabText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600'
  },
  tabTextActive: {
    color: baseTheme.colors.white,
    fontWeight: '700'
  },
  detailsSection: {
    borderRadius: baseTheme.borderRadius.lg,
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.md
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.md
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center'
  },
  detailValue: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs
  },
  detailSubtext: {
    ...baseTheme.typography.caption
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.xs,
    marginBottom: baseTheme.spacing.xs,
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm
  },
  statusText: {
    ...baseTheme.typography.caption,
    fontWeight: '600'
  },
  teamInfo: {
    alignItems: 'center',
    paddingTop: baseTheme.spacing.lg,
    borderTopWidth: 1
  },
  teamName: {
    ...baseTheme.typography.h4,
    marginBottom: baseTheme.spacing.xs
  },
  leagueName: {
    ...baseTheme.typography.bodySmall
  },
  statsSection: {
    marginBottom: baseTheme.spacing.md
  },
  sectionTitle: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    marginBottom: baseTheme.spacing.sm
  },
  statsCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.sm,
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: baseTheme.spacing.md,
    borderBottomWidth: 1
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  statIcon: {
    marginRight: baseTheme.spacing.sm
  },
  statLabel: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600'
  },
  statValue: {
    fontSize: 18, // Reduced from 22
    fontWeight: '900',
    color: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C', // Red for stats
    letterSpacing: -0.3 // Tighter spacing for large numbers
  },
  achievementsSection: {
    marginBottom: baseTheme.spacing.md
  },
  achievementsCard: {
    borderRadius: baseTheme.borderRadius.lg,
    padding: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.md
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1
  },
  achievementText: {
    ...baseTheme.typography.bodySmall,
    flex: 1
  },
  matchCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.sm
  },
  matchCompetition: {
    ...baseTheme.typography.caption,
    fontWeight: '600'
  },
  matchDate: {
    ...baseTheme.typography.caption
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: baseTheme.spacing.sm
  },
  matchTeam: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    flex: 1
  },
  matchScore: {
    ...baseTheme.typography.body,
    fontWeight: '700'
  },
  emptyText: {
    ...baseTheme.typography.bodySmall,
    textAlign: 'center',
    padding: baseTheme.spacing.lg
  }
});

export default PlayerDetailScreen;

