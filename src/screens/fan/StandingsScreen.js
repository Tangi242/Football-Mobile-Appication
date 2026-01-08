import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { getAllStandings, getStandings } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { placeholderImages } from '../../assets/placeholders.js';

const StandingsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { showError } = useToast();
  const { refreshKeys } = useRefresh();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  
  const leagueId = route?.params?.leagueId;

  useFocusEffect(
    React.useCallback(() => {
      loadStandings();
    }, [leagueId, refreshKeys.standings])
  );

  const loadStandings = async () => {
    try {
      setLoading(true);
      let response;
      if (leagueId) {
        response = await getStandings(leagueId);
        const standingsData = response.data?.standings || [];
        console.log('Standings loaded for league:', leagueId, standingsData.length, 'teams');
        setStandings(standingsData);
        setSelectedLeague(standingsData[0]?.league_name || null);
      } else {
        response = await getAllStandings();
        const allStandings = response.data?.standings || [];
        console.log('All standings loaded:', allStandings.length, 'entries');
        // Group by league
        const grouped = {};
        allStandings.forEach(standing => {
          const leagueName = standing.league_name || 'Unknown League';
          if (!grouped[leagueName]) {
            grouped[leagueName] = {
              leagueName,
              leagueId: standing.league_id,
              standings: []
            };
          }
          grouped[leagueName].standings.push(standing);
        });
        const groupedArray = Object.values(grouped);
        console.log('Grouped into', groupedArray.length, 'leagues');
        setStandings(groupedArray);
      }
    } catch (error) {
      console.error('Error loading standings:', error);
      console.error('Error details:', error.response?.data || error.message);
      showError('Failed to load standings');
      setStandings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStandings();
  };

  const getTeamLogoSource = (team) => {
    if (team.team_logo) {
      // If logo_path starts with http, use it directly, otherwise construct path
      if (team.team_logo.startsWith('http')) {
        return { uri: team.team_logo };
      }
      // Construct full URL if it's a relative path
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      return { uri: `${baseUrl}${team.team_logo}` };
    }
    // Fallback to online logo service or placeholder
    const { onlineImages } = require('../../assets/onlineImages.js');
    return { uri: onlineImages.logos.namibia };
  };

  const renderStandingsTable = (leagueStandings, leagueName) => {
    if (!leagueStandings || leagueStandings.length === 0) {
      return (
        <View style={styles.emptyLeague}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No standings available for {leagueName}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.tableContainer, { backgroundColor: theme.colors.surface }]}>
        {/* Table Header */}
        <View style={[styles.tableHeader, { backgroundColor: '#1F2937' }]}>
          <View style={styles.positionColumn}>
            <Text style={styles.headerText}>#</Text>
          </View>
          <View style={styles.teamColumn}>
            <Text style={styles.headerText}>Team</Text>
          </View>
          <View style={styles.playedColumn}>
            <Text style={styles.headerText}>P</Text>
          </View>
          <View style={styles.diffColumn}>
            <Text style={styles.headerText}>Diff</Text>
          </View>
          <View style={styles.pointsColumn}>
            <Text style={styles.headerText}>PTS</Text>
          </View>
        </View>

        {/* Table Rows */}
        {leagueStandings.map((team, index) => {
          const position = index + 1;
          const isTopFour = position <= 4;
          const isPositionFive = position === 5;
          
          // Determine badge color based on position
          let badgeColor = '#6B7280'; // Gray for positions 6+
          if (isTopFour) {
            badgeColor = '#10B981'; // Green for top 4
          } else if (isPositionFive) {
            badgeColor = '#3B82F6'; // Blue for position 5
          }
          
          return (
            <View
              key={team.team_id || team.id}
              style={[
                styles.tableRow,
                { 
                  borderBottomColor: theme.colors.border,
                  backgroundColor: theme.colors.surface
                }
              ]}
            >
              <View style={styles.positionColumn}>
                <View style={[
                  styles.positionBadge,
                  { backgroundColor: badgeColor }
                ]}>
                  <Text style={styles.positionText}>
                    {position}
                  </Text>
                </View>
              </View>
              <View style={styles.teamColumn}>
                <View style={styles.teamInfo}>
                  <Image
                    source={getTeamLogoSource(team)}
                    style={styles.teamLogo}
                    contentFit="contain"
                    placeholder={placeholderImages.logos.namibia}
                    transition={200}
                  />
                  <Text style={[styles.teamName, { color: theme.colors.textDark }]} numberOfLines={1}>
                    {team.team_name}
                  </Text>
                </View>
              </View>
              <View style={styles.playedColumn}>
                <Text style={[styles.statsText, { color: theme.colors.textDark }]}>
                  {team.played || 0}
                </Text>
              </View>
              <View style={styles.diffColumn}>
                <Text style={[
                  styles.diffText,
                  { color: (team.goal_difference || 0) >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference || 0}
                </Text>
              </View>
              <View style={styles.pointsColumn}>
                <Text style={[styles.pointsText, { color: theme.colors.textDark, fontWeight: '700' }]}>
                  {team.points || 0}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderLeagueGroup = ({ item }) => {
    if (leagueId) {
      // Single league view - item is the standings array
      return renderStandingsTable(item, selectedLeague);
    }
    
    // Multiple leagues view - item has leagueName and standings
    return (
      <View style={styles.leagueGroup}>
        <View style={[styles.leagueHeader, { backgroundColor: theme.colors.backgroundPrimary }]}>
          <Ionicons name="trophy" size={20} color={theme.colors.primary} />
          <Text style={[styles.leagueTitle, { color: theme.colors.textDark }]}>
            {item.leagueName}
          </Text>
        </View>
        {renderStandingsTable(item.standings, item.leagueName)}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  // Check if standings is empty
  const hasStandings = Array.isArray(standings) && standings.length > 0;
  
  if (!hasStandings && !loading) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="trophy-outline"
          title="No Standings Available"
          message="Standings will appear here once match results are submitted."
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            League Standings
          </Text>
          {selectedLeague && (
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {selectedLeague}
            </Text>
          )}
        </View>

        {leagueId ? (
          // Single league - render table directly with ScrollView
          <ScrollView
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {renderStandingsTable(standings, selectedLeague)}
          </ScrollView>
        ) : (
          // Multiple leagues - use FlatList
          <FlatList
            data={standings}
            renderItem={renderLeagueGroup}
            keyExtractor={(item, index) => `league-${item.leagueId || index}`}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: baseTheme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: baseTheme.spacing.lg,
  },
  headerTitle: {
    ...baseTheme.typography.h2,
    fontWeight: '800',
    marginBottom: baseTheme.spacing.xs,
  },
  headerSubtitle: {
    ...baseTheme.typography.bodySmall,
  },
  list: {
    paddingBottom: baseTheme.spacing.xl,
  },
  leagueGroup: {
    marginBottom: baseTheme.spacing.xl,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
  },
  leagueTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  tableContainer: {
    borderRadius: baseTheme.borderRadius.lg,
    overflow: 'hidden',
    ...baseTheme.shadows.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: baseTheme.spacing.md,
    paddingHorizontal: baseTheme.spacing.md,
    alignItems: 'center',
  },
  headerText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: baseTheme.spacing.md,
    paddingHorizontal: baseTheme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    minHeight: 60,
  },
  positionColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
  },
  teamColumn: {
    flex: 1,
    paddingLeft: baseTheme.spacing.sm,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamName: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  playedColumn: {
    width: 40,
    alignItems: 'center',
  },
  diffColumn: {
    width: 60,
    alignItems: 'center',
  },
  statsText: {
    ...baseTheme.typography.body,
    fontSize: 14,
    fontWeight: '500',
  },
  diffText: {
    ...baseTheme.typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  pointsColumn: {
    width: 50,
    alignItems: 'center',
  },
  pointsText: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    fontSize: 15,
  },
  emptyLeague: {
    padding: baseTheme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...baseTheme.typography.body,
    fontStyle: 'italic',
  },
});

export default StandingsScreen;

