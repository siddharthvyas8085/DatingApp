import { router } from 'expo-router';
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

import { ApiError, createPreferences, getMyPreferences, updatePreferences } from '@/services/api';
import { getAuthToken } from '@/services/auth';

type FieldErrors = {
  gender?: string;
  minAge?: string;
  maxAge?: string;
  city?: string;
  relationshipIntent?: string;
};

const initialForm = {
  gender: '',
  minAge: '',
  maxAge: '',
  city: '',
  relationshipIntent: '',
};

export default function PreferencesScreen() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const token = await getAuthToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const existing = await getMyPreferences(token);

        setForm({
          gender: existing.gender ?? '',
          minAge: existing.min_age?.toString() ?? '',
          maxAge: existing.max_age?.toString() ?? '',
          city: existing.city ?? '',
          relationshipIntent: existing.distance_km?.toString() ?? '',
        });
        setIsEditing(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setIsEditing(false);
        } else {
          setMessage('Unable to load your preferences right now.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.gender.trim().length > 0 &&
      form.minAge.trim().length > 0 &&
      form.maxAge.trim().length > 0 &&
      form.city.trim().length > 0
    );
  }, [form]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!form.gender.trim()) {
      nextErrors.gender = 'Preferred gender is required.';
    }

    const minAge = Number(form.minAge);
    const maxAge = Number(form.maxAge);

    if (!form.minAge.trim()) {
      nextErrors.minAge = 'Minimum age is required.';
    } else if (!Number.isInteger(minAge) || minAge < 18 || minAge > 80) {
      nextErrors.minAge = 'Minimum age must be between 18 and 80.';
    }

    if (!form.maxAge.trim()) {
      nextErrors.maxAge = 'Maximum age is required.';
    } else if (!Number.isInteger(maxAge) || maxAge < 18 || maxAge > 80) {
      nextErrors.maxAge = 'Maximum age must be between 18 and 80.';
    }

    if (form.minAge && form.maxAge && minAge > maxAge) {
      nextErrors.minAge = 'Minimum age must not exceed maximum age.';
      nextErrors.maxAge = 'Maximum age must not be below minimum age.';
    }

    if (!form.city.trim()) {
      nextErrors.city = 'City is required.';
    }

    if (form.relationshipIntent && !/^[0-9]+$/.test(form.relationshipIntent.trim())) {
      nextErrors.relationshipIntent = 'Relationship intent must be a number value.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setMessage('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const payload = {
        gender: form.gender.trim(),
        min_age: Number(form.minAge),
        max_age: Number(form.maxAge),
        city: form.city.trim(),
        distance_km: form.relationshipIntent.trim() ? Number(form.relationshipIntent) : null,
      };

      if (isEditing) {
        await updatePreferences(payload, token);
        setMessage('Preferences updated successfully.');
      } else {
        await createPreferences(payload, token);
        setMessage('Preferences saved successfully.');
      }

      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message || 'Something went wrong while saving your preferences.');
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.brand}>Bloom</Text>
            <Text style={styles.title}>{isEditing ? 'Update preferences' : 'Set your preferences'}</Text>
            <Text style={styles.subtitle}>
              Help us personalize your matches with a few important preferences.
            </Text>
          </View>

          <View style={styles.form}>
            {isLoading ? (
              <Text style={styles.loadingText}>Loading your preferences...</Text>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Preferred gender</Text>
                  <TextInput
                    value={form.gender}
                    onChangeText={(value) => handleChange('gender', value)}
                    placeholder="Woman, Man, Non-binary..."
                    style={[styles.input, errors.gender ? styles.inputError : null]}
                  />
                  {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
                </View>

                <View style={styles.row}>
                  <View style={[styles.fieldGroup, styles.halfField]}>
                    <Text style={styles.label}>Minimum age</Text>
                    <TextInput
                      value={form.minAge}
                      onChangeText={(value) => handleChange('minAge', value)}
                      placeholder="18"
                      keyboardType="number-pad"
                      style={[styles.input, errors.minAge ? styles.inputError : null]}
                    />
                    {errors.minAge ? <Text style={styles.errorText}>{errors.minAge}</Text> : null}
                  </View>

                  <View style={[styles.fieldGroup, styles.halfField]}>
                    <Text style={styles.label}>Maximum age</Text>
                    <TextInput
                      value={form.maxAge}
                      onChangeText={(value) => handleChange('maxAge', value)}
                      placeholder="35"
                      keyboardType="number-pad"
                      style={[styles.input, errors.maxAge ? styles.inputError : null]}
                    />
                    {errors.maxAge ? <Text style={styles.errorText}>{errors.maxAge}</Text> : null}
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    value={form.city}
                    onChangeText={(value) => handleChange('city', value)}
                    placeholder="Your city"
                    style={[styles.input, errors.city ? styles.inputError : null]}
                  />
                  {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Relationship intent</Text>
                  <TextInput
                    value={form.relationshipIntent}
                    onChangeText={(value) => handleChange('relationshipIntent', value)}
                    placeholder="e.g. 25"
                    keyboardType="number-pad"
                    style={[styles.input, errors.relationshipIntent ? styles.inputError : null]}
                  />
                  {errors.relationshipIntent ? (
                    <Text style={styles.errorText}>{errors.relationshipIntent}</Text>
                  ) : null}
                </View>

                {message ? <Text style={styles.messageText}>{message}</Text> : null}

                <Pressable
                  accessibilityRole="button"
                  disabled={!canSubmit || isSubmitting}
                  onPress={handleSubmit}
                  style={[styles.primaryButton, !canSubmit || isSubmitting ? styles.disabledButton : null]}>
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Saving...') : isEditing ? 'Save preferences' : 'Save preferences'}
                  </Text>
                </Pressable>
              </>
            )}
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#D42775',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  messageText: {
    color: '#2F8A5D',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  loadingText: {
    color: '#775B6A',
    fontSize: 14,
    fontWeight: '600',
  },
});
