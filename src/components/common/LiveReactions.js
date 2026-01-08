import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

const REACTION_TYPES = [
  { id: 'fire', icon: 'flame', label: 'Fire', color: '#F59E0B' },
  { id: 'heart', icon: 'heart', label: 'Love', color: '#EF4444' },
  { id: 'thumbs-up', icon: 'thumbs-up', label: 'Like', color: '#10B981' },
  { id: 'celebrate', icon: 'trophy', label: 'Celebrate', color: '#8B5CF6' },
  { id: 'goal', icon: 'football', label: 'Goal!', color: '#3B82F6' },
];

const LiveReactions = ({ matchId, initialReactions = {} }) => {
  const { theme: appTheme } = useTheme();
  const [reactions, setReactions] = useState(initialReactions);
  const [userReactions, setUserReactions] = useState({});
  const [recentReactions, setRecentReactions] = useState([]);

  // Simulate real-time updates (in production, this would come from WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new reactions coming in
      if (Math.random() > 0.7) {
        const randomReaction = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)];
        const newReaction = {
          id: Date.now(),
          type: randomReaction.id,
          timestamp: Date.now(),
          user: 'Fan' + Math.floor(Math.random() * 1000),
        };
        setRecentReactions((prev) => [newReaction, ...prev].slice(0, 10));
        setReactions((prev) => ({
          ...prev,
          [randomReaction.id]: (prev[randomReaction.id] || 0) + 1,
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleReaction = (reactionId) => {
    const currentCount = reactions[reactionId] || 0;
    const hasReacted = userReactions[reactionId];

    if (hasReacted) {
      // Remove reaction
      setReactions((prev) => ({
        ...prev,
        [reactionId]: Math.max(0, (prev[reactionId] || 0) - 1),
      }));
      setUserReactions((prev) => {
        const next = { ...prev };
        delete next[reactionId];
        return next;
      });
    } else {
      // Add reaction
      setReactions((prev) => ({
        ...prev,
        [reactionId]: (prev[reactionId] || 0) + 1,
      }));
      setUserReactions((prev) => ({
        ...prev,
        [reactionId]: true,
      }));

      // Add to recent reactions
      const reactionType = REACTION_TYPES.find((r) => r.id === reactionId);
      if (reactionType) {
        setRecentReactions((prev) => [
          {
            id: Date.now(),
            type: reactionId,
            timestamp: Date.now(),
            user: 'You',
          },
          ...prev,
        ].slice(0, 10));
      }
    }
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="flash" size={18} color={appTheme.colors.interactive || '#DC143C'} />
        <Text style={[styles.title, { color: appTheme.colors.textDark }]}>Live Reactions</Text>
        {totalReactions > 0 && (
          <View style={[styles.badge, { backgroundColor: appTheme.colors.interactive || '#DC143C' }]}>
            <Text style={styles.badgeText}>{totalReactions}</Text>
          </View>
        )}
      </View>

      {/* Reaction Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reactionsContainer}
      >
        {REACTION_TYPES.map((reaction) => {
          const count = reactions[reaction.id] || 0;
          const isActive = userReactions[reaction.id];

          return (
            <TouchableOpacity
              key={reaction.id}
              style={[
                styles.reactionButton,
                isActive && [styles.reactionButtonActive, { borderColor: reaction.color }],
              ]}
              onPress={() => handleReaction(reaction.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={reaction.icon}
                size={20}
                color={isActive ? reaction.color : appTheme.colors.textSecondary}
              />
              {count > 0 && (
                <Text style={[styles.reactionCount, { color: isActive ? reaction.color : appTheme.colors.textSecondary }]}>
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Recent Reactions Feed */}
      {recentReactions.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={[styles.recentTitle, { color: appTheme.colors.textSecondary }]}>Recent Activity</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScroll}
          >
            {recentReactions.slice(0, 5).map((reaction) => {
              const reactionType = REACTION_TYPES.find((r) => r.id === reaction.type);
              return (
                <View key={reaction.id} style={styles.recentItem}>
                  <Ionicons
                    name={reactionType?.icon || 'ellipse'}
                    size={14}
                    color={reactionType?.color || appTheme.colors.textSecondary}
                  />
                  <Text style={[styles.recentText, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>
                    {reaction.user} reacted
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...theme.typography.tiny,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  reactionsContainer: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundPrimary,
    minWidth: 60,
    justifyContent: 'center',
  },
  reactionButtonActive: {
    backgroundColor: theme.colors.backgroundPrimary,
  },
  reactionCount: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  recentContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  recentTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    fontSize: 11,
  },
  recentScroll: {
    gap: theme.spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  recentText: {
    ...theme.typography.caption,
    fontSize: 10,
  },
});

export default LiveReactions;










