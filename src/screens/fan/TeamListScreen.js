import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../../lib/dayjs.js';
import { useData } from '../../context/DataContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import SearchBar from '../../components/ui/SearchBar.js';
import LeagueFilter from '../../components/common/LeagueFilter.js';
import EmptyState from '../../components/ui/EmptyState.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';

const getTeamLogo = (teamName) => {
  // Placeholder for real logos; fallback to flag
  return getFlagForTeam(teamName);
};

const getRecentForm = (results = [], teamName) => {
  const sorted = [...results].sort((a, b) => dayjs(b.match_date) - dayjs(a.match_date));
  return sorted
    .filter(m => m.home_team === teamName || m.away_team === teamName)
    .slice(0, 5)
    .map(m => {
      const isHome = m.home_team === teamName;
      const teamScore = isHome ? m.home_score : m.away_score;
      const oppScore = isHome ? m.away_score : m.home_score;
      if (teamScore > oppScore) return 'W';
      if (teamScore < oppScore) return 'L';
      return 'D';
    });
};

const triggerHaptic = async () => {
  try {
    const Haptics = await import('expo-haptics');
    if (Haptics?.selectionAsync) {
      await Haptics.selectionAsync();
    }
  } catch (e) {
    // noop if haptics not available
  }
};

const TeamCard = ({ team, onPress, results }) => {
  const form = getRecentForm(results, team.name);
  return (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={async () => {
        await triggerHaptic();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Image source={getTeamLogo(team.name)} style={styles.teamLogo} contentFit="cover" />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
        <Text style={styles.teamLeague}>{team.league || 'League'}</Text>
        <View style={styles.teamStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.position || '-'}</Text>
            <Text style={styles.statLabel}>Pos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.goalsFor || 0}</Text>
            <Text style={styles.statLabel}>GF</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.goalsAgainst || 0}</Text>
            <Text style={styles.statLabel}>GA</Text>
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Form</Text>
          <View style={styles.formDots}>
            {form.map((res, idx) => (
              <View
                key={`${team.name}-form-${idx}`}
                style={[
                  styles.formDot,
                  res === 'W' && styles.formWin,
                  res === 'L' && styles.formLoss,
                  res === 'D' && styles.formDraw
                ]}
              >
                <Text style={styles.formDotText}>{res}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TeamListScreen = ({ navigation }) => {
  const { fixtures, results, leagues, refresh, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');

  const teams = useMemo(() => {
    const allMatches = [...(fixtures || []), ...(results || [])];
    const teamMap = {};
    
    allMatches.forEach(match => {
      [match.home_team, match.away_team].forEach(teamName => {
        if (!teamName) return;
        if (!teamMap[teamName]) {
          teamMap[teamName] = {
            name: teamName,
            league: match.competition,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
          };
        }
        
        if (match.home_score !== undefined && match.away_score !== undefined) {
          const isHome = match.home_team === teamName;
          const teamScore = isHome ? match.home_score : match.away_score;
          const oppScore = isHome ? match.away_score : match.home_score;
          
          teamMap[teamName].goalsFor += teamScore;
          teamMap[teamName].goalsAgainst += oppScore;
          
          if (teamScore > oppScore) {
            teamMap[teamName].wins++;
            teamMap[teamName].points += 3;
          } else if (teamScore < oppScore) {
            teamMap[teamName].losses++;
          } else {
            teamMap[teamName].draws++;
            teamMap[teamName].points += 1;
          }
        }
      });
    });

    let teamList = Object.values(teamMap);
    
    // Filter by league
    if (selectedLeague !== 'all') {
      teamList = teamList.filter(t => {
        const match = allMatches.find(m => 
          (m.home_team === t.name || m.away_team === t.name) && 
          m.league_id && String(m.league_id) === selectedLeague
        );
        return match;
      });
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      teamList = teamList.filter(t => 
        t.name.toLowerCase().includes(query) ||
        (t.league && t.league.toLowerCase().includes(query))
      );
    }
    
    // Sort by points
    return teamList.sort((a, b) => b.points - a.points).map((team, index) => ({
      ...team,
      position: index + 1
    }));
  }, [fixtures, results, selectedLeague, searchQuery]);

  const leagueFilterOptions = useMemo(() => {
    return leagues?.map((league) => ({
      id: String(league.id),
      name: league.name
    })) || [];
  }, [leagues]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Teams</Text>
          <Text style={styles.subtitle}>Browse all clubs and squads</Text>
        </View>

      <SearchBar
        placeholder="Search teams..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <LeagueFilter
        leagues={leagueFilterOptions}
        selectedLeague={selectedLeague}
        onSelectLeague={setSelectedLeague}
        showAll={true}
      />

      <FlatList
        data={teams}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            results={results}
            onPress={() => navigation.navigate('TeamProfile', { 
              teamName: item.name,
              teamId: item.id 
            })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="people"
              title={searchQuery ? "No teams found" : "No teams"}
              subtitle={searchQuery ? "Try a different search term" : "Teams will appear here soon. Browse matches meanwhile."}
            />
          </View>
        }
        contentContainerStyle={teams.length ? styles.list : styles.emptyList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={!!loading} onRefresh={refresh} tintColor={theme.colors.primary} />
        }
        ListHeaderComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : null
        }
      />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2,
    fontWeight: '800'
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  teamLogo: {
    width: 40, // Reduced from 48
    height: 40, // Reduced from 48
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm
  },
  teamInfo: {
    flex: 1
  },
  teamName: {
    ...theme.typography.bodySmall,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  teamLeague: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs
  },
  teamStats: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  statValue: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary
  },
  statLabel: {
    ...theme.typography.tiny,
    color: theme.colors.muted
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm
  },
  formLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700'
  },
  formDots: {
    flexDirection: 'row',
    gap: theme.spacing.xs / 2
  },
  formDot: {
    minWidth: 28,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  formWin: {
    backgroundColor: (theme.colors.interactive || '#DC143C') + '15',
    borderColor: theme.colors.interactive || '#DC143C'
  },
  formLoss: {
    backgroundColor: '#EF444415',
    borderColor: '#EF4444'
  },
  formDraw: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border
  },
  formDotText: {
    ...theme.typography.tiny,
    fontWeight: '800',
    color: theme.colors.textDark
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.lg
  }
});

export default TeamListScreen;

