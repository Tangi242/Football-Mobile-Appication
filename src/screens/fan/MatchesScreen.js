import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import dayjs from '../../lib/dayjs.js';
import { useLeagueDrawer } from '../../context/LeagueDrawerContext.js';
import EmptyState from '../../components/ui/EmptyState.js';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import LeagueDrawer from '../../components/common/LeagueDrawer.js';
import theme from '../../theme/colors.js';
import MatchCardDetailed from '../../components/match/MatchCardDetailed.js';
import { fetchMatchEvents, fetchFixtures, fetchResults, fetchLeagues } from '../../api/client.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useToast } from '../../hooks/useToast.js';

// Helper function to create abbreviation from league name
const getLeagueAbbreviation = (name) => {
  if (!name) return '';
  if (name.length <= 6) return name.toUpperCase();
  
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, 4).toUpperCase();
  }
  
  return words.map(word => word[0]).join('').toUpperCase();
};

const MatchesScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { openDrawer } = useLeagueDrawer();
    const { showError } = useToast();
    const { refreshKeys } = useRefresh();
    const [selectedLeagueId, setSelectedLeagueId] = useState('all'); // 'all' for Main, or league ID
    const [matchEvents, setMatchEvents] = useState({});
    const [fixtures, setFixtures] = useState([]);
    const [results, setResults] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isMountedRef = useRef(true);
    const loadingRef = useRef(new Set()); // Track which match IDs are currently loading
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('all');
    const [showLeagueModal, setShowLeagueModal] = useState(false);

    // Track component mount status
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Load data from database
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [fixturesRes, resultsRes, leaguesRes] = await Promise.all([
                fetchFixtures(),
                fetchResults(),
                fetchLeagues()
            ]);
            setFixtures(fixturesRes.data?.fixtures || []);
            setResults(resultsRes.data?.results || []);
            setLeagues(leaguesRes.data?.leagues || []);
        } catch (error) {
            console.error('Error loading matches:', error);
            showError('Failed to load matches');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [showError]);

    // Load data on focus and when refresh keys change
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData, refreshKeys.matches])
    );

    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    // Get selected league name for display
    const selectedLeagueName = useMemo(() => {
        if (selectedLeagueId === 'all') return 'All Matches';
        const league = leagues?.find(l => String(l.id) === String(selectedLeagueId));
        return league?.name || 'All Matches';
    }, [selectedLeagueId, leagues]);

    // Combine fixtures and results, filter by selected league, sorted by date
    const allMatches = useMemo(() => {
        let combined = [...(fixtures || []), ...(results || [])];
        
        // Filter by selected league
        if (selectedLeagueId !== 'all') {
            combined = combined.filter(match => {
                const matchLeagueId = match.league_id || match.competition_id;
                return matchLeagueId && String(matchLeagueId) === String(selectedLeagueId);
            });
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            combined = combined.filter(match => {
                const homeTeam = (match.home_team || '').toLowerCase();
                const awayTeam = (match.away_team || '').toLowerCase();
                const stadium = (match.stadium_name || match.venue || '').toLowerCase();
                return homeTeam.includes(query) || awayTeam.includes(query) || stadium.includes(query);
            });
        }
        
        return combined.sort((a, b) => {
            const dateA = new Date(a.match_date || a.created_at);
            const dateB = new Date(b.match_date || b.created_at);
            return dateB - dateA; // Newest first
        });
    }, [fixtures, results, selectedLeagueId, searchQuery]);

    // Group matches by date
    const groupedMatches = useMemo(() => {
        const groups = {};
        const today = dayjs().startOf('day');
        const yesterday = today.subtract(1, 'day');

        allMatches.forEach(match => {
            const matchDate = dayjs(match.match_date || match.created_at);
            const dateKey = matchDate.format('YYYY-MM-DD');
            
            if (!groups[dateKey]) {
                let dateLabel;
                if (matchDate.isSame(today, 'day')) {
                    dateLabel = 'Today, ' + matchDate.format('DD MMM YYYY');
                } else if (matchDate.isSame(yesterday, 'day')) {
                    dateLabel = 'Yesterday, ' + matchDate.format('DD MMM YYYY');
                } else {
                    dateLabel = matchDate.format('ddd, DD MMM YYYY');
                }
                
                groups[dateKey] = {
                    date: dateKey,
                    label: dateLabel,
                    matches: []
                };
            }
            groups[dateKey].matches.push(match);
        });

        return Object.values(groups).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    }, [allMatches]);

    // Load events for matches - using useEffect to avoid state updates during render
    useEffect(() => {
        const loadMatchEvents = async () => {
            // Get all match IDs from grouped matches
            const allMatchIds = groupedMatches
                .flatMap(group => group.matches)
                .map(match => match.id || match.match_id)
                .filter(matchId => matchId);

            if (allMatchIds.length === 0) return;

            // Use functional update to check current state without adding to dependencies
            setMatchEvents(currentEvents => {
                // Filter to only load matches that aren't already loaded and aren't currently loading
                const matchIdsToLoad = allMatchIds.filter(matchId => {
                    return !currentEvents[matchId] && !loadingRef.current.has(matchId);
                });

                if (matchIdsToLoad.length === 0) return currentEvents;

                // Mark as loading
                matchIdsToLoad.forEach(id => loadingRef.current.add(id));

                // Load events for all matches in parallel
                matchIdsToLoad.forEach(async (matchId) => {
                    try {
                        const response = await fetchMatchEvents(matchId);
                        const events = response.data?.events || [];
                        
                        // Only update state if component is still mounted
                        if (isMountedRef.current) {
                            setMatchEvents(prev => {
                                // Check again if already loaded (race condition prevention)
                                if (prev[matchId]) return prev;
                                return { ...prev, [matchId]: events };
                            });
                        }
                    } catch (error) {
                        // Silently fail
                    } finally {
                        // Remove from loading set
                        loadingRef.current.delete(matchId);
                    }
                });

                return currentEvents; // Return unchanged state
            });
        };

        loadMatchEvents();
    }, [groupedMatches]); // Only reload when matches change

    const renderMatchCard = (match, index) => {
        const matchId = match.id || match.match_id;
        const matchDate = dayjs(match.match_date || match.created_at);
        const dateLabel = matchDate.format('ddd, MMM D');
        const timeLabel = matchDate.format('hh:mm A');
        const homeScore = match.home_score ?? match.live_home_score;
        const awayScore = match.away_score ?? match.live_away_score;
        const status = match.status || 'scheduled';
        const isFinished = status?.toLowerCase() === 'finished' || status?.toLowerCase() === 'completed';
        const isLive = status?.toLowerCase() === 'live' || status?.toLowerCase() === 'in_progress';
        const displayScore = isFinished && homeScore !== null && awayScore !== null 
            ? `${homeScore} - ${awayScore}` 
            : isLive 
                ? 'LIVE' 
                : timeLabel;
        
        return (
            <TouchableOpacity
                key={`${matchId}-${index}`}
                style={styles.matchCard}
                onPress={() => navigation.navigate('MatchDetails', { matchId })}
                activeOpacity={0.8}
            >
                <Text style={styles.matchCardDate}>{dateLabel}</Text>
                <View style={styles.matchCardTeams}>
                    <View style={styles.teamContainer}>
                        <Image
                            source={{ uri: match.home_team_logo || `https://via.placeholder.com/60?text=${(match.home_team || 'Team')[0]}` }}
                            style={styles.teamLogo}
                            contentFit="contain"
                        />
                        <Text style={styles.teamName} numberOfLines={1}>{match.home_team || 'Home'}</Text>
                    </View>
                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>v/s</Text>
                        <Text style={styles.matchScore}>{displayScore}</Text>
                    </View>
                    <View style={styles.teamContainer}>
                        <Image
                            source={{ uri: match.away_team_logo || `https://via.placeholder.com/60?text=${(match.away_team || 'Team')[0]}` }}
                            style={styles.teamLogo}
                            contentFit="contain"
                        />
                        <Text style={styles.teamName} numberOfLines={1}>{match.away_team || 'Away'}</Text>
                    </View>
                </View>
                <Text style={styles.matchStadium}>{match.stadium_name || match.venue || 'Stadium'}</Text>
            </TouchableOpacity>
        );
    };

    const renderMatchGroup = ({ item: group }) => (
        <View style={styles.dateGroup}>
            {group.matches.map((match, index) => renderMatchCard(match, index))}
        </View>
    );

  // Get selected league name for display
  const selectedLeagueDisplayName = useMemo(() => {
    if (selectedLeagueFilter === 'all') return 'All';
    const league = leagues?.find(l => String(l.id) === String(selectedLeagueFilter));
    return league?.name || 'All';
  }, [selectedLeagueFilter, leagues]);

  return (
    <View style={styles.fullScreen}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* League Filter Button */}
      <View style={styles.leagueFilterButtonContainer}>
        <TouchableOpacity
          style={[
            styles.leagueFilterButton,
            selectedLeagueFilter !== 'all' && styles.leagueFilterButtonActive
          ]}
          onPress={() => setShowLeagueModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.leagueFilterButtonText,
            selectedLeagueFilter !== 'all' && styles.leagueFilterButtonTextActive
          ]}>
            {selectedLeagueDisplayName}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={18} 
            color={selectedLeagueFilter !== 'all' ? '#FFFFFF' : '#DC143C'} 
            style={styles.leagueFilterButtonIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>

        {/* Matches List */}
        {loading && groupedMatches.length === 0 ? (
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton type="match" count={4} />
          </View>
        ) : (
          <FlatList
            data={groupedMatches}
            keyExtractor={(item) => item.date}
            renderItem={renderMatchGroup}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <EmptyState 
                  icon="calendar" 
                  messageType="matches"
                  illustrationTone="brand"
                />
              </View>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            contentContainerStyle={groupedMatches?.length ? styles.list : styles.emptyList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.listContainer}
          />
        )}
      </View>

      {/* League Drawer - Outside container for proper positioning */}
      <LeagueDrawer
        leagues={leagues || []}
        selectedLeagueId={selectedLeagueId}
        onSelectLeague={setSelectedLeagueId}
      />

      {/* League Filter Modal */}
      <Modal
        visible={showLeagueModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLeagueModal(false)}
      >
        <Pressable
          style={styles.leagueModalOverlay}
          onPress={() => setShowLeagueModal(false)}
        >
          <Pressable style={[styles.leagueModalContent, { backgroundColor: theme.colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.leagueModalHeader}>
              <Text style={[styles.leagueModalTitle, { color: theme.colors.textDark }]}>Filter by League</Text>
              <TouchableOpacity onPress={() => setShowLeagueModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.leagueModalScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.leagueModalOption,
                  selectedLeagueFilter === 'all' && styles.leagueModalOptionSelected
                ]}
                onPress={() => {
                  setSelectedLeagueFilter('all');
                  setSelectedLeagueId('all');
                  setShowLeagueModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.leagueModalOptionText,
                  selectedLeagueFilter === 'all' && styles.leagueModalOptionTextSelected
                ]}>
                  All
                </Text>
                {selectedLeagueFilter === 'all' && (
                  <Ionicons name="checkmark" size={20} color="#DC143C" />
                )}
              </TouchableOpacity>

              {leagues?.map((league) => {
                const isSelected = String(selectedLeagueFilter) === String(league.id);
                return (
                  <TouchableOpacity
                    key={league.id}
                    style={[
                      styles.leagueModalOption,
                      isSelected && styles.leagueModalOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedLeagueFilter(String(league.id));
                      setSelectedLeagueId(String(league.id));
                      setShowLeagueModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.leagueModalOptionText,
                      isSelected && styles.leagueModalOptionTextSelected
                    ]}>
                      {league.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="#DC143C" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    minHeight: 44
  },
  searchIcon: {
    marginRight: theme.spacing.sm
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textDark,
    paddingVertical: theme.spacing.sm
  },
  leagueFilterButtonContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'flex-start'
  },
  leagueFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: '#DC143C',
    backgroundColor: 'transparent',
    gap: theme.spacing.sm
  },
  leagueFilterButtonActive: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C'
  },
  leagueFilterButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC143C'
  },
  leagueFilterButtonTextActive: {
    color: '#FFFFFF'
  },
  leagueFilterButtonIcon: {
    marginLeft: 0
  },
  leagueModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  leagueModalContent: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: theme.spacing.sm
  },
  leagueModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  leagueModalTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  leagueModalScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md
  },
  leagueModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  leagueModalOptionSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC143C',
    borderWidth: 2
  },
  leagueModalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textDark
  },
  leagueModalOptionTextSelected: {
    color: '#DC143C',
    fontWeight: '700'
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary
  },
  listContainer: {
    flex: 1
  },
  dateGroup: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    gap: theme.spacing.md
  },
  matchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  matchCardDate: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm
  },
  matchCardTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginBottom: theme.spacing.xs
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textDark,
    textAlign: 'center'
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  matchStadium: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs
  },
  list: {
    paddingBottom: theme.spacing.lg
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg
  },
  skeletonContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md
  }
});

export default MatchesScreen;

