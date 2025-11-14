import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  Animated,
  useWindowDimensions,
  TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';
import AnnouncementCard from '../components/AnnouncementCard.js';
import EmptyState from '../components/EmptyState.js';
import { useData } from '../context/DataContext.js';
import ScreenWrapper from '../components/ScreenWrapper.js';
import theme from '../theme/colors.js';
import { nfaImages } from '../constants/media.js';
import SegmentedControl from '../components/SegmentedControl.js';
import { placeholderImages } from '../assets/placeholders.js';

const NewsScreen = ({ navigation }) => {
  const { announcements, refresh, loading } = useData();
  const newsTabs = ['Headlines', 'Transfers'];
  const heroImages = placeholderImages.matchBanners?.length ? placeholderImages.matchBanners : [nfaImages.hero];
  const heroPagerRef = useRef(null);
  const [activeNewsTab, setActiveNewsTab] = useState(newsTabs[0]);
  const [heroIndex, setHeroIndex] = useState(0);
  const pagerRef = useRef(null);
  const { width } = useWindowDimensions();

  const { headlines, transfers } = useMemo(() => {
    const transferKeyword = /transfer|sign|loan/i;
    return announcements.reduce(
      (acc, article) => {
        if (transferKeyword.test(article.title || '') || transferKeyword.test(article.summary || '')) {
          acc.transfers.push(article);
        } else {
          acc.headlines.push(article);
        }
        return acc;
      },
      { headlines: [], transfers: [] }
    );
  }, [announcements]);

  useEffect(() => {
    const index = newsTabs.indexOf(activeNewsTab);
    if (index >= 0) {
      pagerRef.current?.scrollTo({ x: index * width, animated: true });
    }
  }, [activeNewsTab, width, newsTabs]);

  const handleMomentumEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newsTabs[index] && newsTabs[index] !== activeNewsTab) {
      setActiveNewsTab(newsTabs[index]);
    }
  };

  const handleHeroMomentumEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== heroIndex) {
      setHeroIndex(index);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % heroImages.length;
        heroPagerRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length, width]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.flex}>
        <View style={styles.heroCard}>
          <Animated.ScrollView
            ref={heroPagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleHeroMomentumEnd}
          >
            {heroImages.map((image, index) => (
              <Image
                key={`hero-${index}`}
                source={image}
                style={[styles.heroImage, { width }]}
                contentFit="cover"
                cachePolicy="disk"
              />
            ))}
          </Animated.ScrollView>
          <View style={styles.heroOverlay} />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Brave Warriors Pulse</Text>
          </View>
          <View style={styles.heroDots}>
            {heroImages.map((_, idx) => (
              <View key={`dot-${idx}`} style={[styles.heroDot, idx === heroIndex && styles.heroDotActive]} />
            ))}
          </View>
        </View>
        <SegmentedControl options={newsTabs} value={activeNewsTab} onChange={setActiveNewsTab} />
        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          style={styles.pager}
        >
          {[headlines, transfers].map((collection, pageIndex) => (
            <View key={newsTabs[pageIndex]} style={[styles.page, { width }]}>
              <FlatList
                data={collection}
                keyExtractor={(item, index) => `${newsTabs[pageIndex]}-${item.id}-${index}`}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}>
                    <AnnouncementCard announcement={item} fallbackIndex={index} />
                  </TouchableOpacity>
                )}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}>
                    <AnnouncementCard announcement={item} fallbackIndex={index} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <EmptyState
                    icon="megaphone"
                    title={`No ${newsTabs[pageIndex].toLowerCase()}`}
                    subtitle="Updates will land soon."
                  />
                }
                refreshControl={pageIndex === 0 ? <RefreshControl refreshing={loading} onRefresh={refresh} /> : undefined}
                nestedScrollEnabled
                contentContainerStyle={collection?.length ? styles.list : styles.emptyList}
              />
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 20
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  flex: {
    flex: 1,
    width: '100%'
  },
  heroCard: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)'
  },
  heroBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(3,12,32,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999
  },
  heroBadgeText: {
    color: theme.colors.highlight,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  heroDots: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    gap: 6
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  heroDotActive: {
    backgroundColor: theme.colors.highlight,
    width: 20
  },
  pager: {
    flex: 1,
    marginTop: 16
  },
  page: {
    paddingBottom: 20
  }
});

export default NewsScreen;

