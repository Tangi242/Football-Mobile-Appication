import { useMemo, useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NewsArticleCard from '../../components/news/NewsArticleCard.js';
import EmptyState from '../../components/ui/EmptyState.js';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.js';
// Removed DataContext dependency - all data comes from API
import { useAuth } from '../../context/AuthContext.js';
import { fetchNews, deleteNews } from '../../api/client.js';
import { useToast } from '../../hooks/useToast.js';
import theme from '../../theme/colors.js';
import { useRefresh } from '../../context/RefreshContext.js';

const NewsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const insets = useSafeAreaInsets();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshKeys } = useRefresh();

  // Load news from API
  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchNews();
      const newsData = response.data?.announcements || [];
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
      showError('Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Refresh when admin makes changes to news
  useEffect(() => {
    if (refreshKeys.news > 0) {
      loadNews();
    }
  }, [refreshKeys.news, loadNews]);

  // Refresh news when screen comes into focus (e.g., after editing)
  useFocusEffect(
    useCallback(() => {
      loadNews();
    }, [loadNews])
  );

  // Refresh news
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNews();
  }, [loadNews]);

  // Delete news
  const handleDelete = useCallback((newsItem) => {
    Alert.alert(
      'Delete News',
      `Are you sure you want to delete "${newsItem.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNews(newsItem.id);
              showSuccess('News deleted successfully');
              loadNews(); // Reload news after deletion
            } catch (error) {
              showError(error.userMessage || 'Failed to delete news');
            }
          }
        }
      ]
    );
  }, [loadNews, showSuccess, showError]);

  // Edit news
  const handleEdit = useCallback((newsItem) => {
    const category = newsItem.category === 'transfer' ? 'transfer' : 'announcement';
    navigation.navigate('NewsManagement', { 
      category,
      editNews: newsItem 
    });
  }, [navigation]);

  // Show all news without filtering
  const allNews = useMemo(() => {
    return news || [];
  }, [news]);

  const isAdmin = user?.role === 'admin';

  return (
    <View style={styles.fullScreen}>
      {/* Admin Add Button */}
      {isAdmin && (
        <View style={styles.adminHeader}>
          <TouchableOpacity
            style={styles.addNewsButton}
            onPress={() => setShowPublishModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Publish News"
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading && allNews.length === 0 ? (
        <View style={styles.skeletonContainer}>
          <LoadingSkeleton type="news" count={6} />
        </View>
      ) : (
        <FlatList
          data={allNews}
          numColumns={2}
          keyExtractor={(item, index) => `${item.id || index}-${index}`}
          renderItem={({ item, index }) => (
            <View style={styles.gridItem}>
              <NewsArticleCard
                article={item}
                fallbackIndex={index}
                showTrending={false}
                isGrid={true}
                onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
              />
              {isAdmin && (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={16} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={16} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListHeaderComponent={null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="newspaper"
                messageType="news"
                illustrationTone="brand"
              />
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.emptyAddButton, { backgroundColor: theme.colors.interactive || theme.colors.secondary }]}
                  onPress={() => setShowPublishModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color={theme.colors.white} />
                  <Text style={[styles.emptyAddButtonText, { color: theme.colors.white }]}>Publish News</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={allNews?.length ? styles.gridList : styles.emptyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Publish News Modal */}
      <Modal
        visible={showPublishModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>Publish News</Text>
              <TouchableOpacity onPress={() => setShowPublishModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}
                onPress={() => {
                  setShowPublishModal(false);
                  navigation.navigate('NewsManagement', { category: 'announcement' });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="newspaper-outline" size={24} color={theme.colors.interactive || theme.colors.secondary} />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textDark }]}>Publish Headline News</Text>
                  <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Create general news articles</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}
                onPress={() => {
                  setShowPublishModal(false);
                  navigation.navigate('NewsManagement', { category: 'transfer' });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-horizontal-outline" size={24} color={theme.colors.interactive || theme.colors.secondary} />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textDark }]}>Publish Transfer News</Text>
                  <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Create transfer-related news</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm
  },
  appName: {
    fontSize: 30, // Increased from 24 - larger for better hierarchy
    fontWeight: '900', // Increased from 800 - bolder
    color: theme.colors.primary,
    letterSpacing: 0.3
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addNewsButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.interactive || theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    ...theme.shadows.md
  },
  emptyAddButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  gridList: {
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md
  },
  gridItem: {
    flex: 1,
    margin: theme.spacing.xs / 2,
    maxWidth: '48%'
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  sectionAddButton: {
    padding: theme.spacing.xs,
    marginLeft: 'auto'
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    fontWeight: '700',
    fontSize: 14
  },
  viewAllLink: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  viewAllText: {
    ...theme.typography.bodySmall,
    // Red for interactive links (Brave Warriors brand)
    color: theme.colors.interactive || theme.colors.secondary,
    fontWeight: '700',
    fontSize: 12
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md
  },
  emptyContainer: {
    paddingVertical: theme.spacing.md
  },
  skeletonContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md
  },
  quickAccessSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows.md
  },
  quickAccessText: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  quickAccessSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  quickAccessSmallText: {
    ...theme.typography.bodySmall,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontWeight: '700',
  },
  modalOptions: {
    gap: theme.spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    gap: theme.spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  optionSubtitle: {
    ...theme.typography.bodySmall,
    fontSize: 12,
  },
  adminActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    marginTop: -theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  editButton: {
    backgroundColor: theme.colors.interactive || theme.colors.secondary,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default NewsScreen;

