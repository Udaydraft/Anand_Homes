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

type Props = NativeStackScreenProps<RootStackParamList, 'DeliveryDetails'>;

export const DeliveryDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const { deliveries } = useMobileData();

  const dlv = deliveries.find((d) => d.deliveryId === deliveryId || d.id === deliveryId) || deliveries[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Banner */}
        <View style={styles.idBanner}>
          <Text style={styles.dlvId}>{dlv.deliveryId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{dlv.status}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Supplier</Text>
            <Text style={styles.value}>{dlv.supplier}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Site</Text>
            <Text style={styles.value}>{dlv.site}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Material</Text>
            <Text style={styles.value}>{dlv.material}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expected</Text>
            <Text style={styles.value}>
              {dlv.expectedQty} {dlv.unit}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Received</Text>
            <Text style={[styles.value, { color: '#0D5C3A', fontWeight: '800' }]}>
              {dlv.receivedQty} {dlv.unit}
            </Text>
          </View>

          {/* Shortage Highlight in Red */}
          {dlv.shortage && (
            <View style={styles.shortageRow}>
              <Text style={styles.shortageLabel}>Shortage</Text>
              <Text style={styles.shortageValue}>{dlv.shortage}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Invoice No.</Text>
            <Text style={[styles.value, { fontFamily: 'monospace' }]}>{dlv.invoiceNo || 'INV-2025-00123'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Received On</Text>
            <Text style={styles.value}>{dlv.receivedOn || '28 May 2025, 10:42 AM'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Received By</Text>
            <Text style={styles.value}>{dlv.receivedBy || 'Rajesh Kumar'}</Text>
          </View>

          {/* Proof Photos */}
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Verification Photos</Text>
            <View style={styles.photoGrid}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
                }}
                style={styles.photoThumb}
              />
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=300&auto=format&fit=crop&q=80',
                }}
                style={styles.photoThumb}
              />
            </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  idBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dlvId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 11,
    color: '#64748B',
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  shortageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF1F2',
    borderRadius: 6,
    marginVertical: 4,
  },
  shortageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  shortageValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E11D48',
  },
  photoSection: {
    paddingTop: 12,
  },
  photoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
