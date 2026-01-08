import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { fetchComments, moderateComment, deleteComment } from '../../api/client.js';

const CommentModerationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'

  useFocusEffect(
    useCallback(() => {
      loadComments();
    }, [filter])
  );

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetchComments(null, filter === 'all' ? null : filter);
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      showError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (comment, status) => {
    try {
      await moderateComment(comment.id, status);
      showSuccess(`Comment ${status === 'approved' ? 'approved' : 'rejected'}`);
      loadComments();
      triggerRefresh('news');
    } catch (error) {
      showError('Failed to moderate comment');
    }
  };

  const handleDelete = (comment) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(comment.id);
              showSuccess('Comment deleted');
              loadComments();
            } catch (error) {
              showError('Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'flagged': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.commentHeader}>
        <View style={styles.commentInfo}>
          <Text style={[styles.commentAuthor, { color: theme.colors.textDark }]}>
            {item.user_name || 'Anonymous'}
          </Text>
          <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase() || 'PENDING'}</Text>
        </View>
      </View>
      <Text style={[styles.commentContent, { color: theme.colors.textDark }]}>
        {item.content}
      </Text>
      {item.news_title && (
        <Text style={[styles.newsTitle, { color: theme.colors.textSecondary }]}>
          On: {item.news_title}
        </Text>
      )}
      {item.status === 'pending' && (
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton, { backgroundColor: '#10B981' + '20' }]}
            onPress={() => handleModerate(item, 'approved')}
          >
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton, { backgroundColor: '#EF4444' + '20' }]}
            onPress={() => handleModerate(item, 'rejected')}
          >
            <Ionicons name="close-circle" size={18} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#6B7280' + '20' }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#6B7280" />
            <Text style={[styles.actionText, { color: '#6B7280' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Comment Moderation
          </Text>
        </View>

        <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'pending', 'approved', 'rejected', 'flagged'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && { backgroundColor: theme.colors.primary },
                  { borderColor: theme.colors.border }
                ]}
                onPress={() => setFilter(f)}
              >
                <Text style={[
                  styles.filterText,
                  { color: filter === f ? '#FFFFFF' : theme.colors.textDark }
                ]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon="chatbubbles-outline"
              title={`No ${filter === 'all' ? '' : filter} comments`}
              message={filter === 'pending' ? 'All comments are moderated' : 'No comments found'}
            />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => `comment-${item.id}`}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadComments}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  header: {
    padding: baseTheme.spacing.md,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  filterContainer: {
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    marginHorizontal: baseTheme.spacing.xs,
  },
  filterText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  list: {
    padding: baseTheme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.sm,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  commentDate: {
    ...baseTheme.typography.caption,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
  },
  statusText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
  },
  commentContent: {
    ...baseTheme.typography.body,
    marginBottom: baseTheme.spacing.sm,
    lineHeight: 20,
  },
  newsTitle: {
    ...baseTheme.typography.caption,
    fontSize: 11,
    marginBottom: baseTheme.spacing.sm,
    fontStyle: 'italic',
  },
  commentActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.sm,
    paddingTop: baseTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: baseTheme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  actionText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
});

export default CommentModerationScreen;

