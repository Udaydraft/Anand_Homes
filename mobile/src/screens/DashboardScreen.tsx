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
import { AnandHomesMobileLogo } from '../components/AnandHomesMobileLogo';
import { MobileStockBarChart } from '../components/MobileStockBarChart';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const {
    roleMode,
    setRoleMode,
    toggleRole,
    selectedSite,
    activities,
    lowStockAlerts,
    materialRequests,
    deliveries,
  } = useMobileData();

  const adminBarData = [
    { day: 'Mon', stockIn: 120, stockOut: 85 },
    { day: 'Tue', stockIn: 160, stockOut: 110 },
    { day: 'Wed', stockIn: 95, stockOut: 130 },
    { day: 'Thu', stockIn: 180, stockOut: 90 },
    { day: 'Fri', stockIn: 140, stockOut: 120 },
    { day: 'Sat', stockIn: 175, stockOut: 70 },
    { day: 'Sun', stockIn: 60, stockOut: 140 },
  ];

  const supervisorBarData = [
    { day: 'Mon', stockIn: 65, stockOut: 35 },
    { day: 'Tue', stockIn: 90, stockOut: 55 },
    { day: 'Wed', stockIn: 110, stockOut: 75 },
    { day: 'Thu', stockIn: 80, stockOut: 95 },
    { day: 'Fri', stockIn: 70, stockOut: 60 },
    { day: 'Sat', stockIn: 85, stockOut: 45 },
    { day: 'Sun', stockIn: 30, stockOut: 20 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('MoreMenu')}>
            <Ionicons name="menu-outline" size={24} color="#0A3925" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <AnandHomesMobileLogo compact />
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Active Persona Badge (Determined by Login) */}
          <View style={[styles.roleSwitchBadge, roleMode === 'supervisor' && styles.roleSwitchSupervisor]}>
            <Text style={styles.roleSwitchText}>
              {roleMode === 'admin' ? 'Admin' : 'Supervisor'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('LowStockAlert')}
          >
            <Ionicons name="notifications-outline" size={20} color="#1E293B" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{
                uri:
                  roleMode === 'admin'
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* =================================================================== */}
        {/* ADMIN MOBILE VIEW (Image 3 Screen 2) */}
        {/* =================================================================== */}
        {roleMode === 'admin' ? (
          <>
            {/* Greeting & Site Selector */}
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greetingSmall}>Hello, Admin 👋</Text>
                <Text style={styles.greetingBig}>Good Morning!</Text>
              </View>

              <TouchableOpacity
                style={styles.siteSelector}
                onPress={() => navigation.navigate('Sites')}
              >
                <Ionicons name="business-outline" size={14} color="#0D5C3A" />
                <Text style={styles.siteSelectorText}>All Sites</Text>
                <Ionicons name="chevron-down" size={12} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 4 Metric Cards (2x2 grid) */}
            <View style={styles.kpiGrid}>
              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('Sites')}
              >
                <Text style={styles.kpiLabel}>Total Sites</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>12</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="business" size={16} color="#0D5C3A" />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('Inventory')}
              >
                <Text style={styles.kpiLabel}>Total Materials</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>68</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="cube" size={16} color="#0D5C3A" />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Stock Value</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>₹24,85,600</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="cash" size={16} color="#D97706" />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('LowStockAlert')}
              >
                <Text style={styles.kpiLabel}>Low Stock Items</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>07</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFF1F2' }]}>
                    <Ionicons name="warning" size={16} color="#E11D48" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Stock Overview (This Week) Chart */}
            <MobileStockBarChart data={adminBarData} stockOutColor="#E5A91E" />

            {/* Quick Summary 4-card row */}
            <Text style={styles.sectionHeading}>Quick Summary</Text>
            <View style={styles.quickSummaryRow}>
              <TouchableOpacity
                style={styles.summaryPill}
                onPress={() => navigation.navigate('MaterialRequests')}
              >
                <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="document-text" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.summaryValue}>08</Text>
                <Text style={styles.summaryLabel}>Pending Requests</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.summaryPill}
                onPress={() => navigation.navigate('Deliveries')}
              >
                <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="car" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.summaryValue}>05</Text>
                <Text style={styles.summaryLabel}>Today's Deliveries</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.summaryPill}
                onPress={() => navigation.navigate('PhotoMonitoring')}
              >
                <View style={[styles.summaryDot, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="camera" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.summaryValue}>42</Text>
                <Text style={styles.summaryLabel}>Photos Uploaded</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.summaryPill}
                onPress={() => navigation.navigate('LowStockAlert')}
              >
                <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.summaryValue}>07</Text>
                <Text style={styles.summaryLabel}>Low Stock</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* =================================================================== */
          /* SUPERVISOR MOBILE VIEW (Image 4 Screen 2) */
          /* =================================================================== */
          <>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greetingSmall}>Hello, Rajesh 👋</Text>
                <Text style={styles.greetingBig}>Good Morning!</Text>
              </View>

              <View style={styles.siteStatusBadge}>
                <View style={styles.activeGreenDot} />
                <Text style={styles.siteStatusText}>{selectedSite}</Text>
              </View>
            </View>

            {/* Weather Widget (Mockup Image 4 screen 2) */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherMain}>
                <Ionicons name="partly-sunny" size={28} color="#F59E0B" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.weatherTemp}>28°C</Text>
                  <Text style={styles.weatherDesc}>Partly Cloudy</Text>
                </View>
              </View>

              <View style={styles.weatherStats}>
                <Text style={styles.weatherStatItem}>💧 Humidity: 62%</Text>
                <Text style={styles.weatherStatItem}>💨 Wind: 12 km/h</Text>
                <Text style={styles.weatherStatItem}>🌧️ Rain: 0%</Text>
              </View>
            </View>

            {/* 4 KPI Cards (Materials, Stock Value, Low Stock, Pending Requests) */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Materials</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>32</Text>
                  <Ionicons name="cube" size={16} color="#0D5C3A" />
                </View>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Stock Value</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>₹8,24,500</Text>
                  <Ionicons name="cash" size={16} color="#D97706" />
                </View>
              </View>

              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('LowStockAlert')}
              >
                <Text style={styles.kpiLabel}>Low Stock Items</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>04</Text>
                  <Ionicons name="warning" size={16} color="#E11D48" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('MaterialRequests')}
              >
                <Text style={styles.kpiLabel}>Pending Requests</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={styles.kpiValue}>03</Text>
                  <Ionicons name="document-text" size={16} color="#2563EB" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Stock Overview Bar Chart */}
            <MobileStockBarChart data={supervisorBarData} stockOutColor="#DC2626" />

            {/* Today's Activity */}
            <View style={styles.activityCard}>
              <Text style={styles.activityHeading}>Today's Activity</Text>
              {activities.map((act) => (
                <View key={act.id} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityText}>{act.text}</Text>
                    <Text style={styles.activitySubtext}>{act.subtext}</Text>
                  </View>
                  <Text style={styles.activityTime}>{act.time}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('MaterialRequests')}
              >
                <Text style={styles.viewAllText}>View All Activity &gt;</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar (Image 3 & 4) */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="home" size={20} color="#0D5C3A" />
          <Text style={[styles.tabLabel, { color: '#0D5C3A', fontWeight: '700' }]}>Dashboard</Text>
        </TouchableOpacity>

        {roleMode === 'admin' ? (
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Sites')}>
            <Ionicons name="business-outline" size={20} color="#64748B" />
            <Text style={styles.tabLabel}>Sites</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MySite')}>
            <Ionicons name="business-outline" size={20} color="#64748B" />
            <Text style={styles.tabLabel}>My Site</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Inventory')}>
          <Ionicons name="cube-outline" size={20} color="#64748B" />
          <Text style={styles.tabLabel}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MaterialRequests')}>
          <Ionicons name="document-text-outline" size={20} color="#64748B" />
          <Text style={styles.tabLabel}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MoreMenu')}>
          <Ionicons name="grid-outline" size={20} color="#64748B" />
          <Text style={styles.tabLabel}>More</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleSwitchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#0D5C3A',
  },
  roleSwitchSupervisor: {
    backgroundColor: '#D97706',
  },
  roleSwitchText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  iconButton: {
    position: 'relative',
    padding: 6,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greetingSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  greetingBig: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  siteSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  siteSelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  siteStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  siteStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  weatherDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  weatherStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  weatherStatItem: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  kpiValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 10,
  },
  quickSummaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  activityHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D5C3A',
    marginRight: 10,
  },
  activityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  activitySubtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  viewAllBtn: {
    paddingTop: 10,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D5C3A',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
});
