import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const profiles = [
  {
    id: 1,
    name: 'Mira',
    age: 28,
    city: 'Bengaluru',
    bio: 'Loves sunset walks, cozy cafés, and trying new food spots.',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Ayaan',
    age: 30,
    city: 'Mumbai',
    bio: 'Weekend explorer with a big heart and a soft spot for thoughtful conversations.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Rhea',
    age: 26,
    city: 'Delhi',
    bio: 'Dreamer, artist, and always up for a spontaneous late-night coffee run.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
];

export default function ExploreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Discover</Text>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </Pressable>
        </View>

        {profiles.map((profile) => (
          <View key={profile.id} style={styles.card}>
            <Image source={{ uri: profile.image }} style={styles.image} />

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.profileName}>
                  {profile.name}, {profile.age}
                </Text>
                <Text style={styles.location}>{profile.city}</Text>
              </View>

              <Text style={styles.bio}>{profile.bio}</Text>

              <View style={styles.actionRow}>
                <Pressable style={[styles.actionButton, styles.passButton]}>
                  <Text style={styles.passButtonText}>Pass</Text>
                </Pressable>

                <Pressable style={[styles.actionButton, styles.likeButton]}>
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
});
