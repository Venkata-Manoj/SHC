import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getStatusStyle } from '../utils/statusStyle';

function getEmptyForm() {
  return {
    name: '', startDate: '', endDate: '', registrationLink: '',
    mode: 'ONLINE', location: '', description: '', prizePool: '',
    themes: '', organizer: '',
  };
}

export default function CoordinatorPanelScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(getEmptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'COORDINATOR')) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      return;
    }
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await api.get('/hackathons?limit=50');
      setEvents(res.data.data);
    } catch { Alert.alert('Error', 'Failed to load events'); } finally { setLoading(false); }
  }

  async function handleLogout() {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  function openCreate() {
    setEditId(null);
    setForm(getEmptyForm());
    setModalVisible(true);
  }

  function openEdit(event) {
    setEditId(event._id);
    setForm({
      name: event.name || '',
      startDate: event.startDate ? event.startDate.slice(0, 10) : '',
      endDate: event.endDate ? event.endDate.slice(0, 10) : '',
      registrationLink: event.registrationLink || '',
      mode: event.mode || 'ONLINE',
      location: event.location || '',
      description: event.description || '',
      prizePool: event.prizePool || '',
      themes: Array.isArray(event.themes) ? event.themes.join(', ') : (event.themes || ''),
      organizer: event.organizer || '',
    });
    setModalVisible(true);
  }

  function validateForm() {
    const errors = [];
    if (!form.name.trim()) errors.push('Name is required');
    if (!form.startDate.trim()) errors.push('Start date is required');
    if (!form.endDate.trim()) errors.push('End date is required');
    if (!form.registrationLink.trim()) errors.push('Registration link is required');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) errors.push('Start date must be YYYY-MM-DD format');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.endDate)) errors.push('End date must be YYYY-MM-DD format');
    if (form.name.length > 200) errors.push('Name must be 200 characters or less');
    if (form.description.length > 5000) errors.push('Description must be 5000 characters or less');
    return errors;
  }

  async function handleSave() {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        themes: form.themes.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editId) {
        await api.put(`/hackathons/${editId}`, payload);
      } else {
        await api.post('/hackathons', payload);
      }
      setModalVisible(false);
      Alert.alert('Success', editId ? 'Hackathon updated' : 'Hackathon created');
      loadEvents();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Confirm', 'Delete this hackathon?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/hackathons/${id}`);
          setEvents(prev => prev.filter(e => e._id !== id));
        } catch (err) {
          Alert.alert('Error', 'Delete failed');
        }
      }},
    ]);
  }

  const renderItem = useCallback(({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDate}>{new Date(item.startDate).toLocaleDateString()}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEdit(item)}
          accessibilityLabel={`Edit ${item.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id)}
          accessibilityLabel={`Delete ${item.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), []);

  const keyExtractor = useCallback((item) => item?._id?.toString() ?? Math.random().toString(), []);

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.centered}><ActivityIndicator size="large" color="#FF5500" /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Coordinator Panel</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.createBtn} onPress={openCreate} accessibilityLabel="Create new hackathon" accessibilityRole="button">
              <Text style={styles.createText}>+ New</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} accessibilityLabel="Log out" accessibilityRole="button">
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={events}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editId ? 'Edit Hackathon' : 'New Hackathon'}</Text>

              <TextInput style={styles.input} placeholder="Name *" placeholderTextColor="#424242"
                value={form.name} onChangeText={v => setForm({ ...form, name: v })} accessibilityLabel="Hackathon name" />
              <TextInput style={styles.input} placeholder="Organizer" placeholderTextColor="#424242"
                value={form.organizer} onChangeText={v => setForm({ ...form, organizer: v })} accessibilityLabel="Organizer name" />
              <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD) *" placeholderTextColor="#424242"
                value={form.startDate} onChangeText={v => setForm({ ...form, startDate: v })} accessibilityLabel="Start date" />
              <TextInput style={styles.input} placeholder="End Date (YYYY-MM-DD) *" placeholderTextColor="#424242"
                value={form.endDate} onChangeText={v => setForm({ ...form, endDate: v })} accessibilityLabel="End date" />
              <TextInput style={styles.input} placeholder="Registration Link *" placeholderTextColor="#424242"
                value={form.registrationLink} onChangeText={v => setForm({ ...form, registrationLink: v })} accessibilityLabel="Registration link" />
              <TextInput style={styles.input} placeholder="Mode (ONLINE/OFFLINE/HYBRID)" placeholderTextColor="#424242"
                value={form.mode} onChangeText={v => setForm({ ...form, mode: v })} accessibilityLabel="Event mode" />
              <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#424242"
                value={form.location} onChangeText={v => setForm({ ...form, location: v })} accessibilityLabel="Location" />
              <TextInput style={styles.input} placeholder="Prize Pool" placeholderTextColor="#424242"
                value={form.prizePool} onChangeText={v => setForm({ ...form, prizePool: v })} accessibilityLabel="Prize pool" />
              <TextInput style={styles.input} placeholder="Themes (comma separated)" placeholderTextColor="#424242"
                value={form.themes} onChangeText={v => setForm({ ...form, themes: v })} accessibilityLabel="Themes" />
              <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="Description" placeholderTextColor="#424242" multiline
                value={form.description} onChangeText={v => setForm({ ...form, description: v })} accessibilityLabel="Description" />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} accessibilityLabel={editId ? 'Update hackathon' : 'Create hackathon'} accessibilityRole="button">
                  <Text style={styles.saveText}>{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel" accessibilityRole="button">
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080808' },
  container: { flex: 1, backgroundColor: '#080808', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080808' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#F5EFE0' },
  headerActions: { flexDirection: 'row', gap: 8 },
  createBtn: { backgroundColor: '#FF5500', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  createText: { color: '#080808', fontWeight: '700', fontSize: 14 },
  logoutBtn: { backgroundColor: '#EF444420', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  card: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#212121' },
  cardTitle: { color: '#F5EFE0', fontSize: 15, fontWeight: '600' },
  cardDate: { color: '#6B6B6B', fontSize: 12, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editBtn: { backgroundColor: '#FF550020', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editText: { color: '#FF5500', fontWeight: '600', fontSize: 12 },
  deleteBtn: { backgroundColor: '#EF444420', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0D0D0D', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F5EFE0', marginBottom: 16 },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#212121', borderRadius: 8, padding: 12, color: '#F5EFE0', fontSize: 14, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  saveBtn: { flex: 1, backgroundColor: '#FF5500', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  cancelBtn: { flex: 1, backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#212121' },
  cancelText: { color: '#F5EFE0', fontWeight: '600', fontSize: 16 },
});
