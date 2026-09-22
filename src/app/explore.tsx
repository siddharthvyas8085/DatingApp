import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError, authenticatedFetch, likeProfile } from '@/services/api';
import { getAuthToken } from '@/services/auth';

type CandidateProfile = {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  bio?: string | null;
  occupation?: string | null;
  city?: string | null;
  profile_image_url?: string | null;
};

const fallbackImage =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80';

function getAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) {
    return 'Age unavailable';
  }

  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return 'Age unavailable';
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return `${age}`;
}

export default function ExploreScreen() {
  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const visibleProfiles = useMemo(() => profiles, [profiles]);

  useEffect(() => {
    const loadProfiles = async () => {
      const token = await getAuthToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const result = await authenticatedFetch<CandidateProfile[]>('/preferences/discover', {
          method: 'GET',
        }, token);
        setProfiles(result ?? []);
        setErrorMessage('');
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message || 'Unable to load candidates right now.');
        } else {
          setErrorMessage('Unable to reach the backend. Please check that the server is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handlePass = (profileId: string, profileName: string) => {
    setFeedbackMessage(`${profileName} passed. Next candidate coming up.`);
    setProfiles((current) => current.filter((profile) => profile.id !== profileId));
  };

  const handleLike = async (profileId: string, profileName: string) => {
    if (processingIds[profileId]) {
      return;
    }

    setProcessingIds((current) => ({ ...current, [profileId]: true }));

    try {
      const response = await likeProfile(profileId);

      if (response.matched) {
        setFeedbackMessage(`It's a match with ${profileName}!`);
      } else if (response.message === 'Like already exists') {
        setFeedbackMessage(`${profileName} is already on your liked list.`);
      } else {
        setFeedbackMessage(`Liked ${profileName}. ${response.message}`);
      }

      setProfiles((current) => current.filter((profile) => profile.id !== profileId));
    } catch (error) {
      const apiError = error instanceof ApiError ? error.message : 'Unable to send like right now.';
      setFeedbackMessage(apiError);
    } finally {
      setProcessingIds((current) => ({ ...current, [profileId]: false }));
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Loading candidates...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorTitle}>We hit a snag</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (visibleProfiles.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>No candidates yet</Text>
        <Text style={styles.emptyText}>Check back soon for more matches.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Discover</Text>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </Pressable>
        </View>

        {feedbackMessage ? <Text style={styles.feedbackText}>{feedbackMessage}</Text> : null}

        {visibleProfiles.map((profile) => (
          <View key={profile.id} style={styles.card}>
            <Image
              source={{ uri: profile.profile_image_url || fallbackImage }}
              style={styles.image}
            />

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.profileName}>
                  {profile.name}, {getAge(profile.date_of_birth)}
                </Text>
                <Text style={styles.location}>{profile.city || 'Location unavailable'}</Text>
              </View>

              <Text style={styles.meta}>{profile.occupation || 'Profession not shared'}</Text>
              <Text style={styles.bio}>{profile.bio || 'No bio added yet.'}</Text>

              <View style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    styles.passButton,
                    processingIds[profile.id] ? styles.disabledAction : null,
                  ]}
                  onPress={() => handlePass(profile.id, profile.name)}
                  disabled={Boolean(processingIds[profile.id])}>
                  <Text style={styles.passButtonText}>Pass</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.likeButton,
                    processingIds[profile.id] ? styles.disabledAction : null,
                  ]}
                  onPress={() => void handleLike(profile.id, profile.name)}
                  disabled={Boolean(processingIds[profile.id])}>
                  <Text style={styles.likeButtonText}>Like</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFF8FB',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8FB',
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: '#FFF8FB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F102A',
  },
  filterButton: {
    backgroundColor: '#FFEAF3',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F8D7E5',
  },
  filterButtonText: {
    color: '#9B3C63',
    fontWeight: '700',
  },
  feedbackText: {
    color: '#7A1F4A',
    backgroundColor: '#FFF0F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5D5E6',
    fontSize: 13,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F8D7E5',
    shadowColor: '#E5488A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 320,
  },
  cardBody: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F102A',
  },
  location: {
    color: '#8C5C72',
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    color: '#8A5E6D',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  bio: {
    color: '#6D4B5E',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  disabledAction: {
    opacity: 0.6,
  },
  passButton: {
    backgroundColor: '#F7E7EE',
  },
  likeButton: {
    backgroundColor: '#D42775',
  },
  passButtonText: {
    color: '#8E466D',
    fontWeight: '700',
  },
  likeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stateTitle: {
    color: '#1F102A',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#775B6A',
    fontSize: 15,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#B42345',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorText: {
    color: '#7E4A5F',
    fontSize: 15,
    textAlign: 'center',
  },
});
