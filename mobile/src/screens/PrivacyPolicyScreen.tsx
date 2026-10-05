import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.badgeRow}>
            <Ionicons name="shield-checkmark" size={14} color="#34D399" />
            <Text style={styles.badgeText}>LEGAL & COMPLIANCE</Text>
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSub}>
            How Anand Homes protects and manages your operational and field data.
          </Text>
          <Text style={styles.versionText}>Effective: October 2026 &bull; Version 2.4</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Scope & Application</Text>
          <Text style={styles.paragraph}>
            This Privacy Policy applies to the Anand Homes mobile application utilized by authorized site supervisors, engineers, and project managers.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Information Collected</Text>
          <Text style={styles.paragraph}>
            We collect supervisor authentication details, site assignment tokens, inward material records with auto-generated entry codes, material outward dispatches, and daily labour counts.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Purpose of Processing</Text>
          <Text style={styles.paragraph}>
            Data is strictly processed to track real-time material inventory, calculate project duration timelines, generate Low Stock alerts, and ensure accurate subcontractor labour billing.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Data Security & Encryption</Text>
          <Text style={styles.paragraph}>
            All communications between this mobile app and Anand Homes servers are secured using TLS 1.3 encryption. Passwords and credentials use salted hashes with JWT authentication.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Contact Information</Text>
          <Text style={styles.paragraph}>
            For inquiries regarding your data privacy, contact the Anand Homes Legal Bureau:
          </Text>
          <Text style={styles.contactEmail}>legal@anandhomes.com</Text>
          <Text style={styles.contactAddress}>Anna Nagar Heights, Chennai, Tamil Nadu</Text>
        </View>

        {/* Link to T&C */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('TermsConditions')}
        >
          <Text style={styles.linkText}>View Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={16} color="#0D5C3A" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#0A3925',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#A7F3D0',
    lineHeight: 18,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 10,
    color: '#6EE7B7',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 19,
  },
  contactEmail: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D5C3A',
    marginTop: 6,
  },
  contactAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D5C3A',
  },
});
