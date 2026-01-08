import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { lightTheme } from '../../theme/colors.js';
import { nfaImages } from '../../constants/media.js';

const SignUpScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase and lowercase letters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      });
      setLoading(false);
      Alert.alert(
        'Success!',
        'Your account has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Tabs')
          }
        ]
      );
    }, 1500);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, showEye, onToggleEye, error, keyboardType, autoCapitalize }) => (
    <View>
        <View style={[
        styles.inputContainer,
        { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: error ? '#EF4444' : 'rgba(255, 255, 255, 0.3)' }
      ]}>
        <Ionicons name={icon} size={20} color={error ? '#EF4444' : theme.colors.muted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoComplete="off"
        />
        {showEye !== undefined && showEye && (
          <TouchableOpacity onPress={onToggleEye} style={styles.eyeButton}>
            <Ionicons
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Image
        source={nfaImages.authBackground}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <View style={styles.overlay} pointerEvents="none" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

        {/* Logo and Title */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person-add" size={40} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.textDark }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Join Namibia Football and stay connected
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            icon="person-outline"
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            error={errors.name}
            autoCapitalize="words"
          />

          <InputField
            icon="mail-outline"
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            keyboardType="email-address"
          />

          <InputField
            icon="call-outline"
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            error={errors.phone}
            keyboardType="phone-pad"
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry={!showPassword}
            showEye={formData.password.length > 0}
            onToggleEye={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            showEye={formData.confirmPassword.length > 0}
            onToggleEye={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
              By creating an account, you agree to our{' '}
              <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Creating Account...</Text>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.muted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Text style={[styles.switchTextBold, { color: theme.colors.primary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
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
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    zIndex: 2
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    minHeight: '100%'
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  backButton: {
    padding: 8
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  form: {
    paddingHorizontal: 20,
    gap: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...lightTheme.shadows.sm
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14
  },
  eyeButton: {
    padding: 4
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 8
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center'
  },
  termsLink: {
    fontWeight: '600'
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    ...lightTheme.shadows.md
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    fontSize: 12,
    marginHorizontal: 16,
    fontWeight: '600'
  },
  switchButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12
  },
  switchText: {
    fontSize: 14
  },
  switchTextBold: {
    fontSize: 14,
    fontWeight: '700'
  }
});

export default SignUpScreen;

