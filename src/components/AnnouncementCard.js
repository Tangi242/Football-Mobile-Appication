import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import dayjs from '../lib/dayjs.js';
import theme from '../theme/colors.js';
import { getNewsImage } from '../constants/media.js';

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
        {announcement.body}
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textDark,
    flex: 1,
    marginRight: 12
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary
  },
  body: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginBottom: 8
  },
  image: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 8
  },
  meta: {
    fontSize: 12,
    color: theme.colors.muted
  }
});

export default AnnouncementCard;

