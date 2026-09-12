import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MaterialRequests'>;

export const MaterialRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { materialRequests, myAssignedSites, sites, roleMode, createRequest } = useMobileData();
  const [tab, setTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [search, setSearch] = useState('');

  // Create Request Modal State
  const [showModal, setShowModal] = useState(false);
  const availableSites = roleMode === 'supervisor' ? myAssignedSites : sites;
  const [site, setSite] = useState(availableSites[0]?.name || '');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Bags');
  const [purpose, setPurpose] = useState('');
  const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter requests by role-based assigned sites
  const baseRequests =
    roleMode === 'supervisor'
      ? materialRequests.filter((r) => myAssignedSites.some((s) => s.name === r.site))
      : materialRequests;

  const filtered = baseRequests.filter((r) => {
    const matchTab = tab === 'All' || r.status === tab;
    const matchSearch =
      r.requestId.toLowerCase().includes(search.toLowerCase()) ||
      r.material.toLowerCase().includes(search.toLowerCase()) ||
      r.site.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleOpenCreate = () => {
    if (availableSites.length > 0 && !site) {
      setSite(availableSites[0].name);
    }
    setShowModal(true);
  };

  const handleCreateSubmit = async () => {
    if (!site || !material.trim() || !quantity) return;
    setIsSubmitting(true);
    try {
      await createRequest({
        site,
        material: material.trim(),
        quantity: parseFloat(quantity) || 1,
        unit,
        purpose: purpose.trim() || 'General Construction',
        requiredDate,
        notes: notes.trim() || undefined,
      });
      setShowModal(false);
      setMaterial('');
      setQuantity('');
      setPurpose('');
      setNotes('');
      setTab('Pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  const units = ['Bags', 'Tons', 'Kg', 'Sq.Ft', 'Units', 'Loads', 'Litres'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Requests</Text>
        <TouchableOpacity style={styles.headerNewBtn} onPress={handleOpenCreate}>
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.headerNewBtnText}>New Indent</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search indent ID, material, site..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>
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
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Material Requests</Text>
            <Text style={styles.emptySub}>
              {roleMode === 'supervisor' && availableSites.length === 0
                ? 'No project site is assigned to your supervisor account.'
                : 'No material indents match your selected tab or search query.'}
            </Text>
          </View>
        ) : (
          filtered.map((req) => (
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
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenCreate}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Material Request Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Material Indent</Text>
                <Text style={styles.modalSub}>Request construction materials for your site</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {availableSites.length === 0 ? (
                <View style={styles.warnCard}>
                  <Ionicons name="alert-circle" size={18} color="#D97706" />
                  <Text style={styles.warnText}>
                    No project site assigned. Contact administrator to request materials.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Select Project Site *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {availableSites.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.chip, site === s.name && styles.chipActive]}
                        onPress={() => setSite(s.name)}
                      >
                        <Text style={[styles.chipText, site === s.name && styles.chipTextActive]}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Material Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. UltraTech Cement 53 Grade"
                    placeholderTextColor="#94A3B8"
                    value={material}
                    onChangeText={setMaterial}
                  />

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Quantity *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 50"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Unit</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 2 }}>
                        {units.map((u) => (
                          <TouchableOpacity
                            key={u}
                            style={[styles.unitChip, unit === u && styles.unitChipActive]}
                            onPress={() => setUnit(u)}
                          >
                            <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
                              {u}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Work Purpose / Area</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2nd Floor Column Casting"
                    placeholderTextColor="#94A3B8"
                    value={purpose}
                    onChangeText={setPurpose}
                  />

                  <Text style={styles.inputLabel}>Required Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={requiredDate}
                    onChangeText={setRequiredDate}
                  />

                  <Text style={styles.inputLabel}>Additional Notes</Text>
                  <TextInput
                    style={[styles.input, { height: 60 }]}
                    placeholder="Any supplier or specification remarks..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (!site || !material.trim() || !quantity || isSubmitting) && { opacity: 0.6 },
                ]}
                disabled={!site || !material.trim() || !quantity || isSubmitting}
                onPress={handleCreateSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Request</Text>
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
  headerNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D5C3A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerNewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    height: '100%',
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0D5C3A',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#0D5C3A',
    fontWeight: '700',
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0D5C3A',
  },
  unitChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  unitChipTextActive: {
    color: '#0D5C3A',
    fontWeight: '700',
  },
  warnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  warnText: {
    fontSize: 12,
    color: '#B45309',
    flex: 1,
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
});
