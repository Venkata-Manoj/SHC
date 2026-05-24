import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

const UPDATED = `Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>{UPDATED}</Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide when creating an account, including your name, email address, and institutional affiliation. We also collect usage data such as page views and click interactions.
        </Text>

        <Text style={styles.heading}>2. How We Use Information</Text>
        <Text style={styles.body}>
          Your information is used to provide and improve our services, send notifications about hackathons you've bookmarked, and generate anonymous analytics reports.
        </Text>

        <Text style={styles.heading}>3. Data Storage</Text>
        <Text style={styles.body}>
          Your data is stored securely on our servers. We implement industry-standard security measures to protect your personal information.
        </Text>

        <Text style={styles.heading}>4. Third-Party Services</Text>
        <Text style={styles.body}>
          Our platform may contain links to third-party registration sites. We are not responsible for the privacy practices of these external services.
        </Text>

        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.body}>
          You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@simatshackathon.com
        </Text>

        <Text style={styles.heading}>6. Cookies</Text>
        <Text style={styles.body}>
          We use essential cookies for authentication and analytics. You can manage cookie preferences through your browser settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080808' },
  container: { flex: 1, backgroundColor: '#080808' },
  title: { fontSize: 24, fontWeight: '700', color: '#F5EFE0', marginBottom: 4 },
  updated: { color: '#6B6B6B', fontSize: 12, marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: '#F5EFE0', marginTop: 16, marginBottom: 6 },
  body: { color: '#6B6B6B', lineHeight: 20, fontSize: 14 },
});
