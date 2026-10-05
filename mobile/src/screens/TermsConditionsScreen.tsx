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

type Props = NativeStackScreenProps<RootStackParamList, 'TermsConditions'>;

export const TermsConditionsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.badgeRow}>
            <Ionicons name="document-text" size={14} color="#34D399" />
            <Text style={styles.badgeText}>USER AGREEMENT</Text>
          </View>
          <Text style={styles.heroTitle}>Terms & Conditions</Text>
          <Text style={styles.heroSub}>
            Operational rules and standards for Anand Homes construction supervisors and field teams.
          </Text>
          <Text style={styles.versionText}>Effective: October 2026 &bull; Version 2.4</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Acceptance & Authorization</Text>
          <Text style={styles.paragraph}>
            This application is for authorized Anand Homes site supervisors and staff only. Use of this application constitutes agreement with our operational protocols and data standards.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Account Credential Safety</Text>
          <Text style={styles.paragraph}>
            Supervisor credentials are individual and non-transferable. You are responsible for all material inward receipts, outward dispatches, and labour count submissions logged under your ID.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Inward Material Verification</Text>
          <Text style={styles.paragraph}>
            All delivered construction items (cement, steel rebar, aggregates, masonry) must be physically verified prior to digital inward code generation. Generated inward entry codes are immutable audit tokens.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Outward Dispatch & Nature of Work</Text>
          <Text style={styles.paragraph}>
            Materials taken out from site stock must have their certified Nature of Work indicated (Construction, Installation, or Maintenance). Unauthorized removals are prohibited.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Labour Headcount Integrity</Text>
          <Text style={styles.paragraph}>
            Daily manpower numbers directly govern subcontractor invoices and site safety records. Accurate worker count reporting is mandatory under contract terms.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>6. Legal Inquiries & Jurisdiction</Text>
          <Text style={styles.paragraph}>
            Platform terms are governed under Indian jurisdiction (Chennai, Tamil Nadu). For inquiries, contact:
          </Text>
          <Text style={styles.contactEmail}>legal@anandhomes.com</Text>
        </View>

        {/* Link to Privacy */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={styles.linkText}>View Privacy Policy</Text>
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
