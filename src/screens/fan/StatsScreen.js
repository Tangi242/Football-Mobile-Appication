import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFilterDrawer } from '../../context/FilterDrawerContext.js';
import LeagueTable from '../../components/common/LeagueTable.js';
import FilterDrawer from '../../components/common/FilterDrawer.js';
import LeaderList from '../../components/common/LeaderList.js';
import Leaderboards from '../../components/common/Leaderboards.js';
import MatchListCard from '../../components/match/MatchListCard.js';
import EmptyState from '../../components/ui/EmptyState.js';
import theme from '../../theme/colors.js';
import { fetchLeagues, fetchFixtures, fetchResults, getStandings } from '../../api/client.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../../hooks/useToast.js';

const StatsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useFilterDrawer();
  const { refreshKeys } = useRefresh();
  const { showError } = useToast();
  const subTabs = ['Tables', 'Goals', 'Assists', 'Player', 'Team', 'Fixtures'];
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  
  // State for data from API
  const [leagues, setLeagues] = useState([]);
  const [results, setResults] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [leaguesRes, resultsRes, fixturesRes] = await Promise.all([
        fetchLeagues().catch(err => {
          console.error('Error fetching leagues:', err);
          return { data: { leagues: [] } };
        }),
        fetchResults().catch(err => {
          console.error('Error fetching results:', err);
          return { data: { results: [] } };
        }),
        fetchFixtures().catch(err => {
          console.error('Error fetching fixtures:', err);
          return { data: { fixtures: [] } };
        })
      ]);
      
      setLeagues(leaguesRes.data?.leagues || []);
      setResults(resultsRes.data?.results || []);
      setFixtures(fixturesRes.data?.fixtures || []);
      
      // Auto-select first league if none selected and leagues available
      if (!selectedLeagueId && leaguesRes.data?.leagues?.length > 0) {
        const firstLeague = leaguesRes.data.leagues[0];
        setSelectedLeagueId(String(firstLeague.id));
      }
      
      // Load standings for selected league if available
      if (selectedLeagueId) {
        try {
          const standingsRes = await getStandings(selectedLeagueId);
          setStandings(standingsRes.data?.standings || []);
        } catch (err) {
          console.error('Error loading standings:', err);
          setStandings([]);
        }
      }
    } catch (error) {
      console.error('Error loading stats data:', error);
      showError('Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLeagueId, showError]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, refreshKeys.matches, refreshKeys.standings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Load standings when league changes
  useEffect(() => {
    if (selectedLeagueId) {
      getStandings(selectedLeagueId)
        .then(res => {
          const standingsData = res.data?.standings || [];
          console.log('Standings loaded for league', selectedLeagueId, ':', standingsData.length, 'teams');
          setStandings(standingsData);
        })
        .catch(err => {
          console.error('Error loading standings:', err);
          setStandings([]);
        });
    } else {
      setStandings([]);
    }
  }, [selectedLeagueId, refreshKeys.standings]);

  // Get available seasons from leagues
  const availableSeasons = useMemo(() => {
    const seasonSet = new Set();
    if (leagues && leagues.length > 0) {
      leagues.forEach(league => {
        if (league.season) {
          seasonSet.add(league.season);
        }
      });
    }
    // If no seasons found, add default
    if (seasonSet.size === 0) {
      seasonSet.add('2025/2026');
    }
    return Array.from(seasonSet).sort().reverse(); // Most recent first
  }, [leagues]);

  // Get leagues filtered by season
  const leaguesBySeason = useMemo(() => {
    if (!selectedSeason || selectedSeason === 'all') return leagues || [];
    return (leagues || []).filter(league => league.season === selectedSeason);
  }, [leagues, selectedSeason]);

  // Get league IDs for the selected season
  const leagueIdsBySeason = useMemo(() => {
    return leaguesBySeason.map(league => String(league.id));
  }, [leaguesBySeason]);

  // Filter results by season
  const filteredResults = useMemo(() => {
    if (!selectedSeason || selectedSeason === 'all') return results || [];
    return (results || []).filter(match => {
      if (!match.league_id) return false;
      return leagueIdsBySeason.includes(String(match.league_id));
    });
  }, [results, selectedSeason, leagueIdsBySeason]);

  // Filter fixtures by season
  const filteredFixturesBySeason = useMemo(() => {
    if (!selectedSeason || selectedSeason === 'all') return fixtures || [];
    return (fixtures || []).filter(match => {
      if (!match.league_id) return false;
      return leagueIdsBySeason.includes(String(match.league_id));
    });
  }, [fixtures, selectedSeason, leagueIdsBySeason]);

  // Convert standings from API to format expected by LeagueTable
  const standingsToShow = useMemo(() => {
    if (!selectedLeagueId || !standings.length) return [];
    
    return standings.map(team => ({
      name: team.team_name,
      team_name: team.team_name,
      team_logo: team.team_logo,
      logo_path: team.team_logo,
      played: team.played || 0,
      won: team.wins || 0,
      drawn: team.draws || 0,
      lost: team.losses || 0,
      goalsFor: team.goals_for || 0,
      goalsAgainst: team.goals_against || 0,
      goalDifference: team.goal_difference || 0,
      goal_difference: team.goal_difference || 0,
      points: team.points || 0
    }));
  }, [standings, selectedLeagueId]);

  // Set default season on mount
  useEffect(() => {
    if (!selectedSeason && availableSeasons.length > 0) {
      setSelectedSeason(availableSeasons[0]);
    }
  }, [availableSeasons, selectedSeason]);

  // Reset league selection if selected league is not in available leagues
  useEffect(() => {
    if (leagues.length > 0) {
      if (selectedLeagueId) {
        const leagueExists = leagues.some(league => String(league.id) === selectedLeagueId);
        if (!leagueExists) {
          // Set to first league in the list
          setSelectedLeagueId(String(leagues[0].id));
        }
      } else {
        // Set default to first league if none selected
        setSelectedLeagueId(String(leagues[0].id));
      }
    }
  }, [leagues, selectedLeagueId]);

  // Prepare leagues for dropdown - show all available leagues (no "All" option)
  const leagueOptions = useMemo(() => {
    const options = [];
    if (leagues && leagues.length > 0) {
      leagues.forEach(league => {
        options.push({
          id: String(league.id),
          name: league.name
        });
      });
    }
    return options;
  }, [leagues]);


  const selectedLeagueName = useMemo(() => {
    return leagueOptions.find(l => l.id === selectedLeagueId)?.name || 'Select League';
  }, [selectedLeagueId, leagueOptions]);

  const filteredFixtures = useMemo(() => {
    if (!filteredFixturesBySeason?.length) return [];
    if (!selectedLeagueId) {
      // If no league selected, show empty or all fixtures
      return [];
    }
    // Show all fixtures for the selected league
    return filteredFixturesBySeason
      .filter((match) => match.league_id && Number(match.league_id) === Number(selectedLeagueId))
      .sort((a, b) => {
        // Sort by date, upcoming first
        const dateA = new Date(a.match_date || a.date || 0);
        const dateB = new Date(b.match_date || b.date || 0);
        return dateA - dateB;
      });
  }, [filteredFixturesBySeason, selectedLeagueId]);

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Tables':
        return (
          <View style={styles.contentSection}>
            {loading && !standings.length ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Loading standings...
                </Text>
              </View>
            ) : !selectedLeagueId ? (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="trophy"
                  title="Select a league"
                  subtitle="Choose a league from the filters menu above to view detailed standings, team statistics, and performance metrics. Standings are automatically updated after each match."
                />
              </View>
            ) : standingsToShow.length > 0 ? (
              <LeagueTable standings={standingsToShow} leagueName={selectedLeagueName} />
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="trophy"
                  title="No standings available"
                  subtitle="Standings for this league will be calculated and displayed automatically once match results are recorded. Check back after matches are completed to see team positions, points, and goal differences."
                />
              </View>
            )}
          </View>
        );
      case 'Goals':
        return (
          <View style={styles.contentSection}>
            <Leaderboards navigation={navigation} type="goals" />
          </View>
        );
      case 'Assists':
        return (
          <View style={styles.contentSection}>
            <Leaderboards navigation={navigation} type="assists" />
          </View>
        );
      case 'Player':
        return (
          <View style={styles.contentSection}>
            <Leaderboards navigation={navigation} />
          </View>
        );
      case 'Team':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Team Statistics</Text>
            {selectedLeagueId && standingsToShow.length > 0 ? (
              <View style={styles.teamStatsContainer}>
                {standingsToShow.slice(0, 5).map((team, index) => {
                  const position = index + 1;
                  return (
                  <View key={team.name} style={styles.teamStatCard}>
                    <View style={styles.teamStatHeader}>
                      <Text style={styles.teamStatRank}>#{index + 1}</Text>
                      <Text style={styles.teamStatName}>{team.name}</Text>
                    </View>
                    <View style={styles.teamStatRow}>
                      <View style={styles.teamStatItem}>
                        <Text style={styles.teamStatLabel}>Played</Text>
                        <Text style={styles.teamStatValue}>{team.played}</Text>
                      </View>
                      <View style={styles.teamStatItem}>
                        <Text style={styles.teamStatLabel}>Won</Text>
                        <Text style={styles.teamStatValue}>{team.won}</Text>
                      </View>
                      <View style={styles.teamStatItem}>
                        <Text style={styles.teamStatLabel}>Drawn</Text>
                        <Text style={styles.teamStatValue}>{team.drawn}</Text>
                      </View>
                      <View style={styles.teamStatItem}>
                        <Text style={styles.teamStatLabel}>Lost</Text>
                        <Text style={styles.teamStatValue}>{team.lost}</Text>
                      </View>
                      <View style={styles.teamStatItem}>
                        <Text style={styles.teamStatLabel}>Points</Text>
                        <Text style={[styles.teamStatValue, { color: theme.colors.primary, fontWeight: '700' }]}>{team.points}</Text>
                      </View>
                    </View>
                    <View style={styles.teamStatGoals}>
                      <Text style={styles.teamStatGoalsText}>
                        Goals: {team.goalsFor} - {team.goalsAgainst} (GD: {team.goalDifference > 0 ? '+' : ''}{team.goalDifference})
                      </Text>
                    </View>
                  </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                icon="people"
                title="Select a league"
                subtitle="Choose a league from the filters menu to view detailed team statistics including matches played, wins, draws, losses, goals scored, and points. Team statistics are automatically calculated from match results."
              />
            )}
          </View>
        );
      case 'Fixtures':
        return (
          <View style={styles.contentSection}>
            {!selectedLeagueId ? (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="calendar"
                  title="Select a league"
                  subtitle="Use the filters menu above to choose a league and season. Once selected, you'll see all upcoming fixtures, match dates, venues, and kickoff times for that competition."
                />
              </View>
            ) : filteredFixtures.length > 0 ? (
              <View>
                {filteredFixtures.map((item) => (
                  <MatchListCard
                    key={`stats-fixture-${item.id || item.match_id || Math.random()}`}
                    match={item}
                    onPress={() => navigation.navigate('MatchDetails', { matchId: item.id || item.match_id })}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="calendar"
                  title="No fixtures scheduled"
                  subtitle="There are currently no upcoming fixtures for the selected league and season. New fixtures will automatically appear here once they are scheduled. Try selecting a different league or season, or check back later."
                />
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.fullScreen}>
      {/* Filter Menu Button */}
      <View style={styles.filterButtonWrapper}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={openDrawer}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          accessibilityHint="Opens filter menu with league and season options"
        >
          <Ionicons name="filter" size={20} color={theme.colors.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Drawer */}
      <FilterDrawer
        leagues={leagueOptions}
        selectedLeagueId={selectedLeagueId}
        onSelectLeague={setSelectedLeagueId}
        seasons={availableSeasons}
        selectedSeason={selectedSeason}
        onSelectSeason={setSelectedSeason}
      />

      {/* Sub-Navigation Tabs */}
      <View style={styles.subTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subTabsContainer}
          contentContainerStyle={styles.subTabsContent}
        >
          {subTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.subTab, activeSubTab === tab && styles.subTabActive]}
              onPress={() => setActiveSubTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.subTabText, activeSubTab === tab && styles.subTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading statistics...
            </Text>
          </View>
        ) : (
          renderContent()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary
  },
  filterButtonWrapper: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: theme.touchTarget?.minHeight || 44,
    ...theme.shadows.sm
  },
  filterButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary
  },
  subTabsWrapper: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm
  },
  subTabsContainer: {
    flexGrow: 0
  },
  subTabsContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm
  },
  subTab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  subTabActive: {
    backgroundColor: theme.colors.backgroundPrimary
  },
  subTabText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 11
  },
  subTabTextActive: {
    color: theme.colors.textDark,
    fontWeight: '700'
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md
  },
  contentSection: {
    width: '100%'
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
    fontWeight: '700'
  },
  teamStatsContainer: {
    gap: theme.spacing.sm
  },
  teamStatCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  teamStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  teamStatRank: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary
  },
  teamStatName: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textDark,
    flex: 1
  },
  teamStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  teamStatItem: {
    flex: 1,
    alignItems: 'center'
  },
  teamStatLabel: {
    ...theme.typography.caption,
    fontSize: 9,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs / 2
  },
  teamStatValue: {
    ...theme.typography.bodySmall,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textDark
  },
  teamStatGoals: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  teamStatGoalsText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  loadingText: {
    ...theme.typography.body,
    marginTop: theme.spacing.md,
    textAlign: 'center'
  }
});

export default StatsScreen;

