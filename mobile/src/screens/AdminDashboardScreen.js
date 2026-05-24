import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      return;
    }
    Promise.all([
      api.get('/analytics').then(r => setAnalytics(r.data)).catch(() => { Alert.alert('Error', 'Failed to load analytics'); }),
      api.get('/submissions?status=PENDING').then(r => setSubmissions(r.data.data)).catch(() => { Alert.alert('Error', 'Failed to load submissions'); }),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleReview(id, status) {
    try {
      await api.patch(`/submissions/${id}/review`, { status });
      setSubmissions(prev => prev.filter(s => s._id !== id));
      Alert.alert('Success', `Submission ${status.toLowerCase()}`);
    } catch (err) {
      Alert.alert('Error', 'Review failed');
    }
  }

  async function handleLogout() {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#FF5500" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Manage hackathons, submissions, and view analytics</Text>

      {analytics && (
        <View style={styles.statsRow}>
          <StatCard label="Hackathons" value={analytics.totals?.hackathons} />
          <StatCard label="Views" value={analytics.totals?.views} />
          <StatCard label="Clicks" value={analytics.totals?.clicks} />
        </View>
      )}

      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('CoordinatorPanel')}>
        <Text style={styles.navBtnText}>Manage Events</Text>
      </TouchableOpacity>

      {submissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Submissions ({submissions.length})</Text>
          {submissions.map(s => (
            <View key={s._id} style={styles.submissionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.submissionName}>{s.hackathonData?.name}</Text>
                <Text style={styles.submissionBy}>by {s.submitterEmail}</Text>
              </View>
              <View style={styles.reviewRow}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleReview(s._id, 'APPROVED')}>
                  <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReview(s._id, 'REJECTED')}>
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value ?? '-'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080808' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#F5EFE0' },
  logoutBtn: { backgroundColor: '#EF444420', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  subtitle: { color: '#6B6B6B', fontSize: 13, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#0D0D0D', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#212121' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#FF5500' },
  statLabel: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
  navBtn: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#212121' },
  navBtnText: { color: '#FF5500', fontWeight: '600', fontSize: 15 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F5EFE0', marginBottom: 8 },
  submissionCard: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#212121' },
  submissionName: { color: '#F5EFE0', fontWeight: '600', fontSize: 14 },
  submissionBy: { color: '#6B6B6B', fontSize: 12, marginTop: 2 },
  reviewRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { backgroundColor: '#10B98120', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  approveText: { color: '#10B981', fontWeight: '600', fontSize: 12 },
  rejectBtn: { backgroundColor: '#EF444420', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  rejectText: { color: '#EF4444', fontWeight: '600', fontSize: 12 },
});
