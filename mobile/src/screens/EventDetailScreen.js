import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, Share, Alert } from 'react-native';
import api from '../services/api';

export default function EventDetailScreen({ route }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/hackathons/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => Alert.alert('Error', 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRegister() {
    if (event?.registrationLink) {
      await api.post(`/analytics/${id}/click`).catch(() => {});
      Linking.openURL(event.registrationLink);
    }
  }

  async function handleShare() {
    if (event) {
      await Share.share({
        message: `Check out ${event.name} at SIMATS Hackathons!\n${Linking.createURL(`events/${event._id}`)}`,
      });
    }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#FF5500" /></View>;
  if (!event) return <View style={styles.centered}><Text style={{ color: '#6B6B6B' }}>Event not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: '#FF550020' }]}>
            <Text style={[styles.badgeText, { color: '#FF5500' }]}>{event.mode}</Text>
          </View>
          <View style={[styles.badge, {
            backgroundColor: event.status === 'UPCOMING' ? '#10B98120' : event.status === 'ONGOING' ? '#FF550020' : '#42424220'
          }]}>
            <Text style={[styles.badgeText, {
              color: event.status === 'UPCOMING' ? '#10B981' : event.status === 'ONGOING' ? '#FF5500' : '#424242'
            }]}>{event.status}</Text>
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
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Register Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  shareBtn: { backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', borderWidth: 1, borderColor: '#212121' },
  shareText: { color: '#F5EFE0', fontWeight: '600', fontSize: 16 },
});
