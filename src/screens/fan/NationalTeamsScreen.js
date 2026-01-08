import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from '../../lib/dayjs.js';
import { useData } from '../../context/DataContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import MatchListCard from '../../components/match/MatchListCard.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { lightTheme } from '../../theme/colors.js';
import { nfaImages } from '../../constants/media.js';

const SquadCallup = ({ player, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.callupCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.callupInfo}>
      <Text style={[styles.callupName, { color: theme.colors.textDark }]}>{player.name}</Text>
      <Text style={[styles.callupPosition, { color: theme.colors.muted }]}>{player.position} • {player.club}</Text>
    </View>
    <Ionicons name="chevron-forward" size={14} color={theme.colors.muted} />
  </TouchableOpacity>
);

const NationalTeamsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { fixtures, results } = useData();
  const insets = useSafeAreaInsets();
  const [activeTeam, setActiveTeam] = useState('brave-warriors');
  const [activeTab, setActiveTab] = useState('fixtures');

  const teams = useMemo(() => ({
    'brave-warriors': {
      name: 'Namibia',
      subtitle: 'Namibia Senior National Team',
      logo: nfaImages.hero,
      color: theme.colors.primary,
      category: 'men'
    },
    'u23': {
      name: 'U-23',
      subtitle: 'Namibia Under-23',
      logo: nfaImages.hero,
      color: theme.colors.secondary,
      category: 'men'
    },
    'u20': {
      name: 'U-20',
      subtitle: 'Namibia Under-20',
      logo: nfaImages.hero,
      color: theme.colors.secondary,
      category: 'men'
    },
    'u15': {
      name: 'U-15',
      subtitle: 'Namibia Under-15',
      logo: nfaImages.hero,
      color: theme.colors.secondary,
      category: 'men'
    },
    'women': {
      name: 'Women',
      subtitle: 'Namibia Women\'s National Team',
      logo: nfaImages.hero,
      color: '#E91E63',
      category: 'women'
    },
    'women-u20': {
      name: 'Women U-20',
      subtitle: 'Namibia Women\'s U-20',
      logo: nfaImages.hero,
      color: '#E91E63',
      category: 'women'
    }
  }), [theme]);

  const currentTeam = teams[activeTeam];

  const nationalFixtures = useMemo(() => {
    const allMatches = [...(fixtures || []), ...(results || [])];
    return allMatches.filter(m =>
      m.competition?.toLowerCase().includes('national') ||
      m.competition?.toLowerCase().includes('namibia') ||
      m.home_team?.toLowerCase().includes('namibia') ||
      m.away_team?.toLowerCase().includes('namibia')
    );
  }, [fixtures, results]);

  const squad = useMemo(() => {
    return [
      { name: 'Player One', position: 'GK', club: 'Club A' },
      { name: 'Player Two', position: 'DF', club: 'Club B' },
      { name: 'Player Three', position: 'MF', club: 'Club C' },
      { name: 'Player Four', position: 'FW', club: 'Club D' }
    ];
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'fixtures':
        return (
          <View>
            {nationalFixtures.length > 0 ? (
              nationalFixtures.map((match, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                  activeOpacity={0.7}
                >
                  <MatchListCard match={match} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="calendar"
                  title="No fixtures"
                  subtitle="National team fixtures will appear here"
                />
              </View>
            )}
          </View>
        );
      case 'squad':
        return (
          <View>
            {squad.length > 0 ? (
              squad.map((player, index) => (
                <SquadCallup
                  key={index}
                  player={player}
                  theme={theme}
                  onPress={() => navigation.navigate('PlayerDetail', { playerName: player.name })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState icon="people" title="No squad" subtitle="Squad information will appear here" />
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const renderTeamButton = (key, team) => {
    const isActive = activeTeam === key;
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.teamButton,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          isActive && styles.teamButtonActive
        ]}
        onPress={() => setActiveTeam(key)}
        activeOpacity={0.7}
      >
        {isActive ? (
          <LinearGradient
            colors={[team.color, team.color + 'DD']}
            style={styles.teamButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.activeIndicator} />
            <Text style={styles.teamButtonTextActive}>
              {team.name}
            </Text>
          </LinearGradient>
        ) : (
          <Text style={[styles.teamButtonText, { color: theme.colors.textSecondary }]}>
            {team.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textDark }]}>National Teams</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Namibia National Teams, Youth & Women's Teams</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Men's Teams Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Men's Teams</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamSelectorContent}
          >
            {Object.keys(teams)
              .filter(key => teams[key].category === 'men')
              .map(key => renderTeamButton(key, teams[key]))}
          </ScrollView>
        </View>

        {/* Women's Teams Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Women's Teams</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamSelectorContent}
          >
            {Object.keys(teams)
              .filter(key => teams[key].category === 'women')
              .map(key => renderTeamButton(key, teams[key]))}
          </ScrollView>
        </View>

        {/* Team Detail Card */}
        <View style={[styles.teamHeader, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.teamLogoContainer}>
            <Image
              source={currentTeam.logo}
              style={[styles.teamLogo, { borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundPrimary }]}
              contentFit="cover"
            />
          </View>
          <View style={styles.teamInfo}>
            <Text style={[styles.teamName, { color: theme.colors.textDark }]} numberOfLines={1}>
              {currentTeam.name}
            </Text>
            <Text style={[styles.teamSubtitle, { color: theme.colors.muted }]} numberOfLines={1}>
              {currentTeam.subtitle}
            </Text>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={[styles.tabs, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border }]}>
          {['fixtures', 'squad'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && [styles.tabActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                { color: theme.colors.textSecondary },
                activeTab === tab && [styles.tabTextActive, { color: theme.colors.white }]
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingBottom: lightTheme.spacing.sm,
    borderBottomWidth: 1,
    ...lightTheme.shadows.sm,
    zIndex: 10
  },
  title: {
    ...lightTheme.typography.h2,
    marginBottom: lightTheme.spacing.xs / 2,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 24
  },
  subtitle: {
    ...lightTheme.typography.bodySmall,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: lightTheme.spacing.lg
  },
  sectionContainer: {
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm
  },
  sectionLabel: {
    ...lightTheme.typography.caption,
    fontWeight: '700',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.xs
  },
  teamSelectorContent: {
    paddingHorizontal: lightTheme.spacing.lg,
    gap: lightTheme.spacing.xs,
    paddingRight: lightTheme.spacing.lg
  },
  teamButton: {
    borderRadius: lightTheme.borderRadius.sm,
    borderWidth: 1,
    minWidth: 65,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...lightTheme.shadows.sm
  },
  teamButtonActive: {
    borderWidth: 0,
    ...lightTheme.shadows.md
  },
  teamButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.sm,
    position: 'relative'
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomLeftRadius: lightTheme.borderRadius.sm,
    borderBottomRightRadius: lightTheme.borderRadius.sm
  },
  teamButtonText: {
    ...lightTheme.typography.caption,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.1,
    textAlign: 'center',
    paddingHorizontal: lightTheme.spacing.sm
  },
  teamButtonTextActive: {
    color: lightTheme.colors.white,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.sm,
    marginHorizontal: lightTheme.spacing.lg,
    marginTop: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.sm,
    borderWidth: 1,
    ...lightTheme.shadows.sm
  },
  teamLogoContainer: {
    marginRight: lightTheme.spacing.sm,
    width: 48,
    height: 48
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5
  },
  teamInfo: {
    flex: 1,
    minWidth: 0
  },
  teamName: {
    ...lightTheme.typography.h4,
    marginBottom: lightTheme.spacing.xs / 2,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18
  },
  teamSubtitle: {
    ...lightTheme.typography.caption,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500'
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.xs,
    marginHorizontal: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.sm,
    borderWidth: 1,
    ...lightTheme.shadows.sm
  },
  tab: {
    flex: 1,
    paddingVertical: lightTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: lightTheme.borderRadius.sm,
    height: 32
  },
  tabActive: {
    ...lightTheme.shadows.sm
  },
  tabText: {
    ...lightTheme.typography.bodySmall,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 15
  },
  tabTextActive: {
    fontWeight: '700'
  },
  contentArea: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.xs
  },
  callupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.sm + 2,
    marginBottom: lightTheme.spacing.xs,
    borderWidth: 1,
    ...lightTheme.shadows.sm
  },
  callupInfo: {
    flex: 1,
    minWidth: 0
  },
  callupName: {
    ...lightTheme.typography.body,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs / 2,
    fontSize: 12,
    lineHeight: 17
  },
  callupPosition: {
    ...lightTheme.typography.caption,
    fontSize: 10,
    lineHeight: 13
  },
  newsCard: {
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.sm + 2,
    marginBottom: lightTheme.spacing.xs,
    borderWidth: 1,
    ...lightTheme.shadows.sm
  },
  newsTitle: {
    ...lightTheme.typography.body,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs / 2,
    fontSize: 12,
    lineHeight: 17
  },
  newsDate: {
    ...lightTheme.typography.caption,
    fontSize: 10,
    lineHeight: 13
  },
  emptyContainer: {
    paddingVertical: lightTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    width: '100%'
  }
});

export default NationalTeamsScreen;
