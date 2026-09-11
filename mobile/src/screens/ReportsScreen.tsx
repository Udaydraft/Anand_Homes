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

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const reportsList = [
    { title: 'Stock Summary Report', icon: 'layers-outline' as const },
    { title: 'Stock Movement Report', icon: 'swap-horizontal-outline' as const },
    { title: 'Consumption Report', icon: 'document-text-outline' as const },
    { title: 'Purchase Report', icon: 'cart-outline' as const },
    { title: 'Site Wise Report', icon: 'business-outline' as const },
    { title: 'Low Stock Report', icon: 'warning-outline' as const },
    { title: 'Material Request Report', icon: 'file-tray-full-outline' as const },
    { title: 'Delivery Report', icon: 'car-outline' as const },
    { title: 'Photo Report', icon: 'camera-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {reportsList.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.reportRow}>
              <View style={styles.leftRow}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon} size={18} color="#0D5C3A" />
                </View>
                <Text style={styles.reportTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
});
