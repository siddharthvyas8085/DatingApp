import { useState } from 'react';
import { Link } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { checkBackendHealth } from '../services/api';

export default function HomeScreen() {
  const [status, setStatus] = useState('Backend not checked');

  const handleGetStarted = async () => {
    try {
      setStatus('Checking backend...');
      const result = await checkBackendHealth();
      setStatus(`Connected: ${result.status}`);
    } catch (error) {
      console.error('Backend connection error:', error);
      setStatus('Backend unavailable');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.topGlow} />

        <View style={styles.headerRow}>
          <Text style={styles.badge}>Bloom</Text>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconButtonText}>♡</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Meet someone meaningful</Text>
          <Text style={styles.title}>Find your next beautiful chapter.</Text>
          <Text style={styles.subtitle}>
            Thoughtful matches, warm conversations, and moments that feel natural.
          </Text>

          <Pressable style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get started</Text>
          </Pressable>

          <Link href="./register" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </Pressable>
          </Link>

          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileImageWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80' }}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.profileMeta}>
            <Text style={styles.name}>Aisha, 27</Text>
            <Text style={styles.meta}>New Delhi • Loves slow mornings</Text>
          </View>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>Coffee dates</Text>
            <Text style={styles.tag}>Travel</Text>
            <Text style={styles.tag}>Kindness</Text>
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: '#FFF8FB',
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFD9E9',
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A1F4A',
    letterSpacing: 1.2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5F1',
  },
  iconButtonText: {
    fontSize: 20,
    color: '#D42775',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F7D9E6',
    shadowColor: '#D33A7A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  eyebrow: {
    color: '#D33A7A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    color: '#1F102A',
    marginBottom: 12,
  },
  subtitle: {
    color: '#7F6375',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },
  primaryButton: {
    backgroundColor: '#D42775',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFF3F8',
    borderColor: '#F6CFE0',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 14,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#A12761',
    fontSize: 15,
    fontWeight: '700',
  },
  statusText: {
    color: '#6E4C60',
    fontSize: 13,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFF3F8',
    borderRadius: 28,
    padding: 18,
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#F6DCE7',
  },
  profileImageWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FDEAF2',
  },
  profileImage: {
    width: '100%',
    height: 250,
    borderRadius: 22,
  },
  profileMeta: {
    marginTop: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F102A',
  },
  meta: {
    marginTop: 6,
    color: '#7F6375',
    fontSize: 15,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFE9F3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#9B3C63',
    fontSize: 12,
    fontWeight: '600',
  },
});
