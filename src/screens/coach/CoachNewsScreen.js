import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import { getCoachTeam, getCoachNews, createCoachNews } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const CoachNewsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [team, setTeam] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image_path: '',
    category: 'announcement'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const teamRes = await getCoachTeam(user?.id);
      if (teamRes.data?.team) {
        setTeam(teamRes.data.team);
        const newsRes = await getCoachNews(user?.id);
        setNews(newsRes.data?.announcements || []);
      } else {
        showError('No team assigned to your coach account');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        const fileName = `news_${Date.now()}.${asset.uri.split('.').pop()}`;
        const imagePath = `/images/news/${fileName}`;
        setFormData({ ...formData, image_path: imagePath });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Failed to pick image');
    }
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      image_path: '',
      category: 'announcement'
    });
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      showError('Content is required');
      return;
    }

    try {
      setSaving(true);
      const newsData = {
        ...formData,
        // Ensure team name is included in the news
        title: team ? `${team.name}: ${formData.title}` : formData.title,
        content: team ? `${formData.content}\n\n- ${team.name} Coach` : formData.content,
        published_at: new Date().toISOString()
      };
      await createCoachNews(user?.id, newsData);
      showSuccess('News published successfully');
      setModalVisible(false);
      loadData();
      triggerRefresh('news');
    } catch (error) {
      showError(error.userMessage || 'Failed to publish news');
    } finally {
      setSaving(false);
    }
  };

  const renderNewsItem = ({ item }) => (
    <View style={[styles.newsItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.newsInfo}>
        <Text style={[styles.newsTitle, { color: theme.colors.textDark }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.newsDate, { color: theme.colors.textSecondary }]}>
          {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Draft'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!team) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="newspaper-outline"
          title="No Team Assigned"
          message="You don't have a team assigned to your coach account. Please contact an administrator."
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Team News</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Post news about {team.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {news.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="No News Articles"
            message="You haven't published any news articles yet. Tap the + button to create your first article."
          />
        ) : (
          <FlatList
            data={news}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadData}
          />
        )}

        {/* Add News Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>Publish Team News</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.textDark} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Title *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.title}
                      onChangeText={(text) => setFormData({ ...formData, title: text })}
                      placeholder="Enter news title"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Summary</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.summary}
                      onChangeText={(text) => setFormData({ ...formData, summary: text })}
                      placeholder="Enter news summary"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Content *</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                      value={formData.content}
                      onChangeText={(text) => setFormData({ ...formData, content: text })}
                      placeholder="Enter news content"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      numberOfLines={6}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>News Image</Text>
                    <View style={styles.uploadContainer}>
                      {selectedImage ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => {
                              setSelectedImage(null);
                              setFormData({ ...formData, image_path: '' });
                            }}
                          >
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.uploadButton, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}
                          onPress={pickImage}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="image-outline" size={24} color={theme.colors.interactive || theme.colors.secondary} />
                          <Text style={[styles.uploadButtonText, { color: theme.colors.textDark }]}>Upload Image</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <LoadingButton
                    title="Publish News"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: baseTheme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: baseTheme.spacing.lg,
  },
  headerTitle: {
    ...baseTheme.typography.h2,
    fontWeight: '800',
    marginBottom: baseTheme.spacing.xs,
  },
  headerSubtitle: {
    ...baseTheme.typography.bodySmall,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...baseTheme.shadows.md,
  },
  list: {
    paddingBottom: baseTheme.spacing.lg,
  },
  newsItem: {
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  newsDate: {
    ...baseTheme.typography.caption,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: baseTheme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.lg,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '800',
  },
  form: {
    gap: baseTheme.spacing.md,
  },
  inputGroup: {
    marginBottom: baseTheme.spacing.md,
  },
  label: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  input: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  textArea: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadContainer: {
    marginTop: baseTheme.spacing.xs,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    gap: baseTheme.spacing.sm,
  },
  uploadButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: baseTheme.borderRadius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: baseTheme.spacing.xs,
    right: baseTheme.spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
  },
});

export default CoachNewsScreen;

