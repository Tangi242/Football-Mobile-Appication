import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import Poll from '../../components/common/Poll.js';
import Quiz from '../../components/common/Quiz.js';
import MatchPrediction from '../../components/match/MatchPrediction.js';
import LiveReactions from '../../components/common/LiveReactions.js';
import PredictionLeaderboard from '../../components/common/PredictionLeaderboard.js';
import SegmentedControl from '../../components/ui/SegmentedControl.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useToast } from '../../hooks/useToast.js';
import { scheduleMatchNotifications } from '../../services/notificationService.js';
import { areNotificationsSupported } from '../../utils/notifications.js';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { fetchFixtures, fetchResults, fetchPolls, fetchQuizzes } from '../../api/client.js';
import { useRefresh } from '../../context/RefreshContext.js';

// Lazy load notifications to avoid warnings in Expo Go
let Notifications = null;
const getNotifications = async () => {
  if (!areNotificationsSupported()) return null;
  if (!Notifications) {
    try {
      Notifications = await import('expo-notifications');
    } catch (error) {
      console.warn('Notifications not available:', error.message);
      return null;
    }
  }
  return Notifications;
};

const FanEngagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme: appTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { refreshKeys } = useRefresh();
  const [activeTab, setActiveTab] = useState('Polls');
  const [matchReminders, setMatchReminders] = useState(new Set());
  const [userPredictions, setUserPredictions] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [polls, setPolls] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['Polls', 'Quizzes', 'Predictions', 'Reactions'];

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fixturesRes, resultsRes, pollsRes, quizzesRes] = await Promise.all([
        fetchFixtures(),
        fetchResults(),
        fetchPolls(),
        fetchQuizzes()
      ]);
      setFixtures(fixturesRes.data?.fixtures || []);
      setResults(resultsRes.data?.results || []);
      setPolls(pollsRes.data?.polls || []);
      setQuizzes(quizzesRes.data?.quizzes || []);
    } catch (error) {
      console.error('Error loading fan engagement data:', error);
      showError('Failed to load fan engagement data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Load data on focus and when refresh keys change
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, refreshKeys.polls, refreshKeys.quizzes, refreshKeys.matches])
  );

  const upcomingMatches = useMemo(() => {
    return (fixtures || []).slice(0, 3);
  }, [fixtures]);

  // Get live/upcoming matches for reactions
  const liveMatches = useMemo(() => {
    const allMatches = [...(fixtures || []), ...(results || [])];
    return allMatches.filter(match => {
      const matchDate = dayjs(match.match_date);
      const now = dayjs();
      return matchDate.isAfter(now) && matchDate.diff(now, 'hours') < 24;
    }).slice(0, 3);
  }, [fixtures, results]);

  // Generate prediction leaderboard
  const predictionLeaderboard = useMemo(() => {
    // Mock leaderboard data - in production, this would come from API
    return [
      { userId: user?.id || '1', userName: user?.name || 'You', points: 45, correctPredictions: 8, totalPredictions: 10 },
      { userId: '2', userName: 'FootballFan2024', points: 42, correctPredictions: 7, totalPredictions: 10 },
      { userId: '3', userName: 'BraveWarrior', points: 38, correctPredictions: 6, totalPredictions: 9 },
      { userId: '4', userName: 'NFA_Supporter', points: 35, correctPredictions: 6, totalPredictions: 10 },
      { userId: '5', userName: 'MatchPredictor', points: 32, correctPredictions: 5, totalPredictions: 8 },
    ].sort((a, b) => b.points - a.points);
  }, [user]);

  const handlePollVote = (pollId, optionId) => {
    console.log('Poll voted:', pollId, optionId);
    showSuccess('Your vote has been recorded!');
    // In real app, submit to API
  };

  const handleQuizSubmit = (quizId, results) => {
    console.log('Quiz submitted:', quizId, results);
    const percentage = ((results.score / results.total) * 100).toFixed(0);
    showSuccess(`Quiz completed! You scored ${percentage}%`);
    // In real app, submit to API
  };

  const handlePredictionSubmit = (prediction) => {
    console.log('Prediction submitted:', prediction);
    setUserPredictions((prev) => ({
      ...prev,
      [prediction.matchId]: prediction,
    }));
    showSuccess('Prediction submitted! Check the leaderboard to see your ranking.');
    // In real app, submit to API
  };

  const handleSetReminder = async (match) => {
    try {
      const matchDate = dayjs(match.match_date);
      if (matchDate.isBefore(dayjs())) {
        showError('Cannot set reminder for past matches');
        return;
      }

      if (matchReminders.has(match.id)) {
        // Cancel reminder
        const Notifications = await getNotifications();
        if (Notifications) {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
        setMatchReminders((prev) => {
          const next = new Set(prev);
          next.delete(match.id);
          return next;
        });
        showSuccess('Match reminder cancelled');
      } else {
        // Set reminder
        await scheduleMatchNotifications(match, user?.id);
        setMatchReminders((prev) => new Set(prev).add(match.id));
        showSuccess('Match reminder set! You\'ll be notified 1 hour and 15 minutes before kickoff.');
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      showError('Failed to set reminder. Please check notification permissions.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Polls':
        return (
          <View>
            {polls.length > 0 ? (
              polls.map((poll) => (
                <Poll key={poll.id} poll={poll} onVote={handlePollVote} showResults={true} />
              ))
            ) : (
              <EmptyState
                icon="stats-chart"
                messageType="polls"
                illustrationTone="red"
              />
            )}
          </View>
        );
      case 'Quizzes':
        return (
          <View>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <Quiz key={quiz.id} quiz={quiz} onSubmit={handleQuizSubmit} />
              ))
            ) : (
              <EmptyState
                icon="school"
                messageType="quizzes"
                illustrationTone="gold"
              />
            )}
          </View>
        );
      case 'Predictions':
        return (
          <View>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            {upcomingMatches.length > 0 ? (
              <>
                {upcomingMatches.map((match, index) => {
                  const matchDate = dayjs(match.match_date);
                  const isUpcoming = matchDate.isAfter(dayjs());
                  const hasReminder = matchReminders.has(match.id || match.match_id);

                  return (
                    <View key={match.id || index}>
                      <View style={styles.matchHeader}>
                        <MatchPrediction
                          match={match}
                          onSubmit={handlePredictionSubmit}
                          userPrediction={userPredictions[match.id || match.match_id]}
                        />
                        {isUpcoming && (
                          <TouchableOpacity
                            style={[
                              styles.reminderButton,
                              hasReminder && [styles.reminderButtonActive, { backgroundColor: appTheme.colors.interactive || '#DC143C' }]
                            ]}
                            onPress={() => handleSetReminder(match)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={hasReminder ? 'notifications' : 'notifications-outline'}
                              size={18}
                              color={hasReminder ? theme.colors.white : appTheme.colors.textSecondary}
                            />
                            <Text style={[
                              styles.reminderText,
                              { color: hasReminder ? theme.colors.white : appTheme.colors.textSecondary }
                            ]}>
                              {hasReminder ? 'Reminder Set' : 'Set Reminder'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
                <PredictionLeaderboard
                  leaderboard={predictionLeaderboard}
                  currentUserId={user?.id}
                />
              </>
            ) : (
              <EmptyState
                icon="trophy"
                messageType="predictions"
                illustrationTone="gold"
              />
            )}
          </View>
        );
      case 'Reactions':
        return (
          <View>
            <Text style={styles.sectionTitle}>Live Match Reactions</Text>
            {liveMatches.length > 0 ? (
              liveMatches.map((match, index) => (
                <View key={match.id || index} style={styles.reactionSection}>
                  <View style={styles.matchReactionHeader}>
                    <Text style={[styles.matchReactionTitle, { color: appTheme.colors.textDark }]}>
                      {match.home_team} vs {match.away_team}
                    </Text>
                  </View>
                  <LiveReactions
                    matchId={match.id || match.match_id}
                    initialReactions={{ fire: 12, heart: 8, 'thumbs-up': 15, celebrate: 5, goal: 20 }}
                  />
                </View>
              ))
            ) : (
              <EmptyState
                icon="flash"
                messageType="reactions"
                illustrationTone="red"
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Fan Engagement</Text>
        <Text style={styles.subtitle}>Polls, quizzes, and predictions</Text>
      </View>

      <View style={styles.controls}>
        <SegmentedControl options={tabs} value={activeTab} onChange={setActiveTab} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderContent()}
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
  controls: {
    marginBottom: theme.spacing.lg
  },
  content: {
    paddingBottom: theme.spacing.lg
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center'
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted
  },
  matchHeader: {
    marginBottom: theme.spacing.sm,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundPrimary,
    marginTop: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    justifyContent: 'center',
  },
  reminderButtonActive: {
    borderColor: theme.colors.interactive || '#DC143C',
  },
  reminderText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  reactionSection: {
    marginBottom: theme.spacing.lg,
  },
  matchReactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  matchReactionTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  liveText: {
    ...theme.typography.tiny,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.5,
  },
});

export default FanEngagementScreen;


