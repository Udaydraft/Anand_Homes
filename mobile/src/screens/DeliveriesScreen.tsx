import React, { useState } from 'react';
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
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Deliveries'>;

export const DeliveriesScreen: React.FC<Props> = ({ navigation }) => {
  const { deliveries } = useMobileData();
  const [tab, setTab] = useState<'All' | 'Expected' | 'Received' | 'Cancelled'>('Received');

  const filtered = deliveries.filter((d) => tab === 'All' || d.status === tab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['All', 'Expected', 'Received', 'Cancelled'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Deliveries List */}
      <ScrollView style={styles.list}>
        {filtered.map((dlv) => (
          <TouchableOpacity
            key={dlv.id}
            style={styles.card}
            onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: dlv.deliveryId })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.dlvId}>{dlv.deliveryId}</Text>
              <View
                style={[
                  styles.statusBadge,
                  dlv.status === 'Received' ? styles.statusRec : styles.statusExp,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    dlv.status === 'Received' ? styles.statusRecText : styles.statusExpText,
                  ]}
                >
                  {dlv.status}
                </Text>
              </View>
            </View>

            <Text style={styles.supplierText}>{dlv.supplier}</Text>
            <Text style={styles.siteSub}>{dlv.site}</Text>

            <View style={styles.materialRow}>
              <Text style={styles.matName}>{dlv.material}</Text>
              <Text style={styles.qtyText}>
                {dlv.receivedQty} / {dlv.expectedQty} {dlv.unit}
              </Text>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.dateText}>{dlv.receivedOn || dlv.expectedDate}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Delivery Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StockIn')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#0D5C3A',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dlvId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusRec: {
    backgroundColor: '#ECFDF5',
  },
  statusExp: {
    backgroundColor: '#EFF6FF',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  statusRecText: {
    color: '#047857',
  },
  statusExpText: {
    color: '#1D4ED8',
  },
  supplierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  siteSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  matName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D5C3A',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D5C3A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
