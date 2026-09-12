import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { authService } from '../services/auth.service';
import { Site, User } from '@project/shared';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Sites'>;

export const SitesScreen: React.FC<Props> = ({ navigation }) => {
  const { sites, myAssignedSites, roleMode, updateSite, addSite, setSelectedSite } = useMobileData();
  const [search, setSearch] = useState('');
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [assigningSite, setAssigningSite] = useState<Site | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<User | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Create Site Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteCode, setNewSiteCode] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newSiteType, setNewSiteType] = useState('Residential Construction');
  const [newSiteContact, setNewSiteContact] = useState('+91 98765 43210');
  const [newSiteSupervisor, setNewSiteSupervisor] = useState<User | null>(null);
  const [isCreatingSite, setIsCreatingSite] = useState(false);

  useEffect(() => {
    if (roleMode === 'admin') {
      authService
        .listUsers('supervisor')
        .then((users) => {
          if (Array.isArray(users)) setSupervisors(users);
        })
        .catch((e) => console.warn('Fetch supervisors error:', e));
    }
  }, [roleMode]);

  const baseSites = roleMode === 'supervisor' ? myAssignedSites : sites;

  const filtered = baseSites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAssign = (site: Site) => {
    setAssigningSite(site);
    const existing = supervisors.find(
      (u) =>
        (site.supervisorId && u.id === site.supervisorId) ||
        (site.supervisorEmail && u.email.toLowerCase() === site.supervisorEmail.toLowerCase())
    );
    setSelectedSupervisor(existing || null);
  };

  const handleSaveAssignment = async () => {
    if (!assigningSite || !selectedSupervisor) return;
    setIsAssigning(true);
    try {
      await updateSite(assigningSite.id, {
        supervisor: selectedSupervisor.name,
        supervisorEmail: selectedSupervisor.email,
        supervisorId: selectedSupervisor.id,
      });
      setAssigningSite(null);
      setSelectedSupervisor(null);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateSite = async () => {
    if (!newSiteName.trim() || !newSiteLocation.trim()) return;
    setIsCreatingSite(true);
    try {
      await addSite({
        name: newSiteName.trim(),
        code: newSiteCode.trim() || `RBL-S-00${sites.length + 1}`,
        location: newSiteLocation.trim(),
        projectType: newSiteType.trim() || 'Residential Construction',
        supervisor: newSiteSupervisor ? newSiteSupervisor.name : 'Unassigned',
        supervisorId: newSiteSupervisor ? newSiteSupervisor.id : undefined,
        supervisorEmail: newSiteSupervisor ? newSiteSupervisor.email : undefined,
        status: 'Active',
        contact: newSiteContact.trim() || '+91 98765 43210',
      });
      setShowCreateModal(false);
      setNewSiteName('');
      setNewSiteCode('');
      setNewSiteLocation('');
      setNewSiteSupervisor(null);
      setNewSiteContact('+91 98765 43210');
    } finally {
      setIsCreatingSite(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {roleMode === 'supervisor' ? 'My Assigned Sites' : 'Sites / Projects'}
        </Text>
        {roleMode === 'admin' ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setNewSiteCode(`RBL-S-00${sites.length + 1}`);
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add" size={14} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Site</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={roleMode === 'supervisor' ? 'Search my sites...' : 'Search sites, supervisors...'}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Sites List Cards */}
      <ScrollView style={styles.contentList}>
        {filtered.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="business-outline" size={48} color="#94A3B8" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 }}>
              {roleMode === 'supervisor' ? 'No Sites Assigned Yet' : 'No Sites Found'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
              {roleMode === 'supervisor'
                ? 'Your supervisor account has not been assigned to a construction site. Please contact an administrator.'
                : 'No construction sites matched your search.'}
            </Text>
          </View>
        ) : (
          filtered.map((site) => {
            const isAssigned = !!(site.supervisorId || site.supervisorEmail || (site.supervisor && site.supervisor !== 'Unassigned'));
            return (
              <View key={site.id} style={styles.siteCard}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSite(site.name);
                    navigation.navigate('MySite');
                  }}
                >
                  <Image
                    source={{
                      uri:
                        site.imageUrl ||
                        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300&auto=format&fit=crop&q=80',
                    }}
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
                            site.status === 'Active'
                              ? styles.statusActiveText
                              : styles.statusInactiveText,
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

                    {/* Supervisor Row with Assignment State */}
                    <View style={styles.supervisorRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons
                          name="person-outline"
                          size={13}
                          color={isAssigned ? '#0D5C3A' : '#D97706'}
                        />
                        <View style={{ marginLeft: 6 }}>
                          <Text style={[styles.infoText, { fontWeight: '700', color: isAssigned ? '#1E293B' : '#D97706' }]}>
                            {isAssigned ? site.supervisor : '⚠️ Unassigned'}
                          </Text>
                          {site.supervisorEmail ? (
                            <Text style={{ fontSize: 10, color: '#64748B' }}>{site.supervisorEmail}</Text>
                          ) : null}
                        </View>
                      </View>

                      {roleMode === 'admin' && (
                        <TouchableOpacity
                          style={styles.assignBtn}
                          onPress={() => handleOpenAssign(site)}
                        >
                          <Ionicons name="person-add-outline" size={12} color="#0D5C3A" />
                          <Text style={styles.assignBtnText}>Assign</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.statText}>
                        Materials: <Text style={styles.statBold}>{site.totalMaterials}</Text>
                      </Text>
                      <Text style={styles.statText}>
                        Stock Value: <Text style={styles.statBoldGold}>{site.stockValueFormatted}</Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Admin Assign Supervisor Modal */}
      {assigningSite && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Assign Site Supervisor</Text>
                  <Text style={styles.modalSub}>{assigningSite.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setAssigningSite(null)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>
                Select Registered Supervisor:
              </Text>

              <ScrollView style={{ maxHeight: 220 }}>
                {supervisors.length === 0 ? (
                  <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', paddingVertical: 16 }}>
                    No registered supervisor accounts found. Create supervisor users first.
                  </Text>
                ) : (
                  supervisors.map((s) => {
                    const isSelected = selectedSupervisor?.id === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.supervisorItem, isSelected && styles.supervisorItemSelected]}
                        onPress={() => setSelectedSupervisor(s)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.supervisorItemName, isSelected && { color: '#0D5C3A' }]}>
                            {s.name}
                          </Text>
                          <Text style={styles.supervisorItemEmail}>{s.email}</Text>
                        </View>
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color="#0D5C3A" />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setAssigningSite(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, (!selectedSupervisor || isAssigning) && { opacity: 0.6 }]}
                  disabled={!selectedSupervisor || isAssigning}
                  onPress={handleSaveAssignment}
                >
                  {isAssigning ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Save Assignment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Create Site Modal (Admin only) */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create New Project Site</Text>
                <Text style={styles.modalSub}>Add a new construction site to manage</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Site Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Greenfields Phase 2"
                placeholderTextColor="#94A3B8"
                value={newSiteName}
                onChangeText={setNewSiteName}
              />

              <Text style={styles.inputLabel}>Site Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. RBL-S-005"
                placeholderTextColor="#94A3B8"
                value={newSiteCode}
                onChangeText={setNewSiteCode}
              />

              <Text style={styles.inputLabel}>Location / Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tambaram, Chennai"
                placeholderTextColor="#94A3B8"
                value={newSiteLocation}
                onChangeText={setNewSiteLocation}
              />

              <Text style={styles.inputLabel}>Project Type</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Residential Construction"
                placeholderTextColor="#94A3B8"
                value={newSiteType}
                onChangeText={setNewSiteType}
              />

              <Text style={styles.inputLabel}>Site Contact Phone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                value={newSiteContact}
                onChangeText={setNewSiteContact}
              />

              <Text style={styles.inputLabel}>Assign Supervisor</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.supPill,
                    !newSiteSupervisor && styles.supPillActive,
                  ]}
                  onPress={() => setNewSiteSupervisor(null)}
                >
                  <Text style={[styles.supPillText, !newSiteSupervisor && styles.supPillTextActive]}>
                    Unassigned
                  </Text>
                </TouchableOpacity>
                {supervisors.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.supPill,
                      newSiteSupervisor?.id === s.id && styles.supPillActive,
                    ]}
                    onPress={() => setNewSiteSupervisor(s)}
                  >
                    <Text
                      style={[
                        styles.supPillText,
                        newSiteSupervisor?.id === s.id && styles.supPillTextActive,
                      ]}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (!newSiteName.trim() || !newSiteLocation.trim() || isCreatingSite) && { opacity: 0.6 },
                ]}
                disabled={!newSiteName.trim() || !newSiteLocation.trim() || isCreatingSite}
                onPress={handleCreateSite}
              >
                {isCreatingSite ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Create Site</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  supervisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D5C3A',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  supervisorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  supervisorItemSelected: {
    borderColor: '#0D5C3A',
    backgroundColor: '#F0FDF4',
  },
  supervisorItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  supervisorItemEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0D5C3A',
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  supPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0D5C3A',
  },
  supPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  supPillTextActive: {
    color: '#0D5C3A',
    fontWeight: '700',
  },
});
