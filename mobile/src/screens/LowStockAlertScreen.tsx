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
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'LowStockAlert'>;

export const LowStockAlertScreen: React.FC<Props> = ({ navigation }) => {
  const { lowStockAlerts } = useMobileData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Low Stock Alert</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Warning Banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={20} color="#E11D48" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.bannerTitle}>07 items are below minimum level</Text>
            <Text style={styles.bannerSub}>Immediate requisition needed to avoid work halts</Text>
          </View>
        </View>

        {/* Low Stock Items List */}
        {lowStockAlerts.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.matName}>{item.material}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status} Alert</Text>
              </View>
            </View>

            <Text style={styles.siteText}>{item.site}</Text>

            <View style={styles.stockRow}>
              <Text style={styles.stockLabel}>Current: <Text style={styles.stockBold}>{item.currentStock} {item.unit}</Text></Text>
              <Text style={styles.stockLabel}>Reorder: <Text style={styles.stockBold}>{item.reorderLevel} {item.unit}</Text></Text>
            </View>

            <View style={styles.recBox}>
              <Text style={styles.recTitle}>Recommendation</Text>
              <Text style={styles.recText}>{item.recommendation}</Text>
            </View>

            <TouchableOpacity
              style={styles.reqBtn}
              onPress={() => navigation.navigate('MaterialRequests')}
            >
              <Text style={styles.reqBtnText}>Create Material Request</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.viewReportsBtn}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.viewReportsText}>View All Reports &gt;</Text>
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
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 14,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#BE123C',
  },
  bannerSub: {
    fontSize: 10,
    color: '#E11D48',
    marginTop: 2,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#E11D48',
    fontSize: 10,
    fontWeight: '700',
  },
  siteText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stockLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  stockBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  recBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  recTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  recText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  reqBtn: {
    backgroundColor: '#0D5C3A',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reqBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  viewReportsBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  viewReportsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D5C3A',
  },
});
