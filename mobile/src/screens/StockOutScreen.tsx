import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'StockOut'>;

export const StockOutScreen: React.FC<Props> = ({ navigation }) => {
  const { addStockOut, sites, myAssignedSites, roleMode, inventory } = useMobileData();

  const availableSites = roleMode === 'supervisor' ? myAssignedSites : sites;

  const [site, setSite] = useState(availableSites[0]?.name || '');
  const [material, setMaterial] = useState('Cement');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState('Bags');
  const [usedFor, setUsedFor] = useState('Foundation Work');
  const [requestedBy, setRequestedBy] = useState('Site Supervisor');
  const [notes, setNotes] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);

  useEffect(() => {
    if (!site && availableSites.length > 0) {
      setSite(availableSites[0].name);
    }
  }, [availableSites, site]);

  const currentItem = inventory.find(
    (i) => i.name.toLowerCase() === material.toLowerCase() && i.site === site
  );
  const availableStock = currentItem ? currentItem.totalStock : 0;

  const handleIssue = () => {
    if (!site) return;
    addStockOut({
      site,
      material,
      quantity: parseFloat(quantity) || 0,
      unit,
      usedFor,
      requestedBy,
      notes,
    });
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Out</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {availableSites.length === 0 ? (
          <View style={styles.unassignedCard}>
            <Ionicons name="alert-circle-outline" size={48} color="#D97706" />
            <Text style={styles.unassignedTitle}>No Project Site Assigned</Text>
            <Text style={styles.unassignedText}>
              {roleMode === 'supervisor'
                ? 'Your account is not assigned to any construction site. An administrator must assign a site to you before recording stock disbursements.'
                : 'No construction sites available in the system yet. Please add a site first.'}
            </Text>
            <TouchableOpacity style={styles.unassignedBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.unassignedBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Site *</Text>
              <TouchableOpacity style={styles.pickerBox} onPress={() => setShowSiteModal(true)}>
                <Text style={[styles.pickerText, !site && { color: '#94A3B8' }]}>
                  {site || 'Select site...'}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material *</Text>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerText}>{material}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
          </View>

          {/* Available Stock Pill */}
          <View style={styles.stockBadgeRow}>
            <Text style={styles.stockBadgeLabel}>Available Stock:</Text>
            <View style={styles.stockPill}>
              <Text style={styles.stockPillText}>{availableStock} {unit}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Issue Quantity *</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.pickerBox}>
                <Text style={styles.pickerText}>{unit}</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Used For *</Text>
            <TextInput
              value={usedFor}
              onChangeText={setUsedFor}
              placeholder="e.g. Foundation Work"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requested By / Contractor *</Text>
            <TextInput
              value={requestedBy}
              onChangeText={setRequestedBy}
              style={styles.input}
            />
          </View>

          {/* Upload Photo Tap Area */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Work Stage Photo (Optional)</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => setPhotoUploaded(!photoUploaded)}
            >
              <Ionicons
                name={photoUploaded ? 'checkmark-circle' : 'camera-outline'}
                size={24}
                color="#0D5C3A"
              />
              <Text style={styles.uploadText}>
                {photoUploaded ? 'Photo attached ✓' : 'Tap to upload'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 60 }]}
            />
          </View>

          <TouchableOpacity style={styles.issueBtn} onPress={handleIssue}>
            <Text style={styles.issueBtnText}>Issue Material</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>

      {/* Site Selection Modal */}
      {showSiteModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Project Site</Text>
                <TouchableOpacity onPress={() => setShowSiteModal(false)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 240 }}>
                {availableSites.map((s) => {
                  const isSelected = site === s.name;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.siteItem, isSelected && styles.siteItemSelected]}
                      onPress={() => {
                        setSite(s.name);
                        setShowSiteModal(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.siteItemName, isSelected && { color: '#0D5C3A' }]}>
                          {s.name}
                        </Text>
                        <Text style={styles.siteItemSub}>{s.code} • {s.location}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#0D5C3A" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
  },
  pickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  stockBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stockBadgeLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  stockPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    color: '#1E293B',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  issueBtn: {
    backgroundColor: '#0D5C3A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  issueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  unassignedCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  unassignedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 12,
    marginBottom: 6,
  },
  unassignedText: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  unassignedBtn: {
    backgroundColor: '#0D5C3A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  unassignedBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  siteItem: {
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
  siteItemSelected: {
    borderColor: '#0D5C3A',
    backgroundColor: '#F0FDF4',
  },
  siteItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  siteItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
