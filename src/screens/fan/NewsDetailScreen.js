import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useData } from '../../context/DataContext.js';
import MediaGallery from '../../components/common/MediaGallery.js';
import VideoHighlights from '../../components/common/VideoHighlights.js';
import { shareNews } from '../../utils/share.js';
import theme from '../../theme/colors.js';
import { getNewsImage } from '../../constants/media.js';
import { placeholderImages } from '../../assets/placeholders.js';
import { onlineImages } from '../../assets/onlineImages.js';

const mockComments = [
  { id: '1', author: 'Fan #1', body: 'Great performance from the Namibia national team!' },
  { id: '2', author: 'Analyst', body: 'Looking forward to the next fixtures.' }
];

const NewsDetailScreen = ({ route, navigation }) => {
  const { announcements } = useData();
  const [comments, setComments] = useState(mockComments);
  const [input, setInput] = useState('');
  const { newsId } = route.params || {};
  const article = announcements?.find((item) => item.id === newsId) || announcements?.[0];

  const handleSubmit = () => {
    if (!input?.trim()) return;
    setComments((prev) => [...prev, { id: Date.now().toString(), author: 'You', body: input.trim() }]);
    setInput('');
  };

  const handleShare = async () => {
    if (article) {
      await shareNews(article);
    }
  };

  const galleryImages = useMemo(() => {
    return onlineImages.matchBanners.map(url => ({ uri: url }));
  }, []);

  const videos = useMemo(() => {
    return [
      {
        title: 'Match Highlights',
        thumbnail: { uri: onlineImages.matchBanners[0] },
        url: null, // Video URL will be provided when available
        duration: '5:23',
        date: '2 days ago',
        views: '1.2K'
      },
      {
        title: 'Player Interview',
        thumbnail: { uri: onlineImages.matchBanners[1] },
        url: 'https://example.com/video2',
        duration: '3:45',
        date: '5 days ago',
        views: '890'
      }
    ];
  }, []);

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Image
          source={article?.media_url || getNewsImage(0)}
          style={styles.heroImage}
          contentFit="cover"
          cachePolicy="disk"
        />
        <View style={styles.heroOverlay} />
        <Text style={styles.heroTitle}>{article?.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.bodyContainer}>
        <Text style={styles.metaText}>{article?.published_at || 'Today'}</Text>
        <Text style={styles.articleText}>
          {article?.body || article?.content ||
            (article?.title
              ? `${article.title}. This is a comprehensive news article covering the latest developments in Namibian football. The article provides detailed information, analysis, and insights about the topic. Full article content will be available when the backend provides complete article bodies.`
              : 'Article content is being loaded. Please check back shortly for the full story.')}
        </Text>

        {galleryImages.length > 0 && (
          <MediaGallery images={galleryImages} title="Photo Gallery" />
        )}

        {videos.length > 0 && (
          <VideoHighlights videos={videos} title="Video Highlights" />
        )}

        <View style={styles.commentsCard}>
          <Text style={styles.commentsHeading}>Comments</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <View>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentBody}>{comment.body}</Text>
              </View>
            </View>
          ))}
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Add your comment..."
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs
  },
  shareButton: {
    padding: theme.spacing.xs
  },
  backText: {
    color: theme.colors.textPrimary,
    ...theme.typography.bodySmall,
    fontWeight: '600'
  },
  heroCard: {
    height: 260,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  heroTitle: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    ...theme.typography.h3,
    color: theme.colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  bodyContainer: {
    gap: theme.spacing.lg
  },
  metaText: {
    color: theme.colors.muted,
    ...theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600'
  },
  articleText: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
    lineHeight: 26
  },
  commentsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadows.md
  },
  commentsHeading: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary
  },
  commentRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  commentAuthor: {
    fontWeight: '700',
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs / 2
  },
  commentBody: {
    color: theme.colors.textSecondary,
    ...theme.typography.bodySmall
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.sm
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm
  },
  submitText: {
    color: theme.colors.white,
    ...theme.typography.bodySmall,
    fontWeight: '700'
  }
});

export default NewsDetailScreen;

