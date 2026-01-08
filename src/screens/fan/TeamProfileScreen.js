import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import dayjs from '../../lib/dayjs.js';
import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import baseTheme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';
import { getPlayerImage } from '../../constants/media.js';

const StatBox = ({ label, value, icon, color, theme }) => (
  <View style={[styles.statBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
    <View style={[styles.statIconBox, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
      <Ionicons name={icon} size={16} color={color || theme.colors.primary} />
    </View>
    <Text style={[styles.statValue, { color: theme.colors.textDark }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.colors.muted }]}>{label}</Text>
  </View>
);

const SquadPlayer = ({ player, onPress, theme }) => (
  <TouchableOpacity 
    style={[styles.squadPlayer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    <ExpoImage
      source={player.photo_path || getPlayerImage(0)}
      style={styles.playerPhoto}
      contentFit="cover"
    />
    <View style={styles.playerInfo}>
      <Text style={[styles.playerName, { color: theme.colors.textDark }]} numberOfLines={1}>
        {player.full_name || player.name}
      </Text>
      <Text style={[styles.playerPosition, { color: theme.colors.textSecondary }]}>
        {player.position || 'Player'}
      </Text>
      {player.jersey_number && (
        <View style={[styles.jerseyBadge, { backgroundColor: theme.colors.backgroundPrimary }]}>
          <Text style={[styles.jerseyText, { color: theme.colors.primary }]}>#{player.jersey_number}</Text>
        </View>
      )}
    </View>
    <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
  </TouchableOpacity>
);

const TeamProfileScreen = ({ route, navigation }) => {
  const { teamName, teamId } = route.params || {};
  const { theme: currentTheme } = useTheme();
  const { fixtures, results, users, leagues } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const { announcements } = useData();
  const { toggleFavoriteTeam, isFavoriteTeam } = useAuth();

  // Mock team data - in real app, fetch from API
  const team = useMemo(() => {
    // Find team from results/fixtures
    const allMatches = [...(fixtures || []), ...(results || [])];
    const teamMatch = allMatches.find(m => 
      m.home_team === teamName || m.away_team === teamName
    );
    
    return {
      id: teamId || 1,
      name: teamName || 'Team Name',
      logo: getFlagForTeam(teamName),
      colors: { primary: currentTheme.colors.primary, secondary: currentTheme.colors.secondary },
      stadium: 'Independence Stadium',
      founded: 1990,
      manager: 'John Doe',
      assistantManager: 'Jane Smith',
      captain: 'Player Name',
      league: teamMatch?.competition || 'Premier League',
      wins: 15,
      draws: 5,
      losses: 3,
      goalsFor: 42,
      goalsAgainst: 18,
      points: 50,
      position: 1
    };
  }, [teamName, teamId, fixtures, results]);

  const squad = useMemo(() => {
    return (users || []).filter(u => u.team_name === teamName && u.role === 'player')
      .map((player, index) => ({
        ...player,
        position: player.position || ['GK', 'DF', 'MF', 'FW'][index % 4],
        jersey_number: player.jersey_number || (index + 1)
      }));
  }, [users, teamName]);

  const recentMatches = useMemo(() => {
    const allMatches = [...(results || [])];
    return allMatches
      .filter(m => (m.home_team === teamName || m.away_team === teamName) && m.home_score !== undefined)
      .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
      .slice(0, 5);
  }, [results, teamName]);

  const upcomingFixtures = useMemo(() => {
    return (fixtures || [])
      .filter(m => (m.home_team === teamName || m.away_team === teamName) && m.home_score === undefined)
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
      .slice(0, 5);
  }, [fixtures, teamName]);

  const teamNews = useMemo(() => {
    return (announcements || []).filter(a =>
      a.title?.toLowerCase().includes(teamName.toLowerCase()) ||
      a.body?.toLowerCase().includes(teamName.toLowerCase()) ||
      a.category === 'team'
    ).slice(0, 5);
  }, [announcements, teamName]);

  const historicalBackground = useMemo(() => {
    return {
      founded: team.founded || 1990,
      championships: ['2018 Premier League', '2015 Cup Winner'],
      notablePlayers: ['Player One', 'Player Two', 'Player Three'],
      achievements: [
        '3x Premier League Champions',
        '2x Cup Winners',
        '1x Super Cup Winner'
      ]
    };
  }, [team]);

  const stats = useMemo(() => {
    const matches = recentMatches.filter(m => m.home_score !== undefined);
    return {
      played: matches.length,
      wins: team.wins,
      draws: team.draws,
      losses: team.losses,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalsFor - team.goalsAgainst,
      points: team.points
    };
  }, [recentMatches, team]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            <View style={styles.statsGrid}>
              <StatBox label="Wins" value={stats.wins} icon="trophy" color="#10B981" theme={currentTheme} />
              <StatBox label="Draws" value={stats.draws} icon="remove" color="#F59E0B" theme={currentTheme} />
              <StatBox label="Losses" value={stats.losses} icon="close" color="#EF4444" theme={currentTheme} />
              <StatBox label="Goals" value={stats.goalsFor} icon="football" theme={currentTheme} />
              <StatBox label="Against" value={stats.goalsAgainst} icon="shield" color="#EF4444" theme={currentTheme} />
              <StatBox label="Points" value={stats.points} icon="star" color="#F59E0B" theme={currentTheme} />
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Team Information</Text>
              <View style={[styles.infoCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={14} color={currentTheme.colors.primary} />
                  <Text style={[styles.infoText, { color: currentTheme.colors.textSecondary }]}>Founded: {team.founded}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={14} color={currentTheme.colors.primary} />
                  <Text style={[styles.infoText, { color: currentTheme.colors.textSecondary }]}>Stadium: {team.stadium}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="trophy" size={14} color={currentTheme.colors.primary} />
                  <Text style={[styles.infoText, { color: currentTheme.colors.textSecondary }]}>League: {team.league}</Text>
                </View>
              </View>
            </View>

            <View style={styles.staffSection}>
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Staff Information</Text>
              <View style={[styles.staffCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
                <View style={styles.staffRow}>
                  <View style={[styles.staffIcon, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
                    <Ionicons name="person" size={16} color={currentTheme.colors.primary} />
                  </View>
                  <View style={styles.staffInfo}>
                    <Text style={[styles.staffRole, { color: currentTheme.colors.muted }]}>Manager</Text>
                    <Text style={[styles.staffName, { color: currentTheme.colors.textDark }]}>{team.manager}</Text>
                  </View>
                </View>
                <View style={styles.staffRow}>
                  <View style={[styles.staffIcon, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
                    <Ionicons name="people" size={16} color={currentTheme.colors.primary} />
                  </View>
                  <View style={styles.staffInfo}>
                    <Text style={[styles.staffRole, { color: currentTheme.colors.muted }]}>Assistant Manager</Text>
                    <Text style={[styles.staffName, { color: currentTheme.colors.textDark }]}>{team.assistantManager}</Text>
                  </View>
                </View>
                <View style={styles.staffRow}>
                  <View style={[styles.staffIcon, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
                    <Ionicons name="shield" size={16} color={currentTheme.colors.primary} />
                  </View>
                  <View style={styles.staffInfo}>
                    <Text style={[styles.staffRole, { color: currentTheme.colors.muted }]}>Captain</Text>
                    <Text style={[styles.staffName, { color: currentTheme.colors.textDark }]}>{team.captain}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.matchesSection}>
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Recent Matches</Text>
              {recentMatches.length > 0 ? (
                recentMatches.map((match, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.matchRow, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}
                    onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.matchTeams, { color: currentTheme.colors.textDark }]}>
                      {match.home_team} vs {match.away_team}
                    </Text>
                    {match.home_score !== undefined && (
                      <Text style={[styles.matchScore, { color: currentTheme.colors.primary }]}>
                        {match.home_score} - {match.away_score}
                      </Text>
                    )}
                    <Ionicons name="chevron-forward" size={14} color={currentTheme.colors.muted} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: currentTheme.colors.muted }]}>No recent matches</Text>
              )}
            </View>

            {upcomingFixtures.length > 0 && (
              <View style={styles.matchesSection}>
                <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Upcoming Fixtures</Text>
                {upcomingFixtures.map((match, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.matchRow, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}
                    onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.matchInfo}>
                      <Text style={[styles.matchTeams, { color: currentTheme.colors.textDark }]}>
                        {match.home_team} vs {match.away_team}
                      </Text>
                      <Text style={[styles.matchDate, { color: currentTheme.colors.textSecondary }]}>
                        {dayjs(match.match_date).format('ddd, MMM D • HH:mm')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={currentTheme.colors.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      case 'squad':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Squad ({squad.length})</Text>
            {squad.length > 0 ? (
              <FlatList
                data={squad}
                keyExtractor={(item, index) => `${item.id || index}-${item.full_name}`}
                renderItem={({ item }) => (
                  <SquadPlayer
                    player={item}
                    theme={currentTheme}
                    onPress={() => navigation.navigate('PlayerDetail', { 
                      playerId: item.id,
                      playerName: item.full_name 
                    })}
                  />
                )}
                scrollEnabled={false}
              />
            ) : (
              <Text style={[styles.emptyText, { color: currentTheme.colors.muted }]}>No squad information available</Text>
            )}
          </View>
        );
      case 'stats':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Season Statistics</Text>
            <View style={[styles.statsCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Matches Played</Text>
                <Text style={[styles.statRowValue, { color: currentTheme.colors.textDark }]}>{stats.played}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Wins</Text>
                <Text style={[styles.statRowValue, { color: '#10B981' }]}>{stats.wins}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Draws</Text>
                <Text style={[styles.statRowValue, { color: '#F59E0B' }]}>{stats.draws}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Losses</Text>
                <Text style={[styles.statRowValue, { color: '#EF4444' }]}>{stats.losses}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Goals For</Text>
                <Text style={[styles.statRowValue, { color: currentTheme.colors.textDark }]}>{stats.goalsFor}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Goals Against</Text>
                <Text style={[styles.statRowValue, { color: currentTheme.colors.textDark }]}>{stats.goalsAgainst}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Goal Difference</Text>
                <Text style={[styles.statRowValue, { 
                  color: stats.goalDifference >= 0 ? '#10B981' : '#EF4444' 
                }]}>
                  {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: currentTheme.colors.textSecondary }]}>Points</Text>
                <Text style={[styles.statRowValue, { color: currentTheme.colors.primary, fontWeight: '700' }]}>
                  {stats.points}
                </Text>
              </View>
            </View>
          </View>
        );
      case 'news':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Team News</Text>
            {teamNews.length > 0 ? (
              teamNews.map((news, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.newsCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}
                  onPress={() => navigation.navigate('NewsDetail', { newsId: news.id })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.newsTitle, { color: currentTheme.colors.textDark }]}>{news.title}</Text>
                  <Text style={[styles.newsSummary, { color: currentTheme.colors.textSecondary }]} numberOfLines={2}>
                    {news.body || news.summary || 'No summary available'}
                  </Text>
                  <Text style={[styles.newsDate, { color: currentTheme.colors.muted }]}>
                    {dayjs(news.published_at).format('MMM D, YYYY')}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: currentTheme.colors.muted }]}>No team news available</Text>
              </View>
            )}
          </View>
        );
      case 'history':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textDark }]}>Historical Background</Text>
            
            <View style={[styles.historyCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <View style={styles.historyRow}>
                <Ionicons name="calendar" size={16} color={currentTheme.colors.primary} />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyLabel, { color: currentTheme.colors.muted }]}>Founded</Text>
                  <Text style={[styles.historyValue, { color: currentTheme.colors.textDark }]}>{historicalBackground.founded}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.historyCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <Text style={[styles.historySectionTitle, { color: currentTheme.colors.textDark }]}>Championships</Text>
              {historicalBackground.championships.map((champ, index) => (
                <View key={index} style={[styles.achievementItem, { borderBottomColor: currentTheme.colors.border }]}>
                  <Ionicons name="trophy" size={14} color="#F59E0B" />
                  <Text style={[styles.achievementText, { color: currentTheme.colors.textSecondary }]}>{champ}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.historyCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <Text style={[styles.historySectionTitle, { color: currentTheme.colors.textDark }]}>Notable Players</Text>
              {historicalBackground.notablePlayers.map((player, index) => (
                <View key={index} style={[styles.achievementItem, { borderBottomColor: currentTheme.colors.border }]}>
                  <Ionicons name="person" size={14} color={currentTheme.colors.primary} />
                  <Text style={[styles.achievementText, { color: currentTheme.colors.textSecondary }]}>{player}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.historyCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
              <Text style={[styles.historySectionTitle, { color: currentTheme.colors.textDark }]}>Achievements</Text>
              {historicalBackground.achievements.map((achievement, index) => (
                <View key={index} style={[styles.achievementItem, { borderBottomColor: currentTheme.colors.border }]}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.achievementText, { color: currentTheme.colors.textSecondary }]}>{achievement}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface, borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={currentTheme.colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.textDark }]} numberOfLines={1}>{team.name}</Text>
        <TouchableOpacity
          onPress={() => toggleFavoriteTeam(team.name)}
          style={styles.favoriteButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavoriteTeam(team.name) ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavoriteTeam(team.name) ? '#EF4444' : currentTheme.colors.textDark}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.teamHeader}>
          <ExpoImage source={team.logo} style={styles.teamLogo} contentFit="cover" />
          <Text style={[styles.teamName, { color: currentTheme.colors.textDark }]}>{team.name}</Text>
          <View style={[styles.positionBadge, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
            <Ionicons name="trophy" size={12} color={currentTheme.colors.primary} />
            <Text style={[styles.positionText, { color: currentTheme.colors.primary }]}>Position {team.position}</Text>
          </View>
        </View>

        <View style={[styles.tabs, { backgroundColor: currentTheme.colors.backgroundSecondary }]}>
          {['overview', 'squad', 'stats', 'news', 'history'].map((tab) => (
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.lg,
    paddingVertical: baseTheme.spacing.md,
    borderBottomWidth: 1,
    ...baseTheme.shadows.sm
  },
  backButton: {
    padding: baseTheme.spacing.xs
  },
  headerTitle: {
    ...baseTheme.typography.h4,
    flex: 1,
    textAlign: 'center'
  },
  favoriteButton: {
    padding: baseTheme.spacing.xs
  },
  scrollContent: {
    padding: baseTheme.spacing.lg,
    paddingBottom: baseTheme.spacing.lg
  },
  teamHeader: {
    alignItems: 'center',
    marginBottom: baseTheme.spacing.lg
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    marginBottom: baseTheme.spacing.sm
  },
  teamName: {
    ...baseTheme.typography.h3,
    marginBottom: baseTheme.spacing.xs
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.xs,
    borderRadius: baseTheme.borderRadius.full,
    gap: baseTheme.spacing.xs
  },
  positionText: {
    ...baseTheme.typography.caption,
    fontWeight: '600'
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.lg
  },
  statBox: {
    width: '30%',
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: baseTheme.spacing.xs
  },
  statValue: {
    ...baseTheme.typography.h4,
    marginBottom: baseTheme.spacing.xs / 2
  },
  statLabel: {
    ...baseTheme.typography.tiny,
    textAlign: 'center'
  },
  sectionTitle: {
    ...baseTheme.typography.h4,
    marginBottom: baseTheme.spacing.md
  },
  infoSection: {
    marginBottom: baseTheme.spacing.lg
  },
  infoCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
    gap: baseTheme.spacing.sm
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm
  },
  infoText: {
    ...baseTheme.typography.bodySmall
  },
  matchesSection: {
    marginBottom: baseTheme.spacing.lg
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  matchInfo: {
    flex: 1
  },
  matchTeams: {
    ...baseTheme.typography.bodySmall,
    flex: 1,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2
  },
  matchDate: {
    ...baseTheme.typography.caption,
    fontSize: 10
  },
  matchScore: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700',
    marginRight: baseTheme.spacing.sm
  },
  squadPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.sm,
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: baseTheme.spacing.sm,
    borderWidth: 1
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2
  },
  playerPosition: {
    ...baseTheme.typography.tiny
  },
  jerseyBadge: {
    paddingHorizontal: baseTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: baseTheme.borderRadius.sm,
    marginTop: baseTheme.spacing.xs / 2,
    alignSelf: 'flex-start'
  },
  jerseyText: {
    ...baseTheme.typography.tiny,
    fontWeight: '700'
  },
  statsCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md, // Reduced from lg
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1
  },
  statRowLabel: {
    ...baseTheme.typography.bodySmall
  },
  statRowValue: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700'
  },
  emptyText: {
    ...baseTheme.typography.bodySmall,
    textAlign: 'center',
    padding: baseTheme.spacing.lg
  },
  newsCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  newsTitle: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs
  },
  newsSummary: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs
  },
  newsDate: {
    ...baseTheme.typography.caption
  },
  historyCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm
  },
  historyInfo: {
    flex: 1
  },
  historyLabel: {
    ...baseTheme.typography.caption,
    marginBottom: baseTheme.spacing.xs / 2
  },
  historyValue: {
    ...baseTheme.typography.body,
    fontWeight: '700'
  },
  historySectionTitle: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.sm
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs,
    borderBottomWidth: 1
  },
  achievementText: {
    ...baseTheme.typography.bodySmall,
    flex: 1
  },
  staffSection: {
    marginBottom: baseTheme.spacing.lg
  },
  staffCard: {
    borderRadius: baseTheme.borderRadius.md,
    padding: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
    gap: baseTheme.spacing.md
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm
  },
  staffIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  staffInfo: {
    flex: 1
  },
  staffRole: {
    ...baseTheme.typography.caption,
    marginBottom: baseTheme.spacing.xs / 2
  },
  staffName: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600'
  }
});

export default TeamProfileScreen;

