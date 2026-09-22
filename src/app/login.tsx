import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ApiError,
  getCurrentUser,
  getMyPreferences,
  getMyProfile,
  loginUser,
} from '@/services/api';
import { clearAuthToken, getAuthToken, saveAuthToken } from '@/services/auth';

type FieldErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await getAuthToken();

      if (!token) {
        return;
      }

      try {
        await getCurrentUser(token);
        router.replace('/');
      } catch {
        await clearAuthToken();
      }
    };

    restoreSession();
  }, []);

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0,
    [email, password],
  );

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    setMessage('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      await saveAuthToken(result.access_token);
      await getCurrentUser(result.access_token);

      try {
        await getMyProfile(result.access_token);
      } catch (profileError) {
        if (profileError instanceof ApiError && profileError.status === 404) {
          router.replace('/profile-setup');
          return;
        }

        throw profileError;
      }

      try {
        await getMyPreferences(result.access_token);
        router.replace('/');
        return;
      } catch (preferencesError) {
        if (preferencesError instanceof ApiError && preferencesError.status === 404) {
          router.replace('/preferences');
          return;
        }

        throw preferencesError;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setMessage('Invalid email or password. Please try again.');
        } else if (error.status === 422 || error.status === 400) {
          setMessage(error.message);
        } else {
          setMessage(error.message || 'Unable to log in right now. Please try again.');
        }
      } else {
        setMessage('Unable to reach the backend. Please check that the server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.brand}>Bloom</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in with your details when you are ready to continue.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#A98496"
                style={[styles.input, errors.email ? styles.inputError : null]}
                textContentType="emailAddress"
                value={email}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="current-password"
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#A98496"
                secureTextEntry
                style={[styles.input, errors.password ? styles.inputError : null]}
                textContentType="password"
                value={password}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {message ? <Text style={styles.successText}>{message}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit || isSubmitting}
              onPress={handleLogin}
              style={[styles.loginButton, !canSubmit || isSubmitting ? styles.disabledButton : null]}>
              <Text style={styles.loginButtonText}>
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>New to Bloom?</Text>
              <Link href="./register" style={styles.registerLink}>
                Create account
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#FFF8FB',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFF8FB',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 28,
  },
  brand: {
    color: '#D42775',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1F102A',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    color: '#775B6A',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F7D9E6',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#D33A7A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#332136',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF8FB',
    borderColor: '#F1CADB',
    borderRadius: 14,
    borderWidth: 1,
    color: '#1F102A',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#C83258',
  },
  errorText: {
    color: '#B42345',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  successText: {
    color: '#2F8A5D',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#D42775',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.55,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 18,
  },
  registerPrompt: {
    color: '#775B6A',
    fontSize: 14,
  },
  registerLink: {
    color: '#D42775',
    fontSize: 14,
    fontWeight: '800',
  },
});
