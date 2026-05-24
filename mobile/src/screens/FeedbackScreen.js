import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import api from '../services/api';

const TYPES = [
  { key: 'FEEDBACK', label: 'Feedback' },
  { key: 'FEATURE_REQUEST', label: 'Feature Request' },
  { key: 'BUG_REPORT', label: 'Bug Report' },
];

export default function FeedbackScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('FEEDBACK');
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    setSending(true);
    try {
      await api.post('/feedback', { name: name || 'Anonymous', email, message, type });
      Alert.alert('Thank you!', 'Your feedback has been submitted');
      setName('');
      setEmail('');
      setMessage('');
      setType('FEEDBACK');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Submission failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Send Feedback</Text>
          <Text style={styles.subtitle}>Help us improve the platform</Text>

          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setType(t.key)}
                style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
                accessibilityLabel={`Select ${t.label}`}
                accessibilityRole="button"
                accessibilityState={{ selected: type === t.key }}
              >
                <Text style={[styles.typeText, type === t.key && styles.typeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.input} placeholder="Your name (optional)" placeholderTextColor="#424242"
            value={name} onChangeText={setName} accessibilityLabel="Your name" />
          <TextInput style={styles.input} placeholder="Your email (optional)" placeholderTextColor="#424242"
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Your email" />
          <TextInput style={[styles.input, styles.messageInput]} placeholder="Your message *" placeholderTextColor="#424242" multiline
            value={message} onChangeText={setMessage} accessibilityLabel="Your message" />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={sending} accessibilityLabel="Submit feedback" accessibilityRole="button">
            <Text style={styles.submitText}>{sending ? 'Sending...' : 'Submit'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080808' },
  container: { flex: 1, backgroundColor: '#080808' },
  title: { fontSize: 22, fontWeight: '700', color: '#F5EFE0', marginBottom: 4 },
  subtitle: { color: '#6B6B6B', fontSize: 13, marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#212121' },
  typeBtnActive: { backgroundColor: '#FF5500', borderColor: '#FF5500' },
  typeText: { color: '#6B6B6B', fontSize: 13, fontWeight: '600' },
  typeTextActive: { color: '#080808' },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#212121', borderRadius: 8, padding: 12, color: '#F5EFE0', fontSize: 14, marginBottom: 12 },
  messageInput: { minHeight: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#FF5500', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#080808', fontWeight: '700', fontSize: 16 },
});
