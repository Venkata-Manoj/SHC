import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function EventListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');

  useEffect(() => {
    loadEvents();
  }, [search, mode]);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (search) params.search = search;
      if (mode) params.mode = mode;
      const res = await api.get('/hackathons', { params });
      setEvents(res.data.data);
    } catch { /* fallback */ } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status) {
    switch (status) {
      case 'UPCOMING': return { backgroundColor: '#10B98120', color: '#10B981' };
      case 'ONGOING': return { backgroundColor: '#FF550020', color: '#FF5500' };
      default: return { backgroundColor: '#42424220', color: '#424242' };
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput style={styles.input} placeholder="Search hackathons..." placeholderTextColor="#424242"
          value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.filterRow}>
        {['', 'ONLINE', 'OFFLINE', 'HYBRID'].map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)}
            style={[styles.filterBtn, mode === m && styles.filterBtnActive]}>
            <Text style={[styles.filterText, mode === m && styles.filterTextActive]}>{m || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF5500" style={{ marginTop: 40 }} />
      ) : (
        <FlatList data={events} keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventDetail', { id: item._id })}>
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: '#FF550020' }]}>
                  <Text style={[styles.badgeText, { color: '#FF5500' }]}>{item.mode}</Text>
                </View>
                <View style={[styles.badge, getStatusStyle(item.status)]}>
                  <Text style={[styles.badgeText, getStatusStyle(item.status)]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.date}>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</Text>
              {item.prizePool && <Text style={styles.prize}>{item.prizePool}</Text>}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', padding: 16 },
  searchRow: { marginBottom: 12 },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#212121', borderRadius: 8, padding: 12, color: '#F5EFE0', fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#212121' },
  filterBtnActive: { backgroundColor: '#FF5500', borderColor: '#FF5500' },
  filterText: { color: '#6B6B6B', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#080808' },
  card: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#212121' },
  title: { fontSize: 16, fontWeight: '700', fontFamily: 'System', color: '#F5EFE0' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  date: { color: '#6B6B6B', fontSize: 13, marginTop: 8 },
  prize: { color: '#FF5500', fontSize: 14, fontWeight: '700', marginTop: 4 },
});
