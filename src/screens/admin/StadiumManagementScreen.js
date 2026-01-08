import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { fetchStadiums, createStadium, updateStadium, deleteStadium } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';

const StadiumManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { triggerRefresh } = useRefresh();
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStadium, setEditingStadium] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    capacity: '',
    established_year: '',
    surface_type: 'grass',
    status: 'active',
    latitude: '',
    longitude: '',
    image_path: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchStadiums();
      setStadiums(response.data?.stadiums || []);
    } catch (error) {
      console.error('Error loading stadiums:', error);
      showError('Failed to load stadiums');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStadium(null);
    setFormData({
      name: '',
      city: '',
      address: '',
      capacity: '',
      established_year: '',
      surface_type: 'grass',
      status: 'active',
      latitude: '',
      longitude: '',
      image_path: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (stadium) => {
    setEditingStadium(stadium);
    setFormData({
      name: stadium.name || '',
      city: stadium.city || '',
      address: stadium.address || '',
      capacity: stadium.capacity?.toString() || '',
      established_year: stadium.established_year?.toString() || '',
      surface_type: stadium.surface_type || 'grass',
      status: stadium.status || 'active',
      latitude: stadium.latitude?.toString() || '',
      longitude: stadium.longitude?.toString() || '',
      image_path: stadium.image_path || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (stadium) => {
    Alert.alert(
      'Delete Stadium',
      `Are you sure you want to delete ${stadium.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStadium(stadium.id);
              showSuccess('Stadium deleted successfully');
              loadData();
              // Trigger global refresh so changes appear across the app
              triggerRefresh('stadiums');
              triggerRefresh('teams'); // Stadiums affect teams
              triggerRefresh('matches'); // Stadiums affect matches
            } catch (error) {
              showError(error.userMessage || 'Failed to delete stadium');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Stadium name is required');
      return;
    }

    try {
      setSaving(true);
      const stadiumData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        established_year: formData.established_year ? parseInt(formData.established_year) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (editingStadium) {
        await updateStadium(editingStadium.id, stadiumData);
        showSuccess('Stadium updated successfully');
      } else {
        await createStadium(stadiumData);
        showSuccess('Stadium created successfully');
      }
      setModalVisible(false);
      loadData();
      // Trigger global refresh so changes appear across the app
      triggerRefresh('stadiums');
      triggerRefresh('teams'); // Stadiums affect teams
      triggerRefresh('matches'); // Stadiums affect matches
    } catch (error) {
      showError(error.userMessage || 'Failed to save stadium');
    } finally {
      setSaving(false);
    }
  };

  const renderStadiumItem = ({ item }) => (
    <View style={[styles.stadiumItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.stadiumInfo}>
        <Text style={[styles.stadiumName, { color: theme.colors.textDark }]}>{item.name}</Text>
        {item.city && (
          <Text style={[styles.stadiumCity, { color: theme.colors.textSecondary }]}>{item.city}</Text>
        )}
        {item.capacity && (
          <Text style={[styles.stadiumCapacity, { color: theme.colors.textSecondary }]}>
            Capacity: {item.capacity.toLocaleString()}
          </Text>
        )}
        <Text style={[styles.stadiumStatus, { color: item.status === 'active' ? '#10B981' : '#F59E0B' }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.stadiumActions}>
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
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Manage Stadiums</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.interactive || '#DC143C' }]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {stadiums.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title="No stadiums found"
          subtitle="Add your first stadium to get started"
          messageType="default"
          illustrationTone="brand"
        />
      ) : (
        <FlatList
          data={stadiums}
          renderItem={renderStadiumItem}
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
                {editingStadium ? 'Edit Stadium' : 'Add Stadium'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Stadium Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter stadium name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>City</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="Enter city"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Enter address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Capacity</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.capacity}
                  onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                  placeholder="e.g., 25000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Established Year</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.established_year}
                  onChangeText={(text) => setFormData({ ...formData, established_year: text })}
                  placeholder="e.g., 1990"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Surface Type</Text>
                <View style={styles.statusButtons}>
                  {['grass', 'artificial', 'mixed'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.statusButton,
                        formData.surface_type === type && { backgroundColor: theme.colors.interactive || '#DC143C' }
                      ]}
                      onPress={() => setFormData({ ...formData, surface_type: type })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        formData.surface_type === type && { color: '#FFFFFF' }
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
                <View style={styles.statusButtons}>
                  {['active', 'under_renovation', 'closed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        formData.status === status && { backgroundColor: theme.colors.interactive || '#DC143C' }
                      ]}
                      onPress={() => setFormData({ ...formData, status })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        formData.status === status && { color: '#FFFFFF' }
                      ]}>
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Latitude</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  placeholder="e.g., -22.5700"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Longitude</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  placeholder="e.g., 17.0836"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textDark }]}>Image Path</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                  value={formData.image_path}
                  onChangeText={(text) => setFormData({ ...formData, image_path: text })}
                  placeholder="/images/stadiums/stadium.png"
                />
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
                title={editingStadium ? 'Update' : 'Create'}
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
  stadiumItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  stadiumInfo: {
    flex: 1,
  },
  stadiumName: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs / 2,
  },
  stadiumCity: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  stadiumCapacity: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.xs / 2,
  },
  stadiumStatus: {
    ...baseTheme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stadiumActions: {
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
});

export default StadiumManagementScreen;

