import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { t } from '../../i18n/locales.js';
import theme from '../../theme/colors.js';
import { login as apiLogin } from '../../api/client.js';
import { useToast } from '../../hooks/useToast.js';
import { nfaImages } from '../../constants/media.js';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      const userData = response.data?.user;

      if (!userData) {
        showError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Store user with role
      const user = {
        id: userData.id,
        name: userData.name || `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        profile_photo_path: userData.profile_photo_path,
        status: userData.status
      };

      login(user);
      setLoading(false);

      // Navigate to tabs
      navigation.replace('Tabs', { screen: 'News' });
    } catch (error) {
      console.error('Login error:', error);
      showError(error.userMessage || 'Login failed. Please check your credentials.');
      setLoading(false);
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
            <Text style={styles.headerTitle}>Login Now!</Text>
          </View>

          {/* White Form Card */}
          <View style={styles.formCard}>
            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading || !email || !password}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {loading ? t('loading', language) : t('login', language)}
              </Text>
            </TouchableOpacity>

            {/* Register Now Button (outlined) */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>Register Now</Text>
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
    paddingBottom: -888
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
    ...theme.shadows.lg
  },
  fieldContainer: {
    marginBottom: 24
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 14
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8
  },
  loginButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    ...theme.shadows.md
  },
  loginButtonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  signInButton: {
    borderWidth: 1.5,
    borderColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B'
  }
});

export default LoginScreen;


