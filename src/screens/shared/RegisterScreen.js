import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal, Pressable, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { register, uploadFile } from '../../api/client.js';
import baseTheme from '../../theme/colors.js';
import { nfaImages } from '../../constants/media.js';

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ id: false, license: false });
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  // Available roles for registration
  const availableRoles = [
    { value: 'referee', label: 'Referee', description: 'Match official', icon: 'flag-outline' },
    { value: 'club_manager', label: 'Club Manager', description: 'Team administrator', icon: 'people-outline' },
    { value: 'coach', label: 'Coach', description: 'Team coach', icon: 'fitness-outline' },
    { value: 'journalist', label: 'Journalist', description: 'Sports journalist', icon: 'newspaper-outline' },
    { value: 'player', label: 'Player', description: 'Football player', icon: 'football-outline' }
  ];
  
  const getSelectedRoleLabel = () => {
    const role = availableRoles.find(r => r.value === selectedRole);
    return role ? role.label : 'Select Your Role';
  };
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [documents, setDocuments] = useState({
    id_document: null,
    referee_license: null
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Check file size (5MB limit)
        if (asset.size > 5 * 1024 * 1024) {
          showError('File size must be less than 5MB');
          return;
        }

        setUploading(prev => ({ ...prev, [type]: true }));
        
        try {
          const uploadType = type === 'id_document' ? 'documents' : 'documents';
          const uploadResult = await uploadFile(asset.uri, uploadType, asset.name);
          
          if (uploadResult.success && uploadResult.file) {
            setDocuments(prev => ({
              ...prev,
              [type]: {
                name: asset.name,
                path: uploadResult.file.path,
                uri: asset.uri
              }
            }));
            showSuccess(`${type === 'id_document' ? 'ID' : 'License'} document uploaded successfully`);
          } else {
            showError('Failed to upload document');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          showError(uploadError.userMessage || 'Failed to upload document');
        } finally {
          setUploading(prev => ({ ...prev, [type]: false }));
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showError('Failed to pick document');
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedRole) {
      newErrors.role = 'Please select a role';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!documents.id_document) {
      newErrors.id_document = 'ID document is required';
    }

    // Referee requires license document
    if (selectedRole === 'referee' && !documents.referee_license) {
      newErrors.referee_license = 'Referee license document is required';
    }
    
    // Coach license is optional but recommended
    // Journalist and Player don't require additional documents beyond ID

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim() || null,
        role: selectedRole,
        id_document_path: documents.id_document.path,
        referee_license_path: (selectedRole === 'referee' || selectedRole === 'coach') ? documents.referee_license?.path : null
      };

      const response = await register(registrationData);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created and is pending admin approval. You will be notified once your account is approved.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.userMessage || error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={styles.wrapper}>
      <Image
        source={nfaImages.authBackground}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      {/* Transparent teal overlay covering whole page */}
      <View style={styles.tealOverlay} pointerEvents="none" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
        >
          {/* Header Section */}
          <View style={[styles.headerSection, { paddingTop: insets.top + 60, paddingBottom: 40 }]}>
            <Text style={styles.headerTitle}>Register Now!</Text>
          </View>

          {/* White Form Card */}
          <View style={styles.formCard}>
            {/* Header Icon and Title */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: '#20B2AA' }]}>
                <Ionicons name="person-add" size={32} color="#FFFFFF" />
              </View>
              <Text style={[styles.title, { color: '#1E293B' }]}>Register Account</Text>
              <Text style={[styles.subtitle, { color: '#64748B' }]}>
                Register as a Referee, Club Manager, Coach, Journalist, or Player. Your account will require admin approval.
              </Text>
            </View>

          {/* Role Selection Dropdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Role</Text>
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[
                  styles.roleDropdown,
                  errors.role && styles.roleDropdownError
                ]}
                onPress={() => setShowRoleDropdown(true)}
                activeOpacity={0.7}
              >
                <View style={styles.roleDropdownContent}>
                  {selectedRole ? (
                    <>
                      <Ionicons 
                        name={availableRoles.find(r => r.value === selectedRole)?.icon || 'person-outline'} 
                        size={20} 
                        color="#20B2AA" 
                        style={styles.roleDropdownIcon}
                      />
                      <View style={styles.roleDropdownTextContainer}>
                        <Text style={styles.roleDropdownLabel}>{getSelectedRoleLabel()}</Text>
                        <Text style={styles.roleDropdownDescription}>
                          {availableRoles.find(r => r.value === selectedRole)?.description}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.roleDropdownPlaceholder}>Select Your Role</Text>
                  )}
                </View>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </TouchableOpacity>
              {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            {/* Role Dropdown Modal */}
            <Modal
              visible={showRoleDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowRoleDropdown(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowRoleDropdown(false)}
              >
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Your Role</Text>
                    <TouchableOpacity onPress={() => setShowRoleDropdown(false)}>
                      <Ionicons name="close" size={24} color="#1E293B" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={availableRoles}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          selectedRole === item.value && styles.roleOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedRole(item.value);
                          if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
                          setShowRoleDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={item.icon} 
                          size={24} 
                          color={selectedRole === item.value ? '#20B2AA' : '#94A3B8'} 
                          style={styles.roleOptionIcon}
                        />
                        <View style={styles.roleOptionTextContainer}>
                          <Text style={[
                            styles.roleOptionLabel,
                            selectedRole === item.value && styles.roleOptionLabelSelected
                          ]}>
                            {item.label}
                          </Text>
                          <Text style={styles.roleOptionDescription}>{item.description}</Text>
                        </View>
                        {selectedRole === item.value && (
                          <Ionicons name="checkmark-circle" size={24} color="#20B2AA" />
                        )}
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.first_name && styles.inputError,
                  { borderColor: errors.first_name ? '#EF4444' : '#E2E8F0' }
                ]}
                value={formData.first_name}
                onChangeText={(text) => updateField('first_name', text)}
                placeholder="Enter your first name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
              />
              {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.last_name && styles.inputError,
                  { borderColor: errors.last_name ? '#EF4444' : '#E2E8F0' }
                ]}
                value={formData.last_name}
                onChangeText={(text) => updateField('last_name', text)}
                placeholder="Enter your last name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
              />
              {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError,
                  { borderColor: errors.email ? '#EF4444' : '#E2E8F0' }
                ]}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <Text style={styles.optionalLabel}>Optional</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Document Uploads */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Uploads</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="document-text-outline" size={20} color="#1E293B" />
                <Text style={[styles.label, { color: '#1E293B', marginLeft: 8 }]}>ID Document (PDF)</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.fileButton,
                  { borderColor: errors.id_document ? '#EF4444' : '#E2E8F0' }
                ]}
                onPress={() => pickDocument('id_document')}
                disabled={uploading.id}
              >
                {uploading.id ? (
                  <ActivityIndicator size="small" color="#20B2AA" />
                ) : (
                  <>
                    <Ionicons name="folder-open-outline" size={20} color="#20B2AA" />
                    <Text style={styles.fileButtonText}>
                      {documents.id_document ? documents.id_document.name : 'Choose File'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {documents.id_document && (
                <Text style={styles.fileInfo}>
                  ✓ {documents.id_document.name}
                </Text>
              )}
              <Text style={styles.helpText}>
                Upload your ID document in PDF format (max 5MB)
              </Text>
              {errors.id_document && <Text style={styles.errorText}>{errors.id_document}</Text>}
            </View>

            {(selectedRole === 'referee' || selectedRole === 'coach') && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Ionicons name="document-text-outline" size={20} color="#1E293B" />
                  <Text style={[styles.label, { color: '#1E293B', marginLeft: 8 }]}>
                    {selectedRole === 'referee' ? 'Referee License Document (PDF)' : 'Coach License Document (PDF)'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.fileButton,
                    { borderColor: errors.referee_license ? '#EF4444' : '#E2E8F0' }
                  ]}
                  onPress={() => pickDocument('referee_license')}
                  disabled={uploading.license}
                >
                  {uploading.license ? (
                    <ActivityIndicator size="small" color="#20B2AA" />
                  ) : (
                    <>
                      <Ionicons name="folder-open-outline" size={20} color="#20B2AA" />
                      <Text style={styles.fileButtonText}>
                        {documents.referee_license ? documents.referee_license.name : 'Choose File'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {documents.referee_license && (
                  <Text style={styles.fileInfo}>
                    ✓ {documents.referee_license.name}
                  </Text>
                )}
                <Text style={styles.helpText}>
                  Upload your {selectedRole === 'referee' ? 'referee' : 'coach'} license document in PDF format (max 5MB)
                  {selectedRole === 'coach' && ' (Optional but recommended)'}
                </Text>
                {errors.referee_license && <Text style={styles.errorText}>{errors.referee_license}</Text>}
              </View>
            )}
          </View>

          {/* Password */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.passwordContainer, errors.password && { borderColor: '#EF4444', borderWidth: 2 }]}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Minimum 8 characters</Text>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={[styles.passwordContainer, errors.confirmPassword && { borderColor: '#EF4444', borderWidth: 2 }]}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || uploading.id || uploading.license) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || uploading.id || uploading.license}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Register Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  },
  tealOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(32, 178, 170, 0.4)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  },
  keyboardView: {
    flex: 1,
    zIndex: 2
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0
  },
  headerSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flex: 1,
    minHeight: '100%',
    ...baseTheme.shadows.lg
  },
  header: {
    alignItems: 'center',
    marginBottom: baseTheme.spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  section: {
    marginBottom: baseTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  roleDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    minHeight: 56,
  },
  roleDropdownError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  roleDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleDropdownIcon: {
    marginRight: 12,
  },
  roleDropdownTextContainer: {
    flex: 1,
  },
  roleDropdownLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleDropdownDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  roleDropdownPlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...baseTheme.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  roleOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  roleOptionIcon: {
    marginRight: 12,
  },
  roleOptionTextContainer: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleOptionLabelSelected: {
    color: '#20B2AA',
    fontWeight: '700',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  inputGroup: {
    marginBottom: baseTheme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  label: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  optionalLabel: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: baseTheme.spacing.xs,
  },
  input: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#1E293B'
  },
  inputError: {
    borderWidth: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    padding: 14,
    borderWidth: 0,
  },
  eyeButton: {
    padding: baseTheme.spacing.md,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  fileButtonText: {
    fontSize: 15,
    color: '#1E293B',
    flex: 1,
  },
  fileInfo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
    backgroundColor: '#1E293B',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...baseTheme.typography.body,
    color: baseTheme.colors.white,
    fontWeight: '700',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.xl,
  },
  signInText: {
    fontSize: 14,
    color: '#64748B',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20B2AA',
  },
});

export default RegisterScreen;

