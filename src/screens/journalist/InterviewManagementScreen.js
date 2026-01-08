import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { fetchInterviews, createInterview, updateInterview, deleteInterview } from '../../api/client.js';

const InterviewManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    interviewee_type: 'player',
    interviewee_id: null,
    interviewee_name: '',
    image_path: '',
    video_url: '',
    status: 'draft'
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchInterviews(user?.id);
      setInterviews(response.data?.interviews || []);
    } catch (error) {
      console.error('Error loading interviews:', error);
      showError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingInterview(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      interviewee_type: 'player',
      interviewee_id: null,
      interviewee_name: '',
      image_path: '',
      video_url: '',
      status: 'draft'
    });
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleEdit = (interview) => {
    setEditingInterview(interview);
    setFormData({
      title: interview.title || '',
      summary: interview.summary || '',
      content: interview.content || '',
      interviewee_type: interview.interviewee_type || 'player',
      interviewee_id: interview.interviewee_id || null,
      interviewee_name: interview.interviewee_name || '',
      image_path: interview.image_path || '',
      video_url: interview.video_url || '',
      status: interview.status || 'draft'
    });
    setSelectedImage(interview.image_path || null);
    setModalVisible(true);
  };

  const handleDelete = (interview) => {
    Alert.alert(
      'Delete Interview',
      'Are you sure you want to delete this interview?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInterview(interview.id);
              showSuccess('Interview deleted successfully');
              loadData();
              triggerRefresh('news');
            } catch (error) {
              showError('Failed to delete interview');
            }
          }
        }
      ]
    );
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        const fileName = `interview_${Date.now()}.${asset.uri.split('.').pop()}`;
        const imagePath = `/images/interviews/${fileName}`;
        setFormData({ ...formData, image_path: imagePath });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Failed to pick image');
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
    if (!formData.interviewee_name.trim()) {
      showError('Interviewee name is required');
      return;
    }

    try {
      setSaving(true);
      const interviewData = {
        ...formData,
        author_id: user?.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (editingInterview) {
        await updateInterview(editingInterview.id, interviewData);
        showSuccess('Interview updated successfully');
      } else {
        await createInterview(interviewData);
        showSuccess('Interview created successfully');
      }
      setModalVisible(false);
      loadData();
      triggerRefresh('news');
    } catch (error) {
      showError(error.userMessage || 'Failed to save interview');
    } finally {
      setSaving(false);
    }
  };

  const renderInterviewItem = ({ item }) => (
    <View style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.textDark }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
            {item.interviewee_name} • {item.interviewee_type}
          </Text>
        </View>
        <View style={styles.itemStatus}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'published' ? '#10B981' : '#6B7280' }]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase() || 'DRAFT'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' + '20' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Manage Interviews
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>New Interview</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : interviews.length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon="mic-outline"
              title="No interviews yet"
              message="Create your first interview with players, coaches, or officials"
            />
          </View>
        ) : (
          <FlatList
            data={interviews}
            renderItem={renderInterviewItem}
            keyExtractor={(item) => `interview-${item.id}`}
            contentContainerStyle={styles.list}
          />
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <ScreenWrapper>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                {editingInterview ? 'Edit' : 'Create'} Interview
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Enter interview title"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Interviewee Type</Text>
                <View style={styles.typeButtons}>
                  {['player', 'coach', 'official', 'other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.interviewee_type === type && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setFormData({ ...formData, interviewee_type: type })}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        { color: formData.interviewee_type === type ? '#FFFFFF' : theme.colors.textDark }
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Interviewee Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.interviewee_name}
                  onChangeText={(text) => setFormData({ ...formData, interviewee_name: text })}
                  placeholder="Enter interviewee name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Summary</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.summary}
                  onChangeText={(text) => setFormData({ ...formData, summary: text })}
                  placeholder="Brief summary of the interview"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Content *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  placeholder="Enter interview content"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={8}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Interview Image</Text>
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
                    >
                      <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
                      <Text style={[styles.uploadButtonText, { color: theme.colors.textDark }]}>Upload Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Video URL (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.video_url}
                  onChangeText={(text) => setFormData({ ...formData, video_url: text })}
                  placeholder="https://youtube.com/..."
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
                <View style={styles.statusButtons}>
                  {['draft', 'published'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        formData.status === status && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setFormData({ ...formData, status })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        { color: formData.status === status ? '#FFFFFF' : theme.colors.textDark }
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <LoadingButton
                title={editingInterview ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </ScrollView>
          </ScreenWrapper>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  addButtonText: {
    ...baseTheme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    padding: baseTheme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  itemMeta: {
    ...baseTheme.typography.bodySmall,
    fontSize: 12,
  },
  itemStatus: {
    marginLeft: baseTheme.spacing.md,
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
    fontSize: 10,
  },
  itemActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  actionText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: baseTheme.spacing.md,
  },
  formGroup: {
    marginBottom: baseTheme.spacing.lg,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  typeButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
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
    ...baseTheme.typography.body,
    fontWeight: '600',
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
    gap: baseTheme.spacing.xs,
  },
  uploadButtonText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: baseTheme.spacing.xs,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: baseTheme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: baseTheme.spacing.xs,
    right: baseTheme.spacing.xs,
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.xl,
  },
});

export default InterviewManagementScreen;

