import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { AUTH_TOKEN_KEY } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
      const role = res.data.user.role;
      Alert.alert('Success', `Welcome, ${res.data.user.name}!`);
      if (role === 'ADMIN') {
        navigation.navigate('AdminDashboard');
      } else if (role === 'COORDINATOR') {
        navigation.navigate('CoordinatorPanel');
      } else {
        navigation.navigate('Events');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#424242"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#424242"
        value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('Feedback')}>
          <Text style={styles.link}>Send Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'System', color: '#F5EFE0', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#212121', borderRadius: 8, padding: 14, color: '#F5EFE0', fontSize: 15, marginBottom: 12 },
  button: { backgroundColor: '#FF5500', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20 },
  link: { color: '#6B6B6B', fontSize: 13 },
});
