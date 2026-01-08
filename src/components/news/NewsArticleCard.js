import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import theme from '../../theme/colors.js';
import { getNewsImage } from '../../constants/media.js';

const NewsArticleCard = ({ article, fallbackIndex = 0, showTrending = false, onPress, delay = 0, isGrid = false }) => {
  if (!article) return null;

  const imageSource = article.media_url || getNewsImage(fallbackIndex);
  const commentCount = article.comment_count || Math.floor(Math.random() * 50); // Mock comment count
  const { scale, handlePressIn, handlePressOut } = usePressAnimation(0.98);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale },
        ],
      }}
    >
      <TouchableOpacity 
        style={[styles.card, isGrid && styles.cardGrid]} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${article.title}`}
        accessibilityHint="Double tap to read the full article"
      >
      {imageSource && (
        <Image
          source={imageSource}
          style={[styles.image, isGrid && styles.imageGrid]}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
          accessibilityLabel={article.title || 'News article image'}
          accessibilityRole="image"
        />
      )}
      <View style={[styles.content, isGrid && styles.contentGrid]}>
        <Text style={[styles.title, isGrid && styles.titleGrid]} numberOfLines={isGrid ? 3 : 2}>
          {article.title}
        </Text>
        <View style={[styles.footer, isGrid && styles.footerGrid]}>
          <View style={styles.commentBadge}>
            <Ionicons name="chatbubble-outline" size={14} color={theme.colors.interactive || theme.colors.error || '#DC143C'} />
            <Text 
              style={[styles.commentCount, { color: theme.colors.interactive || theme.colors.error || '#DC143C' }]}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.5}
              minimumFontSize={10}
              accessibilityLabel={`${commentCount} comments`}
            >
              {commentCount}
            </Text>
          </View>
        </View>
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    gap: theme.spacing.md,
    minHeight: theme.touchTarget.minHeight,
    // Enhanced visual feedback on press
    transform: [{ scale: 1 }],
  },
  cardGrid: {
    flexDirection: 'column',
    padding: theme.spacing.sm,
    marginBottom: 0,
    width: '100%',
    minHeight: 0,
  },
  image: {
    width: 80, // Reduced from 100 for better fit
    height: 80, // Reduced from 100 for better fit
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundPrimary
  },
  imageGrid: {
    width: '100%',
    height: 120,
    marginBottom: theme.spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0
  },
  contentGrid: {
    flex: 0,
    justifyContent: 'space-between',
    minHeight: 0,
  },
  title: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
    flex: 1
  },
  titleGrid: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
    flex: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.xs
  },
  footerGrid: {
    justifyContent: 'flex-start',
    marginTop: theme.spacing.xs / 2,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2
  },
  commentCount: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700'
  }
});

export default NewsArticleCard;

