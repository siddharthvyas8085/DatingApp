import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
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

  const handleLogin = () => {
    setMessage('');

    if (!validate()) {
      return;
    }

    setMessage('Login details look good. API integration is not connected yet.');
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
              disabled={!canSubmit}
              onPress={handleLogin}
              style={[styles.loginButton, !canSubmit ? styles.disabledButton : null]}>
              <Text style={styles.loginButtonText}>Log in</Text>
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
