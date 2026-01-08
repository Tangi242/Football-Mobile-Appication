import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchNews, createNews, updateNews, deleteNews, triggerBreakingNews } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const JournalistNewsScreen = ({ navigation, route }) => {
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
    scheduled_publish_at: '',
    status: 'draft',
    is_breaking: false,
    match_id: null,
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
      // Only fetch news posted by this journalist
      const response = await fetchNews(user?.id);
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
      scheduled_publish_at: '',
      status: 'draft',
      is_breaking: false,
      match_id: null,
      tags: '',
      featured: false
    });
    setPollData({
      question: '',
      description: '',
      end_date: '',
      allow_multiple_votes: false
    });
    setSelectedImage(null);
    setSelectedVideo(null);
    setModalVisible(true);
  };

  const handleEdit = (newsItem) => {
    // Only allow editing if this journalist is the author
    if (newsItem.author_id !== user?.id) {
      showError('You can only edit your own news articles');
      return;
    }
    
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
      scheduled_publish_at: newsItem.scheduled_publish_at ? newsItem.scheduled_publish_at.replace('T', ' ').substring(0, 16) : '',
      status: newsItem.status || 'draft',
      is_breaking: newsItem.is_breaking || false,
      match_id: newsItem.match_id || null,
      tags: newsItem.tags || '',
      featured: newsItem.featured || false
    });
    setModalVisible(true);
  };

  const handleDelete = (newsItem) => {
    // Only allow deleting if this journalist is the author
    if (newsItem.author_id !== user?.id) {
      showError('You can only delete your own news articles');
      return;
    }
    
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

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedVideo(asset.uri);
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
        author_id: user?.id || null, // Always set to current journalist's ID
        published_at: formData.status === 'published' 
          ? (formData.published_at ? `${formData.published_at}T00:00:00` : new Date().toISOString())
          : null,
        scheduled_publish_at: formData.status === 'scheduled' && formData.scheduled_publish_at
          ? formData.scheduled_publish_at.replace(' ', 'T')
          : null,
        status: formData.status || 'draft',
        is_breaking: formData.is_breaking || false,
        match_id: formData.match_id || null,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#10B981';
      case 'scheduled': return '#3B82F6';
      case 'draft': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderNewsItem = ({ item }) => (
    <View style={[styles.newsItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {(item.is_breaking || item.status) && (
        <View style={styles.badgeContainer}>
          {item.is_breaking && (
            <View style={[styles.breakingBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.breakingText}>BREAKING</Text>
            </View>
          )}
          {item.status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{(item.status || 'draft').toUpperCase()}</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.newsInfo}>
        <Text style={[styles.newsTitle, { color: theme.colors.textDark }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.newsCategory, { color: theme.colors.textSecondary }]}>
          {item.category || 'announcement'}
        </Text>
        <Text style={[styles.newsDate, { color: theme.colors.textSecondary }]}>
          {item.published_at ? new Date(item.published_at).toLocaleDateString() : 
           item.scheduled_publish_at ? `Scheduled: ${new Date(item.scheduled_publish_at).toLocaleString()}` : 'Draft'}
        </Text>
      </View>
      <View style={styles.newsActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>My News Articles</Text>
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

        {/* Add/Edit News Modal */}
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
                  <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                    {editingNews ? 'Edit News' : 'Publish News'}
                  </Text>
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
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Article Type *</Text>
                    <View style={styles.categoryButtons}>
                      {[
                        { key: 'announcement', label: 'Headline' },
                        { key: 'preview', label: 'Match Preview' },
                        { key: 'report', label: 'Match Report' },
                        { key: 'opinion', label: 'Opinion' },
                        { key: 'interview', label: 'Interview' },
                        { key: 'transfer', label: 'Transfer' }
                      ].map((cat) => (
                        <TouchableOpacity
                          key={cat.key}
                          style={[
                            styles.categoryButton,
                            formData.category === cat.key && { backgroundColor: theme.colors.primary }
                          ]}
                          onPress={() => setFormData({ ...formData, category: cat.key })}
                        >
                          <Text style={[
                            styles.categoryButtonText,
                            formData.category === cat.key && { color: '#FFFFFF' }
                          ]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
                    <View style={styles.categoryButtons}>
                      {['draft', 'scheduled', 'published'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.categoryButton,
                            formData.status === status && { backgroundColor: theme.colors.primary }
                          ]}
                          onPress={() => setFormData({ ...formData, status })}
                        >
                          <Text style={[
                            styles.categoryButtonText,
                            formData.status === status && { color: '#FFFFFF' }
                          ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {formData.status === 'scheduled' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Schedule Publish Date & Time</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                        value={formData.scheduled_publish_at}
                        onChangeText={(text) => setFormData({ ...formData, scheduled_publish_at: text })}
                        placeholder="YYYY-MM-DD HH:MM (e.g., 2025-12-25 10:00)"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <View style={styles.switchRow}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Breaking News</Text>
                      <Switch
                        value={formData.is_breaking}
                        onValueChange={(value) => setFormData({ ...formData, is_breaking: value })}
                        trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                        thumbColor={formData.is_breaking ? theme.colors.primary : '#f4f3f4'}
                      />
                    </View>
                  </View>

                  {(formData.category === 'preview' || formData.category === 'report') && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Related Match (Optional)</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                        value={formData.match_id ? String(formData.match_id) : ''}
                        onChangeText={(text) => setFormData({ ...formData, match_id: text ? parseInt(text) : null })}
                        placeholder="Match ID"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  )}

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

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Video (Optional)</Text>
                    <View style={styles.uploadContainer}>
                      {selectedVideo ? (
                        <View style={styles.imagePreviewContainer}>
                          <Ionicons name="videocam" size={40} color={theme.colors.primary} />
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
                  </View>

                  <View style={styles.inputGroup}>
                    <TouchableOpacity
                      style={styles.pollToggle}
                      onPress={() => setIncludePoll(!includePoll)}
                    >
                      <Text style={[styles.label, { color: theme.colors.textDark }]}>Include Poll</Text>
                      <Ionicons
                        name={includePoll ? 'checkbox' : 'checkbox-outline'}
                        size={24}
                        color={includePoll ? theme.colors.primary : theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {includePoll && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.textDark }]}>Poll Question *</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                          value={pollData.question}
                          onChangeText={(text) => setPollData({ ...pollData, question: text })}
                          placeholder="Enter poll question"
                          placeholderTextColor={theme.colors.textSecondary}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.textDark }]}>Poll Options *</Text>
                        {pollOptions.map((option, index) => (
                          <View key={index} style={styles.pollOptionRow}>
                            <TextInput
                              style={[styles.pollOptionInput, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                              value={option}
                              onChangeText={(text) => updatePollOption(index, text)}
                              placeholder={`Option ${index + 1}`}
                              placeholderTextColor={theme.colors.textSecondary}
                            />
                            {pollOptions.length > 2 && (
                              <TouchableOpacity
                                onPress={() => removePollOption(index)}
                                style={styles.removeOptionButton}
                              >
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                        <TouchableOpacity
                          style={[styles.addOptionButton, { borderColor: theme.colors.primary }]}
                          onPress={addPollOption}
                        >
                          <Ionicons name="add" size={20} color={theme.colors.primary} />
                          <Text style={[styles.addOptionText, { color: theme.colors.primary }]}>Add Option</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  <LoadingButton
                    title={editingNews ? 'Update News' : 'Publish News'}
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
    alignItems: 'center',
    marginBottom: baseTheme.spacing.lg,
  },
  headerTitle: {
    ...baseTheme.typography.h2,
    fontWeight: '800',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  newsInfo: {
    flex: 1,
    marginRight: baseTheme.spacing.md,
  },
  newsTitle: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  newsCategory: {
    ...baseTheme.typography.caption,
    marginBottom: baseTheme.spacing.xs,
  },
  newsDate: {
    ...baseTheme.typography.caption,
  },
  newsActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  categoryButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  categoryButton: {
    flex: 1,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  categoryButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    fontSize: 11,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: baseTheme.spacing.xs,
    marginBottom: baseTheme.spacing.xs,
  },
  breakingBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
  },
  breakingText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 9,
  },
  statusBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
  },
  statusText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
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
  pollToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.sm,
    gap: baseTheme.spacing.sm,
  },
  pollOptionInput: {
    flex: 1,
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  removeOptionButton: {
    padding: baseTheme.spacing.xs,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    gap: baseTheme.spacing.xs,
  },
  addOptionText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
  },
});

export default JournalistNewsScreen;

