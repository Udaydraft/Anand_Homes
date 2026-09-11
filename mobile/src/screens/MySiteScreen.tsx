import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MySite'>;

export const MySiteScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedSite, sites } = useMobileData();

  const site = sites.find((s) => s.name === selectedSite) || sites[0];

  if (!site) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Site</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="business-outline" size={48} color="#94A3B8" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 }}>
            No Site Available
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6 }}>
            There are no sites in the system yet. Please add a site to view its details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Site</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri:
                site.imageUrl ||
                'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80',
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerSiteName}>{site.name}</Text>
            <Text style={styles.bannerProject}>{site.projectType || 'Anna Nagar Residential'}</Text>
          </View>
        </View>

        {/* Site Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Site Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Project Name</Text>
            <Text style={styles.detailValue}>{site.projectType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Site Code</Text>
            <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>{site.code}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{site.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{site.startDate || '12 Jan 2025'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Supervisor</Text>
            <Text style={styles.detailValue}>{site.supervisor}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact</Text>
            <Text style={[styles.detailValue, { color: '#0D5C3A', fontWeight: '800' }]}>
              {site.contact || '98765 43210'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.uploadPhotoBtn}
            onPress={() => navigation.navigate('PhotoMonitoring')}
          >
            <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            <Text style={styles.uploadPhotoText}>Upload Site Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Site Summary Stats Grid */}
        <Text style={styles.summaryTitle}>Site Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={18} color="#0D5C3A" />
            <Text style={styles.statLabel}>Total Materials</Text>
            <Text style={styles.statVal}>{site.totalMaterials}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={18} color="#D97706" />
            <Text style={styles.statLabel}>Stock Value</Text>
            <Text style={styles.statVal}>{site.stockValueFormatted}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="arrow-down-outline" size={18} color="#10B981" />
            <Text style={styles.statLabel}>Today's Stock In</Text>
            <Text style={styles.statVal}>16 Items</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="arrow-up-outline" size={18} color="#EF4444" />
            <Text style={styles.statLabel}>Today's Stock Out</Text>
            <Text style={styles.statVal}>8 Items</Text>
          </View>
        </View>
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
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
  },
  bannerSiteName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bannerProject: {
    color: '#E2E8F0',
    fontSize: 11,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D5C3A',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  uploadPhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
});
