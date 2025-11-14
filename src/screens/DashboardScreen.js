import { useMemo } from 'react';
import { View, Text, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import SectionHeader from '../components/SectionHeader.js';
import AnnouncementCard from '../components/AnnouncementCard.js';
import StatPill from '../components/StatPill.js';
import EmptyState from '../components/EmptyState.js';
import { useData } from '../context/DataContext.js';
import ScreenWrapper from '../components/ScreenWrapper.js';
import theme from '../theme/colors.js';
import { nfaImages } from '../constants/media.js';
import MatchHero from '../components/MatchHero.js';
import MatchListCard from '../components/MatchListCard.js';
import StandingsPanel from '../components/StandingsPanel.js';

const DashboardScreen = () => {
    const { fixtures, results, announcements, liveEvents, loading, refresh } = useData();
    const { width } = useWindowDimensions();

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
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
            contentContainerStyle={styles.container}
        >
            <View style={[styles.hero, { minHeight: width < 360 ? 200 : 240 }]}>
                <Image source={nfaImages.hero} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="disk" />
                <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.45)']} style={styles.heroOverlay}>
                    <Text style={styles.heroLabel}>Namibia Football Hub</Text>
                    <Text style={[styles.heroTitle, { fontSize: width < 360 ? 24 : 34 }]}>All Football. One App.</Text>
                    <Text style={styles.heroSubtitle}>Brave Warriors • Premier League • Cups</Text>
                </LinearGradient>
            </View>

            <View style={styles.section}>
                {nextFixture ? (
                    <MatchHero match={nextFixture} leagueName={leagueName} />
                ) : (
                    <EmptyState icon="time" title="No upcoming matches" subtitle="We will update fixtures soon." />
                )}
            </View>

            <View style={styles.section}>
                <SectionHeader title="Latest Result" />
                {latestResult ? (
                    <MatchListCard match={latestResult} />
                ) : (
                    <EmptyState icon="trophy" title="No recent matches" subtitle="Latest scores will appear after games finish." />
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
                    <EmptyState icon="newspaper" title="No announcements" subtitle="League news will populate here automatically." />
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 32
    },
    hero: {
        borderRadius: 22,
        overflow: 'hidden',
        width: '100%'
    },
    heroOverlay: {
        flex: 1,
        padding: 24,
        justifyContent: 'center'
    },
    section: {
        width: '100%'
    },
    heroLabel: {
        color: theme.colors.highlight,
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: '700'
    },
    heroTitle: {
        marginTop: 6,
        fontSize: 26,
        color: theme.colors.textPrimary,
        fontWeight: '800',
        flexWrap: 'wrap'
    },
    heroSubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: theme.colors.textSecondary
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12
    },
    statGap: {
        width: 12,
        minHeight: 12
    }
});

export default DashboardScreen;

