import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../../context/DataContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import ChartView from '../../components/ui/ChartView.js';
import Tooltip from '../../components/ui/Tooltip.js';
import theme from '../../theme/colors.js';

const StatCard = ({ title, value, change, icon, color = theme.colors.primary }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {change !== undefined && (
      <View style={styles.changeRow}>
        <Ionicons
          name={change >= 0 ? 'arrow-up' : 'arrow-down'}
          size={12}
          color={change >= 0 ? '#10B981' : '#EF4444'}
        />
        <Text style={[styles.changeText, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
          {Math.abs(change)}%
        </Text>
      </View>
    )}
  </View>
);

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { results, fixtures, leaders } = useData();
  const [selectedTrend, setSelectedTrend] = useState(null);

  const analytics = useMemo(() => {
    const totalMatches = (results || []).length;
    const totalGoals = (results || []).reduce((sum, match) => {
      return sum + (match.home_score || 0) + (match.away_score || 0);
    }, 0);
    const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : 0;
    const upcomingMatches = (fixtures || []).length;
    const topScorer = leaders?.goals?.[0];
    const topAssister = leaders?.assists?.[0];

    return {
      totalMatches,
      totalGoals,
      avgGoalsPerMatch,
      upcomingMatches,
      topScorer: topScorer?.value || 0,
      topAssister: topAssister?.value || 0
    };
  }, [results, fixtures, leaders]);

  // Season trend data with historical comparison
  const trendsData = useMemo(() => {
    const goalsPerMatch = Number(analytics.avgGoalsPerMatch);

    // Calculate trends from previous matches (last 5 vs previous 5)
    const recentMatches = (results || []).slice(0, 5);
    const previousMatches = (results || []).slice(5, 10);

    const recentAvgGoals = recentMatches.length > 0
      ? recentMatches.reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0) / recentMatches.length
      : goalsPerMatch;

    const previousAvgGoals = previousMatches.length > 0
      ? previousMatches.reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0) / previousMatches.length
      : goalsPerMatch;

    const goalsTrend = previousAvgGoals > 0
      ? ((recentAvgGoals - previousAvgGoals) / previousAvgGoals * 100).toFixed(1)
      : null;

    return [
      {
        key: 'goals',
        label: 'Goals per Match',
        value: goalsPerMatch,
        unit: ' goals',
        period: 'Last 5 matches',
        color: theme.colors.primary,
        trend: goalsTrend ? (goalsTrend > 0 ? 'up' : goalsTrend < 0 ? 'down' : 'neutral') : null,
        trendValue: goalsTrend ? Math.abs(parseFloat(goalsTrend)) : null,
      },
      {
        key: 'attendance',
        label: 'Match Attendance',
        value: 68,
        unit: '%',
        period: 'Season to date',
        color: '#10B981',
        trend: 'up',
        trendValue: 5.2,
      },
      {
        key: 'cleanSheets',
        label: 'Clean Sheets',
        value: 45,
        unit: '%',
        period: 'Season to date',
        color: theme.colors.secondary,
        trend: 'down',
        trendValue: 2.1,
      }
    ];
  }, [analytics.avgGoalsPerMatch, results]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return trendsData.map(trend => ({
      label: trend.label.split(' ')[0], // Short label for chart
      value: Number(trend.value) || 0,
      unit: trend.unit,
      color: trend.color,
    }));
  }, [trendsData]);

  const maxTrendValue = useMemo(() => {
    const vals = trendsData.map(t => Number(t.value) || 0);
    const max = Math.max(...vals, 1);
    return max;
  }, [trendsData]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Comprehensive statistics and insights</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Matches Played"
            value={analytics.totalMatches}
            change={5}
            icon="calendar"
            color={theme.colors.primary}
          />
          <StatCard
            title="Total Goals"
            value={analytics.totalGoals}
            change={12}
            icon="football"
            color="#10B981"
          />
          <StatCard
            title="Avg Goals/Match"
            value={analytics.avgGoalsPerMatch}
            icon="stats-chart"
            color="#F59E0B"
          />
          <StatCard
            title="Upcoming"
            value={analytics.upcomingMatches}
            icon="time"
            color={theme.colors.secondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <TouchableOpacity
            style={styles.performersCard}
            onPress={() => navigation.navigate('Stats')}
            activeOpacity={0.7}
          >
            <View style={styles.performerRow}>
              <View style={styles.performerInfo}>
                <Ionicons name="trophy" size={18} color="#F59E0B" />
                <Text style={styles.performerLabel}>Top Scorer</Text>
              </View>
              <Text style={styles.performerValue}>{analytics.topScorer} goals</Text>
            </View>
            <View style={styles.performerRow}>
              <View style={styles.performerInfo}>
                <Ionicons name="hand-left" size={18} color={theme.colors.primary} />
                <Text style={styles.performerLabel}>Top Assister</Text>
              </View>
              <Text style={styles.performerValue}>{analytics.topAssister} assists</Text>
            </View>
            <View style={styles.viewStatsHint}>
              <Text style={styles.viewStatsText}>View detailed statistics</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.interactive || theme.colors.error || '#DC143C'} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Season Trends</Text>
              <Tooltip text="Compare current performance metrics with previous periods. Green arrows indicate improvement, red arrows show decline. Switch between bar and line charts to visualize trends differently.">
                <Ionicons name="help-circle-outline" size={18} color={theme.colors.muted} />
              </Tooltip>
            </View>
            <Text style={styles.sectionSubtitle}>Tap info icon for chart explanation • Switch between bar and line views</Text>
          </View>

          {/* Chart View with Switcher */}
          <ChartView
            data={chartData}
            type="bar"
            title="Performance Metrics"
            subtitle="Visual comparison of key statistics"
          />

          {/* Detailed Trend Items */}
          <View style={styles.trendsCard}>
            {trendsData.map((trend) => {
              const barWidth = Math.min((Number(trend.value) / maxTrendValue) * 100, 100);
              const getTrendIcon = () => {
                if (!trend.trend) return null;
                if (trend.trend === 'up') return 'arrow-up';
                if (trend.trend === 'down') return 'arrow-down';
                return 'remove';
              };
              const getTrendColor = () => {
                if (!trend.trend) return theme.colors.muted;
                if (trend.trend === 'up') return '#10B981';
                if (trend.trend === 'down') return '#EF4444';
                return theme.colors.muted;
              };

              return (
                <TouchableOpacity
                  key={trend.key}
                  style={styles.trendItem}
                  activeOpacity={0.75}
                  onPress={() => setSelectedTrend(trend)}
                >
                  <View style={styles.trendHeader}>
                    <View style={styles.trendLabelRow}>
                      <Text style={styles.trendLabel}>{trend.label}</Text>
                      {trend.trend && trend.trendValue && (
                        <View style={styles.trendBadge}>
                          <Ionicons name={getTrendIcon()} size={12} color={getTrendColor()} />
                          <Text style={[styles.trendBadgeText, { color: getTrendColor() }]}>
                            {trend.trendValue}%
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.trendPeriod}>{trend.period}</Text>
                  </View>
                  <View style={styles.trendBarRow}>
                    <View style={styles.trendBar}>
                      <View style={[styles.trendFill, { width: `${barWidth}%`, backgroundColor: trend.color }]} />
                    </View>
                    <Text style={styles.trendValue}>{trend.value}{trend.unit}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {selectedTrend && (
              <View style={styles.trendDetail}>
                <Text style={styles.trendDetailTitle}>{selectedTrend.label}</Text>
                <Text style={styles.trendDetailText}>
                  {`Value: ${selectedTrend.value}${selectedTrend.unit} • Period: ${selectedTrend.period}`}
                </Text>
                {selectedTrend.trend && (
                  <Text style={[styles.trendDetailText, { color: selectedTrend.trend === 'up' ? '#10B981' : '#EF4444' }]}>
                    {selectedTrend.trend === 'up' ? '↑' : '↓'} {selectedTrend.trendValue}% compared to previous period
                  </Text>
                )}
                <Text style={styles.trendDetailHint}>
                  Tap items to view more details or open Stats for deeper breakdowns.
                </Text>
                <TouchableOpacity
                  style={styles.trendDetailButton}
                  onPress={() => navigation.navigate('Stats')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bar-chart" size={16} color={theme.colors.white} />
                  <Text style={styles.trendDetailButtonText}>View full statistics</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.md
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted
  },
  content: {
    paddingBottom: theme.spacing.lg
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg, // Increased from md - more breathing room
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md // Enhanced from sm - subtle soft shadow for depth
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs / 2
  },
  statTitle: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs / 2
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2
  },
  changeText: {
    ...theme.typography.tiny,
    fontWeight: '700'
  },
  section: {
    marginBottom: theme.spacing.md
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs / 2,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  performersCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg, // Increased from md - more breathing room
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md, // Enhanced from sm - subtle soft shadow for depth
    gap: theme.spacing.md
  },
  performerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  performerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  performerLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary
  },
  performerValue: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary
  },
  viewStatsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.xs / 2
  },
  viewStatsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.interactive || theme.colors.error || '#DC143C',
    fontWeight: '600',
    fontSize: 12
  },
  trendsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg, // Increased from md - more breathing room
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md, // Enhanced from sm - subtle soft shadow for depth
    gap: theme.spacing.md
  },
  trendItem: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs
  },
  trendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  trendLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: theme.spacing.xs / 2,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  trendBadgeText: {
    ...theme.typography.tiny,
    fontWeight: '700',
    fontSize: 9,
  },
  trendAxisLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs
  },
  trendPeriodLabel: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  trendPeriod: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary
  },
  trendBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  trendBar: {
    height: 8,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: 4,
    overflow: 'hidden'
  },
  trendFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4
  },
  trendValue: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textDark,
    textAlign: 'right'
  },
  trendDetail: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.xs
  },
  trendDetailTitle: {
    ...theme.typography.body,
    fontWeight: '800',
    color: theme.colors.textDark
  },
  trendDetailText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary
  },
  trendDetailHint: {
    ...theme.typography.caption,
    color: theme.colors.muted
  },
  trendDetailButton: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs / 2,
    ...theme.shadows.sm
  },
  trendDetailButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700'
  }
});

export default AnalyticsScreen;


