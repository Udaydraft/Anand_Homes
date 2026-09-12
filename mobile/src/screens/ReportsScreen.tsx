import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMobileData } from '../context/MobileDataContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { sites, inventory, materialRequests, deliveries, lowStockAlerts, myAssignedSites, roleMode } =
    useMobileData();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const baseSites = roleMode === 'supervisor' ? myAssignedSites : sites;
  const baseInventory =
    roleMode === 'supervisor'
      ? inventory.filter((i) => myAssignedSites.some((s) => s.name === i.site))
      : inventory;
  const baseRequests =
    roleMode === 'supervisor'
      ? materialRequests.filter((r) => myAssignedSites.some((s) => s.name === r.site))
      : materialRequests;
  const baseDeliveries =
    roleMode === 'supervisor'
      ? deliveries.filter((d) => myAssignedSites.some((s) => s.name === d.site))
      : deliveries;

  const totalStockValue = baseSites.reduce((acc, s) => acc + (s.stockValue || 0), 0);
  const formattedStockValue =
    totalStockValue >= 10000000
      ? `₹${(totalStockValue / 10000000).toFixed(2)} Cr`
      : totalStockValue >= 100000
      ? `₹${(totalStockValue / 100000).toFixed(2)} L`
      : `₹${totalStockValue.toLocaleString()}`;

  const reportsList = [
    {
      title: 'Stock Summary Report',
      desc: 'Consolidated materials and quantities across active construction sites',
      icon: 'layers-outline' as const,
      dataCount: `${baseInventory.length} materials tracked`,
    },
    {
      title: 'Stock Movement Report',
      desc: 'Inbound deliveries and field disbursements by project site',
      icon: 'swap-horizontal-outline' as const,
      dataCount: `${baseDeliveries.length + baseRequests.length} stock transactions`,
    },
    {
      title: 'Consumption Report',
      desc: 'Material allocation and usage for site execution blocks',
      icon: 'document-text-outline' as const,
      dataCount: `${baseRequests.filter((r) => r.status === 'Approved').length} completed indents`,
    },
    {
      title: 'Site Wise Report',
      desc: 'Project-level breakdown of materials and inventory valuations',
      icon: 'business-outline' as const,
      dataCount: `${baseSites.length} project sites`,
    },
    {
      title: 'Low Stock Report',
      desc: 'Critical safety buffer items requiring emergency requisition',
      icon: 'warning-outline' as const,
      dataCount: `${lowStockAlerts.length} items below minimum buffer`,
    },
    {
      title: 'Material Request Report',
      desc: 'Full status audit of supervisor indents and approvals',
      icon: 'file-tray-full-outline' as const,
      dataCount: `${baseRequests.length} indents recorded`,
    },
    {
      title: 'Delivery Report',
      desc: 'Vendor shipments, verified invoices, and transit status',
      icon: 'car-outline' as const,
      dataCount: `${baseDeliveries.length} supplier shipments`,
    },
  ];

  const handleExport = (title: string) => {
    Alert.alert(
      'Report Exported',
      `"${title}" data summary has been compiled and saved. (${new Date().toLocaleDateString('en-GB')})`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* KPI Quick Banner */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{baseInventory.length}</Text>
            <Text style={styles.kpiLabel}>Materials Tracked</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: '#0D5C3A' }]}>{formattedStockValue}</Text>
            <Text style={styles.kpiLabel}>Stock Valuation</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: '#B45309' }]}>
              {baseRequests.filter((r) => r.status === 'Pending').length}
            </Text>
            <Text style={styles.kpiLabel}>Pending Indents</Text>
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.card}>
          {reportsList.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.reportRow}
              onPress={() => setSelectedReport(item.title)}
            >
              <View style={styles.leftRow}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon} size={18} color="#0D5C3A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>{item.title}</Text>
                  <Text style={styles.reportDesc}>{item.desc}</Text>
                  <Text style={styles.reportMeta}>{item.dataCount}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Report Preview Modal */}
      {selectedReport && (
        <Modal
          visible={!!selectedReport}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedReport(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, { maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selectedReport}</Text>
                  <Text style={styles.modalSub}>
                    Live generated breakdown &bull; {new Date().toLocaleDateString('en-GB')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedReport(null)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 340 }}>
                {selectedReport.includes('Request') ? (
                  baseRequests.length === 0 ? (
                    <Text style={styles.noDataText}>No material requests recorded yet.</Text>
                  ) : (
                    baseRequests.slice(0, 15).map((r) => (
                      <View key={r.id} style={styles.previewRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewPrimary}>{r.material}</Text>
                          <Text style={styles.previewSecondary}>
                            {r.site} &bull; {r.requestedBy}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.previewQty}>
                            {r.quantity} {r.unit}
                          </Text>
                          <Text style={styles.previewStatus}>{r.status}</Text>
                        </View>
                      </View>
                    ))
                  )
                ) : selectedReport.includes('Delivery') ? (
                  baseDeliveries.length === 0 ? (
                    <Text style={styles.noDataText}>No deliveries recorded yet.</Text>
                  ) : (
                    baseDeliveries.slice(0, 15).map((d) => (
                      <View key={d.id} style={styles.previewRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewPrimary}>{d.material}</Text>
                          <Text style={styles.previewSecondary}>
                            {d.supplier} &bull; {d.site}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.previewQty}>
                            {d.receivedQty} {d.unit}
                          </Text>
                          <Text style={styles.previewStatus}>{d.status}</Text>
                        </View>
                      </View>
                    ))
                  )
                ) : selectedReport.includes('Site') ? (
                  baseSites.length === 0 ? (
                    <Text style={styles.noDataText}>No construction sites recorded yet.</Text>
                  ) : (
                    baseSites.map((s) => (
                      <View key={s.id} style={styles.previewRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewPrimary}>{s.name}</Text>
                          <Text style={styles.previewSecondary}>
                            {s.location} &bull; Supervisor: {s.supervisor}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.previewQty}>{s.stockValueFormatted || '₹0'}</Text>
                          <Text style={styles.previewStatus}>{s.status}</Text>
                        </View>
                      </View>
                    ))
                  )
                ) : (
                  baseInventory.length === 0 ? (
                    <Text style={styles.noDataText}>No inventory records found.</Text>
                  ) : (
                    baseInventory.slice(0, 20).map((i) => (
                      <View key={i.id} style={styles.previewRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewPrimary}>{i.name}</Text>
                          <Text style={styles.previewSecondary}>
                            {i.site} &bull; {i.category}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.previewQty}>
                            {i.totalStock} {i.unit}
                          </Text>
                          <Text style={styles.previewStatus}>{i.status}</Text>
                        </View>
                      </View>
                    ))
                  )
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setSelectedReport(null)}
                >
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalExportBtn}
                  onPress={() => {
                    handleExport(selectedReport);
                    setSelectedReport(null);
                  }}
                >
                  <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.modalExportText}>Export Summary</Text>
                </TouchableOpacity>
              </View>
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
  reportDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  reportMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0D5C3A',
    marginTop: 3,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
  },
  kpiLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  previewPrimary: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  previewSecondary: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  previewQty: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D5C3A',
  },
  previewStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  noDataText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
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
  modalExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0D5C3A',
  },
  modalExportText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
