import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper.js';
import { useData } from '../context/DataContext.js';
import theme from '../theme/colors.js';
import { getNewsImage } from '../constants/media.js';

const mockComments = [
  { id: '1', author: 'Fan #1', body: 'Great performance from the Brave Warriors!' },
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

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

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
          {article?.body ||
            'Detailed article content goes here. Replace with real story once the backend delivers full post bodies.'}
        </Text>

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
    gap: 16,
    paddingBottom: 40
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  backText: {
    color: theme.colors.textPrimary,
    fontWeight: '600'
  },
  heroCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)'
  },
  heroTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary
  },
  bodyContainer: {
    gap: 16
  },
  metaText: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  articleText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 26
  },
  commentsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12
  },
  commentsHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary
  },
  commentRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  commentAuthor: {
    fontWeight: '700',
    color: theme.colors.highlight
  },
  commentBody: {
    color: theme.colors.textSecondary
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2f5c',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.textPrimary
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  submitText: {
    color: theme.colors.textPrimary,
    fontWeight: '700'
  }
});

export default NewsDetailScreen;

