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

import { ApiError, createProfile, getMyProfile, updateProfile } from '@/services/api';
import { getAuthToken } from '@/services/auth';

type FieldErrors = {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  occupation?: string;
  city?: string;
  profileImageUrl?: string;
};

const initialForm = {
  name: '',
  dateOfBirth: '',
  gender: '',
  bio: '',
  occupation: '',
  city: '',
  profileImageUrl: '',
};

export default function ProfileSetupScreen() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = await getAuthToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const profile = await getMyProfile(token);

        setForm({
          name: profile.name ?? '',
          dateOfBirth: profile.date_of_birth ?? '',
          gender: profile.gender ?? '',
          bio: profile.bio ?? '',
          occupation: profile.occupation ?? '',
          city: profile.city ?? '',
          profileImageUrl: profile.profile_image_url ?? '',
        });
        setIsEditing(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setIsEditing(false);
        } else {
          setMessage('Unable to load your profile. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const canSubmit = useMemo(() => {
    return form.name.trim().length > 0 && form.city.trim().length > 0;
  }, [form]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    } else if (form.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    if (form.dateOfBirth) {
      const birthDate = new Date(form.dateOfBirth);
      if (Number.isNaN(birthDate.getTime())) {
        nextErrors.dateOfBirth = 'Enter a valid date of birth.';
      }
    }

    if (form.bio && form.bio.trim().length > 500) {
      nextErrors.bio = 'Bio must be 500 characters or fewer.';
    }

    if (form.occupation && form.occupation.trim().length > 100) {
      nextErrors.occupation = 'Occupation must be 100 characters or fewer.';
    }

    if (form.city && form.city.trim().length > 100) {
      nextErrors.city = 'City must be 100 characters or fewer.';
    }

    if (form.profileImageUrl && !/^https?:\/\//i.test(form.profileImageUrl.trim())) {
      nextErrors.profileImageUrl = 'Use a valid http or https image URL.';
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
        name: form.name.trim(),
        date_of_birth: form.dateOfBirth || null,
        gender: form.gender.trim() || null,
        bio: form.bio.trim() || null,
        occupation: form.occupation.trim() || null,
        city: form.city.trim() || null,
        profile_image_url: form.profileImageUrl.trim() || null,
      };

      if (isEditing) {
        await updateProfile(payload, token);
        setMessage('Profile updated successfully.');
      } else {
        await createProfile(payload, token);
        setMessage('Profile created successfully.');
      }

      router.replace('/preferences');
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message || 'Something went wrong while saving your profile.');
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
            <Text style={styles.title}>{isEditing ? 'Edit your profile' : 'Set up your profile'}</Text>
            <Text style={styles.subtitle}>
              {isEditing
                ? 'Update your details so people can get to know you.'
                : 'Tell us a little about yourself to get started.'}
            </Text>
          </View>

          <View style={styles.form}>
            {isLoading ? (
              <Text style={styles.loadingText}>Loading your profile...</Text>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    value={form.name}
                    onChangeText={(value) => handleChange('name', value)}
                    placeholder="Your full name"
                    style={[styles.input, errors.name ? styles.inputError : null]}
                  />
                  {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Date of birth</Text>
                  <TextInput
                    value={form.dateOfBirth}
                    onChangeText={(value) => handleChange('dateOfBirth', value)}
                    placeholder="YYYY-MM-DD"
                    style={[styles.input, errors.dateOfBirth ? styles.inputError : null]}
                  />
                  {errors.dateOfBirth ? (
                    <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                  ) : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Gender</Text>
                  <TextInput
                    value={form.gender}
                    onChangeText={(value) => handleChange('gender', value)}
                    placeholder="Woman, Man, Non-binary..."
                    style={[styles.input, errors.gender ? styles.inputError : null]}
                  />
                  {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    value={form.bio}
                    onChangeText={(value) => handleChange('bio', value)}
                    placeholder="A short intro about you"
                    multiline
                    numberOfLines={4}
                    style={[styles.input, styles.textArea, errors.bio ? styles.inputError : null]}
                  />
                  {errors.bio ? <Text style={styles.errorText}>{errors.bio}</Text> : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Occupation</Text>
                  <TextInput
                    value={form.occupation}
                    onChangeText={(value) => handleChange('occupation', value)}
                    placeholder="What do you do?"
                    style={[styles.input, errors.occupation ? styles.inputError : null]}
                  />
                  {errors.occupation ? (
                    <Text style={styles.errorText}>{errors.occupation}</Text>
                  ) : null}
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
                  <Text style={styles.label}>Profile image URL</Text>
                  <TextInput
                    value={form.profileImageUrl}
                    onChangeText={(value) => handleChange('profileImageUrl', value)}
                    placeholder="https://example.com/profile.jpg"
                    style={[styles.input, errors.profileImageUrl ? styles.inputError : null]}
                  />
                  {errors.profileImageUrl ? (
                    <Text style={styles.errorText}>{errors.profileImageUrl}</Text>
                  ) : null}
                </View>

                {message ? <Text style={styles.messageText}>{message}</Text> : null}

                <Pressable
                  accessibilityRole="button"
                  disabled={!canSubmit || isSubmitting}
                  onPress={handleSubmit}
                  style={[styles.primaryButton, !canSubmit || isSubmitting ? styles.disabledButton : null]}>
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save profile' : 'Create profile'}
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
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
