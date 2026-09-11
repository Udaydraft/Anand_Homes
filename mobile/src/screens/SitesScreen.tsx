import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Sites'>;

export const SitesScreen: React.FC<Props> = ({ navigation }) => {
  const { sites } = useMobileData();
  const [search, setSearch] = useState('');

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sites / Projects</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Site</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search sites..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={18} color="#0D5C3A" />
        </TouchableOpacity>
      </View>

      {/* Sites List Cards */}
      <ScrollView style={styles.contentList}>
        {filtered.map((site) => (
          <TouchableOpacity
            key={site.id}
            style={styles.siteCard}
            onPress={() => navigation.navigate('MySite')}
          >
            <Image
              source={{ uri: site.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300&auto=format&fit=crop&q=80' }}
              style={styles.siteImage}
            />

            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.siteName}>{site.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    site.status === 'Active' ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      site.status === 'Active' ? styles.statusActiveText : styles.statusInactiveText,
                    ]}
                  >
                    {site.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.projectType}>{site.projectType || 'Residential Project'}</Text>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={13} color="#64748B" />
                <Text style={styles.infoText}>{site.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={13} color="#64748B" />
                <Text style={styles.infoText}>Supervisor: {site.supervisor}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.statText}>Materials: <Text style={styles.statBold}>{site.totalMaterials}</Text></Text>
                <Text style={styles.statText}>Stock Value: <Text style={styles.statBoldGold}>{site.stockValueFormatted}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D5C3A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    gap: 6,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  siteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    overflow: 'hidden',
  },
  siteImage: {
    width: 90,
    height: '100%',
    minHeight: 110,
  },
  cardBody: {
    flex: 1,
    padding: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  siteName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  statusActiveText: {
    color: '#047857',
  },
  statusInactiveText: {
    color: '#64748B',
  },
  projectType: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  infoText: {
    fontSize: 10,
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statText: {
    fontSize: 10,
    color: '#64748B',
  },
  statBold: {
    fontWeight: '800',
    color: '#1E293B',
  },
  statBoldGold: {
    fontWeight: '800',
    color: '#0D5C3A',
  },
});
