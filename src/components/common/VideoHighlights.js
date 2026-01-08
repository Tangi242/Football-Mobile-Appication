import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const VideoCard = ({ video, onPress }) => {
  const handlePress = () => {
    if (video.url) {
      Linking.openURL(video.url);
    } else if (onPress) {
      onPress(video);
    }
  };

  return (
    <TouchableOpacity style={styles.videoCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={video.thumbnail || { uri: 'https://via.placeholder.com/300x200' }}
          style={styles.thumbnail}
          contentFit="cover"
        />
        <View style={styles.playButton}>
          <Ionicons name="play" size={24} color={theme.colors.white} />
        </View>
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <View style={styles.videoMeta}>
          <Ionicons name="time-outline" size={12} color={theme.colors.muted} />
          <Text style={styles.videoDate}>{video.date || 'Recent'}</Text>
          {video.views && (
            <>
              <Ionicons name="eye-outline" size={12} color={theme.colors.muted} style={styles.metaIcon} />
              <Text style={styles.videoViews}>{video.views} views</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const VideoHighlights = ({ videos = [], title = 'Video Highlights' }) => {
  if (!videos || videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="videocam-outline" size={32} color={theme.colors.muted} />
        <Text style={styles.emptyText}>No videos available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoList}
      >
        {videos.map((video, index) => (
          <VideoCard key={index} video={video} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  videoList: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg
  },
  videoCard: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  thumbnailContainer: {
    width: '100%',
    height: 160,
    position: 'relative'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  playButton: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  durationBadge: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm
  },
  durationText: {
    ...theme.typography.tiny,
    color: theme.colors.white,
    fontWeight: '600'
  },
  videoInfo: {
    padding: theme.spacing.md
  },
  videoTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  videoDate: {
    ...theme.typography.caption,
    color: theme.colors.muted
  },
  metaIcon: {
    marginLeft: theme.spacing.xs
  },
  videoViews: {
    ...theme.typography.caption,
    color: theme.colors.muted
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm
  }
});

export default VideoHighlights;


