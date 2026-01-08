import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchNews, createNews, updateNews, deleteNews, uploadFile } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const NewsManagementScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [saving, setSaving] = useState(false);
  const [includePoll, setIncludePoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  const initialCategory = route?.params?.category || 'announcement';
  const editNewsParam = route?.params?.editNews;
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    image_path: '',
    media_url: '',
    category: initialCategory,
    priority: 'normal',
    published_at: new Date().toISOString().split('T')[0],
    tags: '',
    featured: false
  });

  const [pollData, setPollData] = useState({
    question: '',
    description: '',
    end_date: '',
    allow_multiple_votes: false
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // If editNews is passed, open edit modal
    if (editNewsParam) {
      handleEdit(editNewsParam);
    } else if (initialCategory && initialCategory !== 'announcement') {
      // If category is passed, open modal immediately
      handleAdd();
    }
  }, [editNewsParam, initialCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchNews();
      setNews(response.data?.announcements || []);
    } catch (error) {
      console.error('Error loading news:', error);
      showError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingNews(null);
    setIncludePoll(false);
    setPollOptions(['', '']);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      image_path: '',
      media_url: '',
      category: initialCategory,
      priority: 'normal',
      published_at: new Date().toISOString().split('T')[0],
      tags: '',
      featured: false
    });
    setPollData({
      question: '',
      description: '',
      end_date: '',
      allow_multiple_votes: false
    });
    setModalVisible(true);
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setSelectedImage(newsItem.image_path || newsItem.media_url || null);
    setSelectedVideo(newsItem.media_url || null);
    setFormData({
      title: newsItem.title || '',
      slug: newsItem.slug || '',
      summary: newsItem.summary || newsItem.body || '',
      content: newsItem.content || '',
      image_path: newsItem.image_path || newsItem.media_url || '',
      media_url: newsItem.media_url || '',
      category: newsItem.category || 'announcement',
      priority: newsItem.priority || 'normal',
      published_at: newsItem.published_at ? newsItem.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
      tags: newsItem.tags || '',
      featured: newsItem.featured || false
    });
    setModalVisible(true);
  };

  const handleDelete = (newsItem) => {
    Alert.alert(
      'Delete News',
      `Are you sure you want to delete "${newsItem.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNews(newsItem.id);
              showSuccess('News deleted successfully');
              loadData();
              // Trigger global refresh so changes appear across the app
              triggerRefresh('news');
            } catch (error) {
              showError(error.userMessage || 'Failed to delete news');
            }
          }
        }
      ]
    );
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Permission to access media library is required');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        setUploading(true);
        
        try {
          // Upload the image
          const uploadResult = await uploadFile(asset.uri, 'news', `news_${Date.now()}.jpg`);
          if (uploadResult.success && uploadResult.file) {
            setFormData({ ...formData, image_path: uploadResult.file.path });
            showSuccess('Image uploaded successfully');
          } else {
            showError('Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          showError(uploadError.userMessage || 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Failed to pick image');
      setUploading(false);
    }
  };

  const pickVideo = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Permission to access media library is required');
        return;
      }

      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedVideo(asset.uri);
        // Generate a path for database storage
        const fileName = `news_video_${Date.now()}.${asset.uri.split('.').pop()}`;
        const videoPath = `/images/news/${fileName}`;
        setFormData({ ...formData, media_url: videoPath });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      showError('Failed to pick video');
    }
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
    if (includePoll) {
      if (!pollData.question.trim()) {
        showError('Poll question is required');
        return;
      }
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        showError('At least 2 poll options are required');
        return;
      }
    }

    try {
      setSaving(true);
      const newsData = {
        ...formData,
        author_id: user?.id || null,
        published_at: formData.published_at ? `${formData.published_at}T00:00:00` : new Date().toISOString(),
        is_poll: includePoll,
        poll: includePoll ? {
          question: pollData.question,
          description: pollData.description,
          end_date: pollData.end_date ? `${pollData.end_date}T23:59:59` : null,
          allow_multiple_votes: pollData.allow_multiple_votes,
          options: pollOptions.filter(opt => opt.trim())
        } : null
      };

      if (editingNews) {
        await updateNews(editingNews.id, newsData);
        showSuccess('News updated successfully');
      } else {
        await createNews(newsData);
        showSuccess('News published successfully');
      }
      setModalVisible(false);
      loadData();
      // Trigger global refresh so changes appear across the app
      triggerRefresh('news');
      // Navigate back if editing from NewsScreen
      if (editNewsParam) {
        navigation.goBack();
      }
    } catch (error) {
      showError(error.userMessage || 'Failed to save news');
    } finally {
      setSaving(false);
    }
  };

  const renderNewsItem = ({ item }) => (
    <View style={[styles.newsItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.newsInfo}>
        <Text style={[styles.newsTitle, { color: theme.colors.textDark }]}>{item.title}</Text>
        {item.summary && (
          <Text style={[styles.newsSummary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.summary || item.body}
          </Text>
        )}
        <View style={styles.newsMeta}>
          <Text style={[styles.newsCategory, { color: theme.colors.textSecondary }]}>
            {item.category || 'announcement'}
          </Text>
          {item.published_at && (
            <Text style={[styles.newsDate, { color: theme.colors.textSecondary }]}>
              {new Date(item.published_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.newsActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.interactive || '#DC143C'} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Manage News</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {news.length === 0 ? (
        <EmptyState
          icon="newspaper-outline"
          title="No news articles found"
          subtitle="Publish your first news article"
          messageType="default"
          illustrationTone="brand"
        />
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadData}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                {editingNews ? 'Edit News' : 'Publish News'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Enter news title"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Summary</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.summary}
                  onChangeText={(text) => setFormData({ ...formData, summary: text })}
                  placeholder="Brief summary of the news"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Content *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  placeholder="Enter full news content"
                  multiline
                  numberOfLines={8}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Category</Text>
                <View style={styles.statusButtons}>
                  {['announcement', 'transfer', 'match', 'general'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.statusButton,
                        formData.category === cat && { backgroundColor: theme.colors.interactive || '#DC143C' }
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        formData.category === cat && { color: '#FFFFFF' }
                      ]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Priority</Text>
                <View style={styles.statusButtons}>
                  {['low', 'normal', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.statusButton,
                        formData.priority === priority && { backgroundColor: theme.colors.interactive || '#DC143C' }
                      ]}
                      onPress={() => setFormData({ ...formData, priority })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        formData.priority === priority && { color: '#FFFFFF' }
                      ]}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                {formData.image_path && (
                  <Text style={[styles.pathText, { color: theme.colors.textSecondary }]}>
                    Path: {formData.image_path}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>News Video</Text>
                <View style={styles.uploadContainer}>
                  {selectedVideo ? (
                    <View style={styles.videoPreviewContainer}>
                      <Ionicons name="videocam" size={32} color={theme.colors.interactive || theme.colors.secondary} />
                      <Text style={[styles.videoPreviewText, { color: theme.colors.textDark }]} numberOfLines={1}>
                        {formData.media_url.split('/').pop()}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          setSelectedVideo(null);
                          setFormData({ ...formData, media_url: '' });
                        }}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.uploadButton, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}
                      onPress={pickVideo}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="videocam-outline" size={24} color={theme.colors.interactive || theme.colors.secondary} />
                      <Text style={[styles.uploadButtonText, { color: theme.colors.textDark }]}>Upload Video</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {formData.media_url && (
                  <Text style={[styles.pathText, { color: theme.colors.textSecondary }]}>
                    Path: {formData.media_url}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Publish Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.published_at}
                  onChangeText={(text) => setFormData({ ...formData, published_at: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Tags (comma-separated)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.tags}
                  onChangeText={(text) => setFormData({ ...formData, tags: text })}
                  placeholder="e.g., football, nfa, match"
                />
              </View>

              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={[styles.checkboxContainer, { borderColor: theme.colors.border }]}
                  onPress={() => setFormData({ ...formData, featured: !formData.featured })}
                >
                  <Ionicons
                    name={formData.featured ? 'checkbox' : 'checkbox-outline'}
                    size={24}
                    color={formData.featured ? (theme.colors.interactive || '#DC143C') : theme.colors.textSecondary}
                  />
                  <Text style={[styles.checkboxLabel, { color: theme.colors.textDark }]}>Featured Article</Text>
                </TouchableOpacity>
              </View>

              {/* Poll Section */}
              <View style={[styles.pollSection, { borderColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={styles.pollToggle}
                  onPress={() => setIncludePoll(!includePoll)}
                >
                  <Ionicons
                    name={includePoll ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={includePoll ? (theme.colors.interactive || '#DC143C') : theme.colors.textSecondary}
                  />
                  <Text style={[styles.pollToggleLabel, { color: theme.colors.textDark }]}>Include Poll</Text>
                </TouchableOpacity>

                {includePoll && (
                  <View style={styles.pollForm}>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Poll Question *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                        value={pollData.question}
                        onChangeText={(text) => setPollData({ ...pollData, question: text })}
                        placeholder="What would you like to ask?"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Poll Description</Text>
                      <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                        value={pollData.description}
                        onChangeText={(text) => setPollData({ ...pollData, description: text })}
                        placeholder="Additional context for the poll"
                        multiline
                        numberOfLines={2}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Poll Options *</Text>
                      {pollOptions.map((option, index) => (
                        <View key={index} style={styles.pollOptionRow}>
                          <TextInput
                            style={[styles.input, styles.pollOptionInput, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                            value={option}
                            onChangeText={(text) => updatePollOption(index, text)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {pollOptions.length > 2 && (
                            <TouchableOpacity
                              style={styles.removeOptionButton}
                              onPress={() => removePollOption(index)}
                            >
                              <Ionicons name="close-circle" size={24} color="#EF4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                      <TouchableOpacity
                        style={[styles.addOptionButton, { borderColor: theme.colors.border }]}
                        onPress={addPollOption}
                      >
                        <Ionicons name="add-circle-outline" size={20} color={theme.colors.interactive || '#DC143C'} />
                        <Text style={[styles.addOptionText, { color: theme.colors.interactive || '#DC143C' }]}>Add Option</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Poll End Date</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                        value={pollData.end_date}
                        onChangeText={(text) => setPollData({ ...pollData, end_date: text })}
                        placeholder="YYYY-MM-DD (optional)"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <TouchableOpacity
                        style={[styles.checkboxContainer, { borderColor: theme.colors.border }]}
                        onPress={() => setPollData({ ...pollData, allow_multiple_votes: !pollData.allow_multiple_votes })}
                      >
                        <Ionicons
                          name={pollData.allow_multiple_votes ? 'checkbox' : 'checkbox-outline'}
                          size={24}
                          color={pollData.allow_multiple_votes ? (theme.colors.interactive || '#DC143C') : theme.colors.textSecondary}
                        />
                        <Text style={[styles.checkboxLabel, { color: theme.colors.textDark }]}>Allow Multiple Votes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textDark }]}>Cancel</Text>
              </TouchableOpacity>
              <LoadingButton
                title={editingNews ? 'Update' : 'Publish'}
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  backButton: {
    padding: baseTheme.spacing.xs,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: baseTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: baseTheme.spacing.md,
  },
  newsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  newsInfo: {
    flex: 1,
    marginRight: baseTheme.spacing.sm,
  },
  newsTitle: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  newsSummary: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs,
  },
  newsMeta: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.xs,
  },
  newsCategory: {
    ...baseTheme.typography.caption,
    textTransform: 'capitalize',
  },
  newsDate: {
    ...baseTheme.typography.caption,
  },
  newsActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: baseTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: baseTheme.borderRadius.xl,
    borderTopRightRadius: baseTheme.borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: baseTheme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  form: {
    padding: baseTheme.spacing.lg,
  },
  inputGroup: {
    marginBottom: baseTheme.spacing.md,
  },
  label: {
    ...baseTheme.typography.bodySmall,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  statusButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.md,
    paddingHorizontal: baseTheme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
  },
  pollSection: {
    marginTop: baseTheme.spacing.md,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  pollToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.md,
  },
  pollToggleLabel: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  pollForm: {
    marginTop: baseTheme.spacing.md,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.sm,
  },
  pollOptionInput: {
    flex: 1,
  },
  removeOptionButton: {
    padding: baseTheme.spacing.xs,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseTheme.spacing.xs,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addOptionText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  checkboxLabel: {
    ...baseTheme.typography.body,
    fontWeight: '500',
  },
  uploadContainer: {
    marginTop: baseTheme.spacing.xs,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseTheme.spacing.sm,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: baseTheme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  videoPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  videoPreviewText: {
    flex: 1,
    ...baseTheme.typography.bodySmall,
  },
  removeImageButton: {
    position: 'absolute',
    top: baseTheme.spacing.xs,
    right: baseTheme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: baseTheme.borderRadius.full,
    padding: baseTheme.spacing.xs / 2,
  },
  pathText: {
    ...baseTheme.typography.caption,
    marginTop: baseTheme.spacing.xs,
    fontSize: 10,
  },
});

export default NewsManagementScreen;

