import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import theme from '../../theme/colors.js';

const SkeletonCard = ({ width = '100%', height = 100, style }) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity: fadeAnim,
          ...style
        }
      ]}
    />
  );
};

const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  if (type === 'card') {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.cardWrapper}>
            <SkeletonCard height={180} style={styles.card} />
            <View style={styles.content}>
              <SkeletonCard width="70%" height={20} style={styles.title} />
              <SkeletonCard width="100%" height={16} style={styles.text} />
              <SkeletonCard width="80%" height={16} style={styles.text} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'match') {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.matchCard}>
            <SkeletonCard width="40%" height={14} style={styles.matchHeader} />
            <SkeletonCard width="60%" height={12} style={styles.matchMeta} />
            <View style={styles.matchTeams}>
              <SkeletonCard width="35%" height={20} />
              <SkeletonCard width="20%" height={24} />
              <SkeletonCard width="35%" height={20} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'news') {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.newsCard}>
            <View style={styles.newsImageContainer}>
              <SkeletonCard width={100} height={100} style={styles.newsImage} />
            </View>
            <View style={styles.newsContent}>
              <SkeletonCard width="85%" height={18} style={styles.newsTitle} />
              <SkeletonCard width="60%" height={14} style={styles.newsMeta} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'product') {
    return (
      <View style={styles.productGrid}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.productCard}>
            <SkeletonCard width="100%" height={160} style={styles.productImage} />
            <View style={styles.productInfo}>
              <SkeletonCard width="80%" height={16} style={styles.productName} />
              <SkeletonCard width="50%" height={14} style={styles.productCategory} />
              <View style={styles.productFooter}>
                <SkeletonCard width="40%" height={18} style={styles.productPrice} />
                <SkeletonCard width="30%" height={14} style={styles.productRating} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'list') {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.listItem}>
            <SkeletonCard width={48} height={48} style={styles.listAvatar} />
            <View style={styles.listContent}>
              <SkeletonCard width="70%" height={16} style={styles.listTitle} />
              <SkeletonCard width="50%" height={14} style={styles.listSubtitle} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.lg
  },
  cardWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md
  },
  card: {
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.border
  },
  content: {
    gap: theme.spacing.sm
  },
  title: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xs
  },
  text: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  matchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    gap: theme.spacing.sm
  },
  matchHeader: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  matchMeta: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xs
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    gap: theme.spacing.lg
  },
  newsImageContainer: {
    width: 100,
    height: 100
  },
  newsImage: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  newsContent: {
    flex: 1,
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  newsTitle: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  newsMeta: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  productCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.sm
  },
  productImage: {
    borderRadius: 0,
    backgroundColor: theme.colors.border
  },
  productInfo: {
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  productName: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xs / 2
  },
  productCategory: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xs
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs
  },
  productPrice: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  productRating: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    alignItems: 'center',
    gap: theme.spacing.md
  },
  listAvatar: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border
  },
  listContent: {
    flex: 1,
    gap: theme.spacing.xs
  },
  listTitle: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  },
  listSubtitle: {
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border
  }
});

export default LoadingSkeleton;


