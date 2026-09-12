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

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetails'>;

export const RequestDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  const { roleMode, materialRequests, approveRequest, rejectRequest, cancelRequest } = useMobileData();

  const req =
    materialRequests.find((r) => r.requestId === requestId || r.id === requestId) || null;

  if (!req) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 }}>
            Request Not Found
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6 }}>
            The requested material indent could not be located.
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 16,
              backgroundColor: '#0D5C3A',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Request ID & Status Badge */}
        <View style={styles.idBanner}>
          <Text style={styles.reqId}>{req.requestId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{req.status}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Site</Text>
            <Text style={styles.value}>{req.site}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Material</Text>
            <Text style={styles.value}>{req.material}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={[styles.value, { color: '#0D5C3A', fontWeight: '800' }]}>
              {req.quantity} {req.unit}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Required Date</Text>
            <Text style={styles.value}>{req.requiredDate || '02 Jun 2025'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Requested By</Text>
            <Text style={styles.value}>{req.requestedBy}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Requested On</Text>
            <Text style={styles.value}>{req.requestedOn}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purpose</Text>
            <Text style={styles.value}>{req.purpose || 'Foundation Work'}</Text>
          </View>

          <View style={styles.notesBlock}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.notesText}>
              {req.notes || 'Required for upcoming foundation slab work.'}
            </Text>
          </View>

          <View style={styles.attachBlock}>
            <Text style={styles.label}>Attachments</Text>
            <Text style={styles.attachSub}>No file attached</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {roleMode === 'admin' ? (
            <>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => {
                  rejectRequest(req.id);
                  navigation.goBack();
                }}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => {
                  approveRequest(req.id);
                  navigation.goBack();
                }}
              >
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                cancelRequest(req.id);
                navigation.goBack();
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
          )}
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
  reqId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  notesBlock: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 11,
    color: '#334155',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  attachBlock: {
    paddingVertical: 8,
  },
  attachSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#0D5C3A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
