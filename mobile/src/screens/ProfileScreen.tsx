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
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { roleMode, toggleRole, selectedSite, myAssignedSites, sites } = useMobileData();
  const { user, logout } = useAuth();

  const displayName = user?.name || (roleMode === 'admin' ? 'Administrator' : 'Site Supervisor');
  const displayEmail = user?.email || (roleMode === 'admin' ? 'admin@anandhomes.com' : 'supervisor@anandhomes.com');
  const roleTitle = roleMode === 'admin' ? 'Super Administrator' : 'Site Supervisor';
  const avatarUrl =
    roleMode === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80';

  const menuItems = [
    { title: 'Personal Information', icon: 'person-outline' as const, sub: displayName },
    { title: 'Registered Email', icon: 'mail-outline' as const, sub: displayEmail },
    { title: 'Assigned Role', icon: 'shield-checkmark-outline' as const, sub: roleTitle },
    { title: 'Help & Support', icon: 'help-circle-outline' as const, sub: 'support@anandhomes.com' },
    { title: 'About Anand Homes', icon: 'information-circle-outline' as const, sub: 'v1.0.0 (Production Build)' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Account</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.emailText}>{displayEmail}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {roleTitle} {roleMode === 'supervisor' && selectedSite ? `• ${selectedSite}` : ''}
            </Text>
          </View>
        </View>

        {/* Assigned Projects Section */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>
            {roleMode === 'supervisor' ? 'My Assigned Project Sites' : 'Construction Sites Oversight'}
          </Text>
          {roleMode === 'supervisor' ? (
            myAssignedSites.length === 0 ? (
              <View style={styles.unassignedBox}>
                <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
                <Text style={styles.unassignedText}>
                  No active site assigned yet. Contact your administrator.
                </Text>
              </View>
            ) : (
              myAssignedSites.map((s) => (
                <View key={s.id} style={styles.siteItem}>
                  <Ionicons name="business" size={16} color="#0D5C3A" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.siteItemName}>{s.name}</Text>
                    <Text style={styles.siteItemLoc}>{s.location}</Text>
                  </View>
                  <View style={styles.siteStatus}>
                    <Text style={styles.siteStatusText}>{s.status}</Text>
                  </View>
                </View>
              ))
            )
          ) : (
            <View style={styles.adminSitesOverview}>
              <Ionicons name="shield-checkmark" size={18} color="#0D5C3A" />
              <Text style={styles.adminSitesText}>
                Full Administrator Access across all {sites.length} construction projects.
              </Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <View key={idx} style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={18} color="#64748B" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            navigation.navigate('Login');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out Account</Text>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#ECFDF5',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  roleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  switchRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D5C3A',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
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
  menuTitle: {
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
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 30,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D5C3A',
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  unassignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  unassignedText: {
    fontSize: 11,
    color: '#B45309',
    flex: 1,
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  siteItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  siteItemLoc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  siteStatus: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  siteStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#047857',
  },
  adminSitesOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  adminSitesText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  menuSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
