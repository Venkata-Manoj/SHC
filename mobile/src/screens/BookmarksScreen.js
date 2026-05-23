import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const MORE_LINKS = [
  { label: 'Send Feedback', screen: 'Feedback' },
  { label: 'Terms of Service', screen: 'Terms' },
  { label: 'Privacy Policy', screen: 'Privacy' },
];

const BOOKMARKS_KEY = 'shc-bookmarks';

export default function BookmarksScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      setBookmarks(ids);
      if (ids.length > 0) {
        const res = await api.get('/hackathons', { params: { limit: 50 } });
        setEvents(res.data.data.filter(e => ids.includes(e._id)));
      }
    } catch { /* ignore */ }
  }

  async function removeBookmark(id) {
    const updated = bookmarks.filter(b => b !== id);
    setBookmarks(updated);
    setEvents(prev => prev.filter(e => e._id !== id));
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  }

  async function generateShareLink() {
    const base = 'simatshackathon://events?bookmark=';
    const link = bookmarks.map(id => `${base}${id}`).join('&');
    await Share.share({ message: link });
  }

  return (
    <View style={styles.container}>
      {events.length > 0 && (
        <TouchableOpacity style={styles.shareBtn} onPress={generateShareLink}>
          <Text style={styles.shareBtnText}>Share Bookmarked Hackathons</Text>
        </TouchableOpacity>
      )}
      {events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyDesc}>Save hackathons to access them offline</Text>
        </View>
      ) : (
        <FlatList data={events} keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventDetail', { id: item._id })}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.date}>{new Date(item.startDate).toLocaleDateString()}</Text>
              <TouchableOpacity onPress={() => removeBookmark(item._id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
      <View style={styles.moreSection}>
        <Text style={styles.moreTitle}>More</Text>
        {MORE_LINKS.map(link => (
          <TouchableOpacity key={link.screen} style={styles.moreLink} onPress={() => navigation.navigate(link.screen)}>
            <Text style={styles.moreLinkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', padding: 16 },
  shareBtn: { backgroundColor: '#FF5500', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  shareBtnText: { color: '#080808', fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F5EFE0' },
  emptyDesc: { color: '#6B6B6B', marginTop: 4 },
  card: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#212121' },
  title: { fontSize: 16, fontWeight: '700', color: '#F5EFE0' },
  date: { color: '#6B6B6B', fontSize: 13, marginTop: 4 },
  removeBtn: { marginTop: 8, alignSelf: 'flex-start' },
  removeText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  moreSection: { borderTopWidth: 1, borderTopColor: '#212121', paddingTop: 16, marginTop: 8, marginBottom: 32 },
  moreTitle: { fontSize: 14, fontWeight: '700', color: '#F5EFE0', marginBottom: 8 },
  moreLink: { paddingVertical: 10 },
  moreLinkText: { color: '#FF5500', fontSize: 14 },
});
