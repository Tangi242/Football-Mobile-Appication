import { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../lib/dayjs.js';
import { useData } from '../context/DataContext.js';
import EmptyState from '../components/EmptyState.js';
import ScreenWrapper from '../components/ScreenWrapper.js';
import theme from '../theme/colors.js';
import { nfaImages } from '../constants/media.js';
import MatchHero from '../components/MatchHero.js';
import MatchListCard from '../components/MatchListCard.js';
import ChipTabs from '../components/ChipTabs.js';

const Tabs = ['Fixtures', 'Results', 'Reports'];

const MatchesScreen = () => {
    const { fixtures, results, reports, refresh, loading, leagues } = useData();
    const [activeTab, setActiveTab] = useState(Tabs[0]);
    const [selectedLeague, setSelectedLeague] = useState('all');

    const data = useMemo(() => {
        switch (activeTab) {
            case 'Results':
                return results;
            case 'Reports':
                return reports;
            default:
                return fixtures;
        }
    }, [fixtures, results, reports, activeTab]);

    const filteredData = useMemo(() => {
        if (selectedLeague === 'all') return data;
        return data?.filter((item) => Number(item.league_id) === Number(selectedLeague));
    }, [data, selectedLeague]);

    const leagueOptions = useMemo(() => {
        const base = [{ label: 'All', value: 'all' }];
        const mapped =
            leagues?.map((league) => ({
                label: league.name,
                value: String(league.id)
            })) || [];
        return [...base, ...mapped];
    }, [leagues]);

    const heroFixture = useMemo(() => {
        if (!fixtures?.length) return null;
        if (selectedLeague === 'all') return fixtures[0];
        return fixtures.find((match) => Number(match.league_id) === Number(selectedLeague)) || fixtures[0];
    }, [fixtures, selectedLeague]);

    const renderItem = ({ item }) => {
        if (activeTab === 'Reports') {
            return (
                <View style={styles.reportCard}>
                    <Text style={styles.reportLabel}>
                        {dayjs(item.created_at).format('DD MMM, HH:mm')} • {item.home_team} vs {item.away_team}
                    </Text>
                    <Text style={styles.reportTitle}>Match Report #{item.id}</Text>
                    <Text style={styles.reportBody} numberOfLines={3}>
                        {item.summary || item.details}
                    </Text>
                </View>
            );
        }
        return <MatchListCard match={item} />;
    };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.tabRow}>
                {Tabs.map((tab) => (
                    <TouchableOpacity key={tab} style={[styles.tab, tab === activeTab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabLabel, tab === activeTab && styles.activeTabLabel]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ChipTabs options={leagueOptions} value={selectedLeague} onChange={setSelectedLeague} />
            <FlatList
                data={filteredData}
                keyExtractor={(item, index) => `${activeTab}-${item.id}-${index}`}
                renderItem={renderItem}
                ListEmptyComponent={
                    <EmptyState icon="calendar" title={`No ${activeTab.toLowerCase()}`} subtitle="Updates will appear the moment data is synced." />
                }
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                contentContainerStyle={data?.length ? styles.list : styles.emptyList}
                ListHeaderComponent={
                    <View>
                        <View style={styles.banner}>
                            <Image source={nfaImages.fans} style={styles.bannerImage} contentFit="cover" cachePolicy="disk" />
                            <View style={styles.bannerOverlay}>
                                <Text style={styles.bannerTitle}>{activeTab}</Text>
                                <Text style={styles.bannerSubtitle}>Latest updates from Namibian pitches</Text>
                            </View>
                        </View>
                        {heroFixture ? <MatchHero match={heroFixture} leagueName={heroFixture.competition} /> : null}
                    </View>
                }
            />
    </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12
  },
    activeTab: {
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
    },
    tabLabel: {
        fontSize: 14,
    color: theme.colors.muted,
        fontWeight: '600'
    },
    activeTabLabel: {
    color: theme.colors.textPrimary
    },
    reportCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    reportLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 6
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.darkGray,
        marginBottom: 8
    },
    reportBody: {
        fontSize: 14,
        color: theme.colors.darkGray
    },
    list: {
        paddingBottom: 20
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center'
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative'
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 16,
    justifyContent: 'flex-end'
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textDark
  },
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary
  }
});

export default MatchesScreen;

