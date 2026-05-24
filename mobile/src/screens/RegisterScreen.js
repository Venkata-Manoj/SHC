import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', department: '' });
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (value) => setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      Alert.alert('Error', 'Name, email, and password are required');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      Alert.alert('Success', 'Account created! Please sign in.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the SIMATS Hackathon community</Text>

          <TextInput
            style={styles.input} placeholder="Full Name *" placeholderTextColor="#424242"
            value={form.name} onChangeText={update('name')} autoCapitalize="words"
            accessibilityLabel="Full name"
          />
          <TextInput
            style={styles.input} placeholder="Email *" placeholderTextColor="#424242"
            value={form.email} onChangeText={update('email')} keyboardType="email-address" autoCapitalize="none"
            accessibilityLabel="Email address"
          />
          <TextInput
            style={styles.input} placeholder="Password * (min 8 chars)" placeholderTextColor="#424242"
            value={form.password} onChangeText={update('password')} secureTextEntry
            accessibilityLabel="Password"
          />
          <TextInput
            style={styles.input} placeholder="College / Institution" placeholderTextColor="#424242"
            value={form.college} onChangeText={update('college')}
            accessibilityLabel="College or institution"
          />
          <TextInput
            style={styles.input} placeholder="Department / Major" placeholderTextColor="#424242"
            value={form.department} onChangeText={update('department')}
            accessibilityLabel="Department or major"
          />

          <TouchableOpacity
            style={styles.button} onPress={handleRegister} disabled={loading}
            accessibilityLabel="Create your account" accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back to sign in" accessibilityRole="button">
            <Text style={styles.backText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080808' },
  container: { flex: 1, backgroundColor: '#080808' },
  content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '700', color: '#F5EFE0', marginBottom: 4, textAlign: 'center' },
  subtitle: { color: '#6B6B6B', fontSize: 13, marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#212121', borderRadius: 8, padding: 14, color: '#F5EFE0', fontSize: 15, marginBottom: 12 },
  button: { backgroundColor: '#FF5500', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#FF5500', fontSize: 14 },
});
