import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, Share, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { getStatusStyle } from '../utils/statusStyle';

const BOOKMARKS_KEY = 'shc-bookmarks';

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function EventDetailScreen({ route }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    api.get(`/hackathons/${id}`)
      .then(async (res) => {
        setEvent(res.data);
        api.post(`/analytics/${id}/view`).catch(() => {});
        try {
          const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
          const bookmarks = stored ? JSON.parse(stored) : [];
          setIsBookmarked(bookmarks.includes(id));
        } catch { /* ignore */ }
      })
      .catch(() => Alert.alert('Error', 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleBookmark = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const bookmarks = stored ? JSON.parse(stored) : [];
      const idx = bookmarks.indexOf(id);
      if (idx >= 0) {
        bookmarks.splice(idx, 1);
      } else {
        bookmarks.push(id);
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      setIsBookmarked(prev => !prev);
    } catch { /* ignore */ }
  }, [id]);

  async function handleRegister() {
    if (event?.registrationLink) {
      if (!isValidUrl(event.registrationLink)) {
        Alert.alert('Error', 'Registration link is invalid');
        return;
      }
      await api.post(`/analytics/${id}/click`).catch(() => {});
      Linking.openURL(event.registrationLink).catch(() => Alert.alert('Error', 'Could not open registration link'));
    }
  }

  async function handleShare() {
    if (event) {
      await Share.share({
        message: `Check out ${event.name} at SIMATS Hackathons!\n${Linking.createURL(`events/${event._id}`)}`,
      });
    }
  }

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.centered}><ActivityIndicator size="large" color="#FF5500" /></View></SafeAreaView>;
  if (!event) return <SafeAreaView style={styles.safeArea}><View style={styles.centered}><Text style={{ color: '#6B6B6B' }}>Event not found</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#FF550020' }]}>
              <Text style={[styles.badgeText, { color: '#FF5500' }]}>{event.mode}</Text>
            </View>
            <View style={[styles.badge, getStatusStyle(event.status)]}>
              <Text style={[styles.badgeText, getStatusStyle(event.status)]}>{event.status}</Text>
            </View>
          </View>
          <Text style={styles.title}>{event.name}</Text>
          {event.organizer && <Text style={styles.organizer}>by {event.organizer}</Text>}
        </View>

        <View style={styles.infoGrid}>
          <InfoItem label="Start" value={new Date(event.startDate).toLocaleDateString()} />
          <InfoItem label="End" value={new Date(event.endDate).toLocaleDateString()} />
          <InfoItem label="Location" value={event.location || 'Virtual'} />
          {event.prizePool && <InfoItem label="Prize" value={event.prizePool} />}
        </View>

        {event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {event.themes?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Themes</Text>
            <View style={styles.themeRow}>
              {event.themes.map(t => (
                <View key={t} style={styles.theme}><Text style={styles.themeText}>{t}</Text></View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} accessibilityLabel="Register for this hackathon" accessibilityRole="button">
            <Text style={styles.registerText}>Register Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkBtnActive]}
            onPress={toggleBookmark}
            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            accessibilityRole="button"
            accessibilityState={{ selected: isBookmarked }}
          >
            <Text style={[styles.bookmarkText, isBookmarked && styles.bookmarkTextActive]}>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} accessibilityLabel="Share this hackathon" accessibilityRole="button">
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = React.memo(function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080808' },
  container: { flex: 1, backgroundColor: '#080808' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080808' },
  header: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', fontFamily: 'System', color: '#F5EFE0' },
  organizer: { color: '#6B6B6B', marginTop: 4 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8 },
  infoItem: { backgroundColor: '#0D0D0D', borderRadius: 8, padding: 12, minWidth: '45%', borderWidth: 1, borderColor: '#212121' },
  infoLabel: { color: '#6B6B6B', fontSize: 11, marginBottom: 2 },
  infoValue: { color: '#F5EFE0', fontSize: 14, fontWeight: '600' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'System', color: '#F5EFE0', marginBottom: 8 },
  description: { color: '#6B6B6B', lineHeight: 22 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  theme: { backgroundColor: '#141414', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#212121' },
  themeText: { color: '#6B6B6B', fontSize: 12 },
  actions: { padding: 16, flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 32 },
  registerBtn: { flex: 1, backgroundColor: '#FF5500', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  registerText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  bookmarkBtn: { backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#212121' },
  bookmarkBtnActive: { borderColor: '#FF5500', backgroundColor: '#FF550010' },
  bookmarkText: { color: '#6B6B6B', fontWeight: '600', fontSize: 13 },
  bookmarkTextActive: { color: '#FF5500' },
  shareBtn: { backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#212121' },
  shareText: { color: '#F5EFE0', fontWeight: '600', fontSize: 14 },
});
