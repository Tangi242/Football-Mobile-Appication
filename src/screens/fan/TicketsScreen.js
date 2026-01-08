import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from '../../lib/dayjs.js';
import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { t } from '../../i18n/locales.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import EmptyState from '../../components/ui/EmptyState.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';

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

const TicketCard = ({ match, onPress }) => {
  const { language } = useLanguage();
  const matchDate = dayjs(match.match_date);
  const now = dayjs();
  const isUpcoming = matchDate.isAfter(now);
  const ticketPrices = {
    general: 50,
    vip: 150,
    premium: 300
  };

  return (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.matchInfo}>
          <Image source={getFlagForTeam(match.home_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.vs}>vs</Text>
          <Image source={getFlagForTeam(match.away_team)} style={styles.teamFlag} contentFit="cover" />
        </View>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={12} color={theme.colors.primary} />
          <Text style={styles.dateText}>{matchDate.format('MMM D')}</Text>
        </View>
      </View>

      <Text style={styles.matchTeams}>
        {match.home_team} vs {match.away_team}
      </Text>
      <Text style={styles.venue}>
        <Ionicons name="location" size={12} color={theme.colors.muted} /> {match.venue || 'TBA'}
      </Text>
      <Text style={styles.time}>
        <Ionicons name="time" size={12} color={theme.colors.muted} /> {matchDate.format('HH:mm')}
      </Text>

      {isUpcoming && (
        <View style={styles.pricing}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>General</Text>
            <Text style={styles.priceValue}>N${ticketPrices.general}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>VIP</Text>
            <Text style={styles.priceValue}>N${ticketPrices.vip}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Premium</Text>
            <Text style={styles.priceValue}>N${ticketPrices.premium}</Text>
          </View>
        </View>
      )}

      {!isUpcoming && (
        <View style={styles.pastMatchBadge}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.muted} />
          <Text style={styles.pastMatchText}>Match Completed</Text>
        </View>
      )}

      {isUpcoming && (
        <View style={styles.viewDetailsBadge}>
          <Ionicons name="arrow-forward-circle" size={16} color={theme.colors.primary} />
          <Text style={styles.viewDetailsText}>View Details & Buy Ticket</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const TicketsScreen = ({ navigation }) => {
  const { fixtures, results, refresh, loading, leagues } = useData();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('all');

  // Create tabs: All + league abbreviations
  const topTabs = useMemo(() => {
    const tabs = [{ id: 'all', label: 'All', leagueId: null }];
    if (leagues && leagues.length > 0) {
      leagues.forEach(league => {
        tabs.push({
          id: String(league.id),
          label: getLeagueAbbreviation(league.name),
          leagueId: league.id
        });
      });
    }
    return tabs;
  }, [leagues]);

  // Combine fixtures and results, filter by selected league and search, sorted by date
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
        return match.home_team?.toLowerCase().includes(query) ||
          match.away_team?.toLowerCase().includes(query) ||
          match.venue?.toLowerCase().includes(query);
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

  const handleMatchPress = (match) => {
    const matchId = match.id || match.match_id;
    navigation.navigate('MatchDetails', { matchId });
  };

  const renderMatchGroup = ({ item: group }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{group.label}</Text>
      {group.matches.map((match, index) => {
        const matchId = match.id || match.match_id;
        return (
          <TicketCard
            key={`${matchId}-${index}`}
            match={match}
            onPress={() => handleMatchPress(match)}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.fullScreen}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('tickets', language)}</Text>
            <Text style={styles.subtitle}>Purchase match tickets</Text>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={theme.colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search matches..."
              placeholderTextColor={theme.colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Top Navigation Tabs */}
        <View style={styles.topTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topTabsContainer}
            contentContainerStyle={styles.topTabsContent}
          >
            {topTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.topTab, selectedLeagueId === tab.id && styles.topTabActive]}
                onPress={() => setSelectedLeagueId(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.topTabText, selectedLeagueId === tab.id && styles.topTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Matches List */}
        <FlatList
          data={groupedMatches}
          keyExtractor={(item) => item.date}
          renderItem={renderMatchGroup}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="ticket"
                title={searchQuery ? "No matches found" : undefined}
                subtitle={searchQuery ? "No matches match your search criteria. Try a different search term or clear your search to see all available matches with ticket sales." : undefined}
                messageType={searchQuery ? undefined : "matches"}
                illustrationTone="red"
              />
            </View>
          }
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          contentContainerStyle={groupedMatches?.length ? styles.list : styles.emptyList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.listContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary
  },
  headerWrapper: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm
  },
  header: {
    marginBottom: theme.spacing.sm
  },
  title: {
    ...theme.typography.h3,
    fontSize: 20,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.muted
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  searchIcon: {
    marginRight: theme.spacing.sm
  },
  searchInput: {
    flex: 1,
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.sm
  },
  topTabsWrapper: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
    paddingBottom: theme.spacing.sm
  },
  topTabsContainer: {
    flexGrow: 0
  },
  topTabsContent: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  topTab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: theme.spacing.xs,
    minWidth: 40
  },
  topTabActive: {
    borderBottomColor: theme.colors.interactive || theme.colors.error || '#DC143C'
  },
  topTabText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12
  },
  topTabTextActive: {
    color: theme.colors.interactive || theme.colors.error || '#DC143C',
    fontWeight: '700'
  },
  listContainer: {
    flex: 1
  },
  dateGroup: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs
  },
  dateHeader: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
    fontSize: 11
  },
  list: {
    paddingBottom: theme.spacing.lg
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 60
  },
  ticketCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  teamFlag: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  vs: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginHorizontal: theme.spacing.xs
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundPrimary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs / 2
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  matchTeams: {
    ...theme.typography.bodySmall,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  venue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2
  },
  time: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm
  },
  pricing: {
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary
  },
  priceValue: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  buyButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700'
  },
  pastMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md
  },
  pastMatchText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    fontWeight: '600'
  },
  viewDetailsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md
  },
  viewDetailsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg
  }
});

export default TicketsScreen;


