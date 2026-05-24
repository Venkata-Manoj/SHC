import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
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
      await login(res.data);
      Alert.alert('Success', `Welcome, ${res.data.user.name}!`);
      const role = res.data.user.role;
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
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign In</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#424242"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#424242"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Password"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            accessibilityLabel="Sign in to your account"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
            accessibilityLabel="Create a new account"
            accessibilityRole="button"
          >
            <Text style={styles.registerText}>Create Account</Text>
          </TouchableOpacity>
          <View style={styles.links}>
            <TouchableOpacity onPress={() => navigation.navigate('Feedback')} accessibilityLabel="Send feedback" accessibilityRole="button">
              <Text style={styles.link}>Send Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')} accessibilityLabel="View terms of service" accessibilityRole="button">
              <Text style={styles.link}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Privacy')} accessibilityLabel="View privacy policy" accessibilityRole="button">
              <Text style={styles.link}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080808' },
  container: { flex: 1, backgroundColor: '#080808', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'System', color: '#F5EFE0', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#212121', borderRadius: 8, padding: 14, color: '#F5EFE0', fontSize: 15, marginBottom: 12 },
  button: { backgroundColor: '#FF5500', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  registerBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#212121' },
  registerText: { color: '#F5EFE0', fontWeight: '600', fontSize: 16 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20 },
  link: { color: '#6B6B6B', fontSize: 13 },
});
