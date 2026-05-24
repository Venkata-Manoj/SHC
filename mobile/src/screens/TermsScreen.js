import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

const UPDATED = `Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>{UPDATED}</Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.body}>
          By accessing or using SIMATS Hackathon Platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
        </Text>

        <Text style={styles.heading}>2. User Accounts</Text>
        <Text style={styles.body}>
          You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account.
        </Text>

        <Text style={styles.heading}>3. Content Submission</Text>
        <Text style={styles.body}>
          Users may submit hackathon information for review. All submissions are subject to moderation. We reserve the right to reject or remove any content that violates our policies.
        </Text>

        <Text style={styles.heading}>4. Intellectual Property</Text>
        <Text style={styles.body}>
          Hackathon organizers retain ownership of their event content. By submitting content, you grant us a non-exclusive license to display it on the platform.
        </Text>

        <Text style={styles.heading}>5. Limitation of Liability</Text>
        <Text style={styles.body}>
          SIMATS Hackathon Platform is provided "as is" without warranties of any kind. We are not responsible for the accuracy of user-submitted content or for third-party registration links.
        </Text>

        <Text style={styles.heading}>6. Contact</Text>
        <Text style={styles.body}>
          For questions about these terms, contact us at support@simatshackathon.com
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
