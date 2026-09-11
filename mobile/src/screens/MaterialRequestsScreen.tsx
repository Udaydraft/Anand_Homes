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

type Props = NativeStackScreenProps<RootStackParamList, 'MaterialRequests'>;

export const MaterialRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { materialRequests } = useMobileData();
  const [tab, setTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  const filtered = materialRequests.filter((r) => tab === 'All' || r.status === tab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Requests</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Requests List */}
      <ScrollView style={styles.list}>
        {filtered.map((req) => (
          <TouchableOpacity
            key={req.id}
            style={styles.card}
            onPress={() => navigation.navigate('RequestDetails', { requestId: req.requestId })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.reqId}>{req.requestId}</Text>
              <View
                style={[
                  styles.statusBadge,
                  req.status === 'Approved'
                    ? styles.statusApproved
                    : req.status === 'Pending'
                    ? styles.statusPending
                    : styles.statusRejected,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    req.status === 'Approved'
                      ? styles.statusTextApproved
                      : req.status === 'Pending'
                      ? styles.statusTextPending
                      : styles.statusTextRejected,
                  ]}
                >
                  {req.status}
                </Text>
              </View>
            </View>

            <Text style={styles.siteText}>{req.site}</Text>
            <Text style={styles.materialText}>
              {req.material} &bull; <Text style={styles.qtyBold}>{req.quantity} {req.unit}</Text>
            </Text>

            <View style={styles.cardBottom}>
              <Text style={styles.dateText}>{req.requestedOn}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StockOut')}
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
  reqId: {
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
  statusApproved: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
  },
  statusRejected: {
    backgroundColor: '#FFF1F2',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  statusTextApproved: {
    color: '#047857',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextRejected: {
    color: '#E11D48',
  },
  siteText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  materialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  qtyBold: {
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
