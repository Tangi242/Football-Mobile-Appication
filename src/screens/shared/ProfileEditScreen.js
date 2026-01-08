import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { useToast } from '../../hooks/useToast.js';
import theme from '../../theme/colors.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Image picker - using a simple approach for now
// In production, use expo-image-picker or react-native-image-picker

const ProfileEditScreen = ({ navigation, route }) => {
  const { user, updateUser, favoriteTeams, toggleFavoriteTeam } = useAuth();
  const { theme: appTheme } = useTheme();
  const { language } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Available teams for selection
  const availableTeams = [
    'Namibia', 'Black Africa FC', 'African Stars', 'Tura Magic', 
    'Life Fighters', 'Blue Waters', 'Orlando Pirates', 'Civics FC'
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || user.about || '');
      setAvatar(user.avatar || user.photo || null);
      setSelectedTeams([...favoriteTeams]);
    }
  }, [user, favoriteTeams]);

  const pickImage = async () => {
    // For now, show an alert - in production, implement image picker
    Alert.alert(
      'Change Photo',
      'Image picker will be implemented. For now, you can update other profile details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Default', 
          onPress: () => {
            // Set a default avatar URL or placeholder
            setAvatar(null);
          }
        }
      ]
    );
  };

  const toggleTeam = (teamName) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamName)) {
        return prev.filter(t => t !== teamName);
      }
      return [...prev, teamName];
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Please enter your name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showError('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      // Update user in AuthContext
      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar: avatar,
        photo: avatar,
      };

      // Update favorite teams
      const teamsToAdd = selectedTeams.filter(t => !favoriteTeams.includes(t));
      const teamsToRemove = favoriteTeams.filter(t => !selectedTeams.includes(t));
      
      teamsToAdd.forEach(team => toggleFavoriteTeam(team));
      teamsToRemove.forEach(team => toggleFavoriteTeam(team));

      // Save to AsyncStorage
      await AsyncStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
      
      // Update in context
      if (updateUser) {
        updateUser(updatedUser);
      }

      showSuccess('Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: appTheme.colors.border }]}>
                <Ionicons name="person" size={48} color={appTheme.colors.muted} />
              </View>
            )}
            <View style={[styles.editPhotoButton, { backgroundColor: appTheme.colors.primary }]}>
              <Ionicons name="camera" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.photoHint, { color: appTheme.colors.textSecondary }]}>
            Tap to change photo
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: appTheme.colors.textDark }]}>
              Full Name *
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={appTheme.colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: appTheme.colors.textPrimary }]}
                placeholder="Enter your full name"
                placeholderTextColor={appTheme.colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={true}
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: appTheme.colors.textDark }]}>
              Email *
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={appTheme.colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: appTheme.colors.textPrimary }]}
                placeholder="Enter your email"
                placeholderTextColor={appTheme.colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={true}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: appTheme.colors.textDark }]}>
              Phone Number
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <Ionicons name="call-outline" size={20} color={appTheme.colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: appTheme.colors.textPrimary }]}
                placeholder="Enter your phone number"
                placeholderTextColor={appTheme.colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCorrect={false}
                editable={true}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: appTheme.colors.textDark }]}>
              Bio
            </Text>
            <View style={[styles.textAreaContainer, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <TextInput
                style={[styles.textArea, { color: appTheme.colors.textPrimary }]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={appTheme.colors.muted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCorrect={false}
                editable={true}
              />
            </View>
          </View>

          {/* Favorite Teams */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: appTheme.colors.textDark }]}>
              Favorite Teams
            </Text>
            <Text style={[styles.hint, { color: appTheme.colors.textSecondary }]}>
              Select your favorite teams
            </Text>
            <View style={styles.teamsGrid}>
              {availableTeams.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <TouchableOpacity
                    key={team}
                    style={[
                      styles.teamChip,
                      {
                        backgroundColor: isSelected 
                          ? appTheme.colors.primary 
                          : appTheme.colors.surface,
                        borderColor: isSelected 
                          ? appTheme.colors.primary 
                          : appTheme.colors.border
                      }
                    ]}
                    onPress={() => toggleTeam(team)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.teamChipText,
                        {
                          color: isSelected 
                            ? theme.colors.white 
                            : appTheme.colors.textDark
                        }
                      ]}
                    >
                      {team}
                    </Text>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={18} 
                        color={theme.colors.white} 
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <LoadingButton
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim() || !email.trim()}
            style={[styles.saveButton, { backgroundColor: appTheme.colors.primary }]}
            textStyle={styles.saveButtonText}
          >
            Save Profile
          </LoadingButton>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  photoHint: {
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.xs,
  },
  formSection: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  hint: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  textAreaContainer: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    minHeight: 120,
  },
  textArea: {
    fontSize: 15,
    minHeight: 100,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    minHeight: 40,
  },
  teamChipText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  checkIcon: {
    marginLeft: theme.spacing.xs / 2,
  },
  buttonSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white,
  },
});

export default ProfileEditScreen;

