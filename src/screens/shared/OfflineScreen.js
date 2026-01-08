import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext.js';
import { useData } from '../../context/DataContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { t } from '../../i18n/locales.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import MatchListCard from '../../components/match/MatchListCard.js';
import AnnouncementCard from '../../components/news/AnnouncementCard.js';
import EmptyState from '../../components/ui/EmptyState.js';
import theme from '../../theme/colors.js';

const OfflineScreen = ({ navigation }) => {
  const { savedFixtures, savedContent } = useAuth();
  const { fixtures, results, announcements } = useData();
  const { language } = useLanguage();

  const savedMatches = savedFixtures.map(savedFixture => {
    const allMatches = [...(fixtures || []), ...(results || [])];
    return allMatches.find(m => m.id === savedFixture.id || m.match_id === savedFixture.id);
  }).filter(Boolean);

  const savedArticles = savedContent.map(savedContentItem => {
    return announcements?.find(a => a.id === savedContentItem.id);
  }).filter(Boolean);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <Ionicons name="cloud-download-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Offline Content</Text>
      </View>
      <Text style={styles.subtitle}>View your saved fixtures and content offline</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {savedMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Fixtures ({savedMatches.length})</Text>
            {savedMatches.map((match, index) => (
              <TouchableOpacity
                key={match.id || index}
                onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                activeOpacity={0.7}
              >
                <MatchListCard match={match} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {savedArticles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Articles ({savedArticles.length})</Text>
            {savedArticles.map((article, index) => (
              <TouchableOpacity
                key={article.id || index}
                onPress={() => navigation.navigate('NewsDetail', { newsId: article.id })}
                activeOpacity={0.7}
              >
                <AnnouncementCard announcement={article} fallbackIndex={index} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {savedMatches.length === 0 && savedArticles.length === 0 && (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="cloud-download"
              title="No offline content"
              subtitle="Save fixtures and articles to view them offline"
            />
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textDark
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg
  },
  content: {
    paddingBottom: theme.spacing.lg
  },
  section: {
    marginBottom: theme.spacing.md
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg
  }
});

export default OfflineScreen;

