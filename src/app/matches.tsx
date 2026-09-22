import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError, authenticatedFetch, getCurrentUser, getMyMatches } from '@/services/api';
import { getAuthToken } from '@/services/auth';

type MatchRecord = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

type MatchUserProfile = {
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

export default function MatchesScreen() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MatchUserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      const token = await getAuthToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setCurrentUserId(user.id);

        const matchRecords = await getMyMatches(token);
        setMatches(matchRecords ?? []);

        const profileMap: Record<string, MatchUserProfile> = {};

        for (const match of matchRecords ?? []) {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          if (profileMap[otherUserId] || otherUserId === user.id) {
            continue;
          }

          try {
            const profile = await authenticatedFetch<MatchUserProfile>(`/profiles/${otherUserId}`, {
              method: 'GET',
            }, token);
            profileMap[otherUserId] = profile;
          } catch {
            // Ignore individual profile fetch failures and keep the match row visible.
          }
        }

        setProfiles(profileMap);
        setErrorMessage('');
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message || 'Unable to load your matches right now.');
        } else {
          setErrorMessage('Unable to reach the backend. Please check that the server is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [matches]);

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Loading matches...</Text>
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

  if (sortedMatches.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>No matches yet</Text>
        <Text style={styles.emptyText}>Start liking profiles to create your first match.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Matches</Text>

        {sortedMatches.map((match) => {
          const otherUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
          const profile = profiles[otherUserId];

          return (
            <Pressable
              key={match.id}
              style={styles.matchCard}
              onPress={() => {
                router.push({
                  pathname: '/chat',
                  params: {
                    matchId: match.id,
                    otherUserId: otherUserId,
                    otherUserName: profile?.name || 'Matched user',
                  },
                });
              }}>
              <Image
                source={{ uri: profile?.profile_image_url || fallbackImage }}
                style={styles.image}
              />

              <View style={styles.cardBody}>
                <Text style={styles.matchName}>
                  {profile?.name || 'Matched user'}, {profile ? getAge(profile.date_of_birth) : 'Age unavailable'}
                </Text>
                <Text style={styles.matchMeta}>{profile?.city || 'Location unavailable'}</Text>
                <Text style={styles.matchBio} numberOfLines={2}>
                  {profile?.bio || 'You matched! Start a conversation when chat is ready.'}
                </Text>
              </View>
            </Pressable>
          );
        })}
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
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F102A',
    marginBottom: 18,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F8D7E5',
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#E5488A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  image: {
    width: 110,
    height: 110,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  matchName: {
    color: '#1F102A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  matchMeta: {
    color: '#9C5E72',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  matchBio: {
    color: '#6D4B5E',
    fontSize: 14,
    lineHeight: 20,
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
