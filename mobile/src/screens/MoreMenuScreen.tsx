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
import { useAuth } from '../hooks/useAuth';
import { AnandHomesMobileLogo } from '../components/AnandHomesMobileLogo';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MoreMenu'>;

export const MoreMenuScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { roleMode, toggleRole } = useMobileData();

  const menuItems: {
    label: string;
    screen: keyof RootStackParamList;
    icon: any;
  }[] = [
    { label: 'Dashboard', screen: 'Dashboard', icon: 'home-outline' },
    roleMode === 'admin'
      ? { label: 'Sites / Projects', screen: 'Sites', icon: 'business-outline' }
      : { label: 'My Site', screen: 'MySite', icon: 'business-outline' },
    { label: 'Inventory', screen: 'Inventory', icon: 'cube-outline' },
    { label: 'Stock In', screen: 'StockIn', icon: 'arrow-down-circle-outline' },
    { label: 'Stock Out', screen: 'StockOut', icon: 'arrow-up-circle-outline' },
    { label: 'Material Requests', screen: 'MaterialRequests', icon: 'document-text-outline' },
    { label: 'Deliveries', screen: 'Deliveries', icon: 'car-outline' },
    { label: 'Photo Monitoring', screen: 'PhotoMonitoring', icon: 'camera-outline' },
    { label: 'Low Stock Alerts', screen: 'LowStockAlert', icon: 'alert-circle-outline' },
    { label: 'Interactive Map View', screen: 'SiteMapView', icon: 'map-outline' },
    { label: 'Reports & Analytics', screen: 'Reports', icon: 'pie-chart-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More Options</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Brand Banner */}
        <View style={styles.brandBox}>
          <AnandHomesMobileLogo />
          <View style={styles.roleToggle}>
            <Text style={styles.roleToggleText}>
              Logged in as: <Text style={{ color: '#E5A91E' }}>{user?.name || (roleMode === 'admin' ? 'Super Admin' : 'Site Supervisor')}</Text>
            </Text>
          </View>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuRow}
              onPress={() => navigation.navigate(item.screen as any)}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={18} color="#0D5C3A" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            navigation.navigate('Login');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
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
  brandBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  roleToggle: {
    marginTop: 10,
    backgroundColor: '#0A3925',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleToggleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
});
