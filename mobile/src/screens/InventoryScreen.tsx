import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Inventory'>;

export const InventoryScreen: React.FC<Props> = ({ navigation }) => {
  const { inventory, sites, myAssignedSites, roleMode } = useMobileData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const availableSites = roleMode === 'supervisor' ? myAssignedSites : sites;
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>(
    roleMode === 'supervisor' ? availableSites[0]?.name || '' : 'All Sites'
  );

  useEffect(() => {
    if (roleMode === 'supervisor') {
      if (availableSites.length > 0 && (!selectedSiteFilter || selectedSiteFilter === 'All Sites')) {
        setSelectedSiteFilter(availableSites[0].name);
      }
    }
  }, [roleMode, availableSites]);

  const categories = ['All', 'Cement', 'Steel', 'Aggregate', 'Masonry', 'Finishing', 'Electrical', 'Plumbing'];

  const siteOptions =
    roleMode === 'supervisor'
      ? availableSites.map((s) => s.name)
      : ['All Sites', ...sites.map((s) => s.name)];

  const baseItems =
    roleMode === 'supervisor'
      ? inventory.filter((item) => myAssignedSites.some((s) => s.name === item.site))
      : inventory;

  const filtered = baseItems.filter((item) => {
    const matchCat = category === 'All' || item.category === category;
    const matchSite =
      selectedSiteFilter === 'All Sites' || item.site === selectedSiteFilter;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.site.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSite && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity
          style={styles.stockInBtn}
          onPress={() => navigation.navigate('StockIn')}
        >
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.stockInBtnText}>Stock In</Text>
        </TouchableOpacity>
      </View>

      {/* Site Filter Horizontal Scroll */}
      {siteOptions.length > 0 && (
        <View style={styles.siteFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.siteScroll}>
            {siteOptions.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSelectedSiteFilter(s)}
                style={[styles.sitePill, selectedSiteFilter === s && styles.sitePillActive]}
              >
                <Ionicons
                  name="business-outline"
                  size={12}
                  color={selectedSiteFilter === s ? '#0D5C3A' : '#64748B'}
                />
                <Text style={[styles.sitePillText, selectedSiteFilter === s && styles.sitePillTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search material, brand, site..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Horizontal Category Scroll */}
      <View style={styles.catScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.catPill, category === c && styles.catPillActive]}
            >
              <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory Items List */}
      <ScrollView style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Inventory Items</Text>
            <Text style={styles.emptySub}>
              {roleMode === 'supervisor' && availableSites.length === 0
                ? 'No project site is assigned to your account.'
                : 'No materials found matching your category or site filter.'}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="cube-outline" size={18} color="#0D5C3A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>
                    {item.totalStock} {item.unit} &bull; {item.category}
                  </Text>
                  <Text style={styles.itemSite}>Site: {item.site}</Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View
                  style={[
                    styles.badge,
                    item.status === 'Good'
                      ? styles.badgeGood
                      : item.status === 'Medium'
                      ? styles.badgeMed
                      : styles.badgeLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.status === 'Good'
                        ? styles.badgeTextGood
                        : item.status === 'Medium'
                        ? styles.badgeTextMed
                        : styles.badgeTextLow,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                {item.minStock && (
                  <Text style={styles.minStockText}>Min: {item.minStock} {item.unit}</Text>
                )}
              </View>
            </View>
          ))
        )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
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
  catScrollContainer: {
    paddingBottom: 8,
  },
  catList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: '#0D5C3A',
    borderColor: '#0D5C3A',
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeGood: {
    backgroundColor: '#ECFDF5',
  },
  badgeMed: {
    backgroundColor: '#FFFBEB',
  },
  badgeLow: {
    backgroundColor: '#FFF1F2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextGood: {
    color: '#047857',
  },
  badgeTextMed: {
    color: '#B45309',
  },
  badgeTextLow: {
    color: '#E11D48',
  },
  stockInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D5C3A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockInBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  siteFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  siteScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sitePillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0D5C3A',
  },
  sitePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  sitePillTextActive: {
    color: '#0D5C3A',
    fontWeight: '700',
  },
  itemSite: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  minStockText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
