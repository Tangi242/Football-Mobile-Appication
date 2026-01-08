import { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import SectionHeader from '../../components/ui/SectionHeader.js';
import AnnouncementCard from '../../components/news/AnnouncementCard.js';
import StatPill from '../../components/ui/StatPill.js';
import EmptyState from '../../components/ui/EmptyState.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import theme from '../../theme/colors.js';
import { nfaImages } from '../../constants/media.js';
import MatchHero from '../../components/match/MatchHero.js';
import MatchListCard from '../../components/match/MatchListCard.js';
import StandingsPanel from '../../components/common/StandingsPanel.js';
import { fetchFixtures, fetchResults, fetchNews } from '../../api/client.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useToast } from '../../hooks/useToast.js';

const DashboardScreen = () => {
    const { width } = useWindowDimensions();
    const { showError } = useToast();
    const { refreshKeys } = useRefresh();
    const [fixtures, setFixtures] = useState([]);
    const [results, setResults] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load data from database
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [fixturesRes, resultsRes, newsRes] = await Promise.all([
                fetchFixtures(),
                fetchResults(),
                fetchNews()
            ]);
            setFixtures(fixturesRes.data?.fixtures || []);
            setResults(resultsRes.data?.results || []);
            setAnnouncements(newsRes.data?.announcements || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showError('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [showError]);

    // Load data on focus and when refresh keys change
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData, refreshKeys.matches, refreshKeys.news])
    );

    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const nextFixture = fixtures?.[0];
    const latestResult = results?.[0];
    const leagueName = nextFixture?.competition || 'Namibia Premier League';

    const stats = useMemo(() => {
        if (!results?.length) {
            return { matches: 0, goals: 0, reports: 0 };
        }
        const matches = results.length;
        const goals = results.reduce((sum, item) => sum + (item.home_score || 0) + (item.away_score || 0), 0);
        return { matches, goals, reports: matches };
    }, [results]);

    const standings = useMemo(() => {
        const table = {};
        results?.forEach((match) => {
            if (!table[match.home_team]) {
                table[match.home_team] = { name: match.home_team, played: 0, points: 0 };
            }
            if (!table[match.away_team]) {
                table[match.away_team] = { name: match.away_team, played: 0, points: 0 };
            }
            table[match.home_team].played += 1;
            table[match.away_team].played += 1;
            if (match.home_score > match.away_score) {
                table[match.home_team].points += 3;
            } else if (match.home_score < match.away_score) {
                table[match.away_team].points += 3;
            } else {
                table[match.home_team].points += 1;
                table[match.away_team].points += 1;
            }
        });
        return Object.values(table).sort((a, b) => b.points - a.points);
    }, [results]);

    return (
        <ScreenWrapper
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            contentContainerStyle={styles.container}
        >
            <View style={[styles.hero, { minHeight: width < 360 ? 200 : 240 }]}>
                <Image source={nfaImages.hero} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="disk" />
                <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.45)']} style={styles.heroOverlay}>
                    <Text style={styles.heroLabel}>Ballr</Text>
                    <Text style={[styles.heroTitle, { fontSize: width < 360 ? 20 : 28 }]}>All Football. One App.</Text>
                    <Text style={styles.heroSubtitle}>Premier League • National Teams • Cups</Text>
                </LinearGradient>
            </View>

            <View style={styles.section}>
                {nextFixture ? (
                    <MatchHero match={nextFixture} leagueName={leagueName} />
                ) : (
                    <EmptyState
                        icon="time"
                        title="No upcoming matches"
                        subtitle="Check back soon for new fixtures. Match schedules will be updated regularly."
                    />
                )}
            </View>

            <View style={styles.section}>
                <SectionHeader title="Latest Result" />
                {latestResult ? (
                    <MatchListCard match={latestResult} />
                ) : (
                    <EmptyState
                        icon="trophy"
                        title="No recent matches"
                        subtitle="Match results will appear here automatically after games finish. Stay tuned for updates!"
                    />
                )}
            </View>

            <View style={styles.section}>
                <SectionHeader title="Competition Pulse" />
                <View style={[styles.statsRow, { flexWrap: width < 400 ? 'wrap' : 'nowrap' }]}>
                    <StatPill label="Matches played" value={stats.matches} />
                    <View style={styles.statGap} />
                    <StatPill label="Goals scored" value={stats.goals} />
                    <View style={styles.statGap} />
                    <StatPill label="Reports filed" value={stats.reports} />
                </View>
            </View>

            {standings.length ? (
                <View style={styles.section}>
                    <StandingsPanel standings={standings} />
                </View>
            ) : null}

            <View style={styles.section}>
                <SectionHeader title="Announcements" />
                {announcements?.length ? (
                    announcements
                        .slice(0, 3)
                        .map((announcement, index) => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} fallbackIndex={index} />
                        ))
                ) : (
                    <EmptyState
                        icon="newspaper"
                        title="No announcements"
                        subtitle="Important league updates and news will appear here. Check back regularly for the latest information."
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: theme.spacing.lg
    },
    hero: {
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        width: '100%',
        ...theme.shadows.lg
    },
    heroOverlay: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center'
    },
    section: {
        width: '100%',
        marginBottom: theme.spacing.md
    },
    heroLabel: {
        color: theme.colors.white,
        textTransform: 'uppercase',
        ...theme.typography.caption,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        flexShrink: 1,
    },
    heroTitle: {
        marginTop: theme.spacing.xs,
        ...theme.typography.h2,
        color: theme.colors.white,
        flexWrap: 'wrap'
    },
    heroSubtitle: {
        marginTop: theme.spacing.sm,
        ...theme.typography.bodySmall,
        color: 'rgba(255,255,255,0.9)'
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: theme.spacing.md
    },
    statGap: {
        width: theme.spacing.md,
        minHeight: theme.spacing.md
    }
});

export default DashboardScreen;

