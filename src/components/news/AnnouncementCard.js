import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getNewsImage } from '../../constants/media.js';

const AnnouncementCard = ({ announcement, fallbackIndex = 0 }) => {
  const { width } = useWindowDimensions();
  const imageHeight = width < 400 ? 140 : 180;

  if (!announcement) return null;
  const published = announcement.published_at
    ? dayjs(announcement.published_at).fromNow()
    : dayjs().format('MMM D, HH:mm');

  const imageSource = announcement.media_url || getNewsImage(fallbackIndex);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{announcement.title}</Text>
        {announcement.priority === 'high' && <Text style={styles.badge}>High</Text>}
      </View>
      <Text style={styles.body} numberOfLines={3}>
        {announcement.body || announcement.summary || 'No description available.'}
      </Text>
      {imageSource ? (
        <Image
          source={imageSource}
          style={[styles.image, { height: imageHeight }]}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
      ) : null}
      <Text style={styles.meta}>{published}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    flex: 1,
    marginRight: theme.spacing.sm,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: '700'
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.backgroundPrimary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden'
  },
  body: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 17,
    marginBottom: theme.spacing.md,
    fontSize: 12
  },
  image: {
    width: '100%',
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.backgroundPrimary
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 10
  }
});

export default AnnouncementCard;

