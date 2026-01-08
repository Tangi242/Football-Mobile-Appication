import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { lightTheme } from '../../theme/colors.js';
import { nfaImages } from '../../constants/media.js';

const AuthScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Input refs for focus management
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleSubmit = async () => {
    if (isSignUp) {
      if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
    } else {
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: 1,
        name: name || email.split('@')[0] || 'User',
        email: email
      };
      login(newUser);
      setLoading(false);

      // Check if profile needs completion (new user or incomplete)
      const needsCompletion = !name || !name.trim() || name === email.split('@')[0];
      if (needsCompletion) {
        // Navigate to profile edit to complete profile
        navigation.replace('Tabs', { screen: 'News' });
        setTimeout(() => {
          navigation.navigate('ProfileEdit');
        }, 500);
      } else {
        navigation.replace('Tabs');
      }
    }, 1000);
  };

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          nestedScrollEnabled={true}
          bounces={false}
          scrollEnabled={true}
          contentInsetAdjustmentBehavior="automatic"
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
            <View style={[styles.logoContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="football" size={40} color={theme.colors.white} />
            </View>
            <Text style={[styles.title, { color: theme.colors.white }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {isSignUp
                ? 'Sign up to get started with Ballr'
                : 'Sign in to continue to your account'}
            </Text>
          </View>

        {/* Form */}
        <View style={styles.form}>
          {isSignUp && (
            <View style={[styles.inputContainer, { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Ionicons name="person-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.textDark }]}
                placeholder="Full Name"
                placeholderTextColor={theme.colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={true}
                autoFocus={false}
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
            <TextInput
              ref={emailRef}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="Email"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              blurOnSubmit={false}
              editable={true}
              autoFocus={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              autoComplete={isSignUp ? 'password-new' : 'password'}
              returnKeyType={isSignUp ? "next" : "done"}
              blurOnSubmit={!isSignUp}
              editable={true}
              autoFocus={false}
              onSubmitEditing={() => {
                if (isSignUp) {
                  confirmPasswordRef.current?.focus();
                } else {
                  handleSubmit();
                }
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.colors.muted}
              />
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <View style={[styles.inputContainer, { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, { color: theme.colors.textDark }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.colors.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCorrect={false}
                autoComplete="password-new"
                returnKeyType="done"
                blurOnSubmit={true}
                editable={true}
                autoFocus={false}
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>
          )}

          {!isSignUp && (
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              (loading || (!isSignUp && (!email || !password)) || (isSignUp && (!name || !email || !password || !confirmPassword))) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || (!isSignUp && (!email || !password)) || (isSignUp && (!name || !email || !password || !confirmPassword))}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Loading...</Text>
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.muted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Text style={[styles.switchTextBold, { color: theme.colors.primary }]}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
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
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  form: {
    paddingHorizontal: 20,
    gap: 16
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 56,
    ...lightTheme.shadows.sm
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    minHeight: 44,
    paddingHorizontal: 0,
    margin: 0
  },
  eyeButton: {
    padding: 4
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600'
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    ...lightTheme.shadows.md
  },
  submitButtonDisabled: {
    opacity: 0.5
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

export default AuthScreen;

